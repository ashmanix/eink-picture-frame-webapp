from .logger import logger
from pathlib import Path
import re
import os
import shutil
from fastapi import UploadFile

from web.display import get_display, display_image
from web.models import FileError, FileDeletionResults
from web.constants import FILENAME_VALIDATION_REGEX, IMAGE_FOLDER_LOCATION

display = get_display()


def check_is_valid_image_type(filename: str) -> bool:
    is_match = re.search(FILENAME_VALIDATION_REGEX, filename)

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


def delete_image_list(filename_list: list[str]) -> FileDeletionResults:
    successful_list: list[str] = []
    failed_list: list[FileError] = []

    for filename in filename_list:
        try:
            delete_image(filename)
            successful_list.append(filename)
        except Exception as err:
            failed_list.append(FileError(filename=filename, error_message=str(err)))
    return FileDeletionResults(successful=successful_list, failed=failed_list)


def save_image(image_file: UploadFile):
    filename = image_file.filename
    logger.info(f"Attempting to save file: {filename} to folder")

    file_location = f"{IMAGE_FOLDER_LOCATION}/{filename}"

    # Create the images folder for the file if it doesn't already exist
    file_path = Path(file_location)
    file_path.parent.mkdir(parents=True, exist_ok=True)

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
        display_image(display, file_location)
