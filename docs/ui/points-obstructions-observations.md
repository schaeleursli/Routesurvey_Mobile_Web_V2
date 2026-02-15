# Obstructions & Observations UI Design

## Overview
This document outlines the design and implementation of the Obstructions & Observations (Points) UI implementation for the RouteSurvey Web Console.

## 1. Component Architecture
We will implement a 3-panel layout for desktop, collapsible for mobile.

- **RsPanelShell (SurveyLayout)**: 3-pane container (Left List, Center Map, Right Details).
- **RsPointList**: Left panel containing search, filters, and grouped item cards.
- **RsPointListItem**: Individual card component for the list.
- **RsMapShell**: Wrapper for the Leaflet map with cluster/marker logic.
- **RsPointDetailsPanel**: Right panel for viewing/editing selected points.
- **RsPhotoCarousel**: Image viewer/slider.
- **RsStatusChips**: Consistent status badges (Draft, Surveyed, Reviewed, Ready).

## 2. State Machine (Status Workflow)
The `workflowStatus` field governs the point's lifecycle:
1.  **Draft** (Default): Initial state captured from mobile or created.
2.  **Surveyed**: Data populated, photos attached.
3.  **Reviewed**: QA Check passed by a reviewer.
4.  **Ready**: Final state, ready for export/reporting.

**Transitions:**
- Any state -> Draft (if critical fields removed)
- Draft -> Surveyed (Manual or auto if fields complete)
- Surveyed -> Reviewed (Manual action)
- Reviewed -> Ready (Manual action, requires validation)

## 3. Validation Rules
To mark as **Ready**, a point must have:
- [x] Valid `type` (not null)
- [x] Valid `kind` (Obstruction/Observation)
- [x] `distance_m` populated
- [x] `lat/lng` coordinates
- [x] If Severity == Critical: Must have `notes`

## 4. Layout Strategy
- **Desktop (>1024px):**
    - Left Panel (350px fixed/resizable): List
    - Center: Map (Flexible)
    - Right Panel (400px fixed/resizable): Details (Visible on selection)
- **Mobile/Tablet:**
    - Map takes full background.
    - List is a toggleable drawer/overlay.
    - Details is a full-screen or half-screen sheet.

## 5. Extensions
- **Field Types:** New types can be added to the `type` enum in `surveyStore.js`.
- **Metadata:** `qaFlags` can be extended for custom workflows.
