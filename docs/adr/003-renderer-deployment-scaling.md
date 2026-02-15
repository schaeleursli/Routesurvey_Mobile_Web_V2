# ADR-003 — PDF Rendering Service Deployment, Scaling, and Isolation

**Status**: Accepted
**Date**: 2026-01-26
**Decision Owners**: Platform Architecture Team
**Related ADRs**: ADR-001 (Architecture), ADR-002 (Schema)

---

## 1. Context

HTML→PDF rendering via Playwright/Chromium is:
*   CPU and memory heavy
*   sensitive to environment drift (fonts, browser versions)
*   prone to long-tail failures (timeouts, layout edge cases, large image sets)
*   a common source of instability if run inside the main API

RouteSurvey needs an enterprise-grade renderer that is:
*   **deterministic** (same input → same output)
*   **isolated** (render failures don’t take down the API)
*   **scalable** (handles concurrent renders reliably)
*   **observable** (debuggable with logs/artifacts)
*   **secure** (no data leakage, no uncontrolled network access)

---

## 2. Decision

We deploy PDF generation as a separate **Rendering Service** with:
*   job queue orchestration
*   containerized deterministic runtime
*   strict resource and security isolation
*   artifact capture for audit/debug
*   clear status model for UX and operations

The core API **must not** run Playwright directly in-process.

---

## 3. Architecture

### Components

1.  **Core API**
    *   Validates `RouteSurveyReportSchema`
    *   Authorizes request
    *   Creates `RenderJob` record
    *   Enqueues job
    *   Serves job status + download links

2.  **Queue**
    *   Provides backpressure and retry semantics
    *   *Recommended*: BullMQ (Redis) for local/on-prem and first enterprise iteration.
    *   (Cloud option later: SQS/RabbitMQ/Kafka.)

3.  **Renderer Service**
    *   Consumes jobs
    *   Composes HTML
    *   Runs Playwright render (two-pass ToC)
    *   Uploads/stores outputs
    *   Updates job state + metrics

4.  **Storage**
    *   PDF outputs (object store or filesystem)
    *   Render artifacts (HTML snapshot, logs, optional screenshots)

---

## 4. Deployment Model

### 4.1 Containerization (Required)
Renderer runs in a pinned Docker image containing:
*   Node version pinned
*   Playwright pinned
*   Chromium pinned (via Playwright)
*   Fonts installed and pinned
*   **No “latest” tags anywhere**

*Rationale*: Eliminates “works on my machine” drift and keeps outputs stable over time.

### 4.2 Runtime Isolation (Required)
Renderer container must run with:
*   no outbound internet during render (default deny)
*   read-only filesystem where possible
*   limited Linux capabilities
*   sandboxing enabled (Chromium sandbox when supported)
*   restricted temp directory size

*Rationale*: Protects client data and reduces exploit surface.

### 4.3 Resource Limits (Required)
Per-render job hard limits:
*   CPU quota
*   memory cap
*   max render duration (timeout)
*   max input size (HTML, images count, appendix size)

*Rationale*: Prevents runaway renders and noisy-neighbor failures.

---

## 5. Scaling Strategy

### 5.1 Horizontal scaling (Primary)
Scale the renderer by increasing worker replicas:
*   each replica runs N concurrent render slots (start with 1–2)
*   queue distributes work
*   API remains stable under load

*Rule*: Prefer more replicas over high concurrency per replica (Chromium is memory-heavy).

### 5.2 Backpressure and Prioritization
Queue must support:
*   priority jobs (e.g., “Issued” report generation)
*   rate limits per tenant/project
*   max queued jobs per tenant to prevent abuse

### 5.3 Multi-tenancy Guardrails (Enterprise)
*   Per-tenant concurrency limits
*   Per-tenant daily render quotas (configurable)
*   Per-tenant max report size constraints

---

## 6. Job Model and State Machine

A `RenderJob` record is authoritative.

**States**
*   `queued`
*   `rendering`
*   `composing` (optional, but useful)
*   `toc_pass1`
*   `toc_resolve`
*   `toc_pass2`
*   `merging_appendices`
*   `uploading`
*   `completed`
*   `failed`
*   `canceled` (optional)

**Failure Categories (Required)**
*   `SCHEMA_INVALID` (should be caught before queue)
*   `ASSET_MISSING` (images/appendix not found)
*   `TIMEOUT`
*   `OUT_OF_MEMORY`
*   `PLAYWRIGHT_CRASH`
*   `TOC_RESOLUTION_FAILED`
*   `MERGE_FAILED`
*   `STORAGE_FAILED`
*   `UNKNOWN`

*Rule*: Failures must be classified, not generic.

---

## 7. Retry Policy

Enterprise-grade retries are selective, not blind.

**Retryable**
*   transient storage failures
*   temporary renderer crash
*   queue transient errors

**Not retryable by default**
*   schema invalid
*   missing assets
*   ToC anchor errors (unless caused by transient parse failure)

**Recommended:**
*   max 2 retries with exponential backoff
*   capture artifacts on final failure

---

## 8. Deterministic Output Guarantees

Renderer MUST store with each PDF:
*   `schema_version`
*   `renderer_version` (Docker image tag)
*   `playwright_version`
*   `chromium_revision`
*   `css_version`
*   `fonts_version`
*   `content_hash = SHA256(schema + css + versions)`

*Outcome*: Reproducible builds and defensible artifacts.

---

## 9. Observability and Debugging

**Logs (Required)**
*   structured JSON logs per job
*   include: `job_id`, `tenant_id`, `state`, `timings`, `memory peaks` (if possible)
*   log ToC anchor counts and missing anchors

**Metrics (Required)**
*   render duration p50/p95
*   success/failure rate by category
*   queue depth and wait time
*   memory usage / crash rate

**Artifacts (Recommended)**
Store on failure:
*   composed HTML snapshot
*   resolved ToC map
*   CSS bundle used
*   one screenshot per major section (optional)
*   Playwright trace (optional for deep debugging)

---

## 10. Storage Strategy

**Outputs**
*   PDFs stored in object storage (preferred) or filesystem for local-first deployments
*   stored by: `tenant`/`project`/`report_id`/`report_version`

**Retention**
*   outputs retained per contract (enterprise configurable)
*   failed artifacts retention shorter (e.g., 14–30 days)

---

## 11. Security Considerations

*   Disable remote resource loading; all assets must be local or pre-signed and fetched by backend, not by Chromium at render time
*   Strip or control EXIF and sensitive metadata
*   Watermark drafts or non-issued documents by policy
*   Ensure signed URLs for downloads and short expiry

---

## 12. Alternatives Considered

**Render in Core API**
*   *Rejected*: instability risk, resource contention, harder scaling, harder observability.

**Serverless rendering (Lambda-style)**
*   *Deferred*: cold starts and Chromium packaging complexity, limited execution time, harder deterministic font/version management. (Consider later if needed.)

---

## 13. Consequences

**Positive**
*   API stability
*   deterministic output
*   scalable, queue-driven processing
*   enterprise observability and audit trail

**Trade-offs**
*   additional operational component (queue + renderer)
*   more infrastructure configuration required

---

## 14. Follow-ups
*   ADR-004 — Report Approval, Locking, and Digital Signatures
*   ADR-005 — Report Template Versioning and Multi-tenant Branding (optional but likely)

---

## Decision Summary

We isolate PDF rendering into a dedicated, containerized, queued service to achieve determinism, security, scalability, and auditability—the minimum bar for enterprise transport engineering reporting.
