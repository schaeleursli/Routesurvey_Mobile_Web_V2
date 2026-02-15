# RouteSurvey Application User Manual

This guide explains how to operate the RouteSurvey application for route planning, field surveys, and report generation.

---

## 🏗 Planning Module

The **Planning Module** is used to define proposed routes before driving them.

### Workflow
1.  **Create Plan**: Navigate to "Planned Routes" > "New Plan".
2.  **Draw Route**: Use the map tools to draw a polyline on the map.
    -   *Click* to add points.
    -   *Double-click* to finish drawing.
3.  **Add POIs**: Add anticipated Points of Interest (POIs) like bridges or intersections that need inspection.
4.  **Save**: The plan is saved as a "Planned Route" record.

### Key Features
-   **Import KML**: You can import existing KML files to auto-populate the route path.
-   **Radius Search**: Use the "Nearby" tool to find existing observations from previous surveys within a 50m radius of your planned path.

---

## 🚗 Survey Module

The **Survey Module** is the mobile-first interface used by surveyors in the field.

### Starting a Survey
1.  Open the app on a tablet or mobile device.
2.  Select a "Planned Route" or start a "Manual Route".
3.  The GPS will track your position (if enabled).

### Recording Data
-   **Observations**: General notes (e.g., "Road surface poor").
-   **Obstructions**: Critical blockers (e.g., "Low Bridge", "Power Line").
-   **Photos**: Upload photos directly from the device camera.

### Status Workflow
-   **Draft**: Survey is in progress.
-   **Surveyed**: Field work complete, ready for office review.
-   **Reviewed**: Office engineer has validated the data.
-   **Ready**: Approved for final reporting.

---

## 📄 Reports & Templates

The **Reporting Module** turns survey data into professional PDF documents.

### Generating a Report
1.  Go to the **Reports** tab of a specific Route.
2.  **Select Template**: Choose a pre-defined template (e.g., "Standard Heavy Haul", "Utility Survey").
3.  **Preview**: Check the generated content in the preview window.
4.  **Edit**: Use the rich text editor to modify specific sections if needed.
5.  **Download**: Export as PDF or Word (DOCX).

### Templates
Templates define the structure of the report. They control:
-   **Branding**: Logos, headers, footers.
-   **Layout**: Which sections (Map, Obstruction List, Photos) appear where.
-   **Variables**: Placeholders like `{{RouteName}}` or `{{SurveyDate}}` that are auto-filled.

---

## 🔗 Share Center

The **Share Center** allows you to securely share route data with external stakeholders without giving them full account access.

### Sharing Options
-   **Public Link**: Generates a unique, read-only URL.
-   **Password Protection**: Optional PIN for added security.
-   **Expiration**: Set a date for the link to expire.

### Shareable Items
-   **Route Map**: Interactive map view.
-   **Report PDF**: Direct download link.
-   **Raw Data**: CSV/JSON export of obstacle data.
