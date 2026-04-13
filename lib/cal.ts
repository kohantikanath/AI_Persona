import { env } from "@/lib/env";

type CalSlot = {
  start: string;
};

type BookingInput = {
  name: string;
  email: string;
  start: string;
};

function getHeaders(apiVersion: string) {
  if (!env.CALCOM_API_KEY) {
    throw new Error("CALCOM_API_KEY is missing in .env.local.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.CALCOM_API_KEY}`,
    "cal-api-version": apiVersion
  };
}

function getEventTypeId() {
  if (!env.CALCOM_EVENT_TYPE_ID) {
    throw new Error("CALCOM_EVENT_TYPE_ID is missing in .env.local.");
  }

  return Number(env.CALCOM_EVENT_TYPE_ID);
}

export async function getAvailableSlots() {
  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + 7);

  const url = new URL("https://api.cal.com/v2/slots");
  url.searchParams.set("eventTypeId", String(getEventTypeId()));
  url.searchParams.set("start", start.toISOString());
  url.searchParams.set("end", end.toISOString());
  url.searchParams.set("timeZone", "Asia/Kolkata");

  const response = await fetch(url.toString(), {
    headers: getHeaders("2024-09-04"),
    cache: "no-store"
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cal.com availability failed: ${response.status} ${errorText}`);
  }

  const payload = (await response.json()) as {
    data?: Record<string, Array<{ start: string }>>;
  };

  const slots = Object.values(payload.data ?? {})
    .flat()
    .map((slot) => ({ start: slot.start }))
    .sort((left, right) => left.start.localeCompare(right.start))
    .slice(0, 8);

  return slots satisfies CalSlot[];
}

export async function bookSlot(input: BookingInput) {
  const response = await fetch("https://api.cal.com/v2/bookings", {
    method: "POST",
    headers: getHeaders("2026-02-25"),
    body: JSON.stringify({
      eventTypeId: getEventTypeId(),
      start: input.start,
      attendee: {
        name: input.name,
        email: input.email,
        timeZone: "Asia/Kolkata"
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cal.com booking failed: ${response.status} ${errorText}`);
  }

  const payload = (await response.json()) as {
    data?: {
      id?: number | string;
      uid?: string;
      start?: string;
      attendees?: Array<{ email?: string }>;
    };
  };

  return {
    bookingId: payload.data?.id ?? payload.data?.uid ?? null,
    start: payload.data?.start ?? input.start,
    attendeeEmail: payload.data?.attendees?.[0]?.email ?? input.email
  };
}
