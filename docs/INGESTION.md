# Ingestion

## Resume

Add one resume file under `data/resume/`.

Supported formats:

- `.pdf`
- `.docx`
- `.md`
- `.txt`

Run:

```bash
npm run ingest:resume
```

This parses the file, chunks it, and inserts rows into `knowledge_chunks` with `source_type = 'resume'`.

## GitHub

Set `GITHUB_USERNAME` in `.env.local`.

Optional:

- add `GITHUB_TOKEN` if you want higher rate limits

Run:

```bash
npm run ingest:github
```

This fetches up to 8 recent public repos, stores repo metadata in `repos`, and stores searchable chunks in `knowledge_chunks` with `source_type = 'repo'`.

## Notes

- The current pipeline is lexical-first and does not require embeddings.
- This is enough to start building grounded chat.
- Embeddings can be added later when model/API access is available.
