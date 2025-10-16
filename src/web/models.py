from typing import Annotated, List
from pydantic import StringConstraints, BaseModel, Field
from datetime import datetime, timezone
from sqlmodel import Field, SQLModel

from web.constants import FILENAME_VALIDATION_REGEX

Filename = Annotated[
    str,
    StringConstraints(
        strip_whitespace=True,
        min_length=1,
        max_length=255,
        pattern=FILENAME_VALIDATION_REGEX,
    ),
]


class FilesIn(BaseModel):
    files: List[Filename] = Field(
        min_items=1, description="Array of filenames (e.g. ['a.png','b.jpg'])"
    )


class FileError(BaseModel):
    id: int
    error_message: str


class FileDeletionResults(BaseModel):
    successful: list[str]
    failed: list[FileError]


class PictureFrameImage(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    filename: str = Field(index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StorageSpaceDetails(BaseModel):
    total: float
    used: float
    percent: float
    class_type: str = "is-success"
