import pytest
from app.core.ssrf import validate_url_security


def test_ssrf_blocks_loopback_ips():
    is_safe, error, ip = validate_url_security("http://127.0.0.1/test")
    assert not is_safe
    assert "private" in error.lower() or "loopback" in error.lower() or "blocked" in error.lower()

    is_safe, error, ip = validate_url_security("http://127.0.1.5:80/video.mp4")
    assert not is_safe


def test_ssrf_blocks_private_subnets():
    is_safe, error, ip = validate_url_security("http://10.0.0.1/video.mp4")
    assert not is_safe

    is_safe, error, ip = validate_url_security("http://192.168.1.50/photo.jpg")
    assert not is_safe

    is_safe, error, ip = validate_url_security("http://172.16.0.25/stream.mp4")
    assert not is_safe


def test_ssrf_blocks_cloud_metadata():
    is_safe, error, ip = validate_url_security("http://169.254.169.254/latest/meta-data/")
    assert not is_safe
    assert "cloud metadata" in error.lower() or "blocked" in error.lower()

    is_safe, error, ip = validate_url_security("http://metadata.google.internal/computeMetadata/v1/")
    assert not is_safe


def test_ssrf_blocks_invalid_schemes():
    is_safe, error, ip = validate_url_security("file:///etc/passwd")
    assert not is_safe
    assert "Unsupported URL scheme" in error

    is_safe, error, ip = validate_url_security("gopher://127.0.0.1:70")
    assert not is_safe

    is_safe, error, ip = validate_url_security("ftp://example.com/file.mp4")
    assert not is_safe


def test_ssrf_blocks_disallowed_ports():
    is_safe, error, ip = validate_url_security("http://example.com:22/video.mp4")
    assert not is_safe
    assert "port" in error.lower()


def test_ssrf_blocks_internal_tlds():
    is_safe, error, ip = validate_url_security("http://internal.corp/video.mp4")
    # Will either fail DNS resolution or blocked host
    assert not is_safe

    is_safe, error, ip = validate_url_security("http://myservice.local/file.mp4")
    assert not is_safe


def test_ssrf_allows_public_ip():
    # 8.8.8.8 is Google Public DNS
    is_safe, error, ip = validate_url_security("https://8.8.8.8/test.mp4")
    assert is_safe
    assert error is None
