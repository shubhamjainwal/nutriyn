import { NextRequest, NextResponse } from "next/server";
import type { UsdaFoodDetail } from "@/types/nutrition";

const BASE = "https://api.nal.usda.gov/fdc/v1";

export async function GET(
  _req: NextRequest,
  { params }: { params: { fdcId: string } }
) {
  const key = process.env.USDA_API_KEY ?? "DEMO_KEY";
  const url = `${BASE}/food/${params.fdcId}?api_key=${key}`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`USDA error: ${res.status}`);
    const data: UsdaFoodDetail = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[food/detail]", err);
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  }
}
