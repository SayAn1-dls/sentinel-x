"""Unit tests for the AuditLogger and SensorRegistry modules."""

from datetime import datetime, timedelta

from src.modules.audit import AuditAction, AuditEntry, AuditLogger
from src.modules.sensor_registry import SensorInfo, SensorRegistry, SensorStatus

NOW = datetime.utcnow()


def _entry(action=AuditAction.LOGIN, actor="alice", ts=NOW, success=True, eid="e1"):
    return AuditEntry(entry_id=eid, action=action, actor=actor, timestamp=ts,
                      resource_type="session", resource_id="r1", success=success)


class TestAuditLogger:
    def test_query_newest_first(self):
        log = AuditLogger()
        old = _entry(ts=NOW - timedelta(hours=2), eid="old")
        new = _entry(ts=NOW - timedelta(hours=1), eid="new")
        log.log(old)
        log.log(new)
        assert [e.entry_id for e in log.query()] == ["new", "old"]

    def test_filter_by_action(self):
        log = AuditLogger()
        log.log(_entry(action=AuditAction.LOGIN, eid="l"))
        log.log(_entry(action=AuditAction.CONFIG_CHANGE, eid="c"))
        assert [e.entry_id for e in log.query(action=AuditAction.LOGIN)] == ["l"]

    def test_filter_by_actor(self):
        log = AuditLogger()
        log.log(_entry(actor="alice", eid="a"))
        log.log(_entry(actor="bob", eid="b"))
        assert [e.entry_id for e in log.query(actor="bob")] == ["b"]

    def test_filter_by_time_window(self):
        log = AuditLogger()
        log.log(_entry(ts=NOW - timedelta(hours=5), eid="old"))
        log.log(_entry(ts=NOW - timedelta(minutes=30), eid="recent"))
        log.log(_entry(ts=NOW + timedelta(hours=5), eid="future"))
        res = log.query(since=NOW - timedelta(hours=1), until=NOW + timedelta(hours=1))
        assert [e.entry_id for e in res] == ["recent"]

    def test_limit_applies_after_sort(self):
        log = AuditLogger()
        for i in range(5):
            log.log(_entry(ts=NOW - timedelta(minutes=i), eid=f"e{i}"))
        res = log.query(limit=2)
        assert [e.entry_id for e in res] == ["e0", "e1"]

    def test_max_entries_trims_oldest(self):
        log = AuditLogger(max_entries=3)
        for i in range(5):
            log.log(_entry(ts=NOW - timedelta(minutes=5 - i), eid=f"e{i}"))
        assert len(log._entries) == 3
        assert [e.entry_id for e in log.query(limit=10)] == ["e4", "e3", "e2"]

    def test_get_failed_logins_window(self):
        log = AuditLogger()
        log.log(_entry(action=AuditAction.LOGIN_FAILED, success=False,
                       ts=NOW - timedelta(minutes=30), eid="recent_fail"))
        log.log(_entry(action=AuditAction.LOGIN_FAILED, success=False,
                       ts=NOW - timedelta(hours=3), eid="old_fail"))
        log.log(_entry(action=AuditAction.LOGIN, ts=NOW - timedelta(minutes=5), eid="ok"))
        res = log.get_failed_logins(minutes=60)
        assert [e.entry_id for e in res] == ["recent_fail"]


def _sensor(sid="s1", stype="network", status=SensorStatus.ACTIVE):
    return SensorInfo(sensor_id=sid, name=sid, sensor_type=stype,
                      location="dc1", status=status)


class TestSensorRegistry:
    def test_register_new_and_duplicate(self):
        reg = SensorRegistry()
        assert reg.register(_sensor("s1")) is True
        assert reg.register(_sensor("s1")) is False
        assert reg.get("s1") is not None
        assert reg.get("missing") is None

    def test_update_status(self):
        reg = SensorRegistry()
        reg.register(_sensor("s1"))
        assert reg.update_status("s1", SensorStatus.MAINTENANCE) is True
        assert reg.get("s1").status == SensorStatus.MAINTENANCE
        assert reg.update_status("missing", SensorStatus.ACTIVE) is False

    def test_record_ping_updates_state(self):
        reg = SensorRegistry()
        reg.register(_sensor("s1"))
        assert reg.record_ping("s1") is True
        s = reg.get("s1")
        assert s.last_ping is not None
        assert s.reading_count == 1
        assert s.is_stale is False

    def test_record_ping_recovers_offline_sensor(self):
        reg = SensorRegistry()
        reg.register(_sensor("s1", status=SensorStatus.OFFLINE))
        reg.record_ping("s1")
        assert reg.get("s1").status == SensorStatus.ACTIVE

    def test_record_ping_missing_sensor(self):
        assert SensorRegistry().record_ping("nope") is False

    def test_is_stale_without_ping(self):
        assert _sensor("s1").is_stale is True

    def test_is_stale_with_old_ping(self):
        s = _sensor("s1")
        s.last_ping = datetime.utcnow() - timedelta(minutes=10)
        assert s.is_stale is True

    def test_get_stale_sensors_only_active(self):
        reg = SensorRegistry()
        stale_active = _sensor("s1")                       # no ping -> stale
        stale_offline = _sensor("s2", status=SensorStatus.OFFLINE)
        fresh = _sensor("s3")
        fresh.last_ping = datetime.utcnow()
        for s in (stale_active, stale_offline, fresh):
            reg.register(s)
        assert [s.sensor_id for s in reg.get_stale_sensors()] == ["s1"]

    def test_list_sensors_filters(self):
        reg = SensorRegistry()
        reg.register(_sensor("s1", stype="network"))
        reg.register(_sensor("s2", stype="endpoint", status=SensorStatus.OFFLINE))
        assert len(reg.list_sensors()) == 2
        assert [s.sensor_id for s in reg.list_sensors(status=SensorStatus.OFFLINE)] == ["s2"]
        assert [s.sensor_id for s in reg.list_sensors(sensor_type="network")] == ["s1"]

    def test_active_count(self):
        reg = SensorRegistry()
        reg.register(_sensor("s1"))
        reg.register(_sensor("s2", status=SensorStatus.OFFLINE))
        assert reg.active_count == 1

    def test_decommission(self):
        reg = SensorRegistry()
        reg.register(_sensor("s1"))
        assert reg.decommission("s1", reason="end of life") is True
        s = reg.get("s1")
        assert s.status == SensorStatus.DECOMMISSIONED
        assert s.metadata["decommission_reason"] == "end of life"
        assert "decommissioned_at" in s.metadata
        assert reg.decommission("missing") is False
