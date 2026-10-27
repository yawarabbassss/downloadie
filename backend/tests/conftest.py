import os
import sys
import pytest
from fastapi.testclient import TestClient

# Add app directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.core.config import settings


@pytest.fixture(autouse=True)
def test_env_settings():
    """Ensure test settings are active."""
    settings.app_env = "test"
    settings.allow_private_networks_for_tests = False
    yield


@pytest.fixture
def client():
    """FastAPI TestClient fixture."""
    with TestClient(app) as test_client:
        yield test_client
