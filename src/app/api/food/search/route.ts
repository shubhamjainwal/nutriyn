import { NextRequest, NextResponse } from "next/server";
import type { UsdaSearchResponse } from "@/types/nutrition";

const BASE = "https://api.nal.usda.gov/fdc/v1";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ foods: [] });
  }

  const key = process.env.USDA_API_KEY ?? "DEMO_KEY";
  const url = `${BASE}/foods/search?query=${encodeURIComponent(q)}&api_key=${key}&pageSize=15&dataType=Foundation,SR%20Legacy,Branded`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`USDA error: ${res.status}`);
    const data: UsdaSearchResponse = await res.json();
    return NextResponse.json({ foods: data.foods ?? [] });
  } catch (err) {
    console.error("[food/search]", err);
    return NextResponse.json({ error: "Search failed", foods: [] }, { status: 502 });
  }
}
