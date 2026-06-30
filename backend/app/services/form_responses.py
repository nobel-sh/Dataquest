from __future__ import annotations

import csv
from io import StringIO
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.form import Form, FormResponse, FormVersion
from app.models.user import User
from app.schemas.form import FieldOption, FormSchema
from app.schemas.form_response import (
    FormResponseRead,
    FormResponseSubmit,
    validate_response_answers,
)
from app.services.forms import get_latest_version
from app.services.forms_access import require_form_owner, require_submittable_form


def submit_form_response_record(
    form_id: UUID,
    payload: FormResponseSubmit,
    current_user: User | None,
    db: Session,
) -> tuple[FormResponseRead, int]:
    form = require_submittable_form(db.get(Form, form_id), current_user, db)
    latest_version = get_latest_version(form.id, db)
    form_schema = FormSchema.model_validate(latest_version.schema_json)

    try:
        normalized_answers = validate_response_answers(form_schema, payload.answers)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    response = FormResponse(
        form=form,
        form_version=latest_version,
        respondent_user_id=current_user.id if current_user is not None else None,
        answers_json=normalized_answers,
    )
    db.add(response)
    db.commit()
    db.refresh(response)

    return build_response_read(response), latest_version.version_number


def list_form_response_records(
    form_id: UUID,
    current_user: User,
    db: Session,
) -> list[FormResponseRead]:
    form = db.get(Form, form_id)
    form = require_form_owner(form, current_user)

    responses = db.scalars(
        select(FormResponse)
        .where(FormResponse.form_id == form.id)
        .order_by(FormResponse.submitted_at.asc(), FormResponse.id.asc())
    ).all()

    return [build_response_read(response) for response in responses]


def export_form_response_records(
    form_id: UUID,
    current_user: User,
    db: Session,
) -> tuple[str, str, int]:
    form = db.get(Form, form_id)
    form = require_form_owner(form, current_user)

    latest_version = get_latest_version(form.id, db)
    form_schema = FormSchema.model_validate(latest_version.schema_json)
    versions = db.scalars(select(FormVersion).where(FormVersion.form_id == form.id)).all()
    version_numbers_by_id = {version.id: version.version_number for version in versions}
    responses = db.scalars(
        select(FormResponse)
        .where(FormResponse.form_id == form.id)
        .order_by(FormResponse.submitted_at.asc(), FormResponse.id.asc())
    ).all()

    return (
        build_responses_csv(form_schema, responses, version_numbers_by_id),
        f"{form.slug}-responses.csv",
        len(responses),
    )


def build_responses_csv(
    form_schema: FormSchema,
    responses: list[FormResponse],
    version_numbers_by_id: dict[UUID, int],
) -> str:
    buffer = StringIO()
    writer = csv.writer(buffer)
    fields = form_schema.fields

    writer.writerow(["submitted_at", "version", *[field.label for field in fields]])

    for response in responses:
        writer.writerow(
            [
                response.submitted_at.isoformat(),
                f"v{version_numbers_by_id.get(response.form_version_id, 'unknown')}",
                *[
                    format_export_answer(response.answers_json.get(field.id), field.options)
                    for field in fields
                ],
            ]
        )

    return buffer.getvalue()


def format_export_answer(value: object, options: list[FieldOption] | None) -> str:
    if value is None or value == "":
        return ""

    option_labels_by_value = (
        {option.value: option.label for option in options} if options is not None else {}
    )

    if isinstance(value, list):
        return "; ".join(option_labels_by_value.get(str(item), str(item)) for item in value)

    if isinstance(value, bool):
        return "true" if value else "false"

    return option_labels_by_value.get(str(value), str(value))


def build_response_read(response: FormResponse) -> FormResponseRead:
    return FormResponseRead(
        id=response.id,
        form_id=response.form_id,
        form_version_id=response.form_version_id,
        respondent_user_id=response.respondent_user_id,
        answers=response.answers_json,
        submitted_at=response.submitted_at,
    )
