from typing import IO, List
from .logger import logger
from pathlib import Path
import re
import os
import shutil
from PIL import Image

from web.display import get_display, display_image
from web.models import (
    FileError,
    FileDeletionResults,
    PictureFrameImage,
    StorageSpaceDetails,
)
from web.constants import FILENAME_VALIDATION_REGEX, IMAGE_FOLDER_LOCATION
from web.sql import get_item, delete_item, add_item, get_all, get_query
from sqlmodel import Session

from markupsafe import Markup, escape

display = get_display()

IMAGE_THUMBNAIL_FOLDER = Path(f"{IMAGE_FOLDER_LOCATION}/thumbnails")


def check_is_valid_image_type(filename: str) -> bool:
    is_match = re.search(FILENAME_VALIDATION_REGEX, filename)

    if is_match:
        return True
    return False


def check_if_file_exists(filename: str) -> bool:
    image_file_path = Path(f"{IMAGE_FOLDER_LOCATION}/{filename}")
    return os.path.exists(image_file_path)


def save_thumbnail(image_file_path: Path, size=(500, 500)):
    thumbnail_directory = Path(IMAGE_THUMBNAIL_FOLDER)
    thumbnail_directory.mkdir(exist_ok=True)
    thumbnail_path = thumbnail_directory / image_file_path.name

    with Image.open(image_file_path) as image:
        image.thumbnail(size)
        image.save(thumbnail_path)


def delete_thumbnail(image_file_name: str):
    thumbnail_path = Path(IMAGE_THUMBNAIL_FOLDER / image_file_name)
    if os.path.exists(thumbnail_path):
        os.remove(thumbnail_path)
    else:
        logger.warning(
            f"Thumbnail for image: {image_file_name} not found when attempting to delete!"
        )


def delete_image(id: int, session: Session):
    image: PictureFrameImage = get_item(id, session)
    filename = image.filename
    logger.info(f"Attempting to delete file: {filename} from folder.")

    image_file_location = Path(f"{IMAGE_FOLDER_LOCATION}/{filename}")
    if not os.path.exists(image_file_location):
        if image.id is not None:
            delete_item(image.id, session)
        raise FileNotFoundError(
            f"The file {filename} could not be found on the device!"
        )
    else:
        os.remove(image_file_location)
        delete_thumbnail(filename)
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

    image_file_location = Path(f"{IMAGE_FOLDER_LOCATION}/{filename}")

    # Create the images folder for the file if it doesn't already exist
    # file_path = Path(image_file_location)
    # file_path.parent.mkdir(parents=True, exist_ok=True)

    with open(image_file_location, "wb") as buffer:
        shutil.copyfileobj(file, buffer)

    save_thumbnail(image_file_location)

    add_item(filename, session)
    logger.info(f"File: {filename}, saved!")


def set_display_image(id: int, session: Session):
    logger.info(f"Attempting to display filimage ID: {id} on screen.")
    if display is None:
        raise RuntimeError("No display found on device!")

    image: PictureFrameImage = get_item(id, session)
    filename = image.filename

    file_location = f"{IMAGE_FOLDER_LOCATION}/{filename}"

    if not os.path.exists(file_location):
        raise FileNotFoundError(
            f"The file {filename} could not be found on the device!"
        )
    else:
        display_image(display, file_location)


def get_image_list(
    session: Session, search: str | None = None
) -> List[PictureFrameImage]:
    if search:
        return get_query(session, search)

    return get_all(session)


def format_datetime(value, format="%d-%m-%Y %H:%M"):
    return value.strftime(format)


def get_remaining_storage_space() -> StorageSpaceDetails:
    path = Path(IMAGE_FOLDER_LOCATION)
    total, used, free = shutil.disk_usage(path)

    percentage_value = round(used / total * 100)

    class_type = "is-success"

    if percentage_value > 60 and percentage_value <= 79:
        class_type = "is-warning"
    elif percentage_value > 80:
        class_type = "is-danger"

    return StorageSpaceDetails(
        percent=percentage_value,
        used=round(used / (1024**3), 2),
        total=round(total / (1024**3), 2),
        free=round(free / (1024**3), 2),
        class_type=class_type,
    )
