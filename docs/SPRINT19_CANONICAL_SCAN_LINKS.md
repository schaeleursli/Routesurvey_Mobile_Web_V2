# Sprint 19 — Canonical 3D evidence links

The real review flow uses `fetchSurveyPoints(routeId)`, `SurveyPoint.id`, `useSurveyReviewStore`, and `PointInspector`.

This sprint adds a point-scoped evidence store and a selected-point read-only indicator inside the review workspace. It also adds `indexPointEvidence`, which normalizes mobile 3D evidence only when the selected canonical point ID matches the evidence obstruction ID.

## Required backend work
The production API must authorize account/project access and resolve each 3D scan to a canonical SurveyPoint.id, projectId and surveyId. Do not infer project identity solely from routeId or expose untrusted media URLs. After successful authorized retrieval, call `store.setScanEvidence(point.id, validatedSections)`. No invented API endpoint or fake records are wired in this sprint.

## Safety and test gates
The store evidence cache clears when survey points are replaced. The UI never changes the existing survey-point dimensions or declares inferred geometry measured.

Run `npm test -- src/features/scan3d/pointEvidenceLink.test.js`, `npm run typecheck`, `npm run build`. Then test route switches, unsaved drafts, unauthorized project access, point mismatch, and old report compatibility.

The active Flutter mobile project and physical iPhone/Xcode acceptance remain separate. This is a real review-workspace integration, but not a completed authenticated backend or PDF output.
