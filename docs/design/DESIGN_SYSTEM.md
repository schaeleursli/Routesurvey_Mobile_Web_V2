# RouteSurvey Design System

## Overview

The RouteSurvey design system ensures consistent, accessible, and maintainable UI across the entire application. All design values are defined as CSS custom properties (variables) in `src/assets/css/design-system.css`.

## Core Principles

1. **Consistency**: All components use the same design tokens
2. **Accessibility**: WCAG 2.1 AA compliance minimum (AAA preferred)
3. **Theme Support**: Full light and dark mode support
4. **Maintainability**: Design changes in one place affect the entire app

---

## Color System

### Background Colors

```css
--bg-base:        /* Page background */
--bg-surface:     /* Card/panel backgrounds */
--bg-elevated:    /* Elevated/raised surfaces */
```

**Usage:**
```css
.panel {
  background-color: var(--bg-surface);
}
```

### Text Colors

```css
--text-primary:   /* Primary text (headings, body) */
--text-secondary: /* Secondary text (descriptions, labels) */
```

**Usage:**
```css
h1 {
  color: var(--text-primary);
}

.label {
  color: var(--text-secondary);
}
```

### Accent & Brand Colors

```css
--accent:         /* Primary brand color (buttons, links) */
--accent-hover:   /* Accent color on hover */
--accent-surface: /* Translucent accent for backgrounds */
--accent-focus-ring: /* Translucent accent for focus states */
```

**Usage:**
```css
.btn-primary {
  background-color: var(--accent);
}

.btn-primary:hover {
  background-color: var(--accent-hover);
}
```

### Status Colors

```css
--success:  /* Success states (#00B386) */
--warning:  /* Warning states (#F39C12) */
--error:    /* Error states (#E83E8C) */
```

**Usage:**
```css
.alert-success {
  color: var(--success);
}
```

### Border Colors

```css
--border:   /* Default border color */
```

**Usage:**
```css
.card {
  border: 1px solid var(--border);
}
```

---

## Typography

### Font Families

```css
--font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', ...
--font-family-mono: 'JetBrains Mono', 'Fira Code', 'Monaco', ...
```

**Usage:**
```css
body {
  font-family: var(--font-family-base);
}

code {
  font-family: var(--font-family-mono);
}
```

### Font Sizes

```css
--font-size-xs:   12px   /* Small labels */
--font-size-sm:   13px   /* Reduced text */
--font-size-base: 14px   /* Body text */
--font-size-lg:   16px   /* Large body */
--font-size-xl:   18px   /* Subheadings */
--font-size-2xl:  20px   /* Small headings */
--font-size-3xl:   24px   /* Medium headings */
--font-size-4xl:  32px   /* Large headings */
--font-size-5xl:  48px   /* Hero text */
```

**Usage:**
```css
h1 {
  font-size: var(--font-size-4xl);
}

p {
  font-size: var(--font-size-base);
}
```

### Font Weights

```css
--font-weight-normal:   400
--font-weight-medium:   500
--font-weight-semibold: 600
--font-weight-bold:     700
```

**Usage:**
```css
h2 {
  font-weight: var(--font-weight-semibold);
}
```

### Letter Spacing

```css
--letter-spacing-tight:  -0.5%
--letter-spacing-normal: 0%
--letter-spacing-wide:   0.2%
```

---

## Spacing System

Use the 8px grid system:

```css
--spacing-2xs: 4px   /* Minimal spacing */
--spacing-xs:  8px   /* Compact spacing */
--spacing-sm:  12px  /* Small spacing */
--spacing-md:  16px  /* Default spacing */
--spacing-lg:  24px  /* Large spacing */
--spacing-xl:  32px  /* Extra large spacing */
--spacing-2xl: 48px  /* Maximum spacing */
```

**Usage:**
```css
.container {
  padding: var(--spacing-lg);
  gap: var(--spacing-md);
}
```

**Guidelines:**
- Use `--spacing-md` as the default
- Use `--spacing-lg` or `--spacing-xl` for section separation
- Use `--spacing-sm` or `--spacing-xs` for tight layouts
- Never use hard-coded pixel values

---

## Border Radius

```css
--radius-sm:   4px
--radius-md:   6px
--radius-lg:   8px
--radius-xl:   12px
--radius-2xl:  16px
--radius-full: 9999px  /* Fully rounded */
```

**Usage:**
```css
.card {
  border-radius: var(--radius-lg);
}

.badge {
  border-radius: var(--radius-full);
}
```

---

## Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 5%)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 8%), ...
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 8%), ...
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 8%), ...
--shadow-colored: 0 4px 14px 0 rgb(15 98 254 / 39%)  /* Accent shadow */
```

**Usage:**
```css
.card {
  box-shadow: var(--shadow-md);
}

.modal {
  box-shadow: var(--shadow-xl);
}
```

---

## Transitions

```css
--transition-fast:   0.15s ease
--transition-normal: 0.2s ease
--transition-slow:   0.3s ease
```

**Usage:**
```css
.button {
  transition: background-color var(--transition-normal);
}
```

**Note:** These are automatically set to `0s` when user prefers reduced motion.

---

## Dark Mode

Dark mode is controlled by the `data-bs-theme` attribute on the root element:

```html
<html data-bs-theme="dark">
```

### Dark Mode Color Overrides

```css
[data-bs-theme="dark"] {
  --bg-base: #0F172A;
  --bg-surface: #1E293B;
--bg-elevated: #334155;
  
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  
  --border: #475569;
  
  /* Enhanced shadows for dark mode */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 30%);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 40%), ...
}
```

### Implementing Dark Mode Support

1. **Always use CSS variables** - they automatically adapt to theme changes
2. **Test in both modes** - run `npm run test:theme`
3. **Verify contrast** - run `npm run test:contrast`
4. **Avoid hard-coded colors** - the linter will catch these

---

## Utility Classes

Pre-built utility classes for common patterns:

```css
.text-primary       /* Primary text color */
.text-secondary     /* Secondary text color */
.bg-surface         /* Surface background */
.bg-elevated        /* Elevated background */
.border             /* Standard border */
.shadow-sm          /* Small shadow */
.shadow-md          /* Medium shadow */
.shadow-lg          /* Large shadow */
.shadow-xl          /* Extra large shadow */
```

---

## Component Guidelines

### Buttons

```vue
<template>
  <button class="btn-primary">
    Click me
  </button>
</template>

<style scoped>
.btn-primary {
  background-color: var(--accent);
  color: white;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  transition: background-color var(--transition-normal);
}

.btn-primary:hover {
  background-color: var(--accent-hover);
}
</style>
```

### Cards

```vue
<style scoped>
.card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
}
</style>
```

### Form Inputs

```vue
<style scoped>
.form-input {
  background-color: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-base);
  transition: border-color var(--transition-normal);
}

.form-input:focus {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>
```

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

All components must meet:

1. **Color Contrast**
   - Normal text: 4.5:1 minimum
   - Large text (18px+): 3:1 minimum
   - Use `npm run test:contrast` to validate

2. **Keyboard Navigation**
   - All interactive elements must be keyboard accessible
   - Focus indicators must be visible
   - Use `npm run test:a11y` to validate

3. **ARIA Attributes**
   - Use semantic HTML where possible
   - Add ARIA labels for screen readers
   - Maintain proper heading hierarchy

4. **Theme Support**
   - All components must work in both themes
   - Use `npm run test:theme` to validate

### Focus States

```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

### Selection States

```css
::selection {
  background-color: var(--accent);
  color: white;
}
```

---

## Design Validation

### Before Committing

```bash
npm run lint:design
```

This runs:
1. CSS linting (Stylelint)
2. Design system audit
3. Reports any hard-coded values

### Full Design Validation

```bash
npm run test:design
```

This runs:
1. CSS linting
2. Design system audit
3. Color contrast validation
4. Theme consistency tests
5. Accessibility audits

### Individual Tests

```bash
npm run audit:design        # Check for hard-coded values
npm run test:contrast       # Validate color contrast
npm run test:theme          # Test dark mode
npm run test:a11y           # WCAG compliance
npm run test:visual         # Visual regression (Percy)
```

---

## Common Mistakes to Avoid

### ❌ Don't Do This

```css
/* Hard-coded colors */
color: #1F2937;
background: #FFFFFF;

/* Hard-coded spacing */
padding: 16px;
margin: 24px;

/* Hard-coded fonts */
font-size: 14px;
font-family: 'Inter';

/* Inline styles */
<div style="color: red">
```

### ✅ Do This Instead

```css
/* Use CSS variables */
color: var(--text-primary);
background: var(--bg-surface);

/* Use spacing tokens */
padding: var(--spacing-md);
margin: var(--spacing-lg);

/* Use typography tokens */
font-size: var(--font-size-base);
font-family: var(--font-family-base);

/* Use CSS classes */
<div class="text-error">
```

---

## Extending the Design System

If you need to add new design tokens:

1. Add them to `src/assets/css/design-system.css`
2. Define for both light and dark modes
3. Document them in this guide
4. Update Stylelint rules if needed
5. Run `npm run test:design` to validate

### Example: Adding a New Color

```css
:root {
  --info: #3B82F6;
}

[data-bs-theme="dark"] {
  --info: #60A5FA;  /* Lighter for dark backgrounds */
}
```

---

## Resources

- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Color Contrast Checker](https://contrast-ratio.com)
- [Design Tokens Community Group](https://design-tokens.github.io/community-group/)

---

## Support

For questions about the design system:
1. Check this documentation
2. Run `npm run audit:design` to find violations
3. Review the design review workflow: `.agent/workflows/design-review.md`
4. Consult the team design lead
