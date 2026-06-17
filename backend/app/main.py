from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

import app.models  # noqa: F401
from app.db.base import Base
from app.db.session import engine
from app.schemas.agent import FormReviewResult
from app.schemas.form import FormSchema
from app.schemas.form_response import FormResponseSubmission


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(lifespan=lifespan)


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
