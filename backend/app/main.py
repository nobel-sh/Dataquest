from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.models  # noqa: F401
from app.core.config import get_settings
from app.routes.auth import router as auth_router
from app.routes.forms import router as forms_router
from app.schemas.agent import FormReviewResult
from app.schemas.form import FormSchema
from app.schemas.form_response import FormResponseSubmission

settings = get_settings()
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(forms_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/schemas/validate", response_model=FormSchema)
def validate_schema(schema: FormSchema) -> FormSchema:
    return schema


@app.post("/responses/validate", response_model=FormResponseSubmission)
def validate_response(submission: FormResponseSubmission) -> FormResponseSubmission:
    return submission


@app.post("/agents/review/validate", response_model=FormReviewResult)
def validate_review_result(review_result: FormReviewResult) -> FormReviewResult:
    return review_result
