from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Literal
import uuid

@dataclass
class AuditLog:
    action: str
    actor: str
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = field(default_factory=datetime.utcnow)
    target_id: Optional[str] = None
    severity: str = 'INFO'
    success: bool = True
    details: Optional[dict] = None
