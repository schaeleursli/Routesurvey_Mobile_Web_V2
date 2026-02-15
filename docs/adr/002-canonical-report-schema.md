# ADR-002 — Canonical RouteSurvey Report Schema

**Status**: Accepted
**Date**: 2026-01-26
**Decision Owners**: Platform Architecture Team
**Related ADRs**: ADR-001 (PDF Generation & Viewing Architecture)

---

## 1. Context

RouteSurvey reports are long-lived engineering artifacts used for:
*   Transport feasibility decisions
*   EPC tendering
*   Claims, insurance, and dispute resolution
*   Regulatory and permit processes

Free-form or UI-driven document creation is not acceptable for these use cases.

A canonical, schema-driven report model is required to ensure:
*   Deterministic PDF generation
*   Auditability and traceability
*   Long-term reproducibility
*   Controlled evolution of report content

---

## 2. Decision

All PDF reports MUST be generated from a versioned canonical schema, named:

`RouteSurveyReportSchema`

PDF generation is strictly prohibited unless the report payload validates against an accepted schema version.

---

## 3. Schema Design Principles

The schema MUST be:
1.  **Declarative**
    *   Describes *what* is in the report, not *how* it is rendered
2.  **Versioned**
    *   Breaking changes require a new major version
3.  **Complete**
    *   All data required for rendering must be present
4.  **Explicit**
    *   No implicit defaults at render time
5.  **Forward-compatible**
    *   Unknown fields ignored but preserved

---

## 4. Schema Versioning Strategy

Schema versions follow:

`routesurvey.report.vMAJOR.MINOR`

**Rules:**
*   **MAJOR**: breaking structural changes
*   **MINOR**: additive, backward-compatible changes

**Example:**
*   `routesurvey.report.v1.0`
*   `routesurvey.report.v1.1` (adds optional section)
*   `routesurvey.report.v2.0` (breaking change)

The schema version used **MUST** be embedded in the PDF metadata.

---

## 5. High-Level Schema Structure

```json
{
  "schema_version": "routesurvey.report.v1.0",
  "meta": {},
  "lifecycle": {},
  "units": {},
  "sections": {},
  "route": {},
  "observations": [],
  "obstructions": [],
  "engineering": {},
  "risk": {},
  "appendices": []
}
```

---

## 6. Mandatory Core Objects

### 6.1 Meta

```json
"meta": {
  "project_name": "",
  "client_name": "",
  "route_name": "",
  "country": "",
  "report_version": "1.0",
  "generated_at": "ISO-8601",
  "author": "",
  "organization": ""
}
```

**Purpose:**
*   Identification
*   Legal attribution
*   Audit trace

---

### 6.2 Lifecycle

```json
"lifecycle": {
  "state": "draft | reviewed | approved | issued",
  "approved_by": null,
  "approved_at": null,
  "change_note": ""
}
```

**Rules:**
*   `issued` reports are immutable
*   Any modification creates a new report version

---

### 6.3 Units

```json
"units": {
  "system": "metric | imperial",
  "length": "m | ft",
  "weight": "kg | lb",
  "clearance": "m | ft-in"
}
```

Renderer **MUST NOT** infer units.

---

## 7. Sections Control (Critical)

```json
"sections": {
  "executive_summary": true,
  "route_overview": true,
  "methodology": true,
  "observations": true,
  "obstructions": true,
  "engineering_constraints": false,
  "risk_matrix": true,
  "conclusion": true,
  "appendices": true
}
```

**Rules:**
*   Renderer respects order defined by schema
*   Hidden sections **MUST NOT** appear in ToC

---

## 8. Observations Model (Non-Blocking)

```json
{
  "id": "OBS-023",
  "chainage": 124.55,
  "type": "observation",
  "category": "road_condition",
  "description": "",
  "photos": [],
  "notes": ""
}
```

Observations are informational and do not block feasibility.

---

## 9. Obstructions Model (Blocking / Critical)

```json
{
  "id": "BR-012",
  "chainage": 124.55,
  "type": "bridge",
  "classification": "critical",
  "clearance": {
    "height": 4.85,
    "width": 6.2
  },
  "risk_level": "high",
  "photos": [],
  "mitigation": ""
}
```

**Rules:**
*   Each obstruction **MUST** have a stable ID
*   Clearance fields are mandatory for blocking types
*   Used directly by ToC anchors

---

## 10. Engineering Constraints (Optional)

```json
"engineering": {
  "max_gradient_percent": 8.5,
  "min_turning_radius_m": 45,
  "assumed_vehicle": "12 axle hydraulic trailer"
}
```

Renderer treats this as data only, no interpretation.

---

## 11. Appendices

```json
{
  "type": "external_pdf",
  "title": "Bridge Drawings",
  "source": "upload",
  "checksum": "sha256"
}
```

Appendices are appended verbatim and excluded from ToC numbering unless explicitly enabled.

---

## 12. Validation Rules (Hard)

PDF generation **MUST** fail if:
*   Required sections are missing
*   Obstruction IDs are duplicated
*   Units are undefined
*   Lifecycle state is invalid
*   Schema version is unknown

---

## 13. Consequences

**Positive**
*   Deterministic rendering
*   Regeneration years later
*   Clean separation of data and layout
*   Legal defensibility

**Trade-offs**
*   Higher upfront modeling effort
*   Schema migrations required over time

---

## 14. Follow-ups

*   ADR-003 — Rendering Service Deployment & Scaling
*   ADR-004 — Report Approval, Locking & Digital Signatures

---

## Decision Summary

**The schema is the contract.**
**The PDF is only a representation.**

This decision ensures RouteSurvey reports remain engineering artifacts, not editable documents.
