from typing import IO
from .logger import logger
from pathlib import Path
import re
import os
import shutil

from web.display import get_display, display_image
from web.models import FileError, FileDeletionResults, PictureFrameImage
from web.constants import FILENAME_VALIDATION_REGEX, IMAGE_FOLDER_LOCATION
from web.sql import get_item, delete_item, add_item
from sqlmodel import Session

display = get_display()


def check_is_valid_image_type(filename: str) -> bool:
    is_match = re.search(FILENAME_VALIDATION_REGEX, filename)

    if is_match:
        return True
    return False


def delete_image(id: int, session: Session):
    image: PictureFrameImage = get_item(id, session)
    filename = image.filename
    logger.info(f"Attempting to delete file: {filename} from folder.")

    file_location = f"{IMAGE_FOLDER_LOCATION}/{filename}"
    logger.warning(f"File Location: {file_location}")
    if not os.path.exists(file_location):
        if image.id is not None:
            delete_item(image.id, session)
        raise FileNotFoundError(
            f"The file {filename} could not be found on the device!"
        )
    else:
        os.remove(file_location)
        delete_item(image.id, session)
        logger.info(f"File: {filename} was successfully removed!")


def delete_image_list(
    image_id_list: list[int], session: Session
) -> FileDeletionResults:
    successful_list: list[str] = []
    failed_list: list[FileError] = []

    for id in image_id_list:
        try:
            delete_image(id, session)
            successful_list.append(id)
        except Exception as err:
            failed_list.append(FileError(filename=id, error_message=str(err)))
    return FileDeletionResults(successful=successful_list, failed=failed_list)


def save_image(filename: str, file: IO[bytes], session: Session):
    logger.info(f"Attempting to save file: {filename} to folder")

    file_location = f"{IMAGE_FOLDER_LOCATION}/{filename}"

    # Create the images folder for the file if it doesn't already exist
    file_path = Path(file_location)
    file_path.parent.mkdir(parents=True, exist_ok=True)

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file, buffer)

    add_item(filename, session)
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


def get_image_list() -> list[str]:
    file_list = os.listdir(IMAGE_FOLDER_LOCATION)
    image_file_list = []
    for filename in file_list:
        if check_is_valid_image_type(filename):
            image_file_list.append(filename)
    return image_file_list
