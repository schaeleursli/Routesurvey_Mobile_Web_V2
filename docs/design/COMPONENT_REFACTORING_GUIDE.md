# Component Refactoring Guide

## Goal
Gradually refactor components to use design tokens from `src/assets/css/design-system.css` instead of hard-coded values.

## Current Status

**Violations Found:** 3,958 violations across 190/208 files
- 🔴 Errors: 440 (hard-coded colors, fonts)
- 🟡 Warnings: 242 (hard-coded spacing)

## Priority Order

### Phase 1: High-Impact Components (Week 1-2)
Start with most-used, visible components:

1. **src/App.vue** - Main app shell
   - 2 hex colors
   - 1 RGB color

2. **src/components/auth/** - Login/signup pages
   - `AuthShell.vue` - 4 hex colors
   - `MarketingHero.vue` - 9 violations
   - `OAuthButtonGoogle.vue` -11 violations

3. **src/components/dashboard/** - Dashboard widgets
   - `DashboardKpiBadge.vue` - 25 violations
   - `DashboardOnboarding.vue` - 3 violations

### Phase 2: Core UI Components (Week 3-4)
Common reusable components:

4. **Buttons** - Find all button components
5. **Forms** - Input, select, textarea components
6. **Cards** - Container components
7. **Modals** - Dialog components

### Phase 3: Feature Components (Month 2)
Domain-specific components:

8. **Planning Module** - Route planning components
9. **Reporting Module** - Report generation
10. **Survey Module** - Field survey components

## Refactoring Pattern

### Before (❌ Hard-coded)
```vue
<template>
  <div class="card">
    <h3>Title</h3>
    <p>Description</p>
  </div>
</template>

<style scoped>
.card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 24px;
  color: #1F2937;
}

h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}

p {
  color: #6B7280;
  font-size: 14px;
}
</style>
```

### After (✅ Design tokens)
```vue
<template>
  <div class="card">
    <h3>Title</h3>
    <p>Description</p>
  </div>
</template>

<style scoped>
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  color: var(--text-primary);
}

h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-sm);
}

p {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
}
</style>
```

## Common Replacements

### Colors
```css
/* ❌ Before → ✅ After */
color: #1F2937;           → color: var(--text-primary);
color: #6B7280;           → color: var(--text-secondary);
background: #FFFFFF;      → background: var(--bg-surface);
background: #F8F9FA;      → background: var(--bg-base);
border-color: #E5E7EB;    → border-color: var(--border);
color: #0F62FE;           → color: var(--accent);
color: #00B386;           → color: var(--success);
color: #F39C12;           → color: var(--warning);
color: #E83E8C;           → color: var(--error);
```

### Spacing
```css
/* ❌ Before → ✅ After */
padding: 4px;             → padding: var(--spacing-2xs);
padding: 8px;             → padding: var(--spacing-xs);
padding: 12px;            → padding: var(--spacing-sm);
padding: 16px;            → padding: var(--spacing-md);
padding: 24px;            → padding: var(--spacing-lg);
padding: 32px;            → padding: var(--spacing-xl);
margin: 16px;             → margin: var(--spacing-md);
gap: 12px;                → gap: var(--spacing-sm);
```

### Typography
```css
/* ❌ Before → ✅ After */
font-size: 12px;          → font-size: var(--font-size-xs);
font-size: 14px;          → font-size: var(--font-size-base);
font-size: 16px;          → font-size: var(--font-size-lg);
font-size: 18px;          → font-size: var(--font-size-xl);
font-size: 20px;          → font-size: var(--font-size-2xl);
font-size: 24px;          → font-size: var(--font-size-3xl);
font-weight: 400;         → font-weight: var(--font-weight-normal);
font-weight: 500;         → font-weight: var(--font-weight-medium);
font-weight: 600;         → font-weight: var(--font-weight-semibold);
font-weight: 700;         → font-weight: var(--font-weight-bold);
```

### Border Radius
```css
/* ❌ Before → ✅ After */
border-radius: 4px;       → border-radius: var(--radius-sm);
border-radius: 6px;       → border-radius: var(--radius-md);
border-radius: 8px;       → border-radius: var(--radius-lg);
border-radius: 12px;      → border-radius: var(--radius-xl);
border-radius: 9999px;    → border-radius: var(--radius-full);
```

### Shadows
```css
/* ❌ Before → ✅ After */
box-shadow: 0 1px 2px...  → box-shadow: var(--shadow-sm);
box-shadow: 0 4px 6px...  → box-shadow: var(--shadow-md);
box-shadow: 0 10px 15px...→ box-shadow: var(--shadow-lg);
```

## Workflow

### 1. Identify Component
```bash
# Run audit to see violations
npm run audit:design

# Check a specific file
grep -n "#[0-9A-Fa-f]" src/components/YourComponent.vue
```

### 2. Refactor Component
- Replace hex colors with `var(--...)` tokens
- Replace px values with spacing tokens
- Replace font sizes with typography tokens
- Test in both light and dark modes

### 3. Verify
```bash
# Run design validation
npm run test:design

# Check specific component
npm run audit:design | grep "YourComponent"
```

### 4. Test Visually
- Open component in browser
- Toggle between light/dark modes
- Verify colors, spacing look correct
- Check responsive behavior

## Example Refactoring Session

Let's refactor `src/App.vue`:

**Step 1: View current violations**
```bash
npm run audit:design | grep "App.vue" -A 10
```

**Output:**
```
📄 src/App.vue
   ├─ Hard-coded hex color found (2 occurrences)
   ├─ Line 45: #3498db
   └─ Line 117: #fff
   ├─ Hard-coded RGB/HSL color found (1 occurrences)
   └─ Line 29: rgb(255 255 255 / 50%)
```

**Step 2: Find and replace**

Find line 45:
```vue
<style>
.some-class {
  background: #3498db;  /* Line 45 */
}
</style>
```

Replace with design token:
```vue
<style>
.some-class {
  background: var(--accent);
}
</style>
```

**Step 3: Test**
```bash
npm run dev
# Open browser, verify component looks correct
# Toggle dark mode, verify it still works
```

**Step 4: Verify**
```bash
npm run audit:design | grep "App.vue"
```

Expected: No violations for App.vue!

## Tracking Progress

Create a tracking file: `docs/design/refactoring-progress.md`

```markdown
# Refactoring Progress

## Completed ✅
- [ ] src/App.vue (2/2 fixes)
- [ ] src/components/auth/AuthShell.vue (0/4 fixes)

## In Progress 🔄
- None

## Backlog 📋
- src/components/dashboard/DashboardKpiBadge.vue (25 violations)
- src/components/auth/MarketingHero.vue (9 violations)
...

## Metrics
- **Total files with violations:** 190
- **Total violations:** 3,958
- **Files refactored:** 0
- **Violations fixed:** 0
- **Progress:** 0%
```

## Tips

### 1. Start Small
Don't try to refactor everything at once. One component at a time.

### 2. Test Thoroughly
Always test in both light and dark modes after refactoring.

### 3. Use Find & Replace Carefully
VSCode regex find/replace can help:
- Find: `color:\s*#[0-9A-Fa-f]{6}`
- But verify each replacement manually!

### 4. Document Exceptions
Some components may need hard-coded values (e.g., brand logos with specific colors). Document these in the component with comments:

```vue
<style>
.brand-logo {
  /* Exception: Brand-specific Google blue, not from design system */
  background: #4285F4;
}
</style>
```

### 5. Pair with Visual Regression
Run Percy tests after major refactoring to catch visual regressions:

```bash
npm run test:visual
```

## Automation Ideas

### Pre-commit Hook
Add to `.husky/pre-commit`:
```bash
#!/bin/sh
# Only check staged files
npm run lint:design
```

### VS Code Snippets
Create snippets for common patterns:
```json
{
  "Design Token Color": {
    "prefix": "dtc",
    "body": "var(--$1)",
    "description": "Design token variable"
  }
}
```

## Resources

- [Design System Guide](./DESIGN_SYSTEM.md) - Complete token reference
- Design audit: `npm run audit:design`
- Contrast check: `npm run test:contrast`
- Full validation: `npm run test:design`

## Questions?

1. **Which token should I use?** → Check [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
2. **How do I test dark mode?** → Toggle in app UI or add `data-bs-theme="dark"` to `<html>`
3. **What if there's no matching token?** → Add it to `design-system.css` first
4. **Can I use hard-coded values?** → Only with documented exceptions

---

**Remember:** Consistency > Perfection. Gradual progress is better than no progress!
