# ADR-005 — Report Template Versioning and Multi-tenant Branding

**Status**: Accepted
**Date**: 2026-01-26
**Decision Owners**: Platform Architecture Team
**Related ADRs**: ADR-001, ADR-002, ADR-003, ADR-004

---

## 1. Context

Enterprise customers require:
*   consistent corporate branding (logos, colors, legal footers)
*   client-specific cover pages and disclaimers
*   stable templates that do not change unexpectedly
*   ability to reproduce historical PDFs exactly as issued

Templates are part of the deterministic render contract.

---

## 2. Decision

We introduce a **Template System** with:
*   versioned templates
*   per-tenant branding overrides
*   template selection per report
*   template immutability for issued reports
*   strict compatibility rules with schema versions

---

## 3. Template Model

A template is an immutable bundle:
*   HTML layout components
*   CSS bundle
*   font pack
*   optional images (logo, watermark)
*   template metadata

**Template identifiers:**
*   `template_id` (e.g., `routesurvey.default`)
*   `template_version` (semantic versioning)

**Example:**
*   `routesurvey.default@1.2.0`
*   `tenant.acme.engineering@2.0.0`

---

## 4. Template Versioning Rules
*   **MAJOR**: layout-breaking changes (pagination, ToC structure, table styles)
*   **MINOR**: additive changes (new optional section styles)
*   **PATCH**: bug fixes without layout drift guarantees (still requires regression tests)

*Hard rule*: Issued PDFs store the exact template ID+version used.

---

## 5. Tenant Branding Overrides

Branding is a controlled subset:
*   logo(s)
*   company address block
*   brand color tokens (limited set)
*   legal footer/disclaimer text
*   watermark policies

Brand overrides **MUST NOT** allow arbitrary CSS injection by tenants (security and determinism risk).

---

## 6. Template Selection

Template selection inputs:
*   tenant default template
*   per-project template override
*   per-report override (only in draft)

Once issued, template selection is frozen.

---

## 7. Compatibility With Schema

Templates declare supported schema versions:
*   `supports_schema: ["routesurvey.report.v1.*"]`

Renderer must refuse incompatible combinations (fail fast).

---

## 8. Testing Requirements

Every template version MUST pass:
*   golden PDF regression suite
*   ToC correctness tests
*   pagination stress tests (large image sets, long tables)
*   multi-language layout sanity (EN/ES/PT/DE/AR if supported)

No template version can ship without passing the suite.

---

## 9. Consequences

**Positive**
*   enterprise branding without losing determinism
*   stable reproducibility over time
*   controlled rollout of layout changes

**Trade-offs**
*   maintaining template versions requires discipline
*   needs automated regression testing infrastructure

---

## 10. Follow-ups
*   Template registry/storage design
*   Admin UI for branding assets upload and validation
*   Golden PDF test harness integration into CI/CD
