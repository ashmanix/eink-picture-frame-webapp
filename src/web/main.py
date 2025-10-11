from typing import Annotated
from fastapi import FastAPI, Path, HTTPException

from web.utils import (
    delete_image,
    save_image,
    set_display_image,
    filename_validation_regex,
)
from .logger import logger

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World!"}


@app.post("/image/delete/{filename}")
async def delete(
    filename: Annotated[
        str,
        Path(
            title="The name of the file to delete",
            max_length=100,
            pattern=filename_validation_regex,
        ),
    ],
):
    try:
        result = await delete_image(filename)
        if result:
            return {"result": "successful"}
        return {"result": "unsuccessful"}

    except Exception as err:
        logger.error(f"Error deleting image with error: {err}")
        raise HTTPException(status_code=500, detail=str(err))


@app.post("/image/upload")
async def upload():
    try:
        await save_image()
        return {"result": "yo"}
    except Exception as err:
        logger.error(f"Error uploading image with error: {err}")
        raise HTTPException(status_code=500, detail=str(err))


@app.post("/image/display/{filename}")
async def set_current(
    filename: Annotated[
        str,
        Path(
            title="The name of the file to set as the current display image",
            max_length=100,
            pattern=filename_validation_regex,
        ),
    ],
):
    try:
        result = set_display_image(filename)
        if result:
            return {"result": "successful"}
        return {"result": "unsuccessful"}
    except Exception as err:
        logger.error(f"Error setting current image with error: {err}")
        raise HTTPException(status_code=500, detail=str(err))


def dev():
    """Run the app in reload/dev mode."""
    import uvicorn

    uvicorn.run("web.main:app", host="0.0.0.0", port=8000, reload=True)


def serve():
    """Run the app without reload (prod)"""
    import uvicorn

    uvicorn.run("web.main:app", host="0.0.0.0", port=8000, reload=False)
