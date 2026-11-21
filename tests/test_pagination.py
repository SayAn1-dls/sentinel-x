"""
Unit Tests for Pagination Utilities
=====================================
Contract tests for offset pagination, Page metadata,
and cursor encoding/decoding.
"""

import pytest
from src.utils.pagination import (
    Page,
    paginate,
    encode_cursor,
    decode_cursor,
)


ITEMS = list(range(100))


class TestPage:
    """Page metadata contract."""

    def test_total_pages_exact_multiple(self):
        p = Page(items=[], total=100, page=1, page_size=20, has_next=True, has_previous=False)
        assert p.total_pages == 5

    def test_total_pages_with_remainder(self):
        p = Page(items=[], total=101, page=1, page_size=20, has_next=True, has_previous=False)
        assert p.total_pages == 6

    def test_total_pages_zero_items(self):
        p = Page(items=[], total=0, page=1, page_size=20, has_next=False, has_previous=False)
        assert p.total_pages == 0

    def test_total_pages_guard_on_bad_page_size(self):
        p = Page(items=[], total=10, page=1, page_size=0, has_next=False, has_previous=False)
        assert p.total_pages == 0

    def test_to_dict_shape(self):
        p = Page(items=[1, 2], total=10, page=2, page_size=2, has_next=True, has_previous=True)
        d = p.to_dict()
        assert d["items"] == [1, 2]
        assert d["pagination"] == {
            "total": 10, "page": 2, "page_size": 2,
            "total_pages": 5, "has_next": True, "has_previous": True,
        }


class TestPaginate:
    """Offset pagination contract (1-indexed pages)."""

    def test_first_page(self):
        p = paginate(ITEMS, page=1, page_size=20)
        assert p.items == list(range(20))
        assert p.has_previous is False
        assert p.has_next is True
        assert p.total == 100

    def test_middle_page(self):
        p = paginate(ITEMS, page=3, page_size=20)
        assert p.items == list(range(40, 60))
        assert p.has_previous is True
        assert p.has_next is True

    def test_last_page(self):
        p = paginate(ITEMS, page=5, page_size=20)
        assert p.items == list(range(80, 100))
        assert p.has_next is False
        assert p.has_previous is True

    def test_partial_last_page(self):
        p = paginate(ITEMS, page=3, page_size=40)
        assert p.items == list(range(80, 100))
        assert len(p.items) == 20
        assert p.has_next is False

    def test_page_beyond_range_is_empty(self):
        p = paginate(ITEMS, page=10, page_size=20)
        assert p.items == []
        assert p.has_next is False
        assert p.has_previous is True

    def test_empty_list(self):
        p = paginate([], page=1, page_size=20)
        assert p.items == []
        assert p.total == 0
        assert p.has_next is False
        assert p.has_previous is False

    def test_page_size_larger_than_list(self):
        p = paginate([1, 2, 3], page=1, page_size=20)
        assert p.items == [1, 2, 3]
        assert p.has_next is False

    def test_page_zero_rejected(self):
        """Pages are 1-indexed; page 0 is a caller bug and must not
        silently return data."""
        with pytest.raises(ValueError):
            paginate(ITEMS, page=0, page_size=20)

    def test_negative_page_rejected(self):
        """Regression: negative pages used to leak a middle slice through
        Python's negative list indexing (page=-1 returned items 60-80)."""
        with pytest.raises(ValueError):
            paginate(ITEMS, page=-1, page_size=20)

    def test_zero_page_size_rejected(self):
        """page_size=0 used to return an empty page with has_next=True."""
        with pytest.raises(ValueError):
            paginate(ITEMS, page=1, page_size=0)

    def test_negative_page_size_rejected(self):
        with pytest.raises(ValueError):
            paginate(ITEMS, page=1, page_size=-5)


class TestCursors:
    """Cursor encode/decode contract."""

    def test_round_trip(self):
        cursor = encode_cursor({"offset": 40, "sort": "ts"})
        assert decode_cursor(cursor) == {"offset": 40, "sort": "ts"}

    def test_encoding_is_deterministic(self):
        assert encode_cursor({"b": 1, "a": 2}) == encode_cursor({"a": 2, "b": 1})

    def test_invalid_cursor_raises(self):
        with pytest.raises(ValueError):
            decode_cursor("not-valid-b64!!!")

    def test_garbage_prefixed_cursor_raises(self):
        """Regression: invalid base64 characters used to be silently
        discarded, so a corrupted cursor decoded to valid-looking data."""
        cursor = encode_cursor({"offset": 40})
        with pytest.raises(ValueError):
            decode_cursor("!!!" + cursor)

    def test_non_json_payload_raises(self):
        with pytest.raises(ValueError):
            decode_cursor("aGVsbG8gd29ybGRoaXQ=")  # base64 of plain text
