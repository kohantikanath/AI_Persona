import { ChatWindow } from "@/components/ChatWindow";

export default function HomePage() {
  return (
    <main className="page">
      <header className="hero">
        <h1>AI Persona</h1>
        <p className="lede">
          Grounded chat and booking over resume and GitHub.
        </p>
      </header>
      <ChatWindow />
    </main>
  );
}
