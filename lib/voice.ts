import { generateGroundedReplyWithGroq } from "@/lib/groq";
import { retrieveRelevantChunks } from "@/lib/retriever";
import { getAvailableSlots, bookSlot } from "@/lib/cal";

function formatSlotForSpeech(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export async function getVoiceAnswer(message: string) {
  const chunks = await retrieveRelevantChunks(message, 4);
  const reply = await generateGroundedReplyWithGroq(message, chunks);

  return {
    answer: reply.answer,
    mode: reply.mode
  };
}

export async function getVoiceAvailability() {
  const slots = await getAvailableSlots();
  const topSlots = slots.slice(0, 3);

  if (!topSlots.length) {
    return {
      slots: [],
      spoken:
        "I do not see any available interview slots in the next seven days right now."
    };
  }

  return {
    slots: topSlots,
    spoken: `The next available slots are ${topSlots
      .map((slot) => formatSlotForSpeech(slot.start))
      .join(", ")}.`
  };
}

export async function createVoiceBooking(input: {
  name: string;
  email: string;
  start: string;
}) {
  const parsedDate = new Date(input.start);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Selected slot has an invalid datetime value.");
  }

  const normalizedStart = parsedDate.toISOString();
  const booking = await bookSlot({
    ...input,
    start: normalizedStart
  });

  return {
    booking,
    spoken: `Your interview is booked for ${formatSlotForSpeech(normalizedStart)}. A confirmation will go to ${input.email}.`
  };
}
