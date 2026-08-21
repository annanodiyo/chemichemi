import type { Location, WeatherData } from "@/lib/chemichemi";

const AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

interface AirQualityResponse {
  current?: {
    time?: string;
    pm2_5?: number;
    pm10?: number;
  };
}

interface WeatherResponse {
  current?: {
    time?: string;
    temperature_2m?: number;
    wind_speed_10m?: number;
    precipitation?: number;
  };
  daily?: {
    time?: string[];
    temperature_2m_mean?: number[];
    wind_speed_10m_max?: number[];
    precipitation_sum?: number[];
  };
}

export interface EnvironmentalData {
  current: WeatherData;
  forecast: WeatherData[];
}

const asNumber = (value: unknown, label: string): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Open-Meteo response is missing ${label}.`);
  }
  return value;
};

async function getJson<T>(url: URL, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Open-Meteo request failed (${response.status}).`);
  return (await response.json()) as T;
}

function requestUrl(base: string, location: Location): URL {
  const url = new URL(base);
  url.searchParams.set("latitude", String(location.lat));
  url.searchParams.set("longitude", String(location.lon));
  url.searchParams.set("timezone", "Africa/Nairobi");
  return url;
}

/** Fetches current air quality and a seven-day weather outlook for a beach. */
export async function fetchEnvironmentalData(
  location: Location,
  signal?: AbortSignal,
): Promise<EnvironmentalData> {
  const airUrl = requestUrl(AIR_QUALITY_URL, location);
  airUrl.searchParams.set("current", "pm2_5,pm10");

  const weatherUrl = requestUrl(WEATHER_URL, location);
  weatherUrl.searchParams.set("current", "temperature_2m,wind_speed_10m,precipitation");
  weatherUrl.searchParams.set("daily", "temperature_2m_mean,wind_speed_10m_max,precipitation_sum");
  weatherUrl.searchParams.set("forecast_days", "7");
  weatherUrl.searchParams.set("wind_speed_unit", "ms");

  const [air, weather] = await Promise.all([
    getJson<AirQualityResponse>(airUrl, signal),
    getJson<WeatherResponse>(weatherUrl, signal),
  ]);

  const current = weather.current;
  const daily = weather.daily;
  if (
    !current ||
    !daily?.time ||
    !daily.temperature_2m_mean ||
    !daily.wind_speed_10m_max ||
    !daily.precipitation_sum
  ) {
    throw new Error("Open-Meteo weather response is incomplete.");
  }

  const pm2_5 = asNumber(air.current?.pm2_5, "current PM2.5");
  const pm10 = asNumber(air.current?.pm10, "current PM10");
  const currentWeather: WeatherData = {
    temperature: asNumber(current.temperature_2m, "current temperature"),
    windspeed: asNumber(current.wind_speed_10m, "current wind speed"),
    precipitation: asNumber(current.precipitation, "current precipitation"),
    pm2_5,
    pm10,
    date: current.time ? new Date(current.time) : new Date(),
  };

  const forecast = daily.time.map((date, index) => ({
    temperature: asNumber(daily.temperature_2m_mean?.[index], `temperature for ${date}`),
    windspeed: asNumber(daily.wind_speed_10m_max?.[index], `wind speed for ${date}`),
    precipitation: asNumber(daily.precipitation_sum?.[index], `precipitation for ${date}`),
    date: new Date(`${date}T12:00:00`),
  }));

  return { current: currentWeather, forecast };
}
