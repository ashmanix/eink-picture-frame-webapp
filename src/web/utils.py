from .logger import logger
from pathlib import Path
import re
import os
import shutil
from fastapi import UploadFile

from web.display import get_display, display_image

display = get_display()


ROOT = Path(__file__).resolve().parents[2]  # adjust depth once
SRC = ROOT / "src"
FILENAME_VALIDATION_REGEX = r"^.*\.(jpg|JPG|jpeg|JPEG|png|PNG|pdf|PDF)$"

IMAGE_FOLDER_LOCATION = f"{ROOT}{os.getenv("IMAGE_FOLDER_NAME")}"


def check_is_valid_image_type(filename: str) -> bool:
    is_match = re.search(r"^.*\.(jpg|JPG|jpeg|JPEG|png|PNG|pdf|PDF)$", filename)

    if is_match:
        return True
    return False


def delete_image(filename: str):
    logger.info(f"Attempting to delete file: {filename} from folder.")

    file_location = f"{IMAGE_FOLDER_LOCATION}/{filename}"
    logger.warning(f"File Location: {file_location}")
    if not os.path.exists(file_location):
        raise FileNotFoundError(
            f"The file {filename} could not be found on the device!"
        )
    else:
        os.remove(file_location)
        logger.info(f"File: {filename} was successfully removed!")


def save_image(image_file: UploadFile):
    filename = image_file.filename
    logger.info(f"Attempting to save file: {filename} to folder")

    file_location = f"{IMAGE_FOLDER_LOCATION}/{filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(image_file.file, buffer)
    logger.info(f"File: {filename}, saved!")


def set_display_image(filename: str):
    logger.info(f"Attempting to display file: {filename} on screen.")
    file_location = f"{IMAGE_FOLDER_LOCATION}/{filename}"
    if display is None:
        raise RuntimeError("No display found on device!")

    if not os.path.exists(file_location):
        raise FileNotFoundError(
            f"The file {filename} could not be found on the device!"
        )
    else:
        display_image(file_location)
