from datetime import UTC, datetime
from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.schemas.form import FormSchema
from app.schemas.form_response import FormResponseCreate, FormResponseRead, FormResponseSubmission


def valid_schema() -> FormSchema:
    return FormSchema.model_validate(
        {
            "title": "Student Feedback",
            "fields": [
                {"id": "email", "type": "email", "label": "Email", "required": True},
                {"id": "age", "type": "number", "label": "Age", "min": 18, "max": 99},
                {"id": "start_date", "type": "date", "label": "Start date"},
                {"id": "rating", "type": "rating", "label": "Rating", "required": True},
                {
                    "id": "department",
                    "type": "select",
                    "label": "Department",
                    "options": [
                        {"label": "Engineering", "value": "engineering"},
                        {"label": "Support", "value": "support"},
                    ],
                },
                {
                    "id": "topics",
                    "type": "checkbox",
                    "label": "Topics",
                    "options": [
                        {"label": "Product", "value": "product"},
                        {"label": "Pricing", "value": "pricing"},
                    ],
                },
            ],
        }
    )


def test_accepts_response_create_shape() -> None:
    response = FormResponseCreate.model_validate(
        {
            "form_id": uuid4(),
            "form_version_id": uuid4(),
            "answers": {"email": "student@example.com", "rating": 5},
        }
    )

    assert response.answers["rating"] == 5


def test_accepts_response_read_shape() -> None:
    response = FormResponseRead.model_validate(
        {
            "id": uuid4(),
            "form_id": uuid4(),
            "form_version_id": uuid4(),
            "answers": {"email": "student@example.com", "rating": 5},
            "submitted_at": datetime.now(UTC),
        }
    )

    assert response.submitted_at.tzinfo is not None


def test_accepts_submission_answers_matching_schema() -> None:
    submission = FormResponseSubmission.model_validate(
        {
            "schema": valid_schema().model_dump(),
            "answers": {
                "email": "student@example.com",
                "age": 21,
                "start_date": "2026-06-18",
                "rating": 5,
                "department": "engineering",
                "topics": ["product", "pricing"],
            },
        }
    )

    assert submission.answers["department"] == "engineering"


def test_rejects_submission_answers_not_matching_schema() -> None:
    invalid_answers = [
        {"rating": 5},
        {"email": "student@example.com"},
        {"email": "not-an-email", "rating": 5},
        {"email": "student@example.com", "rating": 11},
        {"email": "student@example.com", "rating": 5, "unknown": "value"},
        {"email": "student@example.com", "rating": 5, "department": "sales"},
        {"email": "student@example.com", "rating": 5, "topics": ["unknown"]},
        {"email": "student@example.com", "rating": 5, "start_date": "18-06-2026"},
        {"email": "student@example.com", "rating": True},
    ]

    for answers in invalid_answers:
        with pytest.raises(ValidationError):
            FormResponseSubmission.model_validate(
                {
                    "schema": valid_schema().model_dump(),
                    "answers": answers,
                }
            )
