"""
Sentinel-X Pagination Utilities
==================================
Cursor-based and offset-based pagination for API responses.
"""

from typing import Any, Dict, List, Optional, TypeVar, Generic
from dataclasses import dataclass
import base64
import json

T = TypeVar("T")


@dataclass
class Page:
    """Represents a paginated response."""
    items: List[Any]
    total: int
    page: int
    page_size: int
    has_next: bool
    has_previous: bool

    @property
    def total_pages(self) -> int:
        """Calculate total number of pages."""
        if self.page_size <= 0:
            return 0
        return (self.total + self.page_size - 1) // self.page_size

    def to_dict(self) -> Dict[str, Any]:
        """Serialize pagination metadata for API response."""
        return {
            "items": self.items,
            "pagination": {
                "total": self.total,
                "page": self.page,
                "page_size": self.page_size,
                "total_pages": self.total_pages,
                "has_next": self.has_next,
                "has_previous": self.has_previous,
            },
        }


def paginate(
    items: List[Any],
    page: int = 1,
    page_size: int = 20,
) -> Page:
    """Apply offset-based pagination to a list.

    Args:
        items: Full list of items.
        page: Page number (1-indexed).
        page_size: Number of items per page.

    Returns:
        Page with items and metadata.
    """
    total = len(items)
    start = (page - 1) * page_size
    end = start + page_size
    page_items = items[start:end]

    return Page(
        items=page_items,
        total=total,
        page=page,
        page_size=page_size,
        has_next=end < total,
        has_previous=page > 1,
    )


def encode_cursor(data: Dict[str, Any]) -> str:
    """Encode pagination cursor data as a base64 string.

    Args:
        data: Cursor data dictionary.

    Returns:
        Base64-encoded cursor string.
    """
    json_str = json.dumps(data, sort_keys=True)
    return base64.urlsafe_b64encode(json_str.encode()).decode()


def decode_cursor(cursor: str) -> Dict[str, Any]:
    """Decode a base64 pagination cursor.

    Args:
        cursor: Base64-encoded cursor string.

    Returns:
        Decoded cursor data dictionary.

    Raises:
        ValueError: If cursor is invalid.
    """
    try:
        json_str = base64.urlsafe_b64decode(cursor.encode()).decode()
        return json.loads(json_str)
    except Exception as e:
        raise ValueError(f"Invalid cursor: {e}")
