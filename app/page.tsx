import { ChatWindow } from "@/components/ChatWindow";

const setupSteps = [
  "Rotate your exposed Supabase keys once more because they appeared in terminal output.",
  "Connect Cal.com credentials after chat is stable.",
  "Add OpenAI later if you want model-generated grounded responses beyond lexical summarization.",
  "Use this page to test grounded questions against the ingested resume and GitHub data."
];

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">AI Persona</p>
        <h1>Free-first setup is ready.</h1>
        <p className="lede">
          This repository is scaffolded for a grounded chat persona with real
          scheduling. Voice comes after chat and booking are stable.
        </p>
      </section>

      <section className="card">
        <h2>Immediate setup</h2>
        <ol>
          {setupSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <ChatWindow />
    </main>
  );
}
