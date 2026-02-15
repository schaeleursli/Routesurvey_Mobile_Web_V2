# Getting Started

## Prerequisites

-   **Node.js**: v18+ (LTS recommended)
-   **npm**: Included with Node.js
-   **Git**: For version control

## Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd RSConsole-V3
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

## Environment Configuration

Create a local environment file if needed, though default environments are provided.

**`.env.development`** (Default for `npm run dev`):
```properties
VITE_API_URL=http://localhost:3000/api
# Add other keys as required by the backend
```

## Running the Application

### Development Server
Starts the local Vite dev server with Hot Module Replacement (HMR).
```bash
npm run dev
```
Access the app at `http://localhost:5173`.

### Production Build
Builds the application for production (minified, optimized assets).
```bash
npm run build
```
Output directory: `dist/`

## Testing

### Unit Tests (Vitest)
Runs unit and component tests.
```bash
npm run test
# or for coverage
npm run coverage
```

### End-to-End Tests (Playwright)
Runs the full E2E suite. Ensure the dev server or backend is reachable if required by the tests.
```bash
npm run test:e2e
```

## Linting & Formatting

We use ESLint and Prettier to enforce code quality.
```bash
# Check and fix files
npm run lint
```
