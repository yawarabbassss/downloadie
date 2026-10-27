from typing import List
from fastapi import APIRouter
from app.adapters.registry import registry
from app.models.schemas import ProviderCapabilityInfo

router = APIRouter(tags=["Providers"])


@router.get("/providers", response_model=List[ProviderCapabilityInfo])
async def list_providers():
    """List all supported content providers, their operational status, and explicit capabilities."""
    return registry.list_all_capabilities()
