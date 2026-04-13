import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { bookSlot } from "@/lib/cal";
import { getSupabaseServerClient } from "@/lib/supabase";

const requestSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  start: z.string().min(1)
});

export async function POST(request: NextRequest) {
  try {
    const payload = requestSchema.parse(await request.json());
    const parsedDate = new Date(payload.start);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error("Selected slot has an invalid datetime value.");
    }

    const normalizedStart = parsedDate.toISOString();
    const booking = await bookSlot({
      ...payload,
      start: normalizedStart
    });

    const supabase = getSupabaseServerClient();
    await supabase.from("bookings").insert({
      channel: "chat",
      name: payload.name,
      email: payload.email,
      selected_slot: normalizedStart,
      status: "confirmed",
      external_booking_id: booking.bookingId ? String(booking.bookingId) : null
    });

    return NextResponse.json({
      success: true,
      booking
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected booking route failure.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
