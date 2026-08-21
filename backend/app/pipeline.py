from datetime import datetime, timedelta, timezone

from app import config, cdse_client, processing, storage

REGION_NAME = "winam-gulf-kisumu"


def run():
    storage.init_db()

    start_date = (datetime.now(timezone.utc) - timedelta(days=config.LOOKBACK_DAYS)) \
        .strftime("%Y-%m-%dT%H:%M:%S.000Z")

    products = cdse_client.search_products(
        collection="SENTINEL-2",
        product_type="S2MSI2A",
        lat=config.AOI_LAT,
        lon=config.AOI_LON,
        start_iso=start_date,
        top=5,
    )

    if not products:
        print("No new scenes found in the lookback window.")
        return

    latest = products[0]
    scene_id = latest["Id"]
    scene_name = latest["Name"]
    scene_date = datetime.fromisoformat(
        latest["ContentDate"]["Start"].replace("Z", "+00:00")
    )

    print(f"Processing {scene_name} ({scene_date.isoformat()})...")

    safe_dir = cdse_client.download_and_extract(scene_id, scene_name)

    ndci = processing.compute_ndci(safe_dir)
    ndti = processing.compute_ndti(safe_dir)
    ndwi = processing.compute_ndwi(safe_dir)
    temp = processing.compute_water_temperature(safe_dir)  # None until wired up

    storage.save_metrics(
        REGION_NAME, scene_id, scene_date,
        ndci=ndci, ndti=ndti, ndwi=ndwi,
        temperature_celsius=temp,
        temperature_source="unset" if temp is not None else None,
    )

    print(f"  NDCI mean={ndci['ndci_mean']:.4f}  NDTI mean={ndti['ndti_mean']:.4f}  "
          f"NDWI mean={ndwi['ndwi_mean']:.4f}  water_fraction={ndwi['water_pixel_fraction']:.2%}")
    if temp is None:
        print("  Temperature: not set (no thermal source configured — see processing.py)")


if __name__ == "__main__":
    run()