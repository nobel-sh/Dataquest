import logging
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.ai.form_generation import get_form_generator
from app.ai.form_review import RuleBasedFormReviewer
from app.core.request_context import get_request_id
from app.db.session import get_db
from app.models.user import User
from app.routes.dependencies import get_current_user, get_optional_current_user
from app.schemas.agent import (
    FormReviewResult,
    GenerateFormRequest,
    GenerateFormResult,
    ReviewFormRequest,
)
from app.schemas.form_record import FormCreate, FormRead, FormSettingsUpdate
from app.schemas.form_response import FormResponseRead, FormResponseSubmit
from app.schemas.form_version import FormVersionCreate, FormVersionRead
from app.services.form_responses import (
    export_form_response_records,
    list_form_response_records,
    submit_form_response_record,
)
from app.services.forms import (
    create_form_record,
    create_form_version_record,
    get_owned_form_record,
    get_public_form_record,
    list_form_records,
    list_form_version_records,
    update_form_settings_record,
)

router = APIRouter(prefix="/forms", tags=["forms"])
DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]
OptionalCurrentUser = Annotated[User | None, Depends(get_optional_current_user)]
logger = logging.getLogger("app.forms")


@router.post("", response_model=FormRead, status_code=status.HTTP_201_CREATED)
def create_form(
    payload: FormCreate,
    request: Request,
    db: DbSession,
    current_user: CurrentUser,
) -> FormRead:
    form = create_form_record(payload, current_user, db)
    logger.info(
        "form created",
        extra={
            "event": "form_created",
            "request_id": get_request_id(request),
            "form_id": form.id,
            "owner_id": current_user.id,
            "version": form.latest_version.version_number,
            "field_count": len(payload.form_schema.fields),
        },
    )
    return form


@router.post("/generate", response_model=GenerateFormResult)
def generate_form(
    payload: GenerateFormRequest,
    request: Request,
    _current_user: CurrentUser,
) -> GenerateFormResult:
    generator = get_form_generator()
    result = generator.generate(payload.prompt)
    logger.info(
        "form schema generated",
        extra={
            "event": "form_schema_generated",
            "request_id": get_request_id(request),
            "user_id": _current_user.id,
            "field_count": len(result.form_schema.fields),
            "warning_count": len(result.warnings),
        },
    )
    return result


@router.post("/review", response_model=FormReviewResult)
def review_form(
    payload: ReviewFormRequest,
    request: Request,
    _current_user: CurrentUser,
) -> FormReviewResult:
    result = RuleBasedFormReviewer().review(payload.form_schema)
    logger.info(
        "form schema reviewed",
        extra={
            "event": "form_schema_reviewed",
            "request_id": get_request_id(request),
            "user_id": _current_user.id,
            "field_count": len(result.form_schema.fields),
            "suggestion_count": len(result.suggestions),
        },
    )
    return result


@router.get("", response_model=list[FormRead])
def list_forms(
    db: DbSession,
    current_user: CurrentUser,
    include_archived: bool = False,
) -> list[FormRead]:
    return list_form_records(current_user, db, include_archived)


@router.patch("/{form_id}/settings", response_model=FormRead)
def update_form_settings(
    form_id: UUID,
    payload: FormSettingsUpdate,
    request: Request,
    db: DbSession,
    current_user: CurrentUser,
) -> FormRead:
    form = update_form_settings_record(form_id, payload, current_user, db)
    logger.info(
        "form settings updated",
        extra={
            "event": "form_settings_updated",
            "request_id": get_request_id(request),
            "form_id": form.id,
            "owner_id": current_user.id,
            "accepting_responses": form.accepting_responses,
            "requires_login": form.requires_login,
            "archived": form.archived,
        },
    )
    return form


@router.get("/{form_id}", response_model=FormRead)
def get_form(form_id: UUID, db: DbSession, current_user: CurrentUser) -> FormRead:
    return get_owned_form_record(form_id, current_user, db)


@router.get("/slug/{slug}", response_model=FormRead)
def get_form_by_slug(slug: str, db: DbSession, current_user: OptionalCurrentUser) -> FormRead:
    return get_public_form_record(slug, current_user, db)


@router.post(
    "/{form_id}/versions",
    response_model=FormRead,
    status_code=status.HTTP_201_CREATED,
)
def create_form_version(
    form_id: UUID,
    payload: FormVersionCreate,
    request: Request,
    db: DbSession,
    current_user: CurrentUser,
) -> FormRead:
    form = create_form_version_record(form_id, payload, current_user, db)
    logger.info(
        "form version created",
        extra={
            "event": "form_version_created",
            "request_id": get_request_id(request),
            "form_id": form.id,
            "owner_id": current_user.id,
            "version": form.latest_version.version_number,
            "field_count": len(payload.form_schema.fields),
        },
    )
    return form


@router.get("/{form_id}/versions", response_model=list[FormVersionRead])
def list_form_versions(
    form_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> list[FormVersionRead]:
    return list_form_version_records(form_id, current_user, db)


@router.post(
    "/{form_id}/responses",
    response_model=FormResponseRead,
    status_code=status.HTTP_201_CREATED,
)
def submit_form_response(
    form_id: UUID,
    payload: FormResponseSubmit,
    request: Request,
    db: DbSession,
    current_user: OptionalCurrentUser,
) -> FormResponseRead:
    result = submit_form_response_record(form_id, payload, current_user, db)
    logger.info(
        "form response submitted",
        extra={
            "event": "form_response_submitted",
            "request_id": get_request_id(request),
            "form_id": form_id,
            "version": result.version_number,
            "response_id": result.response.id,
            "authenticated": current_user is not None,
        },
    )
    return result.response


@router.get("/{form_id}/responses/export")
def export_form_responses(
    form_id: UUID,
    request: Request,
    db: DbSession,
    current_user: CurrentUser,
    format: str = "csv",
) -> Response:
    if format != "csv":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="only csv export is supported",
        )
    export = export_form_response_records(form_id, current_user, db)
    logger.info(
        "form responses exported",
        extra={
            "event": "form_responses_exported",
            "request_id": get_request_id(request),
            "form_id": form_id,
            "owner_id": current_user.id,
            "format": format,
            "response_count": export.response_count,
        },
    )
    return Response(
        content=export.body,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{export.filename}"',
        },
    )


@router.get("/{form_id}/responses", response_model=list[FormResponseRead])
def list_form_responses(
    form_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> list[FormResponseRead]:
    return list_form_response_records(form_id, current_user, db)
