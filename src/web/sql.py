from sqlmodel import Session, SQLModel, create_engine, select, func
from typing import List
from fastapi import Depends
from web.models import PictureFrameImage, ImageQueryResult


sqlite_file_name = "image_database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


def get_item(id: int, session: Session) -> PictureFrameImage:
    image = session.get(PictureFrameImage, id)
    if not image:
        raise FileNotFoundError("Image not found in database!")
    return image


def get_all(session: Session, page_no: int, page_size: int) -> ImageQueryResult:
    total = session.exec(select(func.count()).select_from(PictureFrameImage)).one()

    statement = select(PictureFrameImage).offset(page_no * page_size).limit(page_size)
    results = session.exec(statement=statement)
    return ImageQueryResult(items=results, total=total)


def get_query(
    session: Session, search: str, page_no: int, page_size: int
) -> ImageQueryResult:
    if not search:
        return get_all(session, page_no, page_size)

    base_query = select(PictureFrameImage).where(
        PictureFrameImage.filename.like(f"%{search}%")
    )

    statement = base_query.offset(page_no * page_size).limit(page_size)

    total = session.exec(select(func.count()).select_from(base_query.subquery())).one()

    results = session.exec(statement).all()
    return ImageQueryResult(items=results, total=total)


def add_item(filename: str, session: Session) -> PictureFrameImage:
    new_image_item = PictureFrameImage(filename=filename)
    session.add(new_image_item)
    session.commit()
    session.refresh(new_image_item)
    return new_image_item


def delete_item(id: int, session: Session):
    image = session.get(PictureFrameImage, id)
    if not image:
        raise RuntimeError("Image not found in database!")
    session.delete(image)
    session.commit()
