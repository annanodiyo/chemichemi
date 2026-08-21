"""
Storage for computed water-quality metrics. One table, one row per
scene — each metric is a column so everything for a given scene/date
is queryable together instead of joined across tables.
"""
from datetime import datetime, timezone

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

from app import config

Base = declarative_base()


class WaterQualityMetric(Base):
    __tablename__ = "water_quality_metrics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    region = Column(String, index=True)
    scene_id = Column(String, unique=True)
    scene_date = Column(DateTime, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Chlorophyll proxy (NDCI) — from B05/B04
    ndci_mean = Column(Float)
    ndci_min = Column(Float)
    ndci_max = Column(Float)

    # Turbidity proxy (NDTI) — from B04/B03
    ndti_mean = Column(Float)
    ndti_min = Column(Float)
    ndti_max = Column(Float)

    # Water extent/coverage proxy (NDWI) — from B03/B08
    # NOT a water-level/depth measurement.
    ndwi_mean = Column(Float)
    ndwi_min = Column(Float)
    ndwi_max = Column(Float)
    water_pixel_fraction = Column(Float)

    # Water surface temperature — NOT derivable from Sentinel-2 (no
    # thermal band). Stays NULL unless populated from an external
    # source (Landsat thermal, buoy, weather API).
    temperature_celsius = Column(Float, nullable=True)
    temperature_source = Column(String, nullable=True)


engine = create_engine(f"sqlite:///{config.DB_PATH}")
SessionLocal = sessionmaker(bind=engine)


def init_db():
    Base.metadata.create_all(engine)


def save_metrics(region: str, scene_id: str, scene_date: datetime, *,
                  ndci: dict, ndti: dict, ndwi: dict,
                  temperature_celsius: float = None, temperature_source: str = None):
    """Upsert one row per scene with all computed metrics."""
    session = SessionLocal()
    try:
        record = session.query(WaterQualityMetric).filter_by(scene_id=scene_id).first()
        if record is None:
            record = WaterQualityMetric(region=region, scene_id=scene_id, scene_date=scene_date)
            session.add(record)

        record.ndci_mean, record.ndci_min, record.ndci_max = ndci["ndci_mean"], ndci["ndci_min"], ndci["ndci_max"]
        record.ndti_mean, record.ndti_min, record.ndti_max = ndti["ndti_mean"], ndti["ndti_min"], ndti["ndti_max"]
        record.ndwi_mean, record.ndwi_min, record.ndwi_max = ndwi["ndwi_mean"], ndwi["ndwi_min"], ndwi["ndwi_max"]
        record.water_pixel_fraction = ndwi["water_pixel_fraction"]

        if temperature_celsius is not None:
            record.temperature_celsius = temperature_celsius
            record.temperature_source = temperature_source

        session.commit()
        return record
    finally:
        session.close()


def query_metrics(region: str = None, date_from: datetime = None, date_to: datetime = None):
    session = SessionLocal()
    try:
        q = session.query(WaterQualityMetric)
        if region:
            q = q.filter(WaterQualityMetric.region == region)
        if date_from:
            q = q.filter(WaterQualityMetric.scene_date >= date_from)
        if date_to:
            q = q.filter(WaterQualityMetric.scene_date <= date_to)
        return q.order_by(WaterQualityMetric.scene_date.desc()).all()
    finally:
        session.close()