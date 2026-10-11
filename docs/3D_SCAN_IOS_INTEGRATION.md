# RouteSurvey — Native 3D Capture Integration (Sprint 1)

## Repository finding
This repository is the Vue/Vite RouteSurvey console, not the native Flutter iOS application. This PR introduces the platform-neutral obstruction scan metadata contract and a reusable Vue panel. It deliberately does not claim to have installed an iPhone camera plugin.

## RouteSurvey experience
Obstruction record -> Add 3D Scan -> Flutter native platform channel -> Swift ARKit/AVFoundation capture -> locally stored images, camera intrinsics and poses -> lightweight capture preview -> optional opt-in upload to World Studio GPU service -> GLB/3DGS -> linked obstruction record -> inspection and PDF report.

## Field contract
Use schemaVersion=1.0 and stable projectId, surveyId, obstructionId, scanId. A scan includes images, optional WGS84 anchor, processing status, optional 3D asset reference, reconstructionMethod, geometryScale and measurementStatus.

The **only** acceptable clearance category for engineering use is measurementStatus=field_verified with a documented measurement method, instruments, calibration and evidence. AI single-image geometry is unmeasured/inferred and MUST NOT be passed into permit or swept-path safety logic.

## How to integrate Vue
Import Scan3DPanel.vue into the existing obstruction detail workflow after confirming the correct active UI. Bind :record to an actual 3D scan record and listen for @capture and @open-asset. Do not emit synthetic scans or launch an unavailable camera action.

## Native iOS implementation next
Create a Flutter MethodChannel named com.routesurvey.capture3d and Swift module using ARKit/AVFoundation on supported devices; support guided multi-view capture without LiDAR, optionally use LiDAR where available. Capture JPEG frames, intrinsics, timestamps, camera pose, tracking state and location accuracy. Store offline before optional upload. Do not rely on a single photo for reliable hidden geometry.

## Back-end security next
Signed uploads, per-project access control, file retention/deletion, consent for people in images, job status, asset provenance, and explicit reconstruction precision flags. GLB is the primary editable mesh asset; SPZ/Gaussian files are a separate renderer path.

## Acceptance
Run Vitest contract tests; verify UI binding to a real obstruction ID; test iPhone on-device capture; test offline save/resume and optional upload; verify output model and report annotations; conduct physical measurement against known bridge clearance. Until then, this is a starter integration layer, not an operational 3D iOS scanner.
