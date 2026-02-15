# Transport Engineering Frontend

Vue 3 frontend for the heavy-haul transport engineering platform.

## Features Implemented

✅ **Complete Type System** - TypeScript types matching backend EffectiveSpec  
✅ **Pinia State Management** - 6 stores (app, catalog, equipment, transportConfig, calc, visual)  
✅ **API Client** - Type-safe client with all backend endpoints  
✅ **Equipment Library** - Browse, filter, search, and import catalog items  
✅ **Project Equipment** - Manage project-specific equipment with override system  
✅ **Transport Config Editor** - Split-panel editor with schematic + tabs  
✅ **Calculations** - Run axle load calculations and view results  
✅ **SVG Schematic** - Basic renderer for open deck train and SPMT  
✅ **Dark/Light Theme** - Full theme support with persistence  
✅ **UI Components** - Button, Toast, Tabs, Drawer with transitions  

## Tech Stack

- Vue 3 (Composition API + `<script setup>`)
- TypeScript (strict mode)
- Vite
- Pinia
- Vue Router  
- CSS Variables (design system)

## Getting Started

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Backend Integration

The frontend expects the backend API at `http://localhost:8000/api/v1`.

Vite dev server proxies `/api` requests to avoid CORS issues.

## Routes

- `/projects/:projectId/engineering` - Workspace landing
- `/projects/:projectId/engineering/library` - Equipment library browser
- `/projects/:projectId/engineering/equipment` - Project equipment list
- `/projects/:projectId/engineering/configs/:configId` - Config editor

## License

Proprietary - Transport Engineering Platform
