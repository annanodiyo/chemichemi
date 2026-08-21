"""
Central configuration. Loads secrets and settings from environment
variables (via a local .env file that is NEVER committed or shared).
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

CDSE_USERNAME = os.environ.get("CDSE_USERNAME")
CDSE_PASSWORD = os.environ.get("CDSE_PASSWORD")
CDSE_CLIENT_ID = os.environ.get("CDSE_CLIENT_ID", "cdse-public")

AOI_LAT = float(os.environ.get("AOI_LAT", "-0.10"))
AOI_LON = float(os.environ.get("AOI_LON", "34.75"))

LOOKBACK_DAYS = int(os.environ.get("LOOKBACK_DAYS", "10"))

DOWNLOAD_DIR = Path(os.environ.get("DOWNLOAD_DIR", "./data/raw"))
DB_PATH = os.environ.get("DB_PATH", "./data/water_quality.db")

TOKEN_URL = (
    "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/"
    "protocol/openid-connect/token"
)
CATALOGUE_URL = "https://catalogue.dataspace.copernicus.eu/odata/v1/Products"
DOWNLOAD_URL = "https://download.dataspace.copernicus.eu/odata/v1/Products"

DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
