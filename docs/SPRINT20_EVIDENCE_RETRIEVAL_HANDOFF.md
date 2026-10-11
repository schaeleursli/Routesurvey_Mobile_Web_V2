# Sprint 20 — authorized 3D evidence retrieval contract

## Two-sided change
World Studio PR #36 provides restricted development-only scoped job metadata lookup. This RouteSurvey PR provides a same-origin browser query contract.

These endpoints are deliberately **not directly connected**: a RouteSurvey backend must implement /api/scan3d/evidence with logged-in session authentication, actual project/survey/obstruction access controls, and normalization from World Studio job records to the section format produced by the existing report adapter. Only that server component may hold a World Studio service credential.

## Security invariants
Never embed RS_3D_INGEST_TOKEN in web bundles, never trust client-supplied projectId alone, and never send archive-relative image paths as public image URLs. No source thumbnails or 3D model bytes are served by this work.

## Integration next
Implement server-side authorization, trusted service-to-service authentication, signed image/model delivery, ownership tests and cancellation on route change. Then connect the query to selectedPointId, after verified projectId and surveyId are available from the authenticated route context.

## Validation
Run npm test, npm run typecheck, npm run build. Tests and end-to-end auth were not executed in this PR.
