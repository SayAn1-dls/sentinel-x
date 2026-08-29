"""
Sentinel-X Task Scheduler
===========================
Manages periodic and one-shot scheduled tasks such as
health checks, report generation, and data cleanup.
"""

from typing import Callable, Dict, Any, Optional, List
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import uuid


class TaskStatus(Enum):
    """Status of a scheduled task."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class ScheduledTask:
    """Represents a scheduled task."""
    task_id: str
    name: str
    handler: Callable
    interval_seconds: Optional[int] = None  # None = one-shot
    next_run: datetime = field(default_factory=datetime.utcnow)
    last_run: Optional[datetime] = None
    status: TaskStatus = TaskStatus.PENDING
    run_count: int = 0
    max_runs: Optional[int] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    @property
    def is_recurring(self) -> bool:
        """Check if this is a recurring task."""
        return self.interval_seconds is not None

    @property
    def is_due(self) -> bool:
        """Check if the task is due for execution."""
        if self.status == TaskStatus.CANCELLED:
            return False
        if self.max_runs and self.run_count >= self.max_runs:
            return False
        return datetime.utcnow() >= self.next_run


class TaskScheduler:
    """In-memory task scheduler for periodic operations.

    Manages registration, execution, and lifecycle of scheduled
    tasks. In production, this would integrate with a persistent
    job store (Redis, database).

    Attributes:
        _tasks: Registry of scheduled tasks.
        _execution_log: History of task executions.
    """

    def __init__(self):
        self._tasks: Dict[str, ScheduledTask] = {}
        self._execution_log: List[Dict[str, Any]] = []

    def schedule(
        self,
        name: str,
        handler: Callable,
        interval_seconds: Optional[int] = None,
        delay_seconds: int = 0,
        max_runs: Optional[int] = None,
    ) -> str:
        """Schedule a new task.

        Args:
            name: Human-readable task name.
            handler: Callable to execute.
            interval_seconds: Repeat interval (None for one-shot).
            delay_seconds: Initial delay before first execution.
            max_runs: Maximum number of executions (None for unlimited).

        Returns:
            Task ID.
        """
        task_id = str(uuid.uuid4())[:8]
        task = ScheduledTask(
            task_id=task_id,
            name=name,
            handler=handler,
            interval_seconds=interval_seconds,
            next_run=datetime.utcnow() + timedelta(seconds=delay_seconds),
            max_runs=max_runs,
        )
        self._tasks[task_id] = task
        return task_id

    def cancel(self, task_id: str) -> bool:
        """Cancel a scheduled task.

        Args:
            task_id: ID of the task to cancel.

        Returns:
            True if task was found and cancelled.
        """
        if task_id in self._tasks:
            self._tasks[task_id].status = TaskStatus.CANCELLED
            return True
        return False

    def tick(self) -> List[Dict[str, Any]]:
        """Execute all due tasks.

        Should be called periodically (e.g., every second).

        Returns:
            List of execution results.
        """
        results = []
        for task in self._tasks.values():
            if not task.is_due:
                continue

            task.status = TaskStatus.RUNNING
            result = {"task_id": task.task_id, "name": task.name}

            try:
                task.handler()
                task.status = TaskStatus.COMPLETED
                result["status"] = "success"
            except Exception as e:
                task.status = TaskStatus.FAILED
                result["status"] = "failed"
                result["error"] = str(e)

            task.run_count += 1
            task.last_run = datetime.utcnow()

            if task.is_recurring:
                task.next_run = datetime.utcnow() + timedelta(seconds=task.interval_seconds)
                task.status = TaskStatus.PENDING
            elif task.max_runs and task.run_count >= task.max_runs:
                task.status = TaskStatus.COMPLETED

            results.append(result)
            self._execution_log.append(result)

        return results

    def get_status(self) -> List[Dict[str, Any]]:
        """Get status of all scheduled tasks.

        Returns:
            List of task status summaries.
        """
        return [
            {
                "task_id": t.task_id,
                "name": t.name,
                "status": t.status.value,
                "run_count": t.run_count,
                "next_run": t.next_run.isoformat() if t.status == TaskStatus.PENDING else None,
                "last_run": t.last_run.isoformat() if t.last_run else None,
                "recurring": t.is_recurring,
            }
            for t in self._tasks.values()
        ]
