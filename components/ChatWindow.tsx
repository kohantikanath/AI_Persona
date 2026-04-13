"use client";

import { FormEvent, useEffect, useState } from "react";

type Source = {
  id: string;
  sourceType: string;
  sourceName: string;
  url: string | null;
  text: string;
};

type ApiResponse = {
  answer: string;
  grounded: boolean;
  mode: "groq";
  sources: Source[];
};

type Slot = {
  start: string;
};

export function ChatWindow() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [bookingName, setBookingName] = useState("");
  const [bookingEmail, setBookingEmail] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    async function loadSlots() {
      try {
        const result = await fetch("/api/availability");
        const payload = (await result.json()) as { slots?: Slot[]; error?: string };

        if (!result.ok) {
          throw new Error(payload.error ?? "Availability request failed.");
        }

        setSlots(payload.slots ?? []);
        setSelectedSlot(payload.slots?.[0]?.start ?? "");
      } catch (loadError) {
        setSlotsError(loadError instanceof Error ? loadError.message : "Unknown availability error");
      }
    }

    loadSlots();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!message.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      });

      const payload = (await result.json()) as ApiResponse & { error?: string };

      if (!result.ok) {
        throw new Error(payload.error ?? "Chat request failed.");
      }

      setResponse(payload);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function handleBookingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!bookingName || !bookingEmail || !selectedSlot) {
      setBookingStatus("Name, email, and slot are required.");
      return;
    }

    setBookingLoading(true);
    setBookingStatus(null);

    try {
      const result = await fetch("/api/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: bookingName,
          email: bookingEmail,
          start: selectedSlot
        })
      });

      const payload = (await result.json()) as {
        success?: boolean;
        error?: string;
        booking?: { start?: string };
      };

      if (!result.ok) {
        throw new Error(payload.error ?? "Booking request failed.");
      }

      setBookingStatus(`Booking confirmed for ${payload.booking?.start ?? selectedSlot}.`);
    } catch (bookingError) {
      setBookingStatus(bookingError instanceof Error ? bookingError.message : "Unknown booking error");
    } finally {
      setBookingLoading(false);
    }
  }

  return (
    <section className="chat-shell">
      <div className="chat-intro">
        <p className="eyebrow">Part B</p>
        <h2>Grounded chat prototype</h2>
        <p className="lede small">
          Ask about resume details, GitHub repos, role fit, or project tradeoffs.
          The current version retrieves real resume and GitHub evidence, then asks Groq to answer only from that evidence.
        </p>
      </div>

      <form className="chat-form" onSubmit={handleSubmit}>
        <label className="chat-label" htmlFor="message">
          Ask a grounded question
        </label>
        <textarea
          id="message"
          className="chat-input"
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Why are you the right person for this role?"
        />
        <button className="chat-button" type="submit" disabled={loading}>
          {loading ? "Thinking..." : "Ask"}
        </button>
      </form>

      {error ? <p className="status error">{error}</p> : null}

      {response ? (
        <div className="chat-result">
          <div className="answer-card">
            <p className="status">
              {response.grounded ? "Grounded" : "Not grounded"} | {response.mode}
            </p>
            <pre className="answer-copy">{response.answer}</pre>
          </div>

          <div className="sources-card">
            <h3>Evidence base</h3>
            <ul className="source-list">
              {response.sources.map((source) => (
                <li key={source.id} className="source-item">
                  <p className="source-title">
                    {source.sourceType === "resume" ? "Resume" : "GitHub"}: {source.sourceName}
                  </p>
                  {source.url ? (
                    <p className="source-text">{source.url}</p>
                  ) : (
                    <p className="source-text">Candidate resume</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <section className="sources-card">
        <h3>Book an interview</h3>
        <p className="source-text">
          This is the real booking path that will later be reused by the voice agent.
        </p>
        {slotsError ? <p className="status error">{slotsError}</p> : null}
        <form className="booking-form" onSubmit={handleBookingSubmit}>
          <input
            className="chat-input"
            value={bookingName}
            onChange={(event) => setBookingName(event.target.value)}
            placeholder="Your name"
          />
          <input
            className="chat-input"
            value={bookingEmail}
            onChange={(event) => setBookingEmail(event.target.value)}
            placeholder="you@example.com"
            type="email"
          />
          <select
            className="chat-input"
            value={selectedSlot}
            onChange={(event) => setSelectedSlot(event.target.value)}
          >
            {slots.map((slot) => (
              <option key={slot.start} value={slot.start}>
                {new Date(slot.start).toLocaleString()}
              </option>
            ))}
          </select>
          <button className="chat-button" disabled={bookingLoading || !slots.length} type="submit">
            {bookingLoading ? "Booking..." : "Book slot"}
          </button>
        </form>
        {bookingStatus ? <p className="status">{bookingStatus}</p> : null}
      </section>
    </section>
  );
}
