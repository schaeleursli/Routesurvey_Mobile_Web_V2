# Switching to Initial / Legacy APIs

> [!WARNING]
> **Use with Caution**: Reverting to legacy APIs often means losing access to newer features like the advanced Template Builder and optimized Reporting Engine. Only do this if you encounter critical regressions in the V3 reporting flow.

This guide explains how to switch the RouteSurvey console back to using the initial "Legacy" API endpoints and components.

## What are the "Initial APIs"?

In the context of RouteSurvey V3, "Initial APIs" refers to:
1.  **Legacy Report Editor**: The older, less flexible editor (`LegacyReport.vue`).
2.  **Direct MASL Integration**: Earlier versions bypassed the standard backend proxy for some reporting tasks.

## Step-by-Step Rollback Guide

### 1. Enable Legacy Components

The application uses feature flags (often route-based or config-based) to decide which editor to load.

To force the usage of the `LegacyReport` component:

1.  Open `src/views/reports/ReportGenerations.vue` (or the relevant router configuration).
2.  Locate the logic that directs users to `ReportBuilder.vue`.
3.  Change the navigation target to `LegacyReport.vue`.

*Example Router Change (`src/router/index.js`)*:

```diff
- component: () => import('@/views/reports/ReportBuilder.vue'),
+ component: () => import('@/views/reports/LegacyReport.vue'),
```

### 2. Environment Configuration

The legacy reporting engine relies heavily on the `VITE_MASL_API_BASE_URL`.

Ensure your `.env` (or `.env.local`) has the correct MASL API endpoint configured:

```properties
VITE_MASL_API_BASE_URL=http://your-legacy-masl-service:5000
```

### 3. Verification

After switching:
1.  Restart the dev server (`npm run dev`).
2.  Navigate to a Route -> Reports.
3.  Verify that you see the "Legacy Editor" warning banner (if present in the component) or the older UI layout.

## What is Lost?

When reverting to the Legacy Reporting flow:
-   **Template Builder**: You cannot use the new visual template builder. The legacy editor uses hardcoded text blocks or older template schemas.
-   **Performance**: The legacy generation process is synchronous and may block the UI for large reports.
-   **Formatting**: Advanced rich-text features (tables, fancy layouts) may be unsupported.

## Troubleshooting

-   **CORS Errors**: The legacy API often requires specific CORS configuration on the server. Ensure `MASL_API_CORS_CONFIGURATION.md` settings are applied to the backend.
-   **Missing Data**: The legacy editor expects a flatter JSON structure. If you have migrated data to the new V3 structure, some fields might not appear in the legacy report.
