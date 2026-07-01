const LAT = -26.832;
const LON = 32.889;
const TIMEZONE = "Africa/Maputo";
const TIMEOUT_MS = 8000;

const WMO: Record<number, string> = {
  0: "clear sky",
  1: "mainly clear",
  2: "partly cloudy",
  3: "overcast",
  45: "foggy",
  48: "icy fog",
  51: "light drizzle",
  53: "moderate drizzle",
  55: "heavy drizzle",
  61: "light rain",
  63: "moderate rain",
  65: "heavy rain",
  80: "rain showers",
  81: "moderate showers",
  82: "heavy showers",
  95: "thunderstorm",
  96: "thunderstorm with hail",
  99: "heavy thunderstorm with hail",
};

function wmoDesc(code: number): string {
  return WMO[code] ?? "variable conditions";
}

function windDir(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

export interface WeatherResult {
  current: {
    temperatureC: number;
    feelsLikeC: number;
    humidity: number;
    description: string;
    windSpeedKmh: number;
    windDirection: string;
  };
  forecast: {
    date: string;
    description: string;
    minC: number;
    maxC: number;
    rainProbabilityPct: number;
  }[];
}

export async function getWeather(): Promise<WeatherResult> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(LAT));
  url.searchParams.set("longitude", String(LON));
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m",
  );
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
  );
  url.searchParams.set("timezone", TIMEZONE);
  url.searchParams.set("forecast_days", "4");

  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);

    const data = await res.json() as {
      current: {
        temperature_2m: number;
        apparent_temperature: number;
        relative_humidity_2m: number;
        weather_code: number;
        wind_speed_10m: number;
        wind_direction_10m: number;
      };
      daily: {
        time: string[];
        weather_code: number[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_probability_max: number[];
      };
    };

    const c = data.current;
    const d = data.daily;

    return {
      current: {
        temperatureC: Math.round(c.temperature_2m),
        feelsLikeC: Math.round(c.apparent_temperature),
        humidity: c.relative_humidity_2m,
        description: wmoDesc(c.weather_code),
        windSpeedKmh: Math.round(c.wind_speed_10m),
        windDirection: windDir(c.wind_direction_10m),
      },
      forecast: d.time.slice(1, 4).map((date, i) => ({
        date,
        description: wmoDesc(d.weather_code[i + 1]),
        minC: Math.round(d.temperature_2m_min[i + 1]),
        maxC: Math.round(d.temperature_2m_max[i + 1]),
        rainProbabilityPct: d.precipitation_probability_max[i + 1] ?? 0,
      })),
    };
  } finally {
    clearTimeout(tid);
  }
}
