# Design System

RouteSurvey.app follows a strict design system to ensure consistency, scalability, and an award-winning user experience.

> **Principle**: Connect **Tokens** → **Components** → **Screens**. Never style screens directly with arbitrary values.

## 1. Design Tokens

The source of truth for all visual values is located in `src/assets/css/design-system.css`. We use native CSS Variables for high performance and dynamic theming (Light/Dark mode).

### Colors

#### Role-Based Palette
We use semantic names, not raw color names, to support theming.

| Token | Light Value | Dark Value | Usage |
|-------|-------------|------------|-------|
| `--bg-base` | `#F9FAFB` | `#0F172A` | Global app background |
| `--bg-surface` | `#FFFFFF` | `#1E293B` | Cards, Modals, Panels |
| `--bg-elevated` | `#F4F5F6` | `#334155` | Hover states, secondary backgrounds |
| `--text-primary` | `#1F2937` | `#F8FAFC` | Headings, body text |
| `--text-secondary` | `#6B7280` | `#94A3B8` | Metadata, helpers, placeholders |
| `--border` | `#E5E7EB` | `#475569` | Dividers, inputs, card borders |

#### Brand & Status
| Token | Log | Usage |
|-------|-----|-------|
| `--accent` | `#0077cc` | Primary Actions, Links, Focus rings |
| `--success` | `#00B386` | Success messages, Completed states |
| `--warning` | `#F39C12` | Warnings, Pending states |
| `--error` | `#E83E8C` | Errors, Destructive actions |

### Spacing Scale

Use these variables for `margin`, `padding`, and `gap`.

| Token | Size |
|-------|------|
| `--spacing-2xs` | 4px |
| `--spacing-xs` | 8px |
| `--spacing-sm` | 12px |
| `--spacing-md` | 16px |
| `--spacing-lg` | 24px |
| `--spacing-xl` | 32px |
| `--spacing-2xl` | 48px |

### Typography

| Token | Value |
|-------|-------|
| `--font-family-base` | System UI (Apple, Segoe, Roboto, etc.) |
| `--font-family-mono` | JetBrains Mono, Fira Code, Monospace |
| `--font-size-base` | 14px |
| `--font-size-lg` | 16px |

### Radius

| Token | Size | Used For |
|-------|------|----------|
| `--radius-sm` | 4px | Small inputs, badges |
| `--radius-md` | 6px | Buttons, default inputs |
| `--radius-lg` | 8px | Cards |
| `--radius-xl` | 12px | Modals |
| `--radius-full` | 9999px | Pills, avatars |

### Shadows

| Token | Purpose |
|-------|---------|
| `--shadow-sm` | Subtle definition |
| `--shadow-md` | Dropdowns, Popovers |
| `--shadow-lg` | Modals, Floating Actions |

---

## 2. Base Components

Do not use HTML elements (`<button>`, `<input>`) directly. Use the highly reusable **Base Components** located in `src/components/ui`.

| Component | Description | Props |
|-----------|-------------|-------|
| `BaseButton` | Standard button with variants (primary, secondary, text). | `variant`, `disabled`, `loading` |
| `BaseFormField` | Input wrapper with label, error text, and icons. | `label`, `error`, `id`, `startIcon` |
| `BaseCard` | Surface container with standard padding and shadow. | `loading`, `title` |
| `BaseModal` | Accessible dialog with overlay. | `isOpen`, `title`, `size` |
| `BaseDropdown` | Select menu/dropdown. | `options`, `modelValue` |
| `StatusIndicator`| Visual dot/badge for status states. | `status` (success/warning/error) |

---

## 3. Best Practices

### ✅ Do
- Use CSS Variables for everything: `color: var(--text-primary);`
- Use Base Components for all UI elements.
- meaningful class names like `.user-profile-card` rather than `.p-4` (unless using a utility class).

### ❌ Don't
- ❌ Hardcode Hex values: `color: #333;`
- ❌ Use Bootstrap classes (`.btn-primary`, `.text-danger`) generally (we are migrating away).
- ❌ Create one-off components without creating a token first.
