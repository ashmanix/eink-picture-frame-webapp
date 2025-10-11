from .logger import logger
import re

filename_validation_regex = "^.*\.(jpg|JPG|jpeg|JPEG|png|PNG|pdf|PDF)$"


def check_is_valid_image_type(filename: str) -> bool:
    is_match = re.search("^.*\.(jpg|JPG|jpeg|JPEG|png|PNG|pdf|PDF)$", filename)

    if is_match:
        return True
    return False


async def delete_image(filename: str) -> bool:
    logger.info(f"Attempting to delete filename: {filename} from folder")
    return True


async def save_image() -> bool:
    return True


async def set_display_image(filename: str) -> bool:
    return True
