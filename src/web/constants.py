from pathlib import Path
import os

ROOT = Path(__file__).resolve().parents[2]  # adjust depth once

IMAGE_FILE_TYPES = [".jpg", ".jpeg", ".png"]

image_folder_name = os.getenv("IMAGE_FOLDER_NAME", "src/static/images")

image_path = Path(image_folder_name)
IMAGE_FOLDER_LOCATION = ROOT / image_path
ALLOWED_EXTENSIONS = ", ".join(IMAGE_FILE_TYPES)
ext_pattern = "|".join(ext.lstrip(".") for ext in IMAGE_FILE_TYPES)

FILENAME_VALIDATION_REGEX = rf"^.*\.({ext_pattern})$"

# Auth
TOKEN_TTL_SECS = 1800
ADMIN_USER = os.getenv("ADMIN_USER", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin")
DEFAULT_PAGE_NO = 1
DEFAULT_PAGE_SIZE = 25
