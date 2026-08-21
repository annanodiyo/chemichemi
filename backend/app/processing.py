"""
Computes water-quality proxy indices from a Sentinel-2 L2A .SAFE product.

Implemented from S2 optical bands (legitimate, band-math derived):
- NDCI  (chlorophyll proxy)      : compute_ndci()
- NDTI  (turbidity proxy)        : compute_ndti()
- NDWI  (water extent / "level") : compute_ndwi()

NOT derivable from Sentinel-2 (no thermal band on the sensor):
- Water surface temperature      : compute_water_temperature() is a stub;
  wire it up to Landsat 8/9 thermal data or a station/weather API if you
  need real values. It returns None until you do.
"""
from pathlib import Path

import numpy as np
import rasterio
from rasterio.enums import Resampling


def _find_band(safe_dir: Path, band_code: str) -> Path:
    matches = list(safe_dir.rglob(f"*_{band_code}_*.jp2"))
    if not matches:
        raise FileNotFoundError(f"Band {band_code} not found in {safe_dir}")
    return matches[0]


def _read_matched(safe_dir: Path, band_a: str, band_b: str):
    """Read two bands aligned to band_a's resolution/grid."""
    path_a = _find_band(safe_dir, band_a)
    path_b = _find_band(safe_dir, band_b)

    with rasterio.open(path_a) as src_a:
        arr_a = src_a.read(1).astype("float32")
        target_shape = arr_a.shape
        crs = src_a.crs

    with rasterio.open(path_b) as src_b:
        arr_b = src_b.read(
            1, out_shape=target_shape, resampling=Resampling.bilinear
        ).astype("float32")

    return arr_a, arr_b, crs


def _index_stats(index: np.ndarray, crs) -> dict:
    valid = index[~np.isnan(index)]
    return {
        "mean": float(np.nanmean(index)) if valid.size else None,
        "min": float(np.nanmin(valid)) if valid.size else None,
        "max": float(np.nanmax(valid)) if valid.size else None,
        "pixel_count": int(valid.size),
        "crs": str(crs),
    }


def compute_ndci(safe_dir: Path) -> dict:
    """NDCI = (B05 - B04) / (B05 + B04) — chlorophyll-a proxy."""
    b05, b04, crs = _read_matched(safe_dir, "B05", "B04")
    denom = b05 + b04
    with np.errstate(divide="ignore", invalid="ignore"):
        ndci = np.where(denom != 0, (b05 - b04) / denom, np.nan)
    stats = _index_stats(ndci, crs)
    return {
        "ndci_mean": stats["mean"],
        "ndci_min": stats["min"],
        "ndci_max": stats["max"],
        "pixel_count": stats["pixel_count"],
        "crs": stats["crs"],
    }


def compute_ndti(safe_dir: Path) -> dict:
    """
    NDTI = (Red - Green) / (Red + Green) = (B04 - B03) / (B04 + B03)
    Turbidity/suspended-sediment proxy. Higher NDTI ~ more turbid water.
    Not a calibrated NTU value — treat as relative until field-validated.
    """
    b04, b03, crs = _read_matched(safe_dir, "B04", "B03")
    denom = b04 + b03
    with np.errstate(divide="ignore", invalid="ignore"):
        ndti = np.where(denom != 0, (b04 - b03) / denom, np.nan)
    stats = _index_stats(ndti, crs)
    return {
        "ndti_mean": stats["mean"],
        "ndti_min": stats["min"],
        "ndti_max": stats["max"],
        "pixel_count": stats["pixel_count"],
        "crs": stats["crs"],
    }


def compute_ndwi(safe_dir: Path) -> dict:
    """
    NDWI (McFeeters) = (Green - NIR) / (Green + NIR) = (B03 - B08) / (B03 + B08)
    Positive values ~ open water. Used here as a water-EXTENT proxy
    (what fraction of the scene is water), NOT a water-level/depth
    measurement — Sentinel-2 optical imagery cannot measure water height.
    """
    b03, b08, crs = _read_matched(safe_dir, "B03", "B08")
    denom = b03 + b08
    with np.errstate(divide="ignore", invalid="ignore"):
        ndwi = np.where(denom != 0, (b03 - b08) / denom, np.nan)
    stats = _index_stats(ndwi, crs)

    valid = ndwi[~np.isnan(ndwi)]
    water_fraction = float(np.mean(valid > 0)) if valid.size else None

    return {
        "ndwi_mean": stats["mean"],
        "ndwi_min": stats["min"],
        "ndwi_max": stats["max"],
        "water_pixel_fraction": water_fraction,
        "pixel_count": stats["pixel_count"],
        "crs": stats["crs"],
    }


def compute_water_temperature(safe_dir: Path) -> dict | None:
    """
    STUB: Sentinel-2 MSI has no thermal infrared band, so surface water
    temperature cannot be derived from this imagery. This function
    intentionally returns None rather than fabricating a value.

    To get real water temperature, plug in one of:
      - Landsat 8/9 Collection 2 Level-2 thermal band (ST_B10), matched
        by date/AOI via USGS EarthExplorer / M2M API
      - A weather/marine API (e.g. Open-Meteo Marine API) if the AOI is
        coastal — NOT reliable for inland lakes like Winam Gulf
      - An in-situ sensor/buoy feed if you have one
    """
    return None