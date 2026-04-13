# Voice Setup

## Goal

Connect a real phone number to the existing AI persona so a caller can:

- talk to the candidate's AI representative,
- ask resume and GitHub questions,
- ask for availability,
- book a real interview.

## Current Backend Reuse

The voice agent should reuse the same backend pieces already built for chat:

- `RAG retrieval` from resume and GitHub
- `Groq-powered grounded answers`
- `Cal.com availability lookup`
- `Cal.com booking creation`

That means the voice layer is mainly an orchestration and telephony problem, not a second product.

## Recommended Stack

- `Vapi` for agent orchestration
- `Twilio` for the public phone number
- `Deepgram` or Vapi default STT
- `ElevenLabs` or Vapi default voice

If you need the fastest path, use as much of Vapi's built-in stack as possible first.

## What You Need

1. `Vapi` account
2. `Twilio` account
3. one Twilio phone number
4. your deployed app URL
5. working env vars for:
   - `SUPABASE_*`
   - `GROQ_*`
   - `CALCOM_*`

## Voice Architecture

```text
Caller
  ->
Twilio Number
  ->
Vapi Assistant
  ->
Your backend tools
    - chat answer endpoint
    - availability endpoint
    - booking endpoint
```

## Build Order

### 1. Deploy the app first

Before voice, deploy the current app so Vapi can reach public endpoints.

Recommended:

- `Vercel`

Minimum required public routes:

- `/api/chat`
- `/api/availability`
- `/api/book`

## 2. Create the Vapi assistant

In Vapi:

1. Create a new assistant.
2. Set the first message to something like:
   - "Hi, I'm Kohantika's AI representative. I can answer questions about background, projects, and availability, and I can book an interview for you."
3. Set the assistant behavior:
   - be natural and conversational
   - do not invent facts
   - rely on tools for booking and availability
   - if unsure, say so

## 3. Add tools in Vapi

You want three tool categories:

### Tool A: Answer candidate questions

This should call your chat backend.

Suggested mapping:

- endpoint: `POST /api/chat`
- request body:

```json
{
  "message": "{{user_message}}"
}
```

Use this for:

- resume questions
- GitHub questions
- role-fit questions

### Tool B: Get availability

Suggested mapping:

- endpoint: `GET /api/availability`

Use this when the caller says:

- "What time are you free?"
- "Can I book an interview?"
- "Do you have availability tomorrow?"

### Tool C: Book interview

Suggested mapping:

- endpoint: `POST /api/book`
- request body:

```json
{
  "name": "{{caller_name}}",
  "email": "{{caller_email}}",
  "start": "{{selected_slot}}"
}
```

## 4. Collect missing fields during the call

The assistant should gather these before booking:

1. caller name
2. caller email
3. chosen slot

Assistant rule:

- never call booking until all three are confirmed

## 5. Connect Twilio number

In Vapi:

1. connect your Twilio account
2. attach the purchased number to the assistant
3. place a live test call

If using a Twilio trial number:

- expect trial limitations
- the number may not be acceptable for final submission if public calling is restricted

## 6. Suggested assistant prompt

Use a system prompt close to this:

```text
You are Kohantika's AI representative.
Your job is to answer questions about Kohantika's resume, GitHub projects, skills, and fit for the role.
You must not invent facts.
For factual answers, use the available backend answer tool.
For scheduling, use the availability tool first, then collect caller name and email, confirm the selected slot, and only then call the booking tool.
Speak naturally and briefly. Handle follow-up questions conversationally.
If information is missing, say that directly.
```

## 7. Live test checklist

Test these call flows:

### Flow 1: Resume question

- ask: "Tell me about your background"
- expected:
  - grounded answer
  - no hallucinated details

### Flow 2: GitHub question

- ask: "Tell me about PixPDF"
- expected:
  - purpose
  - tech
  - why it matters

### Flow 3: Booking

- ask for availability
- select a slot
- provide name and email
- confirm booking

### Flow 4: Interruption

- interrupt mid-answer
- expected:
  - assistant recovers naturally
  - no crash

## 8. What to measure for evals

For Part C, record:

- first response latency
- average turn latency
- booking completion success
- interruption handling quality
- factual accuracy

## 9. Known risks

### Risk 1

Voice sounds robotic or too long.

Fix:

- shorten prompts
- reduce answer verbosity

### Risk 2

Assistant answers without using grounded tools.

Fix:

- make the answer tool the default path for factual questions

### Risk 3

Booking fails because caller data is incomplete.

Fix:

- explicitly confirm:
  - name
  - email
  - chosen slot

## 10. Immediate next implementation step in this repo

After you create the Vapi and Twilio accounts, the next code step should be:

1. add a dedicated voice-answer endpoint that wraps `/api/chat`
2. add a voice-friendly availability formatter
3. add a voice-friendly booking confirmation formatter
4. document the Vapi tool payloads in the README

