# AI Persona

This project is a free-first implementation of an AI persona that can:

- answer grounded questions about a real resume and GitHub profile,
- expose a public chat interface,
- check real availability,
- book an interview through a live scheduler,
- later reuse the same backend for a voice agent.

## Current Status

Repository scaffolding is in place. The next implementation steps are:

1. install dependencies,
2. create the Supabase schema,
3. ingest resume and GitHub data,
4. build grounded chat,
5. connect booking,
6. add voice last.

## Stack

- `Next.js`
- `TypeScript`
- `Supabase`
- `Cal.com`
- `GitHub API`
- `Groq API`

## Local Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in Supabase, GitHub, and Cal.com credentials.
3. Add `GROQ_API_KEY` for grounded generation.
4. Optionally set `GROQ_MODEL` if your account uses a different Groq-supported model.
5. Run `npm install`.
6. Run `npm run dev`.

## Free-First Constraint

The free-only path is optimized for chat, retrieval, and booking first. A real public voice number may still require paid telephony due to trial restrictions.
