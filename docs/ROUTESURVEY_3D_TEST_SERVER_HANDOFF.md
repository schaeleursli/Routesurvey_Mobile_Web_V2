# RouteSurvey 3D — Sprints 20–26 developer test-server handoff

## Repositories
- iOS Flutter: schaeleursli/RouteSurvey_Mobile_V09
- Vue review and report console: schaeleursli/Routesurvey_Mobile_Web_V2
- reconstruction service: schaeleursli/World-Studio

## Component acceptance
1. **App developer**: generate/repair iOS Runner Xcode target, register Swift capture plugin and camera entitlement/usage string; flutter pub get, flutter analyze, flutter test, physical iPhone ARKit preview/capture, ZIP save/import SHA-256 and local gallery/model viewer. Connect actual survey route and local scan index.
2. **Backend developer**: mount server/scan3d/evidenceProxy.mjs on the actual RouteSurvey API server, inject *real* session validation and DB-backed project/survey/point authorization. No default-allow and no World Studio token in browser. Provide WORLD_STUDIO_ORIGIN and WORLD_STUDIO_TOKEN only in server secrets.
3. **World Studio backend developer**: run the authenticated /api/routesurvey/v1 jobs and evidence services on an isolated test host; implement asynchronous worker queue, worker auth, processing status updates, integrity-checked output, and signed model/photo delivery with project ACL. Never claim queued is ready.
4. **Web app developer**: connect authenticated projectId/surveyId to selected SurveyPoint.id, fetch status from same-origin /api/scan3d/evidence, show loading/error/empty/queued/ready safely. Attach verified report evidence to MASL/PDF with evidence references, not inferred clearances.
5. **QA**: test two separate users/projects for cross-tenant leakage, route switches, revoked session, bad archives, malicious paths, expired signed URL, missing model, ZIP reimport, offline reopen and report regeneration.

## State of code handed off
- iPhone Swift/Flutter capture and ZIP portability: source present, not physical-device tested.
- Browser query and server-only fail-closed handler: source committed, not mounted on real app API host.
- World Studio: job archive ingestion and metadata lookup; no proven production worker/asset delivery.
- PDF renderer: report adapter source exists; final MASL/PDF insertion is an integration task.
- Test server setup: unconfigured. Do not deploy without audited auth/ACL implementation.

## Environments required from developers
Test domain/TLS, session provider, canonical project-to-route-to-point mapping, authorized database access, artifact storage, GPU host/queue, secret management, request limits, retention, observability, backup and recovery.

## Commands
Web: npm ci; npm test; npm run typecheck; npm run build; node --test server/scan3d/evidenceProxy.test.mjs
Mobile: flutter pub get; flutter analyze; flutter test; flutter build ios --no-codesign (on Mac with Xcode)
World Studio: python -m pytest tests/test_routesurvey_jobs.py; uvicorn app.main:app --host 127.0.0.1

## Gates
Never substitute AI reconstruction for independently surveyed clearance values. Require field instrument, calibration, uncertainty, time and reviewer for any field_verified measurement. Keep immutable originals, model revisions and audit/provenance metadata.
