# ADR-004 — Report Approval, Locking, and Digital Signatures

**Status**: Accepted
**Date**: 2026-01-26
**Decision Owners**: Platform Architecture Team
**Related ADRs**: ADR-001, ADR-002, ADR-003

---

## 1. Context

RouteSurvey reports are used for decisions with contractual and legal impact. Enterprise customers require:
*   controlled review/approval before issuance
*   immutable “issued” artifacts
*   traceable audit history (who changed what, when)
*   optional digital signatures for authenticity and tamper evidence

A PDF export button without governance is not acceptable.

---

## 2. Decision

We implement a report lifecycle workflow with:
*   explicit states and transitions
*   role-based permissions
*   immutable “Issued” artifacts
*   versioning on every change after issuance
*   optional digital signatures (phased rollout)

---

## 3. Lifecycle State Machine

**States**
*   `draft`
*   `reviewed`
*   `approved`
*   `issued` (locked)

**Allowed transitions**
*   `draft` → `reviewed`
*   `reviewed` → `approved`
*   `approved` → `issued`
*   `reviewed` → `draft` (rework)
*   `approved` → `draft` (rework)

**Hard rules**
*   `issued` is immutable
*   any change requested after `issued` creates a new version:
    *   `issued(v1.0)` → edit → `draft(v1.1)` → … → `issued(v1.1)`

---

## 4. Roles & Permissions

**Minimum roles:**
*   `author` (create/edit in draft)
*   `reviewer` (mark reviewed, request changes)
*   `approver` (approve)
*   `issuer` (issue/lock; typically approver or admin)
*   `admin` (override/recovery; audited)

**Permission rules:**
*   only `author`/`admin` can edit content in `draft`
*   only `reviewer`/`admin` can set `reviewed`
*   only `approver`/`admin` can set `approved`
*   only `issuer`/`admin` can set `issued`
*   downgrade transitions require a mandatory `change_note`

---

## 5. Audit Trail Requirements

Every lifecycle transition and content update MUST write an append-only audit record containing:
*   `report_id`, `report_version`
*   `actor_id`, `actor_role`
*   `timestamp`
*   `action` (edit, state_change, regenerate_pdf)
*   `diff_summary` (human-readable)
*   `schema_hash` (from ADR-003 determinism)
*   `pdf_hash` (final output checksum when generated)

Audit records must be immutable.

---

## 6. Issuance and Locking

When a report is set to `issued`:
*   the current schema payload is frozen and stored as an immutable snapshot
*   the generated PDF is stored as the authoritative issued artifact
*   the system stores:
    *   `schema version`
    *   `renderer version`
    *   `content hash`
    *   `pdf checksum`
    *   `issuance metadata` (issuer, time)

---

## 7. Digital Signatures (Phased)

**Phase 1 (Required baseline)**
*   Store SHA-256 checksum and provenance metadata for issued PDFs
*   Provide “Verify” endpoint that recomputes checksum from stored PDF

**Phase 2 (Enterprise option)**
*   Apply cryptographic digital signature on issued PDFs
*   Store certificate chain and signature metadata
*   Support signature verification downstream

**Notes:**
*   The exact signature standard (PAdES/LTV) is a later decision if required by regulated customers; do not block initial enterprise readiness.

---

## 8. Consequences

**Positive**
*   enterprise governance and defensibility
*   strong audit story for claims/disputes
*   controlled “final” artifacts

**Trade-offs**
*   more UX complexity (states, roles, approvals)
*   needs careful permissions and audit storage

---

## 9. Follow-ups
*   UI specification for lifecycle controls and status visibility
*   API endpoints for state transitions and audit retrieval
*   optional ADR for PAdES/LTV if demanded by key customers
