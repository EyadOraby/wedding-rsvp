import { NextResponse } from "next/server";
import { getPublicSiteData } from "@/lib/site-data";

export async function GET() {
  try {
    const data = await getPublicSiteData();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load site data" },
      { status: 500 },
    );
  }
}
