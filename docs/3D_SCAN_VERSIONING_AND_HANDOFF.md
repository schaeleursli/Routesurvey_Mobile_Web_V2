# RouteSurvey 3D Scan Pilot — Portability, Versioning and Handoff

## Product boundary
This Vue pilot demonstrates the scan record contract and console panel. It does **not** contain the Flutter iOS native capture implementation. Develop the iPhone plugin as a separate portable component, later integrated with the active Flutter repo; avoid modifying World Studio internals from RouteSurvey.

## Portable package contract v1.1
A portable scan archive must be self-contained:
- manifest.json (schemaVersion, IDs, capture source and device, CRS/local frame, quality status, migration history)
- frames/ original photographs with timestamps, camera intrinsics and poses where available
- assets/ GLB 2.0 polygon mesh; optional Gaussian SPZ or Gaussian PLY; textures/buffers if glTF is not GLB
- evidence/ field measurements, instrument/method, calibration reference, uncertainty and reviewer
- checksums.json using SHA-256 for every included file

Prefer GLB for general mesh interchange and SPZ for Gaussian splats, with original frame images retained. Native capture matrices remain in ARKit-local coordinates until independently aligned. GPS anchors are metadata only unless calibrated. Asset URIs in portable manifests are relative to the archive root. Never persist signed temporary storage URLs as primary asset identity.

## Data migration
src/features/scan3d/scanMigration.js provides explicit v1.0 → v1.1 migration, copies original records, creates an assets array while preserving the legacy asset link and rejects unknown future major schemas. Every subsequent schema update needs a deterministic migration and regression fixture. Never discard original images, original 3D assets or verified measurement evidence during migration.

## Version-independent identifiers
Keep stable scanId, projectId, surveyId, obstructionId across application versions; use immutable asset IDs and independent assetRevision and schemaVersion fields. Reprocessing generates a new asset revision linked to the same scan. A new mobile or backend release must be able to import existing archives without changing survey identity.

## Architecture
Flutter UI → MethodChannel com.routesurvey.capture3d → native Swift ARKit/AVFoundation → locally persisted capture archive → optional World Studio service → GLB/SPZ derivative → survey record/reports.

Implement capture as a package/plugin with isolated public interfaces (startCapture, stopCapture, exportPackage, importPackage, getStatus). No platform-specific paths should appear in the JSON contract.

## Safety, storage and tests
An inferred 3D surface must remain unmeasured/estimated; only separately documented field evidence can enable field_verified. Do not use inferred clearance in route feasibility, engineering checks or permits.

Test migration on older archived pilot records, round-trip ZIP import/export, original image checksum preservation, interrupted offline sessions, real-device permission/thermal limits, and independent clearance measurement. The current PR only commits the versioned JS migration and test; ZIP import/export, native iPhone capture, cryptographic verification and mobile UI integration are future tasks.

## T3 Code handoff
1. Merge pilot PR once Vue tests pass.
2. Confirm the active Flutter repository and embed the Swift capture plugin there.
3. Implement archive writer/reader to v1.1 with schema tests shared between Flutter and web.
4. Establish binary asset viewer and offline/online processing state machine.
5. Run regression compatibility tests against archived v1.0 records, and produce an upgrade/migration report for future app releases.
