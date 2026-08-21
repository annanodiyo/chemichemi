from datetime import datetime
from typing import Optional

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from app import storage

app = FastAPI(title="Lake Victoria Water Quality API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/water-quality")
def get_water_quality(
    region: Optional[str] = Query(None, description="e.g. winam-gulf-kisumu"),
    date_from: Optional[str] = Query(None, description="ISO date, e.g. 2026-06-01"),
    date_to: Optional[str] = Query(None, description="ISO date, e.g. 2026-08-01"),
):
    df = datetime.fromisoformat(date_from) if date_from else None
    dt = datetime.fromisoformat(date_to) if date_to else None

    records = storage.query_metrics(region=region, date_from=df, date_to=dt)

    return {
        "count": len(records),
        "results": [
            {
                "region": r.region,
                "scene_id": r.scene_id,
                "date": r.scene_date.isoformat(),
                "chlorophyll": {
                    "ndci_mean": r.ndci_mean, "ndci_min": r.ndci_min, "ndci_max": r.ndci_max,
                    "note": "Proxy, not a calibrated concentration.",
                },
                "turbidity": {
                    "ndti_mean": r.ndti_mean, "ndti_min": r.ndti_min, "ndti_max": r.ndti_max,
                    "note": "Relative proxy, not calibrated NTU.",
                },
                "water_extent": {
                    "ndwi_mean": r.ndwi_mean, "ndwi_min": r.ndwi_min, "ndwi_max": r.ndwi_max,
                    "water_pixel_fraction": r.water_pixel_fraction,
                    "note": "Extent/coverage proxy, not a water-level or depth measurement.",
                },
                "temperature": {
                    "celsius": r.temperature_celsius,
                    "source": r.temperature_source,
                    "note": "Not derivable from Sentinel-2 (no thermal band); null until an external source is wired up.",
                },
            }
            for r in records
        ],
    }


@app.get("/api/health")
def health():
    return {"status": "ok"}