"""Reverse proxy: forwards all traffic to the Next.js app.
Configure the target via NEXT_URL env var (defaults to http://127.0.0.1:3000 for local dev)."""
import os
from fastapi import FastAPI, Request
from fastapi.responses import Response
import httpx

NEXT_URL = os.environ.get("NEXT_URL", "http://127.0.0.1:3000")

app = FastAPI()
client = httpx.AsyncClient(base_url=NEXT_URL, timeout=120.0)

HOP_HEADERS = {
    "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
    "te", "trailers", "transfer-encoding", "upgrade", "content-length", "content-encoding",
}


@app.get("/health")
async def health():
    return {"status": "ok", "proxy_target": NEXT_URL}


@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])
async def proxy(request: Request, path: str):
    headers = {k: v for k, v in request.headers.items() if k.lower() not in ("host", "content-length")}
    host = request.headers.get("host")
    if host:
        headers["x-forwarded-host"] = host
    headers.setdefault("x-forwarded-proto", "https")
    body = await request.body()
    try:
        upstream = await client.request(
            request.method, f"/{path}",
            params=request.query_params, headers=headers, content=body,
        )
    except httpx.ConnectError:
        return Response(content='{"error":"upstream unavailable"}', status_code=502, media_type="application/json")
    resp = Response(content=upstream.content, status_code=upstream.status_code)
    for k, v in upstream.headers.multi_items():
        lk = k.lower()
        if lk in HOP_HEADERS:
            continue
        if lk == "set-cookie":
            resp.headers.append(k, v)
        else:
            resp.headers[k] = v
    return resp
