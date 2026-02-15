# Project Structure

This document outlines the organization of the codebase. Adhering to this structure is critical for maintainability.

## Directory Tree

```
src/
├── assets/                 # Static assets (images, global CSS)
│   └── css/
│       └── design-system.css  # <--- CORE DESIGN TOKENS
├── components/             # Reusable UI Components
│   ├── ui/                 # <--- BASE DESIGN SYSTEM COMPONENTS (Generic)
│   ├── layouts/            # Layout wrappers
│   ├── planned_routes/     # Domain-specific components
│   └── ...
├── composables/            # Vue Composition API hooks (useFetch, useWindow, etc.)
├── controllers/            # Business Logic & API Service Layer
│   ├── auth/
│   └── ...
├── core/                   # Framework plugins (i18n, icons, etc.)
├── router/                 # Vue Router configuration
├── stores/                 # Pinia State Stores (Global State)
├── utils/                  # Pure utility functions (dates, formatting, security)
├── views/                  # Page Components (Route targets)
└── App.vue                 # Root Component
```

## Where does my code go?

### 1. I am building a reusable button/card/input...
**Location**: `src/components/ui/`
**Rule**: It must be dumb (pure UI). It accepts props and emits events. No API calls inside.

### 2. I am building a "Route Detail" section...
**Location**: `src/components/routes/`
**Rule**: Domain-specific component. Can be smart (access store) or dumb.

### 3. I am creating a whole new page...
**Location**: `src/views/`
**Rule**: This is the entry point for the route. It should fetch data (via Controller/Store) and pass it to components.

### 4. I need to call an API...
**Location**: `src/controllers/`
**Rule**: Create a controller method. Do not call Axios directly from a Vue component.

### 5. I need to share state across pages...
**Location**: `src/stores/`
**Rule**: Use a Pinia store. Do not use `mitt` (deprecated).

### 6. I need a helper for date formatting...
**Location**: `src/utils/`
**Rule**: Pure function.
