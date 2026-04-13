# AI Persona Implementation Plan

## Goal

Build a live AI persona that can:

1. Answer phone calls as my AI representative.
2. Chat publicly via a web interface.
3. Answer using RAG grounded on my real resume and GitHub.
4. Check real availability and book an interview automatically.
5. Produce an eval report with measurable quality metrics.

## Recommended Stack

Use the fastest path to a working submission:

- Frontend chat: `Next.js` + `Vercel`
- Backend API: `Next.js API routes` or a small `Node/Express` service
- LLM + orchestration: `OpenAI Responses API`
- Embeddings / retrieval: `OpenAI embeddings` + `Supabase pgvector`
- Voice agent: `Vapi` + `Twilio`
- Speech stack: `Deepgram` for STT, `ElevenLabs` for TTS
- Calendar booking: `Cal.com` or `Calendly`
- Data ingestion: GitHub API + parsed PDF/DOCX resume
- Observability/evals: structured logs + saved transcripts + simple scoring scripts

## Why This Stack

- `Vapi` is the shortest path to a real phone number and interruption-capable voice agent.
- `Twilio` gives a real callable phone number.
- `Deepgram` and `ElevenLabs` are proven low-latency choices.
- `Supabase pgvector` is easy to set up for RAG and public deployment.
- `Next.js` gives one repo for chat UI, APIs, and deployment.
- `Cal.com` is usually easier to automate and inspect than building raw Google Calendar flows.

## High-Level Architecture

```text
Phone Call / Public Chat
        |
        v
  Persona Orchestrator (server)
        |
        +--> Retrieval Layer
        |      - Resume chunks
        |      - GitHub repo summaries
        |      - Experience / projects facts
        |
        +--> Tool Layer
        |      - Availability lookup
        |      - Booking creation
        |      - GitHub refresh
        |
        +--> LLM
               - grounded answers
               - follow-up questions
               - booking flow
```

## Core Product Requirements Mapped to Implementation

### 1. Voice Agent

Must do:

- Introduce itself as my AI representative.
- Answer background and role-fit questions naturally.
- Handle interruptions and follow-ups.
- Ask for availability.
- propose real slots.
- confirm and book a meeting.

Implementation:

- Buy/configure a `Twilio` number.
- Connect number to `Vapi`.
- Create a voice assistant prompt that:
  - explicitly says it is my AI representative,
  - uses retrieval before answering background questions,
  - uses tools for availability lookup and booking,
  - stays honest when information is missing.
- Add server tools:
  - `getAvailableSlots`
  - `bookInterview`
  - `getCandidateProfile`
  - `getRepoInfo`
- Log every call transcript and tool invocation.

### 2. Chat Interface

Must do:

- Public URL.
- Accurate answers about resume and GitHub.
- Book a call from chat.
- Stay grounded and avoid hallucinations.

Implementation:

- Build a minimal public chat page in `Next.js`.
- Backend chat endpoint:
  - embed user query,
  - retrieve top-k chunks from resume/GitHub knowledge base,
  - pass chunks plus tool definitions into model,
  - require citation IDs internally,
  - refuse unsupported claims.
- Add booking widget or direct chat-booking tool flow.

### 3. RAG Grounding

Must not be hardcoded.

Implementation:

- Parse resume into structured facts and chunks.
- Fetch GitHub repos through API.
- For selected repos, store:
  - repo name,
  - description,
  - tech stack,
  - README summary,
  - tradeoffs,
  - links.
- Store all content in `pgvector`.
- Re-ingest on demand with a script.

### 4. Evals Report

Implementation:

- Save test conversations and calls.
- Measure:
  - first-response latency,
  - average turn latency,
  - tool success rate,
  - booking completion rate,
  - hallucination rate,
  - retrieval hit quality.
- Generate `report.md` then export to PDF.

## Suggested Repo Structure

```text
AI_Persona/
  app/
    page.tsx
    api/
      chat/route.ts
      availability/route.ts
      book/route.ts
      ingest/route.ts
      voice-webhook/route.ts
  components/
    ChatWindow.tsx
    MessageList.tsx
    BookingPanel.tsx
  lib/
    openai.ts
    retriever.ts
    embeddings.ts
    calendar.ts
    github.ts
    resume.ts
    persona.ts
    evals.ts
  scripts/
    ingest-resume.ts
    ingest-github.ts
    run-evals.ts
  data/
    resume/
    repos/
    evals/
  docs/
    architecture.md
    eval-report.md
  public/
  README.md
  IMPLEMENTATION.md
```

## Data Model

### `knowledge_chunks`

- `id`
- `source_type` (`resume`, `repo`, `project`, `experience`)
- `source_name`
- `url`
- `chunk_text`
- `embedding`
- `metadata_json`

### `repos`

- `name`
- `url`
- `description`
- `languages`
- `readme_summary`
- `tradeoffs`
- `last_synced_at`

### `bookings`

- `id`
- `channel` (`voice`, `chat`)
- `name`
- `email`
- `selected_slot`
- `status`
- `external_booking_id`

### `eval_runs`

- `id`
- `channel`
- `scenario`
- `latency_ms`
- `grounded`
- `booking_success`
- `notes`

## Persona Rules

The persona prompt should enforce:

- Always identify as the candidate’s AI representative.
- Never invent education, companies, dates, or repo details.
- If asked something unsupported, say that directly.
- Prefer retrieved facts over model priors.
- When discussing fit for the role, connect claims to resume/repo evidence.
- During booking, confirm timezone, email, and final slot before creating the event.

## Calendar Strategy

### Best path

Use `Cal.com`:

- expose real availability,
- create booking links or direct bookings,
- easier API integration.

### Alternative

Use `Calendly` if already configured.

### Avoid first

Raw Google Calendar availability + custom event creation is more work and adds auth complexity.

## Build Order

### Phase 1: Foundation

1. Initialize `Next.js` app.
2. Set up Supabase project and schema.
3. Add env handling.
4. Add OpenAI client.

Deliverable:

- local app runs,
- database connected,
- env documented.

### Phase 2: Data Ingestion

1. Add resume parser and chunker.
2. Add GitHub fetcher for selected repos.
3. Add embeddings + vector upsert.
4. Add scripts to refresh knowledge.

Deliverable:

- searchable knowledge base grounded on your actual data.

### Phase 3: Chat Persona

1. Build public chat UI.
2. Build RAG chat endpoint.
3. Add source-aware answer formatting.
4. Add booking actions from chat.

Deliverable:

- public URL that answers grounded questions and books meetings.

### Phase 4: Voice Persona

1. Buy/configure Twilio number.
2. Configure Vapi assistant.
3. Wire tool endpoints for availability and booking.
4. Tune latency and interruption handling.

Deliverable:

- live callable number.

### Phase 5: Evals

1. Define 10 to 15 test scenarios.
2. Run chat evals for grounding.
3. Run voice test calls.
4. Write 1-page PDF report.

Deliverable:

- eval report with metrics and failure analysis.

## Day-by-Day Execution Plan

### Day 1

- Create repo and app skeleton.
- Set up Supabase.
- Add env file template.
- Prepare resume source file.
- List 3 to 5 GitHub repos to ingest.

### Day 2

- Build ingestion pipeline.
- Store chunks and embeddings.
- Verify retrieval quality manually.

### Day 3

- Build chat UI and chat API.
- Answer resume and repo questions.
- Add honesty/fallback rules.

### Day 4

- Integrate booking flow.
- Connect Cal.com or Calendly.
- Confirm booking end-to-end from chat.

### Day 5

- Set up Twilio + Vapi voice assistant.
- Connect voice tools to same backend.
- Test interruptions and slot-booking.

### Day 6

- Run evals.
- Fix top failure modes.
- Deploy final URLs.
- Write README and report PDF.

## Key Risks

### Risk 1: Hallucinated background claims

Fix:

- require retrieval for resume/GitHub questions,
- answer only from returned chunks,
- add fallback: "I don't have evidence for that."

### Risk 2: Booking flow breaks mid-conversation

Fix:

- use one booking provider,
- keep booking tools simple,
- confirm input fields explicitly,
- log tool failures.

### Risk 3: Voice latency too high

Fix:

- keep prompts short,
- keep tool payloads minimal,
- precompute summaries,
- use fast models for voice,
- reduce retrieval chunk count.

### Risk 4: GitHub repo answers are too shallow

Fix:

- precompute repo summaries and tech stacks,
- store README plus curated repo metadata,
- ingest only strongest projects first.

## Acceptance Checklist

- Public chat URL works.
- Phone number is callable.
- Persona states it is my AI representative.
- Resume answers are specific and accurate.
- GitHub answers include tech, purpose, and tradeoffs.
- Availability comes from real calendar.
- Booking creates a real confirmed interview.
- Voice first response is under 2 seconds.
- README explains setup and architecture.
- Eval report is exported as PDF.

## What To Prepare Before Implementation

You should gather these first:

1. Updated resume in PDF or DOCX.
2. GitHub username.
3. Shortlist of 3 to 5 repos worth showcasing.
4. Booking provider account (`Cal.com` preferred).
5. Twilio account.
6. Vapi account.
7. OpenAI API key.
8. Supabase project.
9. Vercel account for deployment.

## Recommended First Milestone

Build chat before voice.

Reason:

- chat validates your RAG,
- chat and voice can share the same backend tools,
- booking logic is easier to debug in chat first,
- once grounded chat works, voice becomes an integration problem instead of a product-definition problem.

## Immediate Next Steps

1. Initialize the repo with `Next.js` and TypeScript.
2. Create `.env.example` with all required secrets.
3. Add the Supabase schema.
4. Add the ingestion pipeline for resume and GitHub.
5. Build the chat endpoint before touching voice.

## Decision Summary

If the goal is to finish quickly and reliably, the implementation order should be:

1. `RAG ingestion`
2. `chat persona`
3. `calendar booking`
4. `voice agent`
5. `evals + polish`

