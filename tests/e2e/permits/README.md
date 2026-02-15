# Permits E2E Test Suite

**Comprehensive, unattended overnight testing for the Permits module**

## 📋 Overview

This test suite provides:

- ✅ Full UI automation for Permits Phase 1/1.1
- ✅ Dual-mode support: **MOCK (MSW)** and **REAL (.Net Live API - Refer to docs/backend)**
- ✅ Stress testing with randomized workflows
- ✅ Console error detection and network failure tracking
- ✅ Accessibility smoke checks
- ✅ Detailed HTML reports + JSON artifacts

---

## 🚀 Quick Start

### Run All Permits Tests (Mock Mode)

```bash
npm run test:e2e:permits
```

### Run Against Real Backend (.Net refer to docs/backend)

```bash
# Set environment variables first
export E2E_MODE=real
export E2E_TEST_EMAIL=your@email.com
export E2E_TEST_PASSWORD=yourpassword
export E2E_TEST_PROJECT_ID=your-project-id

npm run test:e2e:permits:real
```

### Run Overnight Soak Test (100 iterations)

```bash
npm run test:e2e:permits:soak
```

### Custom Soak Test (200 iterations, 8+ hours)

```bash
E2E_SOAK_ITERS=200 npm run test:e2e:permits:soak
```

### Interactive UI Mode

```bash
npm run test:e2e:ui
```

---

## 📂 Test Structure

```
tests/e2e/permits/
├── fixtures/
│   ├── global-fixtures.ts         # Shared test context, console tracking, helpers
│   └── permits.fixtures.json      # Mock data for MSW mode
├── permits.dashboard.spec.ts      # Dashboard navigation, case list
├── permits.case.blocked-ready.spec.ts  # Blocking → Ready flow, attachments
├── permits.jump-to-field.spec.ts  # Click-to-focus behavior
├── permits.blocks.spec.ts         # Block selection, navigation
├── permits.requirements.spec.ts   # Requirements panel, tabs, next actions
├── permits.imperial-inputs.spec.ts # Ft/in normalization, formatting
└── permits.soak.spec.ts           # Overnight stress test (randomized)
```

---

## 🎯 Test Coverage

### A) Dashboard Tests

- [x] Navigate to project permits dashboard
- [x] Display cases list with correct count
- [x] Show status pills (blocked + ready)
- [x] Open blocked case and verify workspace loaded
- [x] Display readiness scores

### B) Blocked → Ready Flow

- [x] Verify blocked case has Export disabled
- [x] Show blocking issues in requirements panel
- [x] Fill missing attachments and transition to READY
- [x] Click Export and show placeholder toast
- [x] Show conflicts with side-by-side windows

### C) Jump-to-Field

- [x] Jump to field when clicking missing Required Item
- [x] Scroll to field that is off-screen
- [x] Highlight field temporarily after jump
- [x] Handle nested field paths
- [x] Support multiple jumps in sequence

### D) Block List & Navigation

- [x] Display all blocks in left panel
- [x] Select block and update editor
- [x] Navigate through multiple blocks sequentially
- [x] Show locked icon for required blocks
- [x] Show WIP badge for unimplemented blocks
- [x] Persist selected block on page reload

### E) Requirements Panel

- [x] Display Rolled-up tab with blocking issues
- [x] Switch to By Jurisdiction tab and show authority cards
- [x] Display Next Actions panel with actionable items
- [x] Focus relevant field when clicking Next Action
- [x] Show authority decision badges (approved/conditional/pending)
- [x] Update requirements panel when case data changes

### F) Imperial Inputs

- [x] Normalize inches overflow to feet (14" → +1'2")
- [x] Display formatted imperial values (19'-2" format)
- [x] Not show metric values by default in UI
- [x] Handle edge cases (0 inches, >12 inches)
- [x] Preserve precision when converting internally

### G) Soak Test (Overnight)

- [x] Run 50-200+ iterations unattended
- [x] Randomize workflows (dashboard, cases, blocks, tabs, fields)
- [x] Detect console errors and network failures
- [x] Ensure UI remains responsive (no freezes)
- [x] Generate detailed JSON summary report

---

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `E2E_MODE` | `mock` | `mock` or `real` |
| `E2E_BASE_URL` | `http://localhost:5173` | Frontend URL |
| `E2E_SOAK` | `false` | Enable soak test mode |
| `E2E_SOAK_ITERS` | `100` | Number of soak iterations |
| `E2E_SOAK_DELAY` | `500` | Delay between actions (ms) |
| `E2E_TEST_EMAIL` | - | Login email (real mode) |
| `E2E_TEST_PASSWORD` | - | Login password (real mode) |
| `E2E_TEST_PROJECT_ID` | - | Project ID (real mode) |
| `E2E_BLOCKED_CASE_ID` | - | Blocked case ID (real mode) |
| `E2E_READY_CASE_ID` | - | Ready case ID (real mode) |

---

## 📊 Reporting

### HTML Report

```bash
npx playwright show-report
```

### Soak Test Summary

After running a soak test, check:

```
test-results/soak-summary.json
```

---

## 🔍 Required Selectors (data-testid)

Tests use `data-testid` attributes for stability. These must be added to components:

### Navigation & Layout

- `nav-permits`, `permits-dashboard`, `permits-workspace`
- `permits-block-list`, `permits-block-editor`, `permits-requirements-panel`

### Cases

- `permit-case-{caseId}`, `permits-case-title`, `permits-status-badge`
- `permits-readiness-score`, `permits-export-btn`

### Blocks

- `permits-block-item-{blockId}` (e.g., `permits-block-item-permit_summary`)

### Fields

- `field-attachments-kmlProvided`, `field-attachments-clearanceEvidenceProvided`
- `field-transport-width-ft`, `field-transport-width-in`, etc.

### Requirements Panel

- `permits-blocking-issues`, `permits-required-items`
- `required-item-{path}`, `permits-authority-cards`, `permits-next-actions`

See full list in README body.

---

**Happy Testing! 🎉**
