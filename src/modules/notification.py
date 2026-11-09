"""
Sentinel-X Notification Handlers
==================================
Concrete implementations for alert delivery channels:
email, webhook, and Slack notifications.
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
import html
import json
import hashlib
import hmac
from datetime import datetime


@dataclass
class EmailNotification:
    """Email notification payload."""
    to: str
    subject: str
    body_text: str
    body_html: Optional[str] = None
    priority: str = "normal"
    reply_to: Optional[str] = None


@dataclass
class WebhookPayload:
    """Webhook delivery payload with HMAC signing."""
    url: str
    method: str = "POST"
    headers: Dict[str, str] = None
    body: Dict[str, Any] = None
    signature: Optional[str] = None

    def __post_init__(self):
        if self.headers is None:
            self.headers = {"Content-Type": "application/json"}
        if self.body is None:
            self.body = {}


class EmailHandler:
    """Formats and sends alert notifications via email.

    In production, this integrates with SMTP or a transactional
    email service (SendGrid, AWS SES, etc.).

    Attributes:
        from_address: Sender email address.
        smtp_host: SMTP server hostname.
        smtp_port: SMTP server port.
    """

    def __init__(self, from_address: str, smtp_host: str = "", smtp_port: int = 587):
        self.from_address = from_address
        self.smtp_host = smtp_host
        self.smtp_port = smtp_port

    def format_alert_email(self, alert) -> EmailNotification:
        """Format an alert as an email notification.

        Args:
            alert: Alert instance to format.

        Returns:
            EmailNotification ready for sending. Alert-supplied strings
            are HTML-escaped in the HTML body; the plain-text body keeps
            the original text.
        """
        subject = f"[Sentinel-X] {alert.priority.name}: {alert.title}"
        body = (
            f"Alert ID: {alert.alert_id}\n"
            f"Priority: {alert.priority.name}\n"
            f"Source: {alert.source}\n"
            f"Time: {alert.triggered_at.isoformat()}\n"
            f"\n{alert.message}\n"
        )
        esc_title = html.escape(alert.title)
        esc_id = html.escape(str(alert.alert_id))
        esc_source = html.escape(alert.source)
        esc_message = html.escape(alert.message)
        html_body = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #e74c3c;">⚠️ {esc_title}</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td><strong>Alert ID</strong></td><td>{esc_id}</td></tr>
                <tr><td><strong>Priority</strong></td><td>{alert.priority.name}</td></tr>
                <tr><td><strong>Source</strong></td><td>{esc_source}</td></tr>
                <tr><td><strong>Time</strong></td><td>{alert.triggered_at.isoformat()}</td></tr>
            </table>
            <p style="margin-top: 16px;">{esc_message}</p>
        </div>
        """
        return EmailNotification(
            to="",  # Set by routing rules
            subject=subject,
            body_text=body,
            body_html=html_body,
            priority="high" if alert.priority.value <= 2 else "normal",
        )

    def send(self, notification: EmailNotification) -> Dict[str, Any]:
        """Send an email notification (stub for production SMTP).

        Args:
            notification: Prepared email notification.

        Returns:
            Send result with status.
        """
        # In production: connect to SMTP and send
        return {
            "status": "sent",
            "to": notification.to,
            "subject": notification.subject,
            "timestamp": datetime.utcnow().isoformat(),
        }


class WebhookHandler:
    """Delivers alert notifications via HTTP webhooks.

    Supports HMAC signing for payload integrity verification
    on the receiving end.

    Attributes:
        secret: Shared secret for HMAC signing.
    """

    def __init__(self, secret: str = ""):
        self.secret = secret

    def sign_payload(self, payload: str) -> str:
        """Sign a JSON payload with HMAC-SHA256.

        Args:
            payload: JSON string to sign.

        Returns:
            Hex-encoded HMAC signature.
        """
        return hmac.new(
            self.secret.encode("utf-8"),
            payload.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

    def prepare(self, alert, webhook_url: str) -> WebhookPayload:
        """Prepare a webhook payload from an alert.

        Args:
            alert: Alert to deliver.
            webhook_url: Destination URL.

        Returns:
            Signed WebhookPayload ready for delivery.
        """
        body = {
            "event": "alert.triggered",
            "alert_id": alert.alert_id,
            "title": alert.title,
            "message": alert.message,
            "priority": alert.priority.name,
            "source": alert.source,
            "triggered_at": alert.triggered_at.isoformat(),
        }
        payload_json = json.dumps(body, sort_keys=True)
        signature = self.sign_payload(payload_json) if self.secret else None

        headers = {"Content-Type": "application/json"}
        if signature:
            headers["X-Sentinel-Signature"] = f"sha256={signature}"

        return WebhookPayload(
            url=webhook_url,
            headers=headers,
            body=body,
            signature=signature,
        )

    def deliver(self, payload: WebhookPayload) -> Dict[str, Any]:
        """Deliver a webhook payload (stub for production HTTP client).

        Args:
            payload: Prepared webhook payload.

        Returns:
            Delivery result with status.
        """
        # In production: httpx.post(payload.url, json=payload.body, headers=payload.headers)
        return {
            "status": "delivered",
            "url": payload.url,
            "timestamp": datetime.utcnow().isoformat(),
        }


@dataclass
class SlackMessage:
    """Slack notification payload for an incoming webhook."""
    webhook_url: str
    text: str
    blocks: List[Dict[str, Any]] = field(default_factory=list)
    channel: Optional[str] = None
    username: str = "Sentinel-X"


class SlackHandler:
    """Formats alert notifications for Slack incoming webhooks.

    In production, posts the message JSON to the webhook URL.

    Attributes:
        webhook_url: Default Slack incoming webhook URL.
        default_channel: Optional channel override for delivery.
    """

    PRIORITY_EMOJI = {
        1: ":rotating_light:",
        2: ":warning:",
        3: ":large_yellow_circle:",
        4: ":white_circle:",
    }

    def __init__(self, webhook_url: str = "", default_channel: Optional[str] = None):
        self.webhook_url = webhook_url
        self.default_channel = default_channel

    def format_alert(self, alert, webhook_url: Optional[str] = None) -> SlackMessage:
        """Format an alert as a Slack message.

        Args:
            alert: Alert instance to format.
            webhook_url: Destination webhook URL. Falls back to the
                handler's configured URL.

        Returns:
            SlackMessage ready for delivery.

        Raises:
            ValueError: If no webhook URL is configured or provided.
        """
        url = webhook_url or self.webhook_url
        if not url:
            raise ValueError(
                "Slack webhook URL required: none configured or provided"
            )
        emoji = self.PRIORITY_EMOJI.get(alert.priority.value, ":bell:")
        text = f"{emoji} [{alert.priority.name}] {alert.title}"
        blocks = [
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": text},
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Alert ID:*\n{alert.alert_id}"},
                    {"type": "mrkdwn", "text": f"*Source:*\n{alert.source}"},
                    {"type": "mrkdwn", "text": f"*Priority:*\n{alert.priority.name}"},
                    {"type": "mrkdwn", "text": f"*Time:*\n{alert.triggered_at.isoformat()}"},
                ],
            },
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": alert.message},
            },
        ]
        return SlackMessage(
            webhook_url=url,
            text=text,
            blocks=blocks,
            channel=self.default_channel,
        )

    def send(self, message: SlackMessage) -> Dict[str, Any]:
        """Send a Slack message (stub for production HTTP client).

        Args:
            message: Prepared Slack message.

        Returns:
            Send result with status.
        """
        # In production: httpx.post(message.webhook_url, json=payload)
        return {
            "status": "sent",
            "channel": message.channel,
            "timestamp": datetime.utcnow().isoformat(),
        }
