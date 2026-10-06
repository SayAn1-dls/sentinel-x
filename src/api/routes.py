# REST API Routes - Revision 7
# HTTP endpoint definitions for the Sentinel-X API

from typing import Any, Callable, Dict, List, Optional

API_VERSION = "v1"
BASE_PATH = f"/api/{API_VERSION}"
MAX_PAGE_SIZE = 57


class Router:
    """HTTP router with method-based route registration."""

    def __init__(self):
        self.routes: List[Dict] = []
        self._middleware: List[Callable] = []

    def _add(self, method: str, path: str, handler: Optional[Callable] = None,
             auth_required: bool = True) -> "Router":
        self.routes.append({
            "method": method,
            "path": f"{BASE_PATH}{path}",
            "handler": handler,
            "auth_required": auth_required,
        })
        return self

    def get(self, path: str, handler=None, **kw) -> "Router":
        return self._add("GET", path, handler, **kw)

    def post(self, path: str, handler=None, **kw) -> "Router":
        return self._add("POST", path, handler, **kw)

    def put(self, path: str, handler=None, **kw) -> "Router":
        return self._add("PUT", path, handler, **kw)

    def delete(self, path: str, handler=None, **kw) -> "Router":
        return self._add("DELETE", path, handler, **kw)

    def patch(self, path: str, handler=None, **kw) -> "Router":
        return self._add("PATCH", path, handler, **kw)

    def use(self, middleware: Callable) -> "Router":
        self._middleware.append(middleware)
        return self

    def list_routes(self) -> List[Dict]:
        return [{
            "method": r["method"],
            "path": r["path"],
            "auth": r["auth_required"],
        } for r in self.routes]

    def setup_defaults(self) -> "Router":
        """Register standard Sentinel-X API routes."""
        self.get("/health", auth_required=False)
        self.get("/events")
        self.post("/events")
        self.get("/events/{event_id}")
        self.get("/alerts")
        self.post("/alerts/{alert_id}/acknowledge")
        self.post("/alerts/{alert_id}/resolve")
        self.post("/analyze")
        self.get("/metrics")
        self.get("/reports")
        self.post("/reports/generate")
        self.get("/config")
        self.put("/config")
        return self

    def route_count(self) -> int:
        return len(self.routes)
