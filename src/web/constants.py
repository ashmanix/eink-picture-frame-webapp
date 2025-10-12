from pathlib import Path
import os

ROOT = Path(__file__).resolve().parents[2]  # adjust depth once
SRC = ROOT / "src"
FILENAME_VALIDATION_REGEX = r"^.*\.(jpg|JPG|jpeg|JPEG|png|PNG|pdf|PDF)$"

IMAGE_FOLDER_LOCATION = f"{ROOT}{os.getenv("IMAGE_FOLDER_NAME")}"
