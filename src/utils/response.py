"""
Sentinel-X API Response Utilities
====================================
Standardized API response formatting for consistent
client-side handling across all endpoints.
"""

from typing import Any, Dict, List, Optional
from datetime import datetime


def success_response(
    data: Any = None,
    message: str = "Success",
    status_code: int = 200,
    meta: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Create a standardized success response.

    Args:
        data: Response payload.
        message: Human-readable success message.
        status_code: HTTP status code.
        meta: Additional metadata (pagination, etc.).

    Returns:
        Formatted response dictionary.
    """
    response = {
        "success": True,
        "status": status_code,
        "message": message,
        "data": data,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }
    if meta:
        response["meta"] = meta
    return response


def error_response(
    error_code: str,
    message: str,
    status_code: int = 400,
    details: Optional[List[Dict[str, str]]] = None,
) -> Dict[str, Any]:
    """Create a standardized error response.

    Args:
        error_code: Machine-readable error code.
        message: Human-readable error message.
        status_code: HTTP status code.
        details: List of field-level error details.

    Returns:
        Formatted error response dictionary.
    """
    response = {
        "success": False,
        "status": status_code,
        "error": {
            "code": error_code,
            "message": message,
        },
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }
    if details:
        response["error"]["details"] = details
    return response


def validation_error(
    errors: List[Dict[str, str]],
) -> Dict[str, Any]:
    """Create a validation error response.

    Args:
        errors: List of validation errors, each with 'field' and 'message'.

    Returns:
        Formatted 422 validation error response.
    """
    return error_response(
        error_code="validation_error",
        message="One or more fields failed validation",
        status_code=422,
        details=errors,
    )


def not_found(resource: str, resource_id: str) -> Dict[str, Any]:
    """Create a 404 not found response.

    Args:
        resource: Type of resource (e.g., 'sensor', 'alert').
        resource_id: ID of the missing resource.

    Returns:
        Formatted 404 response.
    """
    return error_response(
        error_code="not_found",
        message=f"{resource} with ID '{resource_id}' not found",
        status_code=404,
    )


def unauthorized(message: str = "Authentication required") -> Dict[str, Any]:
    """Create a 401 unauthorized response."""
    return error_response(
        error_code="unauthorized",
        message=message,
        status_code=401,
    )


def rate_limited(retry_after: float) -> Dict[str, Any]:
    """Create a 429 rate limited response.

    Args:
        retry_after: Seconds until the client can retry.

    Returns:
        Formatted 429 response.
    """
    return error_response(
        error_code="rate_limited",
        message=f"Rate limit exceeded. Retry after {retry_after:.1f} seconds",
        status_code=429,
        details=[{"retry_after": f"{retry_after:.1f}s"}],
    )
