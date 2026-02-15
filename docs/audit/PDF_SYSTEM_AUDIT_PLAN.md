# PDF System Audit & Implementation Plan

**Date**: 2026-01-26
**Scope**: End-to-End PDF Generation System
**Reference Types**: ADR-001, ADR-002, ADR-003, ADR-004, ADR-005

---

## 1. Current System Inventory

### Frontend Entry Points
| Component | Path | Responsibility |
|-----------|------|----------------|
| **Report Builder** | `src/views/reports/ReportBuilder.vue` | Main UI for composing reports. Manages sections, text overrides, and structure. |
| **PDF Controller** | `src/controllers/reporting/reporting_controller.js` | Client-side controller that bridges Vue to the Backend APIs. |
| **Data Model** | `src/types/report.ts` | TypeScript interfaces defining `ReportModel` and `ReportSection`. Acts as the "soft schema". |

### Backend Service (Node.js)
| Module | Path | Responsibility |
|--------|------|----------------|
| **API Entry** | `server/index.js` | Express app. Exposes `POST /api/reports/:id/render-pdf`. Contains no authz or schema validation. |
| **Renderer** | `server/src/renderer.js` | Playwright wrapper. Handles browser interaction, 2-pass ToC, and appendix merging. |
| **Composer** | `server/src/composer.js` | Generates HTML string from JSON data. Hardcoded CSS injection. |
| **Config** | `server/package.json` | Dependencies: `express`, `playwright`, `pdf-lib`, `pdf-parse`. Missing queue/validation libs. |

### Storage & Queue
*   **Queue**: **Missing**. Request processing is synchronous and blocking.
*   **Storage**: **Ephemeral**. The PDF is generated into a memory buffer and streamed directly to the response (`res.send(pdfBuffer)`). No persistence.

---

## 2. ADR Compliance Gap Report

| ADR | Requirement | Implemented? | Evidence | Risk | Fix Approach |
|-----|-------------|--------------|----------|------|--------------|
| **002** | **Schema Contract** | **No** | `server/index.js`: accepts `req.body` blindly. | **High**. Malformed inputs crash renderer. No auditability. | Implement Zod schema validation middleware. Reject invalid payloads. |
| **002** | **Explicit Units** | **Partial** | Frontend assumes metric/imperial context, but payload doesn't enforce it explicitly. | **Medium**. Ambiguous engineering data. | Add `units` object to schema root. |
| **003** | **Isolation** | **No** | `server/index.js`: `import { generatePDF } ...` (in-process). | **Critical**. Browser crash takes down API. | Isolate via Queue (BullMQ) + separate Worker process. |
| **003** | **Job Queue** | **No** | No queue library in `server/package.json`. | **High**. No backpressure, no concurrency control. | Add `bullmq` & Redis. |
| **003** | **Pinned Versions** | **No** | `package.json`: `"playwright": "^1.40.0"` (caret used). | **Medium**. Non-deterministic builds. | Pin exact version (remove caret). |
| **004** | **Lifecycle States** | **Partial** | `ReportBuilder.vue` has `status` badge, but backend has no state machine. | **High**. Cannot prevent editing issued reports. | Implement `LifecycleController` on backend. |
| **004** | **Immutability** | **No** | No backend storage for "Issued" PDFs. | **Critical**. "Issued" report can be regenerated differently later. | Store PDF + JSON snapshot to disk/S3 on "Issue". |
| **005** | **Templating** | **Partial** | `ReportBuilder` has template selector, but backend likely has 1 CSS file. | **Low**. Branding is weak. | Implement basic Template Registry (folder-based). |
| **Sec** | **AuthZ** | **No** | `server/index.js` has `cors` but no JWT verification. | **Critical**. API is open to network. | Port `authMiddleware` to PDF service. |

---

## 3. UI Findings

### ReportBuilder (`src/views/reports/ReportBuilder.vue`)
*   **Status**: Good visual representation of `reportSections`.
*   **Draft/Issued**: UI uses a status badge, but "Generate" button is always active (should be disabled if critical fields missing).
*   **Preview**: Opens a modal with HTML preview.
*   **Missing**: No clear "Lock/Issue" action. The "status" seems merely informational from the route data.

### PDFViewer
*   **Status**: Not integrated into `ReportBuilder` flow directly (seems to be a separate view).
*   **Feature Set**: Basic PDF.js implementation exists.

---

## 4. Implementation Plan (Sprint Schedule)

### Sprint 0: Stability & Security (Immediate)
**Goal**: Stop the bleeding. Secure the API and prevent resource exhaustion.
*   [ ] **Security**: Add `authMiddleware` (JWT verification) to `server/index.js`.
*   [ ] **Security**: Remove `^` from `playwright` version in `package.json` (Pinning).
*   [ ] **Start**: Add `zod` and `bullmq` dependencies.
*   [ ] **Config**: Set strict timeout (30s) and body size limit (50mb) in Express.

### Sprint 1: Schema & Lifecycle (Core Logic)
**Goal**: Enforce ADR-002 (Schema) and ADR-004 (Lifecycle).
*   [ ] **Schema**: Create `server/src/schema/reportSchema.js` (Zod definition).
*   [ ] **Validation**: Add middleware to validate `req.body` against Zod schema.
*   [ ] **Lifecycle**: Create simple in-memory or file-based "Job Store" that tracks `jobId` -> `status`.
*   [ ] **Endpoint**: Update `POST /render-pdf` to return `jobId` immediately (async pattern preparation).

### Sprint 2: Async Queue & Isolation
**Goal**: Enforce ADR-003 (Isolation).
*   [ ] **Queue**: Setup BullMQ in `server/src/queue/pdfQueue.js`.
*   [ ] **Worker**: Move `generatePDF` call into a separate worker file `server/src/worker.js`.
*   [ ] **API**: Change `POST /render-pdf` to enqueue a job and return 202 Accepted.
*   [ ] **Polling**: Add `GET /jobs/:id` endpoint for frontend polling.
*   [ ] **UI**: Update `reporting_controller.js` to handle async polling loop.

### Sprint 3: Immutability & Persistence
**Goal**: Enforce ADR-004 (Locking) and Storage.
*   [ ] **Storage**: Implement `FileStore` (local `storage/` dir for now) to save `report-{id}-v{ver}.pdf`.
*   [ ] **Locking**: When job is "Issued", save the input JSON alongside the PDF (`.json` + `.pdf`).
*   [ ] **Hashing**: Calculate `SHA256` of the PDF and store it in metadata.

### Sprint 4: Templating Basics
**Goal**: ADR-005 compliance.
*   [ ] **Registry**: Create `server/templates/default/` with `styles.css` and `header.html`.
*   [ ] **Composer**: Update `composer.js` to load CSS/HTML from the selected template ID.

---

## 5. Recommended CI Checks

1.  **Golden PDF Test**:
    *   Create a `tests/fixtures/golden-report.json`.
    *   Run renderer in CI.
    *   Compare output PDF hash against known good hash.
2.  **Schema Linter**:
    *   Ensure `src/types/report.ts` stays in sync with `server/src/schema/reportSchema.js` (Manual or generated).
3.  **Vulnerability Scan**:
    *   Run `npm audit` specifically on the `server/` directory.

---

## 6. Execution Instructions

**Next Step**: Wait for approval of this plan. Upon approval, I will begin with Sprint 0 (Security & Config).
