from __future__ import annotations

import re
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.form import Form, FormResponse, FormVersion
from app.models.user import User
from app.schemas.form_record import FormCreate, FormRead, FormSettingsUpdate
from app.schemas.form_version import FormVersionCreate, FormVersionRead
from app.services.forms_access import require_form_owner, require_public_form


def create_form_record(payload: FormCreate, current_user: User, db: Session) -> FormRead:
    form = Form(
        owner=current_user,
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
    return build_form_read(form, version, db, current_user)


def duplicate_form_record(
    form_id: UUID,
    current_user: User,
    db: Session,
) -> FormRead:
    source_form = db.get(Form, form_id)
    source_form = require_form_owner(source_form, current_user)
    source_version = get_latest_version(source_form.id, db)
    source_schema = source_version.schema_json
    duplicate_slug = next_duplicate_slug(source_form.slug, db)
    duplicate_form = Form(
        owner=current_user,
        title=f"Copy of {source_form.title}",
        description=source_form.description,
        slug=duplicate_slug,
        accepting_responses=source_form.accepting_responses,
        requires_login=source_form.requires_login,
        archived=False,
    )
    duplicate_version = FormVersion(
        form=duplicate_form,
        version_number=1,
        schema_json=source_schema,
    )

    db.add(duplicate_version)
    db.commit()
    db.refresh(duplicate_form)
    db.refresh(duplicate_version)
    return build_form_read(duplicate_form, duplicate_version, db, current_user)


def list_form_records(
    current_user: User,
    db: Session,
    include_archived: bool = False,
) -> list[FormRead]:
    statement = select(Form).where(Form.owner_id == current_user.id)
    if not include_archived:
        statement = statement.where(Form.archived.is_(False))

    forms = db.scalars(statement.order_by(Form.updated_at.desc())).all()

    return [
        build_form_read(form, get_latest_version(form.id, db), db, current_user)
        for form in forms
    ]


def update_form_settings_record(
    form_id: UUID,
    payload: FormSettingsUpdate,
    current_user: User,
    db: Session,
) -> FormRead:
    form = db.get(Form, form_id)
    form = require_form_owner(form, current_user)

    if payload.accepting_responses is not None:
        form.accepting_responses = payload.accepting_responses
    if payload.requires_login is not None:
        form.requires_login = payload.requires_login
    if payload.archived is not None:
        form.archived = payload.archived

    latest_version = get_latest_version(form.id, db)
    db.commit()
    db.refresh(form)
    return build_form_read(form, latest_version, db, current_user)


def get_owned_form_record(form_id: UUID, current_user: User, db: Session) -> FormRead:
    form = db.get(Form, form_id)
    form = require_form_owner(form, current_user)
    return build_form_read(form, get_latest_version(form.id, db), db, current_user)


def get_public_form_record(slug: str, current_user: User | None, db: Session) -> FormRead:
    form = db.scalar(select(Form).where(Form.slug == slug))
    form = require_public_form(form)
    return build_form_read(form, get_latest_version(form.id, db), db, current_user)


def create_form_version_record(
    form_id: UUID,
    payload: FormVersionCreate,
    current_user: User,
    db: Session,
) -> FormRead:
    form = db.get(Form, form_id)
    form = require_form_owner(form, current_user)

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
    return build_form_read(form, version, db, current_user)


def list_form_version_records(
    form_id: UUID,
    current_user: User,
    db: Session,
) -> list[FormVersionRead]:
    form = db.get(Form, form_id)
    form = require_form_owner(form, current_user)

    versions = db.scalars(
        select(FormVersion)
        .where(FormVersion.form_id == form.id)
        .order_by(FormVersion.version_number.asc())
    ).all()

    return [build_version_read(version) for version in versions]


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


def next_duplicate_slug(source_slug: str, db: Session) -> str:
    candidate_index = 1
    while True:
        candidate = duplicate_slug_for_index(source_slug, candidate_index)
        exists = db.scalar(select(Form.id).where(Form.slug == candidate).limit(1))
        if exists is None:
            return candidate
        candidate_index += 1


def duplicate_slug_for_index(source_slug: str, index: int) -> str:
    suffix = "copy" if index == 1 else f"copy-{index}"
    base = re.sub(r"-copy(?:-\d+)?$", "", source_slug)
    return f"{base}-{suffix}"


def build_form_read(
    form: Form,
    version: FormVersion,
    db: Session,
    current_user: User | None,
) -> FormRead:
    return FormRead(
        id=form.id,
        owner_id=form.owner_id,
        title=form.title,
        description=form.description,
        slug=form.slug,
        accepting_responses=form.accepting_responses,
        requires_login=form.requires_login,
        has_responded=has_user_responded(form.id, current_user, db),
        response_count=get_response_count(form.id, db),
        archived=form.archived,
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


def has_user_responded(form_id: UUID, current_user: User | None, db: Session) -> bool:
    if current_user is None:
        return False

    response_id = db.scalar(
        select(FormResponse.id)
        .where(
            FormResponse.form_id == form_id,
            FormResponse.respondent_user_id == current_user.id,
        )
        .limit(1)
    )
    return response_id is not None


def get_response_count(form_id: UUID, db: Session) -> int:
    return (
        db.scalar(
            select(func.count()).select_from(FormResponse).where(FormResponse.form_id == form_id)
        )
        or 0
    )
