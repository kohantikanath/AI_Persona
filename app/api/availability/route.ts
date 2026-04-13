import { NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/cal";

export async function GET() {
  try {
    const slots = await getAvailableSlots();
    return NextResponse.json({ slots });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected availability route failure.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
