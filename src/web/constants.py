from pathlib import Path
import os

ROOT = Path(__file__).resolve().parents[2]  # adjust depth once

image_folder_name = os.getenv("IMAGE_FOLDER_NAME", "src/static/images")
image_path = Path(image_folder_name)
IMAGE_FOLDER_LOCATION = ROOT / image_path

FILENAME_VALIDATION_REGEX = r"^.*.(jpg|JPG|jpeg|JPEG|png|PNG|pdf|PDF)$"
