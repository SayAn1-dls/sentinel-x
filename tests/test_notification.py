"""
Unit Tests for Notification Handlers
=======================================
"""

import pytest
from datetime import datetime
from src.modules.notification import (
    EmailHandler,
    WebhookHandler,
    EmailNotification,
)
from src.modules.alert import Alert, AlertPriority


class TestEmailHandler:
    """Test suite for EmailHandler."""

    def setup_method(self):
        self.handler = EmailHandler(
            from_address="alerts@sentinel-x.io",
            smtp_host="smtp.example.com",
        )

    def _make_alert(self, priority=AlertPriority.P2_HIGH):
        return Alert(
            alert_id="a-001",
            rule_id="r-001",
            title="Temperature Spike",
            message="Server room temperature exceeded 45°C",
            priority=priority,
            source="sensor_temp_01",
            triggered_at=datetime(2026, 8, 29, 10, 0, 0),
        )

    def test_format_email_subject(self):
        alert = self._make_alert()
        email = self.handler.format_alert_email(alert)
        assert "[Sentinel-X]" in email.subject
        assert "Temperature Spike" in email.subject

    def test_format_email_body(self):
        alert = self._make_alert()
        email = self.handler.format_alert_email(alert)
        assert "a-001" in email.body_text
        assert "sensor_temp_01" in email.body_text

    def test_html_body_included(self):
        alert = self._make_alert()
        email = self.handler.format_alert_email(alert)
        assert email.body_html is not None
        assert "Temperature Spike" in email.body_html

    def test_high_priority_email(self):
        alert = self._make_alert(AlertPriority.P1_CRITICAL)
        email = self.handler.format_alert_email(alert)
        assert email.priority == "high"

    def test_low_priority_email(self):
        alert = self._make_alert(AlertPriority.P4_LOW)
        email = self.handler.format_alert_email(alert)
        assert email.priority == "normal"

    def test_send_returns_status(self):
        notification = EmailNotification(
            to="admin@example.com",
            subject="Test",
            body_text="Test body",
        )
        result = self.handler.send(notification)
        assert result["status"] == "sent"


class TestWebhookHandler:
    """Test suite for WebhookHandler."""

    def setup_method(self):
        self.handler = WebhookHandler(secret="test_secret_key")

    def test_sign_payload_deterministic(self):
        sig1 = self.handler.sign_payload('{"test": true}')
        sig2 = self.handler.sign_payload('{"test": true}')
        assert sig1 == sig2

    def test_different_payloads_different_signatures(self):
        sig1 = self.handler.sign_payload('{"a": 1}')
        sig2 = self.handler.sign_payload('{"b": 2}')
        assert sig1 != sig2

    def test_prepare_includes_signature(self):
        alert = Alert(
            alert_id="a-002",
            rule_id="r-001",
            title="Motion Detected",
            message="Motion after hours",
            priority=AlertPriority.P1_CRITICAL,
            source="sensor_motion_01",
            triggered_at=datetime(2026, 8, 29, 22, 0, 0),
        )
        payload = self.handler.prepare(alert, "https://hooks.example.com/alert")
        assert payload.signature is not None
        assert "X-Sentinel-Signature" in payload.headers

    def test_deliver_returns_status(self):
        from src.modules.notification import WebhookPayload
        payload = WebhookPayload(url="https://example.com/hook")
        result = self.handler.deliver(payload)
        assert result["status"] == "delivered"

    def test_no_secret_no_signature(self):
        handler = WebhookHandler(secret="")
        alert = Alert(
            alert_id="a-003", rule_id="r-001", title="Test",
            message="Test", priority=AlertPriority.P3_MEDIUM,
            source="s1", triggered_at=datetime.utcnow(),
        )
        payload = handler.prepare(alert, "https://example.com")
        assert payload.signature is None


class TestEmailHtmlEscaping:
    """Alert-controlled strings must not inject markup into the HTML body."""

    def _hostile_alert(self):
        from datetime import datetime
        from src.modules.alert import Alert, AlertPriority
        return Alert(
            alert_id="a1",
            rule_id="r1",
            title='<img src=x onerror="alert(1)">',
            message="payload: <script>evil()</script>",
            priority=AlertPriority.P1_CRITICAL,
            source="ids",
            triggered_at=datetime(2026, 11, 9, 10, 0, 0),
        )

    def test_html_body_escapes_title_and_message(self):
        from src.modules.notification import EmailHandler
        n = EmailHandler("sec@x.io").format_alert_email(self._hostile_alert())
        assert "<script>evil()</script>" not in n.body_html
        assert 'onerror="alert(1)"' not in n.body_html
        assert "&lt;script&gt;" in n.body_html
        assert "&lt;img" in n.body_html

    def test_text_body_keeps_original_text(self):
        from src.modules.notification import EmailHandler
        n = EmailHandler("sec@x.io").format_alert_email(self._hostile_alert())
        assert "<script>evil()</script>" in n.body_text


class TestSlackHandler:
    """Slack channel advertised by the module docstring."""

    def _alert(self):
        from datetime import datetime
        from src.modules.alert import Alert, AlertPriority
        return Alert(
            alert_id="a1",
            rule_id="r1",
            title="Brute force detected",
            message="200 failed logins",
            priority=AlertPriority.P2_HIGH,
            source="auth",
            triggered_at=datetime(2026, 11, 9, 10, 0, 0),
        )

    def test_format_uses_configured_webhook(self):
        from src.modules.notification import SlackHandler
        h = SlackHandler(webhook_url="https://hooks.slack.com/default")
        m = h.format_alert(self._alert())
        assert m.webhook_url == "https://hooks.slack.com/default"
        assert "[P2_HIGH] Brute force detected" in m.text
        assert m.blocks  # structured payload present

    def test_explicit_webhook_overrides_configured(self):
        from src.modules.notification import SlackHandler
        h = SlackHandler(webhook_url="https://hooks.slack.com/default")
        m = h.format_alert(self._alert(), webhook_url="https://hooks.slack.com/other")
        assert m.webhook_url == "https://hooks.slack.com/other"

    def test_missing_webhook_url_raises(self):
        import pytest
        from src.modules.notification import SlackHandler
        with pytest.raises(ValueError):
            SlackHandler().format_alert(self._alert())

    def test_priority_emoji_mapping(self):
        from datetime import datetime
        from src.modules.alert import Alert, AlertPriority
        from src.modules.notification import SlackHandler
        a = self._alert()
        a.priority = AlertPriority.P1_CRITICAL
        m = SlackHandler("https://hooks.slack.com/x").format_alert(a)
        assert m.text.startswith(":rotating_light:")

    def test_send_returns_status(self):
        from src.modules.notification import SlackHandler
        h = SlackHandler("https://hooks.slack.com/x", default_channel="#sec")
        result = h.send(h.format_alert(self._alert()))
        assert result["status"] == "sent"
        assert result["channel"] == "#sec"
