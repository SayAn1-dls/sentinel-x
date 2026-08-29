"""
Unit Tests for API Response Utilities
=======================================
"""

import pytest
from src.utils.response import (
    success_response,
    error_response,
    validation_error,
    not_found,
    unauthorized,
    rate_limited,
)


class TestSuccessResponse:
    def test_basic_success(self):
        resp = success_response(data={"id": "123"})
        assert resp["success"] is True
        assert resp["status"] == 200
        assert resp["data"]["id"] == "123"
        assert "timestamp" in resp

    def test_with_meta(self):
        resp = success_response(
            data=[1, 2, 3],
            meta={"page": 1, "total": 10},
        )
        assert resp["meta"]["page"] == 1

    def test_custom_status(self):
        resp = success_response(status_code=201, message="Created")
        assert resp["status"] == 201
        assert resp["message"] == "Created"


class TestErrorResponse:
    def test_basic_error(self):
        resp = error_response("bad_request", "Invalid input")
        assert resp["success"] is False
        assert resp["error"]["code"] == "bad_request"

    def test_with_details(self):
        resp = error_response(
            "validation_error", "Failed",
            details=[{"field": "email", "message": "invalid"}],
        )
        assert len(resp["error"]["details"]) == 1

    def test_validation_error(self):
        resp = validation_error([
            {"field": "email", "message": "required"},
            {"field": "name", "message": "too short"},
        ])
        assert resp["status"] == 422
        assert len(resp["error"]["details"]) == 2

    def test_not_found(self):
        resp = not_found("sensor", "sen_001")
        assert resp["status"] == 404
        assert "sen_001" in resp["error"]["message"]

    def test_unauthorized(self):
        resp = unauthorized()
        assert resp["status"] == 401

    def test_rate_limited(self):
        resp = rate_limited(30.0)
        assert resp["status"] == 429
        assert "30.0" in resp["error"]["message"]
