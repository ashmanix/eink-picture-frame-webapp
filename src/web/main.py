from typing import Annotated, List
from fastapi import FastAPI, Path, HTTPException, UploadFile, File, Body
from dotenv import load_dotenv

import traceback

from web.utils import (
    delete_image,
    save_image,
    set_display_image,
    check_is_valid_image_type,
    delete_image_list,
)

from web.constants import FILENAME_VALIDATION_REGEX

from web.models import Filename
from .logger import logger

app = FastAPI()
load_dotenv()


@app.get("/")
async def root():
    return {"message": "Hello World!"}


@app.post("/image/delete/")
async def delete_list(files: List[Filename]):
    try:
        results = delete_image_list(files)
        return results

    except Exception as err:
        handle_error(err, f"Error deleting list of images with error: {err}")


@app.post("/image/delete/{filename}")
async def delete(
    filename: Annotated[
        str,
        Path(
            title="The name of the file to delete",
            max_length=100,
            pattern=FILENAME_VALIDATION_REGEX,
        ),
    ],
):
    try:
        delete_image(filename)
        return {"result": "successful"}

    except FileNotFoundError as err:
        handle_error(err, f"File {filename} could not be found", 404)
    except Exception as err:
        handle_error(err, f"Error deleting image with error: {err}")


@app.post("/image/upload")
async def upload_image(file: UploadFile = File(...)):
    try:
        filename = file.filename
        if not check_is_valid_image_type(filename):
            raise TypeError(f"{filename} is not a valid image file type!")
        save_image(file)
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
