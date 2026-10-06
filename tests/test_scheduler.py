"""
Unit Tests for Task Scheduler Module
=======================================
"""

import pytest
from src.modules.scheduler import TaskScheduler, TaskStatus


class TestTaskScheduler:
    """Test suite for TaskScheduler."""

    def setup_method(self):
        self.scheduler = TaskScheduler()
        self.exec_count = 0

    def _dummy_task(self):
        self.exec_count += 1

    def _failing_task(self):
        raise RuntimeError("Task failed")

    def test_schedule_and_execute(self):
        task_id = self.scheduler.schedule("test", self._dummy_task)
        results = self.scheduler.tick()
        assert len(results) == 1
        assert results[0]["status"] == "success"
        assert self.exec_count == 1

    def test_one_shot_runs_once(self):
        self.scheduler.schedule("once", self._dummy_task, max_runs=1)
        self.scheduler.tick()
        self.scheduler.tick()  # Should not run again
        assert self.exec_count == 1

    def test_cancel_task(self):
        task_id = self.scheduler.schedule("cancel_me", self._dummy_task, delay_seconds=100)
        assert self.scheduler.cancel(task_id) is True
        results = self.scheduler.tick()
        assert len(results) == 0

    def test_failed_task_status(self):
        self.scheduler.schedule("bad", self._failing_task)
        results = self.scheduler.tick()
        assert results[0]["status"] == "failed"
        assert "error" in results[0]

    def test_get_status(self):
        self.scheduler.schedule("task_a", self._dummy_task)
        self.scheduler.schedule("task_b", self._dummy_task, interval_seconds=60)
        status = self.scheduler.get_status()
        assert len(status) == 2
        names = [s["name"] for s in status]
        assert "task_a" in names
        assert "task_b" in names

    def test_delayed_task_not_due(self):
        self.scheduler.schedule("delayed", self._dummy_task, delay_seconds=3600)
        results = self.scheduler.tick()
        assert len(results) == 0
        assert self.exec_count == 0

    def test_cancel_unknown_task(self):
        assert self.scheduler.cancel("nonexistent") is False
