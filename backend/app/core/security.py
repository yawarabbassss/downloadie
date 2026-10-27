import hashlib
import hmac
import os
import re
import time
from typing import Dict, Optional, Tuple


# Safe allowed media content-types
ALLOWED_MIME_TYPES = {
    # Video
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
    "video/x-matroska": ".mkv",
    "video/ogg": ".ogv",
    # Audio
    "audio/mpeg": ".mp3",
    "audio/mp4": ".m4a",
    "audio/wav": ".wav",
    "audio/webm": ".weba",
    "audio/ogg": ".ogg",
    "audio/flac": ".flac",
    # Image
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
    # Archives (Carousel ZIP downloads)
    "application/zip": ".zip",
    "application/x-zip-compressed": ".zip",
}

# Inverted mapping: extension to mime
EXT_TO_MIME = {ext: mime for mime, ext in ALLOWED_MIME_TYPES.items()}
EXT_TO_MIME[".jpeg"] = "image/jpeg"
EXT_TO_MIME[".m4v"] = "video/mp4"


def is_allowed_mime_type(content_type: str) -> bool:
    """Check if the MIME type is in the allowed media types list."""
    if not content_type:
        return False
    clean_type = content_type.split(";")[0].strip().lower()
    return clean_type in ALLOWED_MIME_TYPES


def get_extension_for_mime(content_type: str, fallback: str = ".bin") -> str:
    """Return file extension for a given MIME type."""
    clean_type = content_type.split(";")[0].strip().lower()
    return ALLOWED_MIME_TYPES.get(clean_type, fallback)


def sanitize_filename(filename: str, fallback_ext: str = "") -> str:
    """
    Sanitize an untrusted filename to prevent path traversal and shell injection.
    Only allows alphanumeric characters, dashes, underscores, and dots.
    """
    if not filename:
        return f"media_download{fallback_ext}"

    # Extract basename only (strip directories)
    clean = os.path.basename(filename.strip())

    # Replace invalid chars with underscore
    clean = re.sub(r"[^\w\s\.-]", "_", clean)
    clean = re.sub(r"[\s]+", "_", clean)
    clean = clean.strip("._-")

    if not clean:
        clean = "media_download"

    # Truncate length
    if len(clean) > 80:
        base, ext = os.path.splitext(clean)
        clean = base[: 80 - len(ext)] + ext

    # Ensure extension
    if fallback_ext and not clean.endswith(fallback_ext):
        clean = f"{clean}{fallback_ext}"

    return clean


class TokenBucketRateLimiter:
    """In-memory Token Bucket rate limiter per IP/client."""

    def __init__(self, rate_per_minute: int = 45, burst_capacity: int = 15):
        self.rate_per_second = rate_per_minute / 60.0
        self.capacity = burst_capacity
        # Store: key -> (current_tokens, last_update_time)
        self._buckets: Dict[str, Tuple[float, float]] = {}

    def is_allowed(self, client_id: str) -> Tuple[bool, int]:
        """
        Check if request is allowed.
        Returns:
            (is_allowed: bool, retry_after_seconds: int)
        """
        now = time.time()
        tokens, last_update = self._buckets.get(client_id, (float(self.capacity), now))

        # Add newly accrued tokens based on elapsed time
        elapsed = now - last_update
        tokens = min(float(self.capacity), tokens + elapsed * self.rate_per_second)

        # Periodic cleanup of old entries
        if len(self._buckets) > 10000:
            stale_threshold = now - 3600
            self._buckets = {k: v for k, v in self._buckets.items() if v[1] > stale_threshold}

        if tokens >= 1.0:
            tokens -= 1.0
            self._buckets[client_id] = (tokens, now)
            return True, 0
        else:
            self._buckets[client_id] = (tokens, now)
            time_needed = (1.0 - tokens) / self.rate_per_second
            return False, max(1, int(time_needed))


def generate_download_token(job_id: str, secret_key: str, expires_at: int) -> str:
    """Generate a cryptographic HMAC token for a download link."""
    payload = f"{job_id}:{expires_at}".encode("utf-8")
    sig = hmac.new(secret_key.encode("utf-8"), payload, hashlib.sha256).hexdigest()
    return f"{expires_at}:{sig}"


def verify_download_token(job_id: str, token: str, secret_key: str) -> bool:
    """Verify cryptographic HMAC token and expiration."""
    if not token or ":" not in token:
        return False
    try:
        expires_at_str, received_sig = token.split(":", 1)
        expires_at = int(expires_at_str)
        if time.time() > expires_at:
            return False

        payload = f"{job_id}:{expires_at}".encode("utf-8")
        expected_sig = hmac.new(secret_key.encode("utf-8"), payload, hashlib.sha256).hexdigest()
        return hmac.compare_digest(received_sig, expected_sig)
    except Exception:
        return False


def encrypt_token(raw_token: str, secret_key: str) -> str:
    """
    Encrypt sensitive access token at rest using key derivation and XOR stream cipher with random salt.
    Result is hex encoded safe string.
    """
    import base64
    if not raw_token:
        return ""
    salt = os.urandom(16)
    key = hashlib.sha256(secret_key.encode("utf-8") + salt).digest()
    data = raw_token.encode("utf-8")
    encrypted = bytes([b ^ key[i % len(key)] for i, b in enumerate(data)])
    combined = salt + encrypted
    return base64.urlsafe_b64encode(combined).decode("utf-8")


def decrypt_token(cipher_text: str, secret_key: str) -> Optional[str]:
    """
    Decrypt access token encrypted with encrypt_token.
    """
    import base64
    if not cipher_text:
        return None
    try:
        combined = base64.urlsafe_b64decode(cipher_text.encode("utf-8"))
        if len(combined) < 17:
            return None
        salt = combined[:16]
        encrypted = combined[16:]
        key = hashlib.sha256(secret_key.encode("utf-8") + salt).digest()
        data = bytes([b ^ key[i % len(key)] for i, b in enumerate(encrypted)])
        return data.decode("utf-8")
    except Exception:
        return None
