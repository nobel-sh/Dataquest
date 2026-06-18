from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.form import Form, FormResponse, FormVersion
from app.schemas.form import FormSchema
from app.schemas.form_record import FormCreate, FormRead
from app.schemas.form_response import (
    FormResponseRead,
    FormResponseSubmit,
    validate_response_answers,
)
from app.schemas.form_version import FormVersionCreate, FormVersionRead

router = APIRouter(prefix="/forms", tags=["forms"])
DbSession = Annotated[Session, Depends(get_db)]


@router.post("", response_model=FormRead, status_code=status.HTTP_201_CREATED)
def create_form(payload: FormCreate, db: DbSession) -> FormRead:
    form = Form(
        title=payload.form_schema.title,
        description=payload.form_schema.description,
        slug=payload.slug,
    )
    version = FormVersion(
        form=form,
        version_number=1,
        schema_json=payload.form_schema.model_dump(mode="json"),
    )

    db.add(version)

    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="form slug already exists",
        ) from error

    db.refresh(form)
    db.refresh(version)

    return build_form_read(form, version)


@router.get("/{form_id}", response_model=FormRead)
def get_form(form_id: UUID, db: DbSession) -> FormRead:
    form = db.get(Form, form_id)
    if form is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="form not found")

    latest_version = get_latest_version(form.id, db)

    return build_form_read(form, latest_version)


@router.get("/slug/{slug}", response_model=FormRead)
def get_form_by_slug(slug: str, db: DbSession) -> FormRead:
    form = db.scalar(select(Form).where(Form.slug == slug))
    if form is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="form not found")

    latest_version = get_latest_version(form.id, db)

    return build_form_read(form, latest_version)


@router.post(
    "/{form_id}/versions",
    response_model=FormRead,
    status_code=status.HTTP_201_CREATED,
)
def create_form_version(
    form_id: UUID,
    payload: FormVersionCreate,
    db: DbSession,
) -> FormRead:
    form = db.get(Form, form_id)
    if form is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="form not found")

    latest_version = get_latest_version(form.id, db)
    form.title = payload.form_schema.title
    form.description = payload.form_schema.description

    version = FormVersion(
        form=form,
        version_number=latest_version.version_number + 1,
        schema_json=payload.form_schema.model_dump(mode="json"),
    )
    db.add(version)
    db.commit()
    db.refresh(form)
    db.refresh(version)

    return build_form_read(form, version)


@router.get("/{form_id}/versions", response_model=list[FormVersionRead])
def list_form_versions(form_id: UUID, db: DbSession) -> list[FormVersionRead]:
    form = db.get(Form, form_id)
    if form is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="form not found")

    versions = db.scalars(
        select(FormVersion)
        .where(FormVersion.form_id == form.id)
        .order_by(FormVersion.version_number.asc())
    ).all()

    return [build_version_read(version) for version in versions]


@router.post(
    "/{form_id}/responses",
    response_model=FormResponseRead,
    status_code=status.HTTP_201_CREATED,
)
def submit_form_response(
    form_id: UUID,
    payload: FormResponseSubmit,
    db: DbSession,
) -> FormResponseRead:
    form = db.get(Form, form_id)
    if form is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="form not found")

    latest_version = get_latest_version(form.id, db)
    form_schema = FormSchema.model_validate(latest_version.schema_json)

    try:
        normalized_answers = validate_response_answers(form_schema, payload.answers)
    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error),
        ) from error

    response = FormResponse(
        form=form,
        form_version=latest_version,
        answers_json=normalized_answers,
    )
    db.add(response)
    db.commit()
    db.refresh(response)

    return build_response_read(response)


@router.get("/{form_id}/responses", response_model=list[FormResponseRead])
def list_form_responses(form_id: UUID, db: DbSession) -> list[FormResponseRead]:
    form = db.get(Form, form_id)
    if form is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="form not found")

    responses = db.scalars(
        select(FormResponse)
        .where(FormResponse.form_id == form.id)
        .order_by(FormResponse.submitted_at.asc(), FormResponse.id.asc())
    ).all()

    return [build_response_read(response) for response in responses]


def get_latest_version(form_id: UUID, db: Session) -> FormVersion:
    latest_version = db.scalar(
        select(FormVersion)
        .where(FormVersion.form_id == form_id)
        .order_by(FormVersion.version_number.desc())
        .limit(1)
    )
    if latest_version is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="form has no versions",
        )
    return latest_version


def build_form_read(form: Form, version: FormVersion) -> FormRead:
    return FormRead(
        id=form.id,
        title=form.title,
        description=form.description,
        slug=form.slug,
        created_at=form.created_at,
        updated_at=form.updated_at,
        latest_version=build_version_read(version),
    )


def build_version_read(version: FormVersion) -> FormVersionRead:
    return FormVersionRead(
        id=version.id,
        form_id=version.form_id,
        version_number=version.version_number,
        form_schema=version.schema_json,
        created_at=version.created_at,
    )


def build_response_read(response: FormResponse) -> FormResponseRead:
    return FormResponseRead(
        id=response.id,
        form_id=response.form_id,
        form_version_id=response.form_version_id,
        answers=response.answers_json,
        submitted_at=response.submitted_at,
    )
