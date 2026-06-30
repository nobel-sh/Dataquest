from __future__ import annotations

import re
from collections import defaultdict

from app.schemas.agent import FormReviewResult, FormReviewSuggestion, ReviewSeverity
from app.schemas.form import FieldType, FormField, FormSchema

VAGUE_LABELS = {
    "comments",
    "details",
    "feedback",
    "info",
    "information",
    "other",
}
CONTACT_TERMS = {"contact", "lead", "inquiry", "signup", "registration"}
FEEDBACK_TERMS = {"feedback", "survey", "satisfaction", "evaluation", "review"}


def review_form_schema(form_schema: FormSchema) -> FormReviewResult:
    suggestions: list[FormReviewSuggestion] = []
    suggestions.extend(review_duplicate_labels(form_schema))
    suggestions.extend(review_required_load(form_schema))
    suggestions.extend(review_contact_fields(form_schema))
    suggestions.extend(review_feedback_shape(form_schema))
    suggestions.extend(review_field_quality(form_schema))

    return FormReviewResult.model_validate(
        {
            "schema": form_schema,
            "suggestions": dedupe_suggestions(suggestions),
        }
    )


def review_duplicate_labels(form_schema: FormSchema) -> list[FormReviewSuggestion]:
    labels_by_normalized: dict[str, list[FormField]] = defaultdict(list)
    for field in form_schema.fields:
        labels_by_normalized[normalize_text(field.label)].append(field)

    suggestions: list[FormReviewSuggestion] = []
    for fields in labels_by_normalized.values():
        if len(fields) <= 1:
            continue
        for field in fields[1:]:
            suggestions.append(
                FormReviewSuggestion(
                    field_id=field.id,
                    severity=ReviewSeverity.WARNING,
                    message=(
                        "This question repeats another label. Combine or reword duplicate "
                        "questions."
                    ),
                )
            )
    return suggestions


def review_required_load(form_schema: FormSchema) -> list[FormReviewSuggestion]:
    field_count = len(form_schema.fields)
    required_count = sum(1 for field in form_schema.fields if field.required)

    if field_count < 4:
        return []

    required_ratio = required_count / field_count
    if required_ratio >= 0.8:
        return [
            FormReviewSuggestion(
                severity=ReviewSeverity.WARNING,
                message=(
                    "Most questions are required. Make non-essential fields optional to improve "
                    "completion rate."
                ),
            )
        ]

    return []


def review_contact_fields(form_schema: FormSchema) -> list[FormReviewSuggestion]:
    email_field = first_field_of_type(form_schema, FieldType.EMAIL)
    phone_field = first_field_of_type(form_schema, FieldType.PHONE)

    if email_field is not None and phone_field is not None and phone_field.required:
        return [
            FormReviewSuggestion(
                field_id=phone_field.id,
                severity=ReviewSeverity.WARNING,
                message="Phone number may be optional when email is already collected.",
            )
        ]

    if contains_terms(form_text(form_schema), CONTACT_TERMS) and email_field is None:
        return [
            FormReviewSuggestion(
                severity=ReviewSeverity.WARNING,
                message="Consider adding an email field so respondents can be contacted later.",
            )
        ]

    return []


def review_feedback_shape(form_schema: FormSchema) -> list[FormReviewSuggestion]:
    if not contains_terms(form_text(form_schema), FEEDBACK_TERMS):
        return []

    if any(field.type == FieldType.RATING for field in form_schema.fields):
        return []

    return [
        FormReviewSuggestion(
            severity=ReviewSeverity.INFO,
            message=(
                "Feedback forms often benefit from a rating field for quick quantitative "
                "analysis."
            ),
        )
    ]


def review_field_quality(form_schema: FormSchema) -> list[FormReviewSuggestion]:
    suggestions: list[FormReviewSuggestion] = []

    for field in form_schema.fields:
        normalized_label = normalize_text(field.label)

        if normalized_label in VAGUE_LABELS:
            suggestions.append(
                FormReviewSuggestion(
                    field_id=field.id,
                    severity=ReviewSeverity.INFO,
                    message="This label is broad. Use a more specific question prompt.",
                )
            )

        if field.type == FieldType.TEXTAREA and field.required:
            suggestions.append(
                FormReviewSuggestion(
                    field_id=field.id,
                    severity=ReviewSeverity.INFO,
                    message="Long-answer questions are often easier to complete when optional.",
                )
            )

        if field.type in {FieldType.TEXT, FieldType.NUMBER} and looks_like_rating_prompt(field):
            suggestions.append(
                FormReviewSuggestion(
                    field_id=field.id,
                    severity=ReviewSeverity.WARNING,
                    message=(
                        "This looks like a rating question. Use the rating field type for "
                        "consistency."
                    ),
                )
            )

        if field.type in {FieldType.SELECT, FieldType.RADIO, FieldType.CHECKBOX}:
            option_count = len(field.options or [])
            if option_count > 10:
                suggestions.append(
                    FormReviewSuggestion(
                        field_id=field.id,
                        severity=ReviewSeverity.INFO,
                        message=(
                            "This field has many options. Consider grouping choices or using "
                            "fewer options."
                        ),
                    )
                )

    return suggestions


def first_field_of_type(form_schema: FormSchema, field_type: FieldType) -> FormField | None:
    return next((field for field in form_schema.fields if field.type == field_type), None)


def looks_like_rating_prompt(field: FormField) -> bool:
    text = normalize_text(" ".join([field.label, field.description or "", field.placeholder or ""]))
    return (
        "rate" in text
        or "rating" in text
        or re.search(r"\b1\s*(to|-)\s*(5|10)\b", text) is not None
    )


def form_text(form_schema: FormSchema) -> str:
    parts = [form_schema.title, form_schema.description or ""]
    parts.extend(field.label for field in form_schema.fields)
    return normalize_text(" ".join(parts))


def contains_terms(text: str, terms: set[str]) -> bool:
    return any(term in text for term in terms)


def normalize_text(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def dedupe_suggestions(suggestions: list[FormReviewSuggestion]) -> list[FormReviewSuggestion]:
    seen: set[tuple[str | None, ReviewSeverity, str]] = set()
    unique: list[FormReviewSuggestion] = []

    for suggestion in suggestions:
        key = (suggestion.field_id, suggestion.severity, suggestion.message)
        if key in seen:
            continue
        seen.add(key)
        unique.append(suggestion)

    return unique
