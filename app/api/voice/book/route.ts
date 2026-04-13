import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createVoiceBooking } from "@/lib/voice";
import { getSupabaseServerClient } from "@/lib/supabase";

const requestSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  start: z.string().min(1)
});

export async function POST(request: NextRequest) {
  try {
    const payload = requestSchema.parse(await request.json());
    const result = await createVoiceBooking(payload);

    const supabase = getSupabaseServerClient();
    await supabase.from("bookings").insert({
      channel: "voice",
      name: payload.name,
      email: payload.email,
      selected_slot: new Date(payload.start).toISOString(),
      status: "confirmed",
      external_booking_id: result.booking.bookingId ? String(result.booking.bookingId) : null
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected voice booking failure.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
