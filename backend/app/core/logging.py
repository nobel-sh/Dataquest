from __future__ import annotations

import json
import logging
import sys
from datetime import UTC, datetime
from traceback import format_exception


STANDARD_LOG_FIELDS = {
    "args",
    "asctime",
    "created",
    "exc_info",
    "exc_text",
    "filename",
    "funcName",
    "levelname",
    "levelno",
    "lineno",
    "module",
    "msecs",
    "message",
    "msg",
    "name",
    "pathname",
    "process",
    "processName",
    "relativeCreated",
    "stack_info",
    "thread",
    "threadName",
}


class JsonLogFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": datetime.fromtimestamp(record.created, UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        for key, value in record.__dict__.items():
            if key not in STANDARD_LOG_FIELDS and not key.startswith("_"):
                payload[key] = value

        if record.exc_info:
            payload["exception"] = "".join(format_exception(*record.exc_info)).strip()

        return json.dumps(payload, default=str, separators=(",", ":"))


def configure_logging(level: str, log_format: str = "json") -> None:
    formatter: logging.Formatter
    if log_format == "text":
        formatter = logging.Formatter("%(asctime)s %(levelname)s [%(name)s] %(message)s")
    else:
        formatter = JsonLogFormatter()

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.handlers = [handler]
    root_logger.setLevel(level)

    # Keep SQLAlchemy from logging every query unless explicitly debugging it.
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
