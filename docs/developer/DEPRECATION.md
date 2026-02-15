# Deprecation Policy & Compatibility

As RouteSurvey V3 evolves, older components and API patterns are deprecated to maintain code quality and performance. This document outlines the policy and currently deprecated items.

## Policy

-   **Soft Deprecation**: Component/API is still functional but marked with a warning (e.g., `DEPRECATED` console log or UI banner). No new development should occur here.
-   **Hard Deprecation**: Component/API is scheduled for removal in the next major release.
-   **Removal**: Code is deleted.

## Deprecated Components

| Component | Path | Status | Replacement |
| :--- | :--- | :--- | :--- |
| **Legacy Report Editor** | `src/views/reports/LegacyReport.vue` | **Soft Deprecated** | `ReportBuilder.vue` (V3 Editor) |
| **Old Report Generators** | `src/views/reports/ReportGenerations.vue` | **Maintained** | This view now routes to the new builder but retains logic for legacy routing. |

## Feature Flags

Some deprecations are managed via feature flags or environment variables:

-   `VITE_ENABLE_LEGACY_EDITOR`: (Hypothetical) If removed, the legacy editor route is disabled.

## Migration Guide

To migrate from **Legacy Report** to **V3 Report**:
1.  Open the legacy report.
2.  Export data if needed (though both read from the same `Route` data source).
3.  Open the new **Report Builder** for the same route.
4.  Apply a V3 Template.
