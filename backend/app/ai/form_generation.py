from __future__ import annotations

import re
from abc import ABC, abstractmethod
from typing import Any

import httpx
from fastapi import HTTPException, status
from pydantic import ValidationError

from app.core.config import Settings, get_settings
from app.schemas.agent import GenerateFormResult
from app.schemas.form import FormSchema


class FormGenerator(ABC):
    @abstractmethod
    def generate(self, prompt: str) -> GenerateFormResult:
        """Generate a validated form schema without persisting it."""


class MockFormGenerator(FormGenerator):
    def generate(self, prompt: str) -> GenerateFormResult:
        title = title_from_prompt(prompt)
        schema = FormSchema(
            title=title,
            description=f"Generated draft based on: {prompt[:120]}",
            fields=[
                {
                    "id": "name",
                    "type": "text",
                    "label": "Name",
                    "required": True,
                },
                {
                    "id": "email",
                    "type": "email",
                    "label": "Email",
                    "required": True,
                },
                {
                    "id": "rating",
                    "type": "rating",
                    "label": "Overall rating",
                    "required": True,
                    "min": 1,
                    "max": 5,
                },
                {
                    "id": "comments",
                    "type": "textarea",
                    "label": "Additional comments",
                    "required": False,
                },
            ],
        )
        return GenerateFormResult.model_validate(
            {
                "schema": schema,
                "warnings": ["Generated with mock provider; no external AI call was made."],
            }
        )


class GeminiFormGenerator(FormGenerator):
    def __init__(self, api_key: str, model: str) -> None:
        self.api_key = api_key
        self.model = model

    def generate(self, prompt: str) -> GenerateFormResult:
        try:
            response = httpx.post(
                (
                    "https://generativelanguage.googleapis.com/v1beta/models/"
                    f"{self.model}:generateContent"
                ),
                headers={
                    "Content-Type": "application/json",
                    "x-goog-api-key": self.api_key,
                },
                json=gemini_payload(prompt),
                timeout=30.0,
            )
        except httpx.HTTPError as error:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Gemini generation request failed: {error.__class__.__name__}",
            ) from error

        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=gemini_error_detail(response),
            )

        try:
            text = extract_gemini_text(response.json())
            schema = FormSchema.model_validate_json(text)
        except (KeyError, TypeError, ValueError, ValidationError) as error:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Gemini returned an invalid form schema",
            ) from error

        return GenerateFormResult.model_validate({"schema": schema})


def get_form_generator(settings: Settings | None = None) -> FormGenerator:
    resolved_settings = settings or get_settings()

    match resolved_settings.ai_provider:
        case "mock":
            return MockFormGenerator()
        case "gemini":
            if not resolved_settings.gemini_api_key:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="GEMINI_API_KEY is required when AI_PROVIDER=gemini",
                )
            return GeminiFormGenerator(
                api_key=resolved_settings.gemini_api_key,
                model=resolved_settings.gemini_model,
            )
        case unknown_provider:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"unsupported AI_PROVIDER: {unknown_provider}",
            )


def gemini_payload(prompt: str) -> dict[str, Any]:
    return {
        "contents": [
            {
                "parts": [
                    {
                        "text": (
                            "Generate a survey/form schema as strict JSON.\n"
                            "Return only a JSON object with this shape:\n"
                            "{\n"
                            '  "title": "string",\n'
                            '  "description": "string or null",\n'
                            '  "fields": [\n'
                            "    {\n"
                            '      "id": "lowercase_snake_case",\n'
                            '      "type": "text|textarea|number|email|phone|date|select|radio|'
                            'checkbox|rating",\n'
                            '      "label": "string",\n'
                            '      "required": true,\n'
                            '      "description": "string or null",\n'
                            '      "placeholder": "string or null",\n'
                            '      "options": [{"label": "string", "value": "string"}],\n'
                            '      "min": 1,\n'
                            '      "max": 5\n'
                            "    }\n"
                            "  ]\n"
                            "}\n"
                            "Rules: field IDs must be unique; options are only for select, radio, "
                            "and checkbox; min/max are only for number and rating; rating min/max "
                            "must stay between 1 and 10; do not include HTML, JavaScript, SQL, "
                            "markdown, comments, or explanations.\n\n"
                            f"Request: {prompt}"
                        )
                    }
                ]
            }
        ],
        "generationConfig": {
            "response_mime_type": "application/json",
        },
    }


def extract_gemini_text(payload: dict[str, Any]) -> str:
    return payload["candidates"][0]["content"]["parts"][0]["text"]


def gemini_error_detail(response: httpx.Response) -> str:
    fallback = f"Gemini generation failed: {response.status_code}"

    try:
        body = response.json()
    except ValueError:
        return fallback

    message = body.get("error", {}).get("message")
    if isinstance(message, str) and message:
        return f"{fallback}: {message}"

    return fallback


def title_from_prompt(prompt: str) -> str:
    words = re.findall(r"[A-Za-z0-9]+", prompt.lower())
    stop_words = {"a", "an", "the", "for", "to", "of", "with", "and", "or", "form", "survey"}
    title_words = [word for word in words if word not in stop_words][:4]

    if not title_words:
        return "Generated Form"

    return " ".join(word.capitalize() for word in title_words)
