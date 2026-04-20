import { NextResponse } from "next/server";
import { fetchYahoo } from "@/lib/fetchYahoo";

export async function GET() {
  await fetchYahoo();

  return NextResponse.json({ message: "fetch done" });
}