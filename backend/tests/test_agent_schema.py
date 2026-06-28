import pytest
from pydantic import ValidationError

from app.schemas.agent import (
    FormReviewResult,
    GenerateFormRequest,
    GenerateFormResult,
    ReviewSeverity,
)
from app.schemas.form import FormSchema


def valid_schema() -> FormSchema:
    return FormSchema.model_validate(
        {
            "title": "Student Feedback",
            "fields": [
                {"id": "email", "type": "email", "label": "Email", "required": True},
                {"id": "rating", "type": "rating", "label": "Rating", "required": True},
            ],
        }
    )


def test_accepts_generate_form_request() -> None:
    request = GenerateFormRequest.model_validate(
        {"prompt": "Create a short student feedback survey"}
    )

    assert request.prompt == "Create a short student feedback survey"


def test_rejects_empty_generate_form_request_prompt() -> None:
    with pytest.raises(ValidationError):
        GenerateFormRequest.model_validate({"prompt": ""})


def test_accepts_generate_form_result() -> None:
    result = GenerateFormResult.model_validate(
        {
            "schema": valid_schema().model_dump(),
            "warnings": ["Assumed a five point rating scale."],
        }
    )

    assert result.form_schema.title == "Student Feedback"
    assert result.warnings == ["Assumed a five point rating scale."]


def test_rejects_generate_form_result_with_invalid_schema() -> None:
    with pytest.raises(ValidationError):
        GenerateFormResult.model_validate(
            {
                "schema": {"title": "Invalid", "fields": []},
                "warnings": [],
            }
        )


def test_accepts_form_review_result() -> None:
    result = FormReviewResult.model_validate(
        {
            "schema": valid_schema().model_dump(),
            "suggestions": [
                {
                    "field_id": "email",
                    "severity": ReviewSeverity.WARNING,
                    "message": "Email should remain required for follow-up.",
                },
                {
                    "severity": "info",
                    "message": "The form is short enough for quick completion.",
                },
            ],
        }
    )

    assert result.suggestions[0].field_id == "email"
    assert result.suggestions[1].severity == ReviewSeverity.INFO


def test_rejects_invalid_form_review_result_suggestions() -> None:
    invalid_suggestions = [
        [{"field_id": "unknown", "severity": "info", "message": "Bad field reference."}],
        [{"field_id": "email", "severity": "critical", "message": "Invalid severity."}],
        [{"field_id": "email", "severity": "info", "message": ""}],
        [{"field_id": "email", "severity": "info", "message": "x", "html": "<b>x</b>"}],
    ]

    for suggestions in invalid_suggestions:
        with pytest.raises(ValidationError):
            FormReviewResult.model_validate(
                {
                    "schema": valid_schema().model_dump(),
                    "suggestions": suggestions,
                }
            )
