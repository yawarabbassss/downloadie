# Downloadie — A Modern Multi-Platform Media Downloader

**Downloadie** is a production-minded web application engineered for inspecting, validating, and downloading media across multiple content providers. Built with a modern, minimal aesthetic and an extensible architecture, Downloadie prioritizes **security**, **privacy**, and **honest capability disclosure**.

---

## 🌟 Key Features

- **Distinctive Brand & Experience:** Clean, minimal visual identity with electric violet accents, soft blue highlights, high-contrast typography, and zero dark patterns.
- **Honest Capability Declarations:** Never fakes successful downloads. Each platform adapter declares its supported operations, credentials requirements, and terms constraints.
- **SSRF Defense Engine:** Robust multi-hop server-side validation strictly blocks private IPv4/IPv6 networks, loopback addresses, local TLDs, and cloud metadata endpoints (`169.254.169.254`).
- **Direct Media Downloader:** Out-of-the-box streaming downloads for direct MP4, WEBM, MOV, MP3, WAV, JPG, PNG, and WEBP files with safe filename sanitization.
- **Ephemeral Storage & Privacy:** Download links are signed with cryptographic HMAC tokens. Ephemeral files are automatically pruned every 15 minutes and expire within 60 minutes.
- **Zero Session Theft:** Downloadie never asks users to input social media passwords or steal session cookies.

---

## 🏗️ Platform Adapter Architecture

Downloadie utilizes an extensible provider adapter registry (`app/adapters/`). Each adapter implements:

- `can_handle(url)`: Detects whether a URL belongs to the provider.
- `validate_url(url)`: Validates syntax and executes SSRF checks.
- `get_capabilities()`: Returns honest operational status, required credentials, and limitations.
- `resolve_media(url, auth_context)`: Extracts metadata, thumbnails, and available formats.
- `create_download(url, format_id)`: Orchestrates secure, chunked streaming downloads.
- `get_job_status(job_id)`: Tracks asynchronous job progress.

### Platform Status Summary

| Provider | Operational Status | Supported Media | Requirements & Constraints |
| :--- | :--- | :--- | :--- |
| **Direct Media Files** | `Active & Instant` | Video (MP4, WEBM), Audio (MP3, WAV), Images | Fully functional. Enforces 150 MB ceiling and SSRF protection. |
| **Instagram** | `Requires Meta Token` | Reels, Feed Posts, Carousels, Stories | Requires `INSTAGRAM_ACCESS_TOKEN` via Meta Graph API. No private scraping. |
| **YouTube** | `Terms Restricted` | Metadata, Shorts, Creator Workflows | Metadata via `YOUTUBE_API_KEY`. Stream ripping restricted by YouTube ToS; links to YouTube Studio. |
| **TikTok** | `Developer API Mode` | Public Creator Videos | Requires registered `TIKTOK_CLIENT_KEY`. Watermark circumvention is strictly prohibited. |
| **Facebook** | `Requires Page Token` | Public Page Videos, Reels | Requires `FACEBOOK_ACCESS_TOKEN` via Meta Graph API. |

---

## 🚀 Getting Started Locally

### Prerequisites

- **Python 3.11+** (Python 3.13 tested and verified)
- **Node.js 18+** (Node.js 24 tested and verified)
- **Git**

---

### 1. Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
# Windows:
python -m venv venv
.\venv\Scripts\activate

# Linux/macOS:
# python -m venv venv
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```

- API Docs (Swagger): [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### 2. Frontend Setup (Next.js)

```bash
# Navigate to frontend directory
cd frontend

# Install npm packages
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 3. Docker & Docker Compose Setup

```bash
# Start backend and frontend simultaneously
docker compose up --build
```

---

## 🧪 Testing

### Backend Test Suite (Pytest)

The backend includes a comprehensive test suite covering SSRF defense, adapter routing, token generation, storage lifecycles, and API endpoints:

```bash
.\backend\venv\Scripts\pytest -v .\backend\tests
```

---

## 🛡️ Security Architecture

1. **SSRF Blocking:** Checks all resolved DNS records for destination hosts. Rejects RFC 1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopbacks (`127.0.0.0/8`, `::1`), link-local addresses, and AWS/GCP/Azure cloud metadata (`169.254.169.254`, `metadata.google.internal`).
2. **Redirect Re-Validation:** On every redirect hop (up to 5), the new location is re-validated against the SSRF filter before any outbound socket connection is made.
3. **MIME Verification:** Content-Type headers are checked against an approved allowlist. Unknown binary streams without media extensions are rejected.
4. **Filename Sanitization:** Filenames are stripped of directory traversal sequences (`../`, null bytes, control characters).
5. **HMAC Ephemeral Tokens:** Download links are signed with cryptographic SHA256 HMAC tokens containing UNIX expiration timestamps.

---

## 📄 License & Content Rights

Downloadie is provided as an independent utility for lawful personal media management. Users are solely responsible for ensuring they own or are authorized to save requested content.
