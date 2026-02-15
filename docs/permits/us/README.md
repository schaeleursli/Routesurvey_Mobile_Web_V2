# US Permits Module Documentation

## Overview

The US Permits module enables users to create, manage, and validate permit applications for oversized loads traveling through California, Texas, and Florida. The system features:

- **Imperial-first UX**: All measurements displayed in ft/in, lbs, mph
- **Jurisdiction-aware rules**: State-specific requirements and constraints
- **Conflict detection**: Automatic identification of conflicting requirements
- **Validation gating**: Draft/Blocked/Ready status workflow
- **Readiness scoring**: 0-100 score based on completeness

---

## Table of Contents

1. [Architecture](#architecture)
2. [Data Model](#data-model)
3. [Block System](#block-system)
4. [Rules Engine](#rules-engine)
5. [API Reference](#api-reference)
6. [Frontend UX](#frontend-ux)
7. [Testing](#testing)

---

## Architecture

### System Overview

```
┌─────────────────┐
│   Vue3 Frontend │
│  (Imperial UX)  │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│  FastAPI Python │
│     Backend     │
└────────┬────────┘
         │ subprocess
         ▼
┌─────────────────┐      ┌──────────────┐
│   Node.js CLI   │─────▶│ Rules Engine │
│   (cli.js)      │      │   + Rollup   │
└─────────────────┘      └──────────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
│  (permit_case)  │
└─────────────────┘
```

### Node.js ↔ Python Bridge

The Python backend communicates with the existing Node.js rules engine via subprocess:

**Input** (stdin):
```json
{
  "segments": [
    {"id": "seg1", "start_km": 0, "end_km": 500, "admin": {"state": "CA"}}
  ],
  "payload": {
    "transport": {
      "overall": {
        "width_m": 5.9,
        "height_m": 5.76,
        "length_m": 30.48,
        "gross_kg": 199580
      }
    }
  }
}
```

**Output** (stdout):
```json
{
  "decisions": [...],
  "rollup": {...},
  "conflicts": [...],
  "validation": {
    "blockingIssues": [],
    "warnings": []
  },
  "rationale": [...]
}
```

### Key Design Decisions

1. **Async Bridge with Semaphore**: Limits to 6 concurrent subprocess calls
2. **Hash-based Caching**: SHA256 of `segments + payload` to skip redundant evaluations
3. **Metric Storage**: All imperial inputs converted to metric before storage
4. **Deterministic Scoring**: Readiness score uses fixed deduction rules

---

## Data Model

### PermitCase Table

```sql
CREATE TABLE permit_case (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL,
    title VARCHAR(255),
    route_id VARCHAR(255),
    payload_json JSONB,          -- Metric units
    rollup_json JSONB,            -- Output from Node.js
    status VARCHAR(20),           -- "draft" | "blocked" | "ready"
    readiness_score INTEGER,      -- 0-100
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Payload Structure

```typescript
{
  transport: {
    overall: {
      width_m: number,
      height_m: number,
      length_m: number,
      gross_kg: number
    }
  },
  clearance: {
    measurements: [
      {
        location: string,
        clearance_m: number,
        method: "laser" | "tape" | "estimated" | "as-built",
        confidence: "high" | "medium" | "low"
      }
    ]
  },
  attachments: {
    routeMapProvided: boolean,
    loadPhotosProvided: boolean,
    drawingsProvided: boolean,
    weightDistProvided: boolean,
    notes: string
  },
  compliance: {
    preparedBy: string,
    surveyDate: string
  },
  route: {
    id: string,
    name: string,
    statesInRoute: string[]
  }
}
```

---

## Block System

### Template: `us_permit_template_v1`

| Block ID | Type | Locked | Description |
|----------|------|--------|-------------|
| `permit_summary` | Summary | ✓ | Case metadata, prepared by, survey date |
| `vehicle_load` | Data Entry | ✓ | Overall dimensions, weight |
| `route_definition` | Data Entry | | Route details, segments |
| `clearance_obstructions` | Data Entry | | Clearance measurements, obstructions |
| `bridge_list` | Data Entry | | Bridges along route |
| `escort_windows` | Data Entry | | Escort requirements |
| `evidence_annex` | Attachments | | Required attachments |
| `state_addenda` | Auto-generated | ✓ | State-specific requirements |

### Block Registry

Components mapped in `/src/components/permits/blocks/blockRegistry.js`:

```javascript
export const BLOCK_REGISTRY = {
  'permit_summary': PermitSummaryBlock,
  'vehicle_load': VehicleLoadBlock,
  'clearance_obstructions': ClearanceObstructionsBlock,
  'evidence_annex': EvidenceAnnexBlock,
  // ...
};
```

---

## Rules Engine

### Jurisdiction Hierarchy

```
US_BASE (federal)
  ├─ CA (California)
  ├─ TX (Texas)
  └─ FL (Florida)
```

### Rollup Algorithm

1. Evaluate US_BASE rules
2. For each state in route, evaluate state rules
3. Merge requirements (union)
4. Detect conflicts (side-by-side comparison)
5. Generate rationale with imperial formatting

### Status Derivation

```python
if len(blocking_issues) > 0 or any(c.severity == "block" for c in conflicts):
    status = "blocked"
elif len(blocking_issues) == 0 and len(blocking_conflicts) == 0:
    status = "ready"
else:
    status = "draft"
```

### Readiness Score

```python
score = 100
score -= len(blocking_issues) * 30
score -= len(blocking_conflicts) * 15
score -= len(warnings) * 5
score -= len(low_confidence_measurements) * 5
score = max(0, min(100, score))
```

---

## API Reference

### Endpoints

#### `POST /api/v1/projects/{projectId}/permit-cases/us`
Create new US permit case

**Request**:
```json
{
  "route_id": "route_123",
  "title": "CA-TX Oversized Load"
}
```

**Response**: `PermitCaseResponse`

---

#### `GET /api/v1/projects/{projectId}/permit-cases`
List all permit cases for project

**Response**: `PermitCaseListItem[]`

---

#### `GET /api/v1/permit-cases/{caseId}`
Get permit case detail

**Response**: `PermitCaseResponse`

---

#### `PATCH /api/v1/permit-cases/{caseId}`
Update permit case (partial)

**Request**:
```json
{
  "payload_json": {
    "transport": {
      "overall": {
        "width_m": 5.9
      }
    }
  }
}
```

**Response**: `PermitCaseResponse` (re-evaluated)

---

#### `GET /api/v1/routes/{routeId}/segments`
Get route segments for rollup

**Response**: `RouteSegment[]`

---

## Frontend UX

### Imperial-First Rules (Non-Negotiable)

1. **Display**: All dimensions shown as ft/in (e.g., `19'-4"`)
2. **Input**: Separate fields for feet and inches
3. **Storage**: Converted to meters before API call
4. **Rationale**: All strings use imperial (e.g., "exceeds 18'-11\"")
5. **No Metric**: Metric units never shown unless explicitly toggled

### Workspace Layout

```
┌────────────────────────────────────────────────────────────┐
│ Header: [Readiness Score] [Status] [Export Button]        │
├───────────┬─────────────────────────┬──────────────────────┤
│           │                         │                      │
│  Block    │   Block Editor          │  Jurisdictions       │
│  List     │   (selected block)      │  [Authority Cards]   │
│           │                         │                      │
│  • Summary│                         │  Next Actions        │
│  • Vehicle│                         │  [Action Items]      │
│  • Route  │                         │                      │
│  • Clear. │                         │  Requirements        │
│  • Bridge │                         │  [Required Items]    │
│  • Escort │                         │  [Conflicts]         │
│  • Evid.  │                         │                      │
│  • Addenda│                         │                      │
│           │                         │                      │
└───────────┴─────────────────────────┴──────────────────────┘
```

### Phase 1.1 Enhancements

**Authority Cards**:
- Jurisdiction name + authority label
- Escort level (None/Pilot/Police)
- Travel window summary
- Speed limit (mph)
- Blocking conflict count

**Readiness Score Widget**:
- Circular 0-100 indicator
- Color-coded (green/yellow/red)
- Breakdown of deductions

**Next Actions Panel**:
- Auto-generated prioritized actions
- High: blocking conflicts, missing fields
- Medium: warnings
- Click to jump to context

---

## Testing

### Backend Tests

Run: `pytest backend/tests/test_permits.py -v`

**Coverage**:
- Status derivation logic
- Readiness score computation
- Imperial threshold formatting
- API endpoint structure

### Node.js Tests

Run: `npm test` in `/server`

**Coverage**:
- Rules engine evaluation
- Rollup algorithm
- Conflict detection
- Rationale generation with imperial formatting

### Frontend E2E Tests (Planned)

Using Playwright:
- Create permit case
- Enter imperial dimensions
- Verify status transition (draft → blocked → ready)
- Test conflict visualization
- Test jump-to-field

---

## Production Checklist

- [x] Backend async bridge with semaphore
- [x] Hash-based caching
- [x] Readiness score implementation
- [x] Imperial-first UX components
- [x] Authority cards
- [x] Next actions panel
- [x] 4/8 block components implemented
- [x] Backend unit tests
- [ ] Remaining 4 blocks
- [ ] Frontend E2E tests
- [ ] Load testing (concurrent subprocess calls)
- [ ] Documentation complete

---

**Last Updated**: 2026-01-27  
**Version**: Phase 1 + Phase 1.1 Complete
