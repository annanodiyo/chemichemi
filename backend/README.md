# Lake Victoria Water Quality POC

Minimal end-to-end pipeline: Sentinel-2 imagery → chlorophyll proxy (NDCI) →
your own API → your client app.

```
CDSE (Sentinel-2)  ->  pipeline.py  ->  SQLite DB  ->  api.py (FastAPI)  ->  your frontend
                        (search,         (computed        (client-facing
                         download,        metrics only,     JSON endpoint,
                         NDCI)            no raw imagery)   no credentials)
```

## Setup

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# edit .env with your real CDSE username/password - never commit this file
# or paste it into chat/logs
```

## Run the pipeline once (fetches latest scene, computes NDCI, stores it)

```bash
python -m app.pipeline
```

## Run the API

```bash
uvicorn app.api:app --reload --port 8000
```

Then from any client:

```
GET http://localhost:8000/api/water-quality?region=winam-gulf-kisumu
```

Returns JSON only - no satellite credentials, no raw imagery, ever exposed
to the client.

## Automate it

Add a cron entry so the pipeline runs daily and the API always has fresh data:

```
0 6 * * * /path/to/venv/bin/python -m app.pipeline >> /path/to/pipeline.log 2>&1
```

## What this POC gives you

- **NDCI (chlorophyll proxy)** from Sentinel-2, mean/min/max per scene over
  your AOI point.

## What it does NOT give you (and how to extend)

| Parameter | Status | How to add it |
|---|---|---|
| Surface temperature | Not included | Add a Sentinel-3 SLSTR (`SL_2_WST___`) search + a thermal-band reader, same pattern as `processing.py` |
| Cyanobacteria / HAB index | Not included | Sentinel-3 OLCI (`OL_2_WFR___`), similar band-math approach |
| Water hyacinth extent | Not included | Sentinel-2 NDVI/FAI over a polygon AOI instead of a point |
| Dissolved oxygen | **Not derivable from satellite data at all** | Requires field measurements. Once you have even a small set of (date, location, DO reading) pairs, fit a regression against NDCI + temperature + turbidity, and add that as a separate "modeled DO" endpoint - clearly labeled as estimated, not measured |

## Notes on scaling this up

- Swap SQLite for PostgreSQL + PostGIS when you move beyond a single point AOI.
- Store only computed metrics long-term; keep raw `.SAFE` downloads temporary
  (delete after processing) unless you have a specific reason to keep them.
- For map visualization, render the NDCI raster to a Cloud-Optimized GeoTIFF
  and serve tiles via `titiler`, rather than sending raw rasters to the client.
- Rotate any credentials that were ever typed into a terminal, script, or
  chat - treat them as compromised once shared anywhere outside a secrets
  manager or local `.env` file.
