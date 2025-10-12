from typing import Annotated, List
from pydantic import StringConstraints, BaseModel, Field

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
    filename: str
    error_message: str


class FileDeletionResults(BaseModel):
    successful: list[str]
    failed: list[FileError]
