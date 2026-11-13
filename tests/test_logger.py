"""Contract tests for the structured logging module (src/utils/logger.py)."""

import json
import logging
import time

import pytest

from src.utils.logger import (
    CorrelationFilter,
    JSONFormatter,
    get_logger,
    setup_file_handler,
    setup_timed_rotation,
)


def _unique_name(prefix):
    return f"{prefix}.{time.time_ns()}"


def _make_record(msg="hello", level=logging.INFO, created=None, args=()):
    rec = logging.LogRecord("rec.logger", level, __file__, 42, msg, args, None)
    if created is not None:
        rec.created = created
    return rec


class TestGetLogger:
    def test_level_applied(self):
        assert get_logger(_unique_name("lvl"), "DEBUG").level == logging.DEBUG
        assert get_logger(_unique_name("lvl"), "ERROR").level == logging.ERROR

    def test_level_case_insensitive(self):
        assert get_logger(_unique_name("lvl"), "warning").level == logging.WARNING

    def test_unknown_level_raises(self):
        with pytest.raises(ValueError, match="Unknown log level"):
            get_logger(_unique_name("lvl"), "DEBGU")

    def test_non_level_attribute_rejected(self):
        # 'handlers' exists on the logging module but is not a level
        with pytest.raises(ValueError, match="Unknown log level"):
            get_logger(_unique_name("lvl"), "handlers")

    def test_no_duplicate_handlers_on_repeat_calls(self):
        name = _unique_name("dup")
        first = get_logger(name)
        second = get_logger(name)
        assert first is second
        assert len(second.handlers) == 1

    def test_handler_uses_json_formatter(self):
        logger = get_logger(_unique_name("fmt"))
        assert isinstance(logger.handlers[0].formatter, JSONFormatter)


class TestJSONFormatter:
    def test_output_is_valid_json_with_required_keys(self):
        out = json.loads(JSONFormatter().format(_make_record()))
        for key in ("timestamp", "level", "logger", "message",
                    "module", "function", "line"):
            assert key in out

    def test_fields_reflect_record(self):
        out = json.loads(JSONFormatter().format(_make_record("hi", logging.WARNING)))
        assert out["level"] == "WARNING"
        assert out["logger"] == "rec.logger"
        assert out["message"] == "hi"
        assert out["line"] == 42

    def test_message_formats_args(self):
        out = json.loads(JSONFormatter().format(_make_record("v=%s", args=(7,))))
        assert out["message"] == "v=7"

    def test_timestamp_reflects_event_time(self):
        past = time.time() - 86400
        out = json.loads(JSONFormatter().format(_make_record(created=past)))
        ts = out["timestamp"]
        event = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime(past))
        assert ts.startswith(event)
        assert not ts.startswith(time.strftime("%Y-%m-%d", time.gmtime()))

    def test_exception_included(self):
        try:
            raise RuntimeError("boom")
        except RuntimeError:
            import sys
            rec = _make_record()
            rec.exc_info = sys.exc_info()
        out = json.loads(JSONFormatter().format(rec))
        assert "RuntimeError: boom" in out["exception"]

    def test_correlation_id_omitted_unless_present(self):
        out = json.loads(JSONFormatter().format(_make_record()))
        assert "correlation_id" not in out
        rec = _make_record()
        rec.correlation_id = "cid-1"
        out = json.loads(JSONFormatter().format(rec))
        assert out["correlation_id"] == "cid-1"


class TestCorrelationFilter:
    def test_attaches_id_and_passes_record(self):
        f = CorrelationFilter("abc-123")
        rec = _make_record()
        assert f.filter(rec) is True
        assert rec.correlation_id == "abc-123"

    def test_default_id_is_empty(self):
        f = CorrelationFilter()
        rec = _make_record()
        f.filter(rec)
        assert rec.correlation_id == ""


class TestFileHandlers:
    def test_setup_file_handler_writes_json(self, tmp_path):
        name = _unique_name("file")
        logger = get_logger(name)
        setup_file_handler(logger, log_dir=str(tmp_path))
        logger.info("written")
        for h in logger.handlers:
            h.flush()
        content = (tmp_path / f"{name}.log").read_text()
        assert json.loads(content.strip())["message"] == "written"

    def test_setup_file_handler_rotates(self, tmp_path):
        name = _unique_name("rot")
        logger = get_logger(name)
        setup_file_handler(logger, log_dir=str(tmp_path),
                           max_bytes=200, backup_count=2)
        for i in range(20):
            logger.warning("payload-%d-%s", i, "x" * 60)
        for h in logger.handlers:
            h.flush()
        assert (tmp_path / f"{name}.log.1").exists()

    def test_setup_file_handler_creates_directory(self, tmp_path):
        name = _unique_name("mkdir")
        nested = tmp_path / "a" / "b"
        setup_file_handler(get_logger(name), log_dir=str(nested))
        assert nested.is_dir()

    def test_setup_timed_rotation_writes(self, tmp_path):
        name = _unique_name("timed")
        logger = get_logger(name)
        setup_timed_rotation(logger, log_dir=str(tmp_path), when="s",
                             interval=1, backup_count=1)
        logger.error("timed entry")
        for h in logger.handlers:
            h.flush()
        content = (tmp_path / f"{name}.timed.log").read_text()
        assert json.loads(content.strip())["message"] == "timed entry"
