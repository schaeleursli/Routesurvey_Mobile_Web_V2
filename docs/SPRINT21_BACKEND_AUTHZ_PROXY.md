# Sprint 21 — RouteSurvey trusted backend gateway

Server-only Node HTTP handler `createEvidenceHandler` implements `GET /api/scan3d/evidence`, accepting canonical project/survey/obstruction IDs. It requires injected `authenticate(req)` and `authorizePoint({user, projectId, surveyId, obstructionId})` functions. Authorization must consult the real persistent membership, survey and SurveyPoint IDs (not mere client claims). There is intentionally **no default allow**.

The upstream is the World Studio restricted development metadata service (Sprint 20); its token is read only from server environment at host startup. Enforce HTTPS and a fixed configured origin. Return job status metadata and empty `sections`, never misrepresent queued jobs as completed report evidence or expose unverified signed image/model URLs.

## Host wiring example (illustrative only)
The real RouteSurvey API host must call:
`const handler = createEvidenceHandler({ authenticate: realSessionValidator, authorizePoint: databaseACL, upstreamOrigin: process.env.WORLD_STUDIO_ORIGIN, serviceToken: process.env.WORLD_STUDIO_TOKEN })`
and register handler at `/api/scan3d/evidence`. No browser credential should enter the World Studio request. Do not deploy the handler without both trusted hooks.

## Important limitations
This repository primarily ships a Vite/Vue console. No production Node API host, user auth/session adapter or database ACL integration was verified here. The handler is a secured-by-construction integration boundary, **not an active production endpoint**. World Studio static shared token still lacks tenant-aware service credential scoping. Also requires actual model processing, source-image delivery, model revisions, and verified engineering measurement separation.

## Test and release gates
`node --test server/scan3d/evidenceProxy.test.mjs` and existing `npm test`, `npm run typecheck`, `npm run build`. Verify expired sessions, non-member project access, mismatched upstream IDs, revoked access, route changes and safe log redaction. Run tests in CI and on staging. Native Mac Mini iPhone test still pending.
