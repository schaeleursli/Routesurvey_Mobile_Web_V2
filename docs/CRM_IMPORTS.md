# RouteSurvey CRM source imports

## Breakbulk Europe and Dubai

The official Breakbulk exhibitor pages expose public company, stand and sector data.

Run:

```bash
npm run crm:import:breakbulk
```

Generated snapshots are written to:

- `src/data/crm/generated/breakbulk-europe-2027.json`
- `src/data/crm/generated/breakbulk-dubai-2027.json`

The importer preserves the official source URL and observation timestamp.

## Intermodal South America

The public Intermodal website embeds the complete exhibitor directory through the event platform. The normal website crawler does not expose the complete 500+ brand list in static HTML.

Two routes are supported:

1. Curated public-source seed data checked into the repository.
2. A CSV/export supplied by the authorized event platform/user, imported with the generic importer.

Example:

```bash
node scripts/crm/import-source-csv.mjs \
  --input ./intermodal-exhibitors.csv \
  --source-id intermodal-south-america-exhibitors-2026 \
  --source-url https://www.intermodal.com.br/lista-de-expositores/
```

The generic importer accepts common headers such as:

- Company / Company Name / exhibitor
- Full Name / person
- Job Title / position
- Country
- Stand / Booth
- Sector / Category

Do not automate extraction from authenticated/private networking views.

## Dedupe

Company imports use a conservative match key:
- punctuation and diacritics normalized
- ordinary legal suffixes removed
- operating-brand words retained

Near matches are **not** auto-merged. They must go to alias review.
