# PDF Generation System Architecture

> **Review Status**: VERIFIED
> **Last Verification**: 2026-01-26
> **Scope**: Backend PDF Generation Service & Frontend Viewer

This document defines the architecture, operational flows, and failure modes of the PDF generation subsystem. It serves as the canonical reference for implementation and auditing.

## 1. Verified Architecture Overview

The PDF system operates as a **Headless Rendering Pipeline** with a strict separation of concerns between Data, Layout, and Rendering.

```mermaid
graph TD
    subgraph "Client Layer (Browser)"
        FE[Vue Frontend (PdfViewer.vue)]
        Viewer[PDF.js Viewer]
    end

    subgraph "API Layer (Express)"
        API[Express Service (index.js)]
        Composer[HTML Composer]
    end

    subgraph "Rendering Core (Playwright)"
        Browser[Chromium Instance]
        Context[Browser Context (Isolated)]
        Page[Render Page]
    end

    subgraph "Post-Processing"
        Parser[PDF Parse (ToC Extraction)]
        Merger[PDF Lib (Appendix Merge)]
    end

    FE -- "POST /api/reports/:id/render-pdf (JSON)" --> API
    API -- "Report Data" --> Composer
    Composer -- "HTML String" --> API
    API -- "HTML + Options" --> Browser
    Browser --> Page
    Page -- "PDF Buffer (Pass 1)" --> Parser
    Parser -- "Page Numbers" --> Page
    Page -- "PDF Buffer (Pass 2)" --> Merger
    Merger -- "Final PDF" --> FE
```

### Component Responsibilities

| Component | Responsibility | MUST NOT |
|-----------|----------------|----------|
| **Frontend** | Collects data, initiates request, displays result. | Perform layout calculations or HTML composition. |
| **API Service** | Input validation, orchestration of render steps. | Store persistent state or business logic. |
| **Composer** | Transforms JSON data into printable HTML/CSS. | Execute JavaScript or fetch external network resources. |
| **Renderer** | Deterministic HTML-to-PDF conversion via Playwright. | Modify content structure except for ToC injection. |
| **Merger** | Appends pre-generated PDFs (Appendices). | Alter the content of the main report pages. |

---

## 2. Canonical PDF Generation Flow

The generation process is a synchronous, multi-pass pipeline designed to support dynamic Tables of Contents (ToC) and page numbering.

### 2.1 Entry Point
**Endpoint**: `POST /api/reports/:id/render-pdf`
**Input**: JSON Payload containing `metadata`, `sections`, `snapshots`, `appendices`.

### 2.2 Sequence of Operations

1.  **Composition (HTML Generation)**
    *   System loads `pdf.css`.
    *   Iterates through `sections`.
    *   Injects `metadata` (Title, version).
    *   **Output**: A single HTML string.

2.  **Render Pass 1 (Pagination Discovery)**
    *   *Condition*: Triggered if HTML contains `@toc` or `<!-- @toc -->`.
    *   Injects invisible `SECTION_MARKER` spans into the HTML.
    *   Playwright renders the full document to a temporary Buffer.
    *   `pdf-parse` reads the Buffer, mapping `SECTION_MARKER_ID` $\rightarrow$ `Page Number`.

3.  **ToC Injection**
    *   Generates HTML table info from the Page Number Map.
    *   Replaces `@toc` placeholder in the *original* HTML with the generated table.

4.  **Render Pass 2 (Final Output)**
    *   Playwright renders the modified HTML (with ToC).
    *   Injects CSS Watermarks (if requested).
    *   **Output**: Main Report PDF Buffer.

5.  **Post-Processing (Appendix Merge)**
    *   System loads Main Report PDF.
    *   Iterates through `appendices` (Base64 encoded external PDFs).
    *   Appends appendix pages to the end of the Main Report.
    *   **Result**: Final Consolidated PDF.

---

## 3. PDF Generation States & Failure Modes

The system is currently designed as a comprehensive synchronous operation.

| State | Description | Surface to User |
|-------|-------------|-----------------|
| **Idle** | No active requests. | - |
| **Rendering** | Playwright is processing the page. | Loading Spinner ("Generating Report...") |
| **Completed** | PDF Buffer returned successfully. | PDF Viewer opens / Download starts. |
| **Failed** | Process terminated before completion. | Error Toast / retry prompt. |

### Failure Categories

1.  **Layout Failure (Malformed HTML)**
    *   *Cause*: Invalid HTML structure or CSS syntax in `composer.js`.
    *   *Result*: PDF generates but looks broken.
    *   *Detection*: Visual QC only.

2.  **Render Timeout**
    *   *Cause*: Complexity > 30s execution time (default Playwright timeout).
    *   *Result*: HTTP 500.

3.  **Resource Exhaustion**
    *   *Cause*: High concurrency leading to OOM (Out of Memory) in Headless Chromium.
    *   *Result*: Process crash / HTTP 502/500.

4.  **Appendix Merge Failure**
    *   *Cause*: Corrupt Base64 data in `appendices`.
    *   *Result*: Main PDF returned *without* the failed appendix (Fail-open).
    *   *Log*: "Failed to merge appendix..."

---

## 4. Enterprise Controls & Standards

### 4.1 Dependency Pinning (RISK)
*   **Current**: `playwright: ^1.40.0`
*   **Requirement**: Must be pinned to an exact version (e.g., `1.40.1`) to guarantee distinct Chromium binary versions across environments.
*   **Action**: Update `package.json` to remove carets (`^`).

### 4.2 Renderer Isolation
*   **Requirement**: The rendering service SHOULD run in a dedicated container or sandbox to prevent:
    1.  Memory leaks affecting the main API.
    2.  SSRF (Server-Side Request Forgery) attacks via the headless browser.
*   **Implementation**: Use `--no-sandbox` strictly governed by Docker security profiles (e.g., `seccomp`).

### 4.3 Deterministic Output
*   **Fonts**: System relies on host fonts.
    *   *Control*: Docker image must include explicit font packages (e.g., `fonts-inter`, `fonts-noto`).
*   **Timezone**: Browser context timezones should be forced to `UTC` to prevent date mismatches.

### 4.4 Access Control (GAP)
*   **Current Verification**: The `server/index.js` uses `cors()` but does **not** validate the `Authorization` header.
*   **Critique**: The PDF service implicitly trusts the network caller.
*   **Requirement**: Implement JWT validation middleware on the `/api/reports` endpoint.

---

## 5. Audit & Gap Analysis

### Identified Gaps
1.  **Security**: No Auth middleware on the PDF Generation Microservice.
2.  **Schema**: No validation (Zod/Joi) of the input JSON. Malformed inputs can crash the composer.
3.  **Observability**: No request ID tracking or structured logging.
4.  **Stability**: Single `browser` instance pattern (`let browserInstance = null`) may degrade over time. Recommended to restart browser context or browser instance periodically.

### Non-Goals
*   **Real-time Collaboration**: The PDF view is a snapshot, not a live Google Doc.
*   **Client-side Rendering**: We do not use `jspdf` to avoid browser inconsistency. All rendering is server-side.
