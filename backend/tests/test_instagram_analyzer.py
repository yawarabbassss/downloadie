import pytest
from app.core.security import decrypt_token, encrypt_token
from app.models.schemas import CapabilityStatus, MediaType
from app.services.instagram_service import instagram_service


@pytest.mark.asyncio
async def test_username_sanitization():
    """Test cleaning and extraction of usernames from diverse input strings."""
    assert instagram_service.clean_username("natgeo") == "natgeo"
    assert instagram_service.clean_username("@natgeo") == "natgeo"
    assert instagram_service.clean_username("https://www.instagram.com/natgeo/") == "natgeo"
    assert instagram_service.clean_username("https://instagram.com/natgeo?igsh=123") == "natgeo"
    assert instagram_service.clean_username("https://www.instagram.com/cristiano.ronaldo/") == "cristiano.ronaldo"
    assert instagram_service.clean_username("") == ""
    assert instagram_service.clean_username("https://www.instagram.com/p/C5WTtLuPrkq/") == ""


@pytest.mark.asyncio
async def test_post_shortcode_extraction():
    """Test shortcode identification for carousel and post URLs."""
    assert instagram_service.clean_post_shortcode("https://www.instagram.com/p/C5WTtLuPrkq/") == "C5WTtLuPrkq"
    assert instagram_service.clean_post_shortcode("https://instagram.com/reel/C5WTtLuPrkq") == "C5WTtLuPrkq"
    assert instagram_service.clean_post_shortcode("https://instagram.com/natgeo/") is None


@pytest.mark.asyncio
async def test_token_encryption_at_rest():
    """Verify that sensitive access tokens are encrypted and decrypted correctly."""
    secret = "downloadie-super-secret-key-12345"
    token = "EAABwzLixnjYBA...meta_long_lived_token_example"

    encrypted = encrypt_token(token, secret)
    assert encrypted != token
    assert len(encrypted) > len(token)

    decrypted = decrypt_token(encrypted, secret)
    assert decrypted == token

    # Tampered secret cannot decrypt
    assert decrypt_token(encrypted, "wrong-secret-key") is None


@pytest.mark.asyncio
async def test_demo_profile_analysis():
    """Verify sample creator profile returns transparent metrics and snapshots."""
    result = await instagram_service.analyze_profile("demo_creator")

    assert result.profile.username == "demo_creator"
    assert result.profile.is_verified is True
    assert result.profile.follower_count == 54200
    assert result.profile.data_source == "sample_profile"

    # Engagement rate calculation verification: ((2850 + 165) / 54200) * 100 = 5.56%
    er_val = result.performance.public_engagement_rate.value
    expected_er = round(((2850.0 + 165.0) / 54200.0) * 100, 2)
    assert er_val == expected_er
    assert result.performance.public_engagement_rate.formula is not None

    # Growth analytics verification
    growth = result.growth
    assert growth.snapshot_count >= 1
    assert growth.percentage_growth >= 0.0
    assert len(growth.history_points) >= 1


@pytest.mark.asyncio
async def test_first_time_profile_analysis_starts_history():
    """Test that analyzing an unseen profile establishes the initial baseline snapshot."""
    test_user = "brand_new_test_creator_99"
    result = await instagram_service.analyze_profile(test_user)

    assert result.profile.username == test_user
    assert result.growth.starting_followers == result.growth.current_followers
    assert result.growth.net_follower_change == 0
    assert result.growth.percentage_growth == 0.0
    assert "First snapshot recorded" in result.growth.notice


@pytest.mark.asyncio
async def test_oauth_start_url():
    """Test Meta OAuth initialization response."""
    auth_resp = instagram_service.get_oauth_start_url(state="test_state_123")
    assert auth_resp.state == "test_state_123"
    # When credentials are not in .env, is_configured should be False and setup instructions provided
    if not auth_resp.is_configured:
        assert auth_resp.setup_instructions is not None
        assert "INSTAGRAM_APP_ID" in auth_resp.setup_instructions
