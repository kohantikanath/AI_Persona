"use client";

import { FormEvent, useState } from "react";

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

export function ChatWindow() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    </section>
  );
}
