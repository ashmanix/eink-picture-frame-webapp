from typing import Annotated
from fastapi import FastAPI, Path, HTTPException, UploadFile, File, Request, Depends
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from web.sql import create_db_and_tables, get_all, get_session
from dotenv import load_dotenv
from sqlmodel import Session

import traceback

from web.utils import (
    delete_image,
    save_image,
    set_display_image,
    check_is_valid_image_type,
    delete_image_list,
    get_image_list,
)

from web.constants import FILENAME_VALIDATION_REGEX

from .logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)
app.mount("/images", StaticFiles(directory="src/static/images"), name="images")
app.mount("/css", StaticFiles(directory="src/static/css"), name="css")
templates = Jinja2Templates(directory="src/web/template")
load_dotenv()

SessionDep = Annotated[Session, Depends(get_session)]


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    image_list = get_image_list()
    return templates.TemplateResponse(
        request=request, name="home.html", context={"image_list": image_list}
    )


@app.get("/image_list")
async def get_list(session: SessionDep):
    try:
        results = get_all(session)
        return {"image_list": results}

    except Exception as err:
        handle_error(err, f"Error getting list of images with error: {err}")


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
        save_image(filename, file, session)
        return {"result": "success"}
    except Exception as err:
        handle_error(err, f"Error uploading image with error: {err}")


@app.post("/image/display/{filename}")
async def set_current(
    filename: Annotated[
        str,
        Path(
            title="The name of the file to set as the current display image",
            max_length=100,
            pattern=FILENAME_VALIDATION_REGEX,
        ),
    ],
):
    try:
        set_display_image(filename)
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
