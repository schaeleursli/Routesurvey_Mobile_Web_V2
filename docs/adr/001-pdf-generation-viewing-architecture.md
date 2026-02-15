# ADR-001 — PDF Generation & Viewing Architecture

**Status**: Accepted
**Date**: 2026-01-26
**Decision Owners**: Platform Architecture Team
**Systems**: RouteSurvey Web Console, Reporting Service

---

## 1. Context

RouteSurvey requires generation of professional, defensible, and reproducible PDF reports for transport engineering and route survey use cases (mining, EPC, heavy haul logistics).

**Key constraints:**
*   Reports must be auditable and regenerable years later
*   Layout fidelity is critical (tables, maps, photos, ToC)
*   Frontend users require a rich preview and viewing experience
*   PDF generation is compute-intensive and must not block UI
*   Future requirements include approvals, versioning, and digital signatures

---

## 2. Decision

We adopt a **hybrid, server-side PDF generation architecture** with a schema-first contract, using **HTML → PDF rendering via Playwright**, and **PDF.js** for frontend viewing.

**High-level decision:**
*   **Frontend**: controls report structure, content selection, and preview
*   **Backend**: validates report schema and orchestrates rendering
*   **Renderer service**: deterministically converts HTML to PDF
*   **Viewer**: client-side PDF.js for navigation and inspection

---

## 3. Architecture Overview

### Components

**Frontend (Vue)**
*   Report builder UI
*   Section enable/disable and ordering
*   Preview (HTML, non-authoritative)
*   PDF viewing (PDF.js)

*Explicitly NOT responsible for:*
*   Layout logic
*   Pagination
*   PDF rendering
*   Business rule enforcement

**Backend API**
*   Validates `RouteSurveyReportSchema`
*   Enforces permissions and lifecycle state
*   Triggers PDF generation
*   Stores versions and metadata

**PDF Rendering Service (Node.js)**
*   HTML composition (composer)
*   CSS injection (locked, versioned)
*   PDF rendering (Playwright / Chromium)
*   Two-pass Table of Contents resolution
*   Appendix merging (existing PDFs)

*This service is isolated, stateless, and deterministic.*

---

## 4. Canonical PDF Generation Flow

1.  **User requests PDF generation from frontend**
2.  **Backend:**
    *   Validates schema
    *   Verifies permissions and report state
    *   Enqueues render job
3.  **Renderer:**
    *   Composes HTML from schema
    *   Injects versioned CSS and fonts
    *   **Pass 1**: render draft PDF with invisible anchors
    *   Parse anchor → page mapping
    *   **Pass 2**: regenerate HTML with resolved ToC
    *   Render final PDF
4.  **Backend:**
    *   Stores PDF
    *   Records hash, renderer version, schema version
    *   Updates report status

---

## 5. Two-Pass Table of Contents (Formalized)

**Pass 1 — Anchor Discovery**
*   Each ToC entry inserts a deterministic anchor
*   PDF is rendered with anchors hidden

**Analysis**
*   PDF is parsed
*   Anchor page numbers are resolved
*   Missing or duplicate anchors are logged

**Pass 2 — Final Render**
*   ToC page numbers injected
*   Final PDF rendered
*   If resolution fails → PDF marked DRAFT

---

## 6. Determinism & Reproducibility

The system must guarantee identical output for identical inputs.

**Measures:**
*   **Pinned versions:**
    *   Node
    *   Playwright
    *   Chromium
    *   Fonts
*   **Fonts embedded in PDF**
*   **Network access disabled during rendering**
*   **Content hash stored:**
    `SHA256(report_schema + css + renderer_version)`

---

## 7. PDF Viewing Decision

**Chosen:**
*   PDF.js (via Vue wrapper)

**Reasons:**
*   Industry standard
*   No server dependency
*   Supports thumbnails, outlines, zoom, print
*   No layout interpretation risk

---

## 8. Security & Access Control

*   PDF generation is server-side only
*   Role-based access required
*   Watermarking supported for classified drafts
*   Optional digital signing (future ADR)

---

## 9. Lifecycle & Governance

Each report follows a defined lifecycle:
*   **Draft**
*   **Reviewed**
*   **Approved**
*   **Issued** (locked)

Changes require:
*   New version
*   Change description
*   Approver identity

---

## 10. Alternatives Considered

**Frontend-only PDF generation**
*   *Rejected*: Non-deterministic, no auditability, browser-dependent rendering.

**LaTeX-based rendering**
*   *Rejected*: Poor image/map handling, high authoring friction, weak CSS/layout flexibility.

**Word / DOCX export**
*   *Rejected*: No layout guarantees, manual edits break traceability.

---

## 11. Consequences

**Positive**
*   Enterprise-grade reproducibility
*   Clear separation of concerns
*   Scalable rendering
*   Audit-safe outputs

**Trade-offs**
*   Higher implementation complexity
*   Dedicated rendering service required
*   Longer initial setup

---

## 12. Open Items / Follow-ups

*   ADR-002: Report Schema Definition
*   ADR-003: Rendering Service Deployment Model
*   ADR-004: Digital Signatures & Long-Term Validation (LTV)

---

## 13. Decision Summary

This architecture ensures that PDFs are not documents, but verifiable engineering artifacts that can withstand audits, claims, and long-term operational use.
