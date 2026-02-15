# RouteSurvey.app Design System

A comprehensive design system for RouteSurvey.app's professional web console and admin tools. This system serves as the single source of truth for all UI, UX, and visual logic.

## Table of Contents

1. [Color System](#color-system)
2. [Typography](#typography)
3. [Components](#components)
4. [Spacing](#spacing)
5. [Elevation](#elevation)
6. [Status Indicators](#status-indicators)

---

## Color System

### Background Colors

| Color | CSS Variable | Hex Code | Usage |
|-------|-------------|----------|-------|
| Background Base | `--bg-base` | `#F9FAFB` | Primary background color |
| Surface | `--bg-surface` | `#FFFFFF` | Card and panel backgrounds |
| Elevated | `--bg-elevated` | `#F4F5F6` | Elevated surface backgrounds |

### Text Colors

| Color | CSS Variable | Hex Code | Usage |
|-------|-------------|----------|-------|
| Text Primary | `--text-primary` | `#1F2937` | Primary text content |
| Text Secondary | `--text-secondary` | `#6B7280` | Secondary text and descriptions |

### Accent Colors

| Color | CSS Variable | Hex Code | Usage |
|-------|-------------|----------|-------|
| Accent | `--accent` | `#00A7E1` | Primary brand color, buttons, links |
| Accent Hover | `--accent-hover` | `#0090C9` | Hover states for accent elements |

### Border Colors

| Color | CSS Variable | Hex Code | Usage |
|-------|-------------|----------|-------|
| Border | `--border` | `#E5E7EB` | Default borders and dividers |

### Status Colors

| Color | CSS Variable | Hex Code | Usage |
|-------|-------------|----------|-------|
| Success | `--success` | `#00B386` | Success states, verified routes |
| Warning | `--warning` | `#F39C12` | Warning states, clearance cautions |
| Error | `--error` | `#E83E8C` | Error states, blocked routes |

---

## Typography

### Font Hierarchy

#### Display Heading (H1)
- **Size:** 48px
- **Weight:** 700 (Bold)
- **Letter Spacing:** -0.5%
- **Usage:** Main page titles and hero sections

#### Section Heading (H2)
- **Size:** 32px
- **Weight:** 600 (Semi-Bold)
- **Letter Spacing:** -0.25%
- **Usage:** Section headers and major content divisions

#### Panel Title (H3)
- **Size:** 24px
- **Weight:** 600 (Semi-Bold)
- **Letter Spacing:** 0%
- **Usage:** Panel headers and card titles

#### Body Text
- **Size:** 16px
- **Weight:** 400-500 (Regular to Medium)
- **Letter Spacing:** 0%
- **Usage:** General content and descriptions

#### Small / Label
- **Size:** 13-14px
- **Weight:** 500 (Medium)
- **Letter Spacing:** +0.2%
- **Usage:** Labels, captions, and secondary information

#### Numeric / Code
- **Size:** 14px
- **Font Family:** JetBrains Mono
- **Weight:** 500 (Medium)
- **Letter Spacing:** 0%
- **Usage:** Code snippets, numeric data, and technical content

---

## Components

### Buttons

#### Button Variants

**Primary Button**
- Background: `--accent` (#00A7E1)
- Text: White
- Border: None
- Usage: Primary actions and CTAs

**Secondary Button**
- Background: `--bg-surface` (transparent in dark mode)
- Text: White
- Border: `--border` (#E5E7EB)
- Usage: Secondary actions

**Ghost Button**
- Background: Transparent
- Text: `--accent` (#00A7E1)
- Border: None
- Usage: Tertiary actions and links

#### Button Sizes

- **Small:** Compact height for dense interfaces
- **Medium:** Standard height for most use cases
- **Large:** Prominent height for primary actions

#### Button with Icons

- **Left Icon:** Icon positioned to the left of text
- **Right Icon:** Icon positioned to the right of text
- **Both Icons:** Icons on both sides when needed

### Cards

#### Default Card
- Background: `--bg-surface`
- Border: `--border` (#E5E7EB)
- Border Radius: Rounded corners
- Usage: Basic content grouping

#### Interactive Card
- Same as Default Card
- Hover effects for interactive states
- Usage: Clickable content areas

#### Status Cards

**Success Card**
- Left border: `--success` (#00B386)
- Usage: Verified routes and successful states

**Warning Card**
- Left border: `--warning` (#F39C12)
- Usage: Clearance cautions and warnings

**Error Card**
- Left border: `--error` (#E83E8C)
- Usage: Blocked routes and error states

### Panels

#### Route List Panel
- Background: `--bg-surface`
- Border: `--border`
- Border Radius: Rounded corners
- Usage: Grouping related content and controls

**Panel Content Structure:**
- Title: Panel Title (H3) styling
- Description: Body text styling
- List items with:
  - Primary text (route name)
  - Secondary text (distance, last updated)
  - Status indicator with icon and text

---

## Spacing

### Spacing Scale

| Size | Value | Usage |
|------|-------|-------|
| 2XS | 4px | Minimal spacing, tight layouts |
| XS | 8px | Small spacing between related elements |
| SM | 12px | Standard small spacing |
| MD | 16px | Default spacing between elements |
| LG | 24px | Medium spacing for section separation |
| XL | 32px | Large spacing for major divisions |
| 2XL | 48px | Extra large spacing for page sections |

---

## Elevation

### Elevation Levels

#### Level 0
- **Shadow:** None
- **Description:** No shadow, flat
- **Usage:** Default state, no elevation needed

#### Level 1
- **Shadow:** `shadow-sm`
- **Description:** Subtle elevation
- **Usage:** Hover states, slight emphasis

#### Level 2
- **Shadow:** `shadow-md`
- **Description:** Medium elevation
- **Usage:** Cards, panels, moderate emphasis

#### Level 3
- **Shadow:** `shadow-lg`
- **Description:** High elevation
- **Usage:** Modals, dropdowns, maximum emphasis

---

## Status Indicators

### Verified Route
- **Icon:** Green circle with white checkmark
- **Text:** "Verified Route"
- **Description:** "All clearances pass"
- **Color:** `--success` (#00B386)
- **Usage:** Routes that have passed all clearance checks

### Clearance Caution
- **Icon:** Orange triangle with exclamation mark in light gray circle
- **Text:** "Clearance Caution"
- **Description:** "Verify measurements"
- **Color:** `--warning` (#F39C12)
- **Usage:** Routes requiring manual verification

### Route Blocked
- **Icon:** Red circle with white X
- **Text:** "Route Blocked"
- **Description:** "Obstruction detected"
- **Color:** `--error` (#E83E8C)
- **Usage:** Routes that cannot be used due to obstructions

---

## Implementation Notes

### Dark Mode Support
- The design system supports both light and dark modes
- Color values may differ between modes while maintaining contrast ratios
- Dark mode is the primary interface shown in the design system

### Accessibility
- All color combinations meet WCAG contrast requirements
- Interactive elements have clear hover and focus states
- Status indicators use both color and iconography for clarity

### Consistency
- Use CSS custom properties (variables) for all color values
- Maintain consistent spacing using the defined scale
- Apply elevation levels consistently across similar components

---

*RouteSurvey.app Enterprise Design System — v3.0*
