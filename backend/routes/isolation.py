from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal
import logging

router = APIRouter(prefix='/api/nodes', tags=['isolation'])
logger = logging.getLogger(__name__)

ISOLATED_NODES: set[str] = set()

class IsolationRequest(BaseModel):
    node_id: str
    reason: str
    severity: Literal['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    initiated_by: str = 'SYSTEM'

class IsolationResponse(BaseModel):
    node_id: str
    isolated: bool
    message: str

@router.post('/isolate', response_model=IsolationResponse)
async def isolate_node(req: IsolationRequest):
    if req.node_id in ISOLATED_NODES:
        raise HTTPException(status_code=409, detail=f'Node {req.node_id} already isolated')
    ISOLATED_NODES.add(req.node_id)
    logger.warning(f'Node {req.node_id} isolated | reason={req.reason} | severity={req.severity} | by={req.initiated_by}')
    return IsolationResponse(node_id=req.node_id, isolated=True, message=f'Node {req.node_id} isolated successfully')

@router.post('/release', response_model=IsolationResponse)
async def release_node(req: IsolationRequest):
    ISOLATED_NODES.discard(req.node_id)
    return IsolationResponse(node_id=req.node_id, isolated=False, message=f'Node {req.node_id} released')

@router.get('/isolated')
async def list_isolated():
    return {'isolated_nodes': list(ISOLATED_NODES), 'count': len(ISOLATED_NODES)}
