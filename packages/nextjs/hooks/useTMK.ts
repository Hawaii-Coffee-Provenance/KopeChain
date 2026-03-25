"use client";

import { useCallback, useState } from "react";

export interface TMKResult {
  latitude: number;
  longitude: number;
  tmkText: string;
  acres?: number;
}

const TMK_API = "https://geodata.hawaii.gov/arcgis/rest/services/ParcelsZoning/MapServer/25/query";

function computeCentroid(rings: number[][][]): { lat: number; lng: number } {
  let totalX = 0,
    totalY = 0,
    count = 0;

  for (const ring of rings) {
    for (const [x, y] of ring) {
      totalX += x;
      totalY += y;
      count++;
    }
  }

  return { lat: totalY / count, lng: totalX / count };
}

function normalizeTMK(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");

  if (digits.length < 3) return null;

  const d = digits[0] ?? "";
  const z = digits[1] ?? "";
  const s = digits[2] ?? "";

  const rest = digits.slice(3);
  const plat = rest.slice(0, 3).padStart(3, "0");
  const parcel = rest.slice(3, 6).padStart(3, "0");

  if (!d || !z || !s) return null;

  return `${d}${z}${s}${plat}${parcel}`;
}

export function useTMK() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(async (tmk: string): Promise<TMKResult | null> => {
    const normalized = normalizeTMK(tmk);

    if (!normalized) {
      setError("Enter at least D-Z-S to search.");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        where: `tmk_txt LIKE '${normalized}%'`,
        outFields: "tmk_txt,gisacres",
        returnGeometry: "true",
        outSR: "4326",
        f: "json",
      });

      const res = await fetch(`${TMK_API}?${params.toString()}`);
      if (!res.ok) throw new Error(`Error: ${res.status}`);

      const data = await res.json();
      if (!data.features?.length) throw new Error("No parcel found for that TMK.");

      const { attributes: attrs, geometry } = data.features[0];
      const { lat, lng } = computeCentroid(geometry.rings as number[][][]);

      return {
        latitude: lat,
        longitude: lng,
        tmkText: attrs.tmk_txt ?? tmk,
        acres: attrs.gisacres != null ? parseFloat(attrs.gisacres) : undefined,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lookup failed.";

      setError(msg);

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { lookup, loading, error, clearError: () => setError(null) };
}
