# Repo Selection

The GitHub ingestion pipeline now reads from [selected-repos.json](/C:/Users/kohan/Documents/Kohantika/Practice/AI_Persona/data/repos/selected-repos.json).

Only the repos listed there will be ingested into the candidate knowledge base.

Why this exists:

- avoids polluting retrieval with the current `AI_Persona` repo
- avoids template or placeholder repos dominating answers
- keeps job-relevant evidence focused on your strongest projects

If you want better answers, keep this list to `3` to `5` strong repositories.
