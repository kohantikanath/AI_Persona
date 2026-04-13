const setupSteps = [
  "Create a Supabase project and copy its URL and keys into .env.local.",
  "Create a Cal.com account and add API credentials.",
  "Add your GitHub username and, optionally, a personal access token.",
  "Add your resume file under data/resume/ before building ingestion.",
  "Run npm install, then npm run dev once dependencies are available."
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
    </main>
  );
}
