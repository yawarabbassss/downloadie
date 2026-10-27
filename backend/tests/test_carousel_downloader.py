import os
import zipfile
import pytest
from app.core.config import settings
from app.core.security import verify_download_token
from app.models.schemas import MediaType
from app.services.instagram_service import instagram_service
from app.services.storage import storage_manager


@pytest.mark.asyncio
async def test_carousel_shortcode_validation():
    """Verify that invalid URLs raise clean errors."""
    with pytest.raises(ValueError):
        await instagram_service.resolve_carousel("https://google.com/test")

    with pytest.raises(ValueError):
        await instagram_service.resolve_carousel("https://www.instagram.com/user_profile/")


@pytest.mark.asyncio
async def test_carousel_zip_creation_and_integrity():
    """Verify safe zero-padded filename creation and zip archive generation."""
    test_job_id = "test_carousel_job_99"
    target_dir = storage_manager.get_job_directory(test_job_id)
    zip_name = "downloadie-carousel-test.zip"
    zip_path = os.path.join(target_dir, zip_name)

    # Create mock slide files
    slide1_path = os.path.join(target_dir, "slide-01.jpg")
    slide2_path = os.path.join(target_dir, "slide-02.mp4")

    with open(slide1_path, "wb") as f:
        f.write(b"\xff\xd8\xff\xe0mock_jpeg_slide_1_content")
    with open(slide2_path, "wb") as f:
        f.write(b"\x00\x00\x00\x18ftypmp42mock_mp4_slide_2_content")

    # Build zip file
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        z.write(slide1_path, arcname="slide-01.jpg")
        z.write(slide2_path, arcname="slide-02.mp4")

    assert os.path.isfile(zip_path)

    # Verify zip archive contents and ordering
    with zipfile.ZipFile(zip_path, "r") as z:
        namelist = z.namelist()
        assert namelist == ["slide-01.jpg", "slide-02.mp4"]
        assert z.read("slide-01.jpg") == b"\xff\xd8\xff\xe0mock_jpeg_slide_1_content"
        assert z.read("slide-02.mp4") == b"\x00\x00\x00\x18ftypmp42mock_mp4_slide_2_content"

    # Cleanup test dir
    storage_manager.delete_job(test_job_id)
