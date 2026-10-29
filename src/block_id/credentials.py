"""Tamper-evident credential records using standard-library HMAC signatures."""

from dataclasses import dataclass
import base64
import hashlib
import hmac
import json


@dataclass(frozen=True)
class Credential:
    subject: str
    issuer: str
    claims: dict[str, str]
    signature: str


def issue(subject: str, issuer: str, claims: dict[str, str], secret: bytes) -> Credential:
    if not subject.strip() or not issuer.strip() or not secret:
        raise ValueError("subject, issuer, and secret are required")
    payload = {"subject": subject, "issuer": issuer, "claims": claims}
    signature = _sign(payload, secret)
    return Credential(subject, issuer, dict(claims), signature)


def verify(credential: Credential, secret: bytes) -> bool:
    if not secret:
        return False
    payload = {
        "subject": credential.subject,
        "issuer": credential.issuer,
        "claims": credential.claims,
    }
    return hmac.compare_digest(credential.signature, _sign(payload, secret))


def _sign(payload: dict, secret: bytes) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    digest = hmac.new(secret, encoded, hashlib.sha256).digest()
    return base64.urlsafe_b64encode(digest).decode("ascii").rstrip("=")
