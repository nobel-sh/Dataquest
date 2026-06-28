from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.form import Form, FormResponse
from app.models.user import User


def require_form_owner(form: Form | None, current_user: User) -> Form:
    if form is None or form.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="form not found")
    return form


def require_public_form(form: Form | None) -> Form:
    if form is None or form.archived:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="form not found")
    return form


def require_submittable_form(form: Form | None, current_user: User | None, db: Session) -> Form:
    form = require_public_form(form)
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

    return form
