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


class TestOneShotSemantics:
    """Regression: a one-shot task (interval_seconds=None, no max_runs)
    must execute exactly once. Before the fix, is_due ignored task
    status, so completed/failed one-shot tasks re-ran on every tick."""

    def setup_method(self):
        self.scheduler = TaskScheduler()
        self.exec_count = 0

    def _counting_task(self):
        self.exec_count += 1

    def test_one_shot_without_max_runs_runs_exactly_once(self):
        self.scheduler.schedule("once", self._counting_task)
        self.scheduler.tick()
        self.scheduler.tick()
        self.scheduler.tick()
        assert self.exec_count == 1

    def test_failed_one_shot_not_retried(self):
        calls = []

        def bad():
            calls.append(1)
            raise RuntimeError("boom")

        self.scheduler.schedule("bad", bad)
        first = self.scheduler.tick()
        assert first[0]["status"] == "failed"
        second = self.scheduler.tick()
        assert second == []
        assert len(calls) == 1

    def test_completed_one_shot_reports_completed(self):
        self.scheduler.schedule("once", self._counting_task)
        self.scheduler.tick()
        status = {s["name"]: s for s in self.scheduler.get_status()}
        assert status["once"]["status"] == "completed"


class TestRecurringSemantics:
    """Recurring tasks keep running on their interval after the fix."""

    def setup_method(self):
        self.scheduler = TaskScheduler()
        self.exec_count = 0

    def _counting_task(self):
        self.exec_count += 1

    def test_recurring_runs_every_elapsed_interval(self):
        self.scheduler.schedule("rec", self._counting_task, interval_seconds=0)
        self.scheduler.tick()
        self.scheduler.tick()
        assert self.exec_count == 2
        status = {s["name"]: s for s in self.scheduler.get_status()}
        assert status["rec"]["status"] == "pending"

    def test_recurring_max_runs_stops_after_limit(self):
        self.scheduler.schedule(
            "rec", self._counting_task, interval_seconds=0, max_runs=2)
        self.scheduler.tick()
        self.scheduler.tick()
        self.scheduler.tick()
        assert self.exec_count == 2
