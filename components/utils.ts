import { Vector3 } from 'three';

/**
 * Converts Latitude and Longitude to a Vector3 on a sphere.
 * 
 * @param lat Latitude in degrees (-90 to 90)
 * @param lon Longitude in degrees (-180 to 180)
 * @param radius Radius of the sphere
 * @returns THREE.Vector3
 */
export const latLongToVector3 = (lat: number, lon: number, radius: number): Vector3 => {
  // Convert lat/lon to radians
  // Phi is the polar angle (0 at North Pole, PI at South Pole)
  const phi = (90 - lat) * (Math.PI / 180);
  
  // Theta is the azimuthal angle (around the equator)
  // We offset by 180 to match standard Three.js Sphere UV mapping
  const theta = (lon + 180) * (Math.PI / 180);

  // Spherical to Cartesian conversion
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));

  return new Vector3(x, y, z);
};

/**
 * Generates a short summary of the economic impact on DXY and USDT.D based on actual vs forecast data.
 * Pure function, no external API calls.
 * 
 * @param event Event Name (e.g., "GDP Growth Rate")
 * @param actual Actual Value (e.g., "2.5%")
 * @param forecast Forecast Value (e.g., "2.1%")
 * @param country Country Name (e.g., "USA")
 * @returns A string summary (max 15 words)
 */
export const summarizeEconomicImpact = (
  event: string,
  actual: string,
  forecast: string,
  country: string
): string => {
  // Helper to parse numbers from strings like "5.4%", "200K"
  const parseVal = (val: string) => {
    if (!val) return NaN;
    return parseFloat(val.replace(/[^0-9.-]/g, ''));
  };

  const actNum = parseVal(actual);
  const fcNum = parseVal(forecast);

  // If data is missing or invalid, return a neutral placeholder
  if (isNaN(actNum) || isNaN(fcNum)) {
    return "Veri henüz açıklanmadı veya eksik; piyasa etkisi belirsiz.";
  }

  // Determine if "Higher" numbers are "Better" for the economy/currency
  // Most events (GDP, PMI, Sales, Rates) -> Higher is Better/Stronger
  // Unemployment, Claims -> Lower is Better/Stronger
  const isInverseMetric = /unemployment|jobless|claims/i.test(event);

  let isPositiveNews = false;
  if (isInverseMetric) {
    isPositiveNews = actNum < fcNum;
  } else {
    isPositiveNews = actNum > fcNum;
  }

  // Check for exact match (Neutral)
  if (Math.abs(actNum - fcNum) < 0.001) {
    return "Beklentiyle uyumlu veri; piyasalarda yatay seyir ve sınırlı etki beklenir.";
  }

  // Generate Summary based on "Good News" = Strong DXY logic
  if (isPositiveNews) {
    return "Beklentiden iyi veri geldi; DXY güçlenirken, USDT.D üzerinde yükseliş baskısı artar.";
  } else {
    return "Beklentiden zayıf veri geldi; DXY gevşerken, USDT.D üzerinde düşüş baskısı oluşur.";
  }
};
