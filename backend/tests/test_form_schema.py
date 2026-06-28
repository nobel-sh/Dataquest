import pytest
from pydantic import ValidationError

from app.schemas.form import FormSchema


def test_accepts_valid_form_schema() -> None:
    schema = FormSchema.model_validate(
        {
            "title": "Student Feedback",
            "description": "Course feedback survey",
            "fields": [
                {
                    "id": "email",
                    "type": "email",
                    "label": "Email address",
                    "required": True,
                },
                {
                    "id": "rating",
                    "type": "rating",
                    "label": "Rate this course",
                    "required": True,
                },
                {
                    "id": "preferred_contact",
                    "type": "radio",
                    "label": "Preferred contact method",
                    "options": [
                        {"label": "Email", "value": "email"},
                        {"label": "Phone", "value": "phone"},
                    ],
                },
            ],
        }
    )

    assert schema.fields[1].min == 1
    assert schema.fields[1].max == 5


def test_rejects_invalid_form_schema() -> None:
    invalid_payloads = [
        {
            "title": "Duplicate IDs",
            "fields": [
                {"id": "email", "type": "email", "label": "Email"},
                {"id": "email", "type": "text", "label": "Name"},
            ],
        },
        {
            "title": "Unsupported Type",
            "fields": [{"id": "html", "type": "html", "label": "HTML"}],
        },
        {
            "title": "Missing Label",
            "fields": [{"id": "name", "type": "text", "label": ""}],
        },
        {
            "title": "Select Without Options",
            "fields": [{"id": "department", "type": "select", "label": "Department"}],
        },
        {
            "title": "Text With Options",
            "fields": [
                {
                    "id": "name",
                    "type": "text",
                    "label": "Name",
                    "options": [{"label": "A", "value": "a"}],
                }
            ],
        },
        {
            "title": "Invalid Min Max",
            "fields": [{"id": "age", "type": "number", "label": "Age", "min": 10, "max": 1}],
        },
        {
            "title": "Nested Field",
            "fields": [{"id": "group", "type": "text", "label": "Group", "fields": []}],
        },
        {
            "title": "Bad Field ID",
            "fields": [{"id": "First Name", "type": "text", "label": "First name"}],
        },
        {
            "title": "Raw HTML",
            "fields": [{"id": "name", "type": "text", "label": "Name", "html": "<input />"}],
        },
    ]

    for payload in invalid_payloads:
        with pytest.raises(ValidationError):
            FormSchema.model_validate(payload)
