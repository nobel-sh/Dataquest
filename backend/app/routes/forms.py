import csv
import logging
from io import StringIO
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.ai.form_generation import get_form_generator
from app.db.session import get_db
from app.models.form import Form, FormResponse, FormVersion
from app.models.user import User
from app.routes.dependencies import get_current_user, get_optional_current_user
from app.schemas.agent import GenerateFormRequest, GenerateFormResult
from app.schemas.form import FieldOption, FormSchema
from app.schemas.form_record import FormCreate, FormRead, FormSettingsUpdate
from app.schemas.form_response import (
    FormResponseRead,
    FormResponseSubmit,
    validate_response_answers,
)
from app.schemas.form_version import FormVersionCreate, FormVersionRead

router = APIRouter(prefix="/forms", tags=["forms"])
DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]
OptionalCurrentUser = Annotated[User | None, Depends(get_optional_current_user)]
logger = logging.getLogger("app.forms")


@router.post("", response_model=FormRead, status_code=status.HTTP_201_CREATED)
def create_form(payload: FormCreate, db: DbSession, current_user: CurrentUser) -> FormRead:
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

    logger.info(
        "form created form_id=%s owner_id=%s version=%s field_count=%s",
        form.id,
        current_user.id,
        version.version_number,
        len(payload.form_schema.fields),
    )
    return build_form_read(form, version, db, current_user)


@router.post("/generate", response_model=GenerateFormResult)
def generate_form(payload: GenerateFormRequest, _current_user: CurrentUser) -> GenerateFormResult:
    generator = get_form_generator()
    result = generator.generate(payload.prompt)
    logger.info(
        "form schema generated user_id=%s field_count=%s warning_count=%s",
        _current_user.id,
        len(result.form_schema.fields),
        len(result.warnings),
    )
    return result


@router.get("", response_model=list[FormRead])
def list_forms(
    db: DbSession,
    current_user: CurrentUser,
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


@router.patch("/{form_id}/settings", response_model=FormRead)
def update_form_settings(
    form_id: UUID,
    payload: FormSettingsUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> FormRead:
    form = db.get(Form, form_id)
    form = ensure_form_owner(form, current_user)
    if payload.accepting_responses is not None:
        form.accepting_responses = payload.accepting_responses
    if payload.requires_login is not None:
        form.requires_login = payload.requires_login
    if payload.archived is not None:
        form.archived = payload.archived
    latest_version = get_latest_version(form.id, db)

    db.commit()
    db.refresh(form)

    logger.info(
        "form settings updated form_id=%s owner_id=%s accepting_responses=%s "
        "requires_login=%s archived=%s",
        form.id,
        current_user.id,
        form.accepting_responses,
        form.requires_login,
        form.archived,
    )
    return build_form_read(form, latest_version, db, current_user)


@router.get("/{form_id}", response_model=FormRead)
def get_form(form_id: UUID, db: DbSession, current_user: CurrentUser) -> FormRead:
    form = db.get(Form, form_id)
    form = ensure_form_owner(form, current_user)

    latest_version = get_latest_version(form.id, db)

    return build_form_read(form, latest_version, db, current_user)


@router.get("/slug/{slug}", response_model=FormRead)
def get_form_by_slug(slug: str, db: DbSession, current_user: OptionalCurrentUser) -> FormRead:
    form = db.scalar(select(Form).where(Form.slug == slug))
    if form is None or form.archived:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="form not found")

    latest_version = get_latest_version(form.id, db)

    return build_form_read(form, latest_version, db, current_user)


@router.post(
    "/{form_id}/versions",
    response_model=FormRead,
    status_code=status.HTTP_201_CREATED,
)
def create_form_version(
    form_id: UUID,
    payload: FormVersionCreate,
    db: DbSession,
    current_user: CurrentUser,
) -> FormRead:
    form = db.get(Form, form_id)
    form = ensure_form_owner(form, current_user)

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

    logger.info(
        "form version created form_id=%s owner_id=%s version=%s field_count=%s",
        form.id,
        current_user.id,
        version.version_number,
        len(payload.form_schema.fields),
    )
    return build_form_read(form, version, db, current_user)


@router.get("/{form_id}/versions", response_model=list[FormVersionRead])
def list_form_versions(
    form_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> list[FormVersionRead]:
    form = db.get(Form, form_id)
    form = ensure_form_owner(form, current_user)

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
    current_user: OptionalCurrentUser,
) -> FormResponseRead:
    form = db.get(Form, form_id)
    if form is None or form.archived:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="form not found")
    if not form.accepting_responses:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="form is not accepting responses",
        )
    if form.requires_login and current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="login required to submit this form",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if current_user is not None:
        existing_response = db.scalar(
            select(FormResponse)
            .where(
                FormResponse.form_id == form.id,
                FormResponse.respondent_user_id == current_user.id,
            )
            .limit(1)
        )
        if existing_response is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="user has already submitted a response for this form",
            )

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
        respondent_user_id=current_user.id if current_user is not None else None,
        answers_json=normalized_answers,
    )
    db.add(response)
    db.commit()
    db.refresh(response)

    logger.info(
        "form response submitted form_id=%s version=%s response_id=%s authenticated=%s",
        form.id,
        latest_version.version_number,
        response.id,
        current_user is not None,
    )
    return build_response_read(response)


@router.get("/{form_id}/responses/export")
def export_form_responses(
    form_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
    format: str = "csv",
) -> Response:
    if format != "csv":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="only csv export is supported",
        )

    form = db.get(Form, form_id)
    form = ensure_form_owner(form, current_user)

    latest_version = get_latest_version(form.id, db)
    form_schema = FormSchema.model_validate(latest_version.schema_json)
    versions = db.scalars(select(FormVersion).where(FormVersion.form_id == form.id)).all()
    version_numbers_by_id = {version.id: version.version_number for version in versions}
    responses = db.scalars(
        select(FormResponse)
        .where(FormResponse.form_id == form.id)
        .order_by(FormResponse.submitted_at.asc(), FormResponse.id.asc())
    ).all()

    csv_body = build_responses_csv(form_schema, responses, version_numbers_by_id)
    logger.info(
        "form responses exported form_id=%s owner_id=%s format=%s response_count=%s",
        form.id,
        current_user.id,
        format,
        len(responses),
    )
    return Response(
        content=csv_body,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{form.slug}-responses.csv"',
        },
    )


@router.get("/{form_id}/responses", response_model=list[FormResponseRead])
def list_form_responses(
    form_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> list[FormResponseRead]:
    form = db.get(Form, form_id)
    form = ensure_form_owner(form, current_user)

    responses = db.scalars(
        select(FormResponse)
        .where(FormResponse.form_id == form.id)
        .order_by(FormResponse.submitted_at.asc(), FormResponse.id.asc())
    ).all()

    return [build_response_read(response) for response in responses]


def ensure_form_owner(form: Form | None, current_user: User) -> Form:
    if form is None or form.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="form not found")
    return form


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


def build_form_read(
    form: Form,
    version: FormVersion,
    db: Session,
    current_user: User | None,
) -> FormRead:
    return FormRead(
        id=form.id,
        title=form.title,
        description=form.description,
        slug=form.slug,
        accepting_responses=form.accepting_responses,
        requires_login=form.requires_login,
        has_responded=has_user_responded(form.id, current_user, db),
        archived=form.archived,
        created_at=form.created_at,
        updated_at=form.updated_at,
        latest_version=build_version_read(version),
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
        respondent_user_id=response.respondent_user_id,
        answers=response.answers_json,
        submitted_at=response.submitted_at,
    )
