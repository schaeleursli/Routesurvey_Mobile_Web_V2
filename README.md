# RouteSurvey (V3)

> **Enterprise-grade console for transport route surveys and logistics.**

RouteSurvey is a specialized logistics platform designed for planning, surveying, and reporting on transport routes. It serves engineers, surveyors, and logistics managers who need to ensure route viability for heavy or oversized transport.

---

## 📖 Table of Contents

-   [Overview](#-overview)
-   [Key Concepts](#-key-concepts)
-   [Architecture](#-architecture)
-   [Getting Started](#-getting-started)
    -   [Prerequisites](#prerequisites)
    -   [Installation](#installation)
    -   [Running Locally](#running-locally)
-   [Configuration](#-configuration)
-   [Documentation](#-documentation)
-   [Switching API Modes](#-switching-api-modes)

---

## 🔭 Overview

RouteSurvey solves the problem of accurate route validation. It allows users to:
1.  **Plan** routes using map data.
2.  **Survey** physical routes using mobile-first tools to capture obstacles (bridges, power lines, etc.).
3.  **Report** findings in standardized PDF or digital formats for clients and authorities.
4.  **Share** secure links to route data and reports.

**Target Audience**: Logistics Engineers, Field Surveyors, Project Managers.

---

## 💡 Key Concepts

| Concept | Description |
| :--- | :--- |
| **Route** | The core entity. A specific path from Point A to Point B. |
| **Planning** | The desktop-based process of defining a route before driving it. |
| **Survey** | The field process of driving the route and logging **Observations** (general notes) and **Obstructions** (blockers). |
| **Points** | Specific locations on a route (e.g., Bridge, Turn, Overhead Wire). |
| **Templates** | Reusable report structures ensuring consistency across projects. |
| **Report** | The final output (PDF/Doc) generated from a Survey, often using a specific Template. |

---

## 🏗 Architecture

The system follows a strict **Layered Architecture** to ensure maintainability and separation of concerns.

-   **Frontend**: Vue 3 + Vite.
-   **State**: Pinia (Global Stores).
-   **Routing**: Vue Router.
-   **API Layer**: Axios Controllers (Pattern: `View` -> `Store` -> `Controller` -> `API`).

### Directories
-   `src/views`: Page layouts and screens.
-   `src/components`: Reusable UI elements (`ui/` for design system).
-   `src/controllers`: Business logic and API bridges.
-   `src/stores`: Reactive state management.

For a deep dive, see **[Architecture Documentation](./docs/02_ARCHITECTURE.md)**.

---

## 🚀 Getting Started

### Prerequisites

-   **Node.js**: v18+ (LTS)
-   **npm**: v9+
-   **Docker** (optional, for local backend)

### Installation

```bash
# 1. Clone the repo
git clone <repository-url>
cd RSConsole-V3

# 2. Install dependencies
npm install
```

### Running Locally

```bash
# Run the development server
npm run dev
```

> The app will be available at `http://localhost:5173`.

---

## ⚙ Configuration

The application is configured via environment variables.

| Variable | Description | Default (Dev) |
| :--- | :--- | :--- |
| `VITE_API_URL` | Main Backend API URL | `http://localhost:3000/api` |
| `VITE_MASL_API_BASE_URL` | Reporting Service API | `http://localhost:5000` |

Copy `.env.local.example` to `.env.local` to override defaults safely.

---

## 📚 Documentation

We maintain detailed documentation in the `/docs` directory.

-   **[User Manual](./docs/manual/APP_USAGE.md)**: How to use the Planning, Survey, and Reporting tools.
-   **[Developer Guide](./docs/02_ARCHITECTURE.md)**: Deep dive into code patterns and architecture.
-   **[Backend API](./docs/05_BACKEND_API.md)**: API reference and endpoints.
-   **[Design System](./docs/03_DESIGN_SYSTEM.md)**: UI components and strict styling rules.
-   **[Deprecation Policy](./docs/developer/DEPRECATION.md)**: Information on deprecated components.

---

## 🔄 Switching API Modes

Legacy features (such as the old Report Editor) and previous API versions can be toggled for backward compatibility.

> **⚠️ WARNING**: Reverting to legacy APIs may disable newer features like the Template Builder.

For full instructions, see **[Switching to Legacy APIs](./docs/developer/API_SWITCHING.md)**.

---

*© 2026 RouteSurvey.app*
