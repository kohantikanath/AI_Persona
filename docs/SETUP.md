# Setup

## 1. Create the app env file

Create `.env.local` from `.env.example`.

Required first:

- `NEXT_PUBLIC_APP_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GITHUB_USERNAME`
- `CALCOM_API_KEY`
- `CALCOM_EVENT_TYPE_ID`
- `CALCOM_USERNAME`

Optional for later:

- `GITHUB_TOKEN`
- `OPENAI_API_KEY`

## 2. Install dependencies

```bash
npm install
```

## 3. Run the database schema

Copy the contents of [schema.sql](/C:/Users/kohan/Documents/Kohantika/Practice/AI_Persona/supabase/schema.sql) into the Supabase SQL editor and run it.

## 4. Start the app

```bash
npm run dev
```

## 5. Next implementation milestone

After setup works locally, build:

1. `scripts/ingest-resume.ts`
2. `scripts/ingest-github.ts`
3. `app/api/chat/route.ts`
4. `app/api/availability/route.ts`
5. `app/api/book/route.ts`
