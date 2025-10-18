from time import sleep
from typing import Annotated, List
from fastapi import (
    FastAPI,
    Path,
    HTTPException,
    UploadFile,
    File,
    Request,
    Depends,
    status,
    Form,
)
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from web.models import PictureFrameImage
from web.sql import create_db_and_tables, get_all, get_session
from dotenv import load_dotenv
from sqlmodel import Session
import traceback
from web.utils import (
    check_if_file_exists,
    delete_image,
    save_image,
    set_display_image,
    check_is_valid_image_type,
    delete_image_list,
    get_image_list,
    format_datetime,
    get_remaining_storage_space,
)
from web.models import LoginBody
from web.constants import IMAGE_FOLDER_LOCATION, ALLOWED_EXTENSIONS
from web.auth import validate_token, check_credentials, issue_token, revoke_token

from .logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)

# Create directory if it doesnt already exist
IMAGE_FOLDER_LOCATION.mkdir(parents=True, exist_ok=True)

app.mount("/images", StaticFiles(directory="src/static/images"), name="images")
app.mount("/css", StaticFiles(directory="src/static/css"), name="css")
app.mount("/webfonts", StaticFiles(directory="src/static/webfonts"), name="webfonts")
app.mount("/js", StaticFiles(directory="src/static/js"), name="js")
templates = Jinja2Templates(directory="src/web/template")
templates.env.filters["format_datetime"] = format_datetime
load_dotenv()

SessionDep = Annotated[Session, Depends(get_session)]


@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    PUBLIC_PATHS = ["/login", "/logout", "/"]
    PUBLIC_PREFIXES = ["/css/", "/js/", "/webfonts/", "/images/"]
    path = request.url.path
    if path in PUBLIC_PATHS or any(path.startswith(p) for p in PUBLIC_PREFIXES):
        return await call_next(request)

    try:
        validate_token(request)

    except HTTPException as err:
        return JSONResponse({"detail": "Authorisation Error"}, status_code=401)

    except Exception as err:
        return JSONResponse({"detail": "Internal Server Error"}, status_code=500)

    return await call_next(request)


@app.get("/login", response_class=HTMLResponse)
async def get_login(request: Request):
    return templates.TemplateResponse(request=request, name="login.html")


@app.get("/", response_class=HTMLResponse)
async def root(request: Request, session: SessionDep, search: str | None = None):
    # image_list: List[PictureFrameImage] = get_image_list(session, search)
    storage = get_remaining_storage_space()
    return templates.TemplateResponse(
        request=request,
        name="home.html",
        context={
            "image_list": [],
            "storage": storage,
            "allowed_extensions": ALLOWED_EXTENSIONS,
        },
    )


@app.get("/storage/partial")
async def get_storage_partial(request: Request):
    try:
        storage = get_remaining_storage_space()
        return templates.TemplateResponse(
            request=request,
            name="partial/storage_space.html",
            context={"storage": storage},
        )
    except Exception as err:
        handle_error(err, f"Error getting partial list: {err}")


@app.get("/image_list/partial")
async def get_list_partial(
    request: Request, session: SessionDep, search: str | None = None
):
    try:
        image_list: List[PictureFrameImage] = get_image_list(session, search)
        return templates.TemplateResponse(
            request=request,
            name="partial/image_list.html",
            context={
                "image_list": image_list,
                "allowed_extensions": ALLOWED_EXTENSIONS,
            },
        )
    except Exception as err:
        handle_error(err, f"Error getting partial list: {err}")


@app.get("/storage_space")
async def get_storage_space():
    try:
        storage = get_remaining_storage_space()
        return storage

    except Exception as err:
        handle_error(err, f"Error getting partial list: {err}")


@app.get("/image_list")
async def get_list(session: SessionDep):
    try:
        results = get_all(session)
        return {"image_list": results}

    except Exception as err:
        handle_error(err, f"Error getting list of images with error: {err}")


@app.post("/login")
def login(username: Annotated[str, Form()], password: Annotated[str, Form()]):
    try:
        if not check_credentials(username=username, password=password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect login details",
            )
        return {"token": issue_token()}

    except Exception as err:
        handle_error(err, f"Error getting authorisation token: {err}")


@app.post("/logout")
def logout(request: Request):
    try:
        revoke_token(request)

    except Exception as err:
        handle_error(err, f"Error logging out: {err}")


@app.post("/image/delete/")
async def delete_list(files: list[int], session: SessionDep):
    try:
        results = delete_image_list(files, session)
        return results

    except Exception as err:
        handle_error(err, f"Error deleting list of images with error: {err}")


@app.post("/image/delete/{id}")
async def delete(
    id: int,
    session: SessionDep,
):
    try:
        delete_image(id, session)
        return {"result": "successful"}

    except FileNotFoundError as err:
        handle_error(err, f"File ID: {id} could not be found", 404)
    except Exception as err:
        handle_error(err, f"Error deleting image with error: {err}")


@app.post("/image/upload")
async def upload_image(session: SessionDep, file: UploadFile = File(...)):
    try:
        filename = file.filename
        file = file.file
        if not check_is_valid_image_type(filename):
            raise TypeError(f"{filename} is not a valid image file type!")
        if check_if_file_exists(filename):
            raise RuntimeError(f"{filename} is already on device!")
        save_image(filename, file, session)
        return {"result": "success"}
    except Exception as err:
        handle_error(err, f"Error uploading image with error: {err}")


@app.post("/image/display/{id}")
async def set_current(
    id: int,
    session: SessionDep,
):
    try:
        set_display_image(id, session)
        return {"result": "successful"}
    except Exception as err:
        handle_error(err, f"Error setting current image with error: {err}")


def handle_error(err: Exception, msg: str, code: int = 500):
    logger.error(msg)
    traceback.print_exc()
    raise HTTPException(status_code=code, detail=str(err))


def dev():
    """Run the app in reload/dev mode."""
    import uvicorn

    uvicorn.run("web.main:app", host="0.0.0.0", port=8000, reload=True)


def serve():
    """Run the app without reload (prod)"""
    import uvicorn

    uvicorn.run("web.main:app", host="0.0.0.0", port=8000, reload=False)
