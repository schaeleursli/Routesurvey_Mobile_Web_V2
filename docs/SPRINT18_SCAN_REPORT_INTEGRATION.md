# Sprint 18 — RouteSurvey mobile evidence → web reporting adapter

## Source findings
The real Vue console has SurveyReviewPage.vue using useSurveyReviewStore and fetchSurveyPoints(routeId); ReportBuilder.vue is a large, existing report builder. The RouteSurvey_Mobile_V09 Flutter app still has placeholder main.dart. Replacing these interfaces blindly would risk regression.

## Delivered
The reportEvidenceAdapter normalizes a mobile '3d_visual_evidence' section, rejects mismatched project/survey/obstruction identity, and preserves original photographs and GLB/SPZ model revision references. It never outputs measured clearance values.

## Integration path for T3 Code
1. Resolve the canonical survey point/obstruction ID in fetchSurveyPoints and useSurveyReviewStore.
2. Extend an authorized backend endpoint to read scan packages from the World Studio/RouteSurvey asset repository, scoped to the same account/project.
3. Pass stored mobile evidence sections through normalize3DEvidence with verified IDs before embedding them into ReportBuilder's report JSON.
4. In PDF/MASL, display source-photo thumbnails (resolved with authorized file URLs), scan/model revision, processing method, and disclaimer; do not copy archive-relative 'frames/' URLs directly into HTML or PDF output.
5. Add a distinct field-evidence measurement object with instrument, unit, uncertainty, calibration and reviewer; do not infer clearance from AI models.
6. Regression-test rendering of existing reports without any 3D scans, imported v1.0/v1.1 archives, missing assets, and mismatched obstruction IDs.
7. Run npm test, npm run typecheck, npm run build on a configured T3 environment and verify live survey/report data.

## Scope and blocker
This PR adds a **tested-in-source adapter**, not a completed live database/PDF integration. There is no authenticated end-to-end scan repository/API that guarantees ownership and asset resolution yet. Do not attach untrusted scan URLs into report markup. Complete Mac Mini Sprint 9 and end-to-end reconstruction separately before release.
