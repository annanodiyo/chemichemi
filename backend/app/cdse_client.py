"""
Thin client around the Copernicus Data Space Ecosystem (CDSE) APIs:
- token generation (Keycloak password grant)
- OData catalogue search
- product download

All credentials stay server-side. Nothing here should ever run
in a browser or be shipped to a client app.
"""
import time
import zipfile
from pathlib import Path

import requests

from app import config

_token_cache = {"access_token": None, "expires_at": 0}


def get_access_token() -> str:
    """Return a valid access token, refreshing if expired.
    CDSE access tokens are short-lived (~10 minutes)."""
    if _token_cache["access_token"] and time.time() < _token_cache["expires_at"] - 30:
        return _token_cache["access_token"]

    resp = requests.post(
        config.TOKEN_URL,
        data={
            "client_id": config.CDSE_CLIENT_ID,
            "username": config.CDSE_USERNAME,
            "password": config.CDSE_PASSWORD,
            "grant_type": "password",
        },
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()

    _token_cache["access_token"] = data["access_token"]
    _token_cache["expires_at"] = time.time() + data.get("expires_in", 600)
    return _token_cache["access_token"]


def search_products(collection: str, product_type: str, lat: float, lon: float,
                     start_iso: str, top: int = 5) -> list:
    """Search the OData catalogue for scenes intersecting a point,
    newest first."""
    odata_filter = (
        f"Collection/Name eq '{collection}' and "
        f"OData.CSC.Intersects(area=geography'SRID=4326;POINT({lon} {lat})') and "
        f"ContentDate/Start gt {start_iso} and "
        "Attributes/OData.CSC.StringAttribute/any("
        f"att:att/Name eq 'productType' and att/Value eq '{product_type}')"
    )
    params = {
        "$filter": odata_filter,
        "$top": top,
        "$orderby": "ContentDate/Start desc",
    }
    headers = {"Authorization": f"Bearer {get_access_token()}"}
    resp = requests.get(config.CATALOGUE_URL, headers=headers, params=params, timeout=60)
    resp.raise_for_status()
    return resp.json().get("value", [])


def download_and_extract(product_id: str, product_name: str) -> Path:
    """Download a product's zip by Id and extract it. Returns the
    path to the extracted .SAFE directory."""
    dest_zip = config.DOWNLOAD_DIR / f"{product_name}.zip"
    extract_dir = config.DOWNLOAD_DIR / product_name

    if extract_dir.exists():
        return extract_dir  # already downloaded/processed

    url = f"{config.DOWNLOAD_URL}({product_id})/$value"
    headers = {"Authorization": f"Bearer {get_access_token()}"}

    with requests.get(url, headers=headers, stream=True, timeout=300) as r:
        r.raise_for_status()
        with open(dest_zip, "wb") as f:
            for chunk in r.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    f.write(chunk)

    with zipfile.ZipFile(dest_zip) as z:
        z.extractall(config.DOWNLOAD_DIR)

    dest_zip.unlink(missing_ok=True)
    return extract_dir
