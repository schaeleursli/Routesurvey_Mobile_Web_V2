# Design Review Guide

## Quick Start

Run a complete design review in one command:

```bash
npm run test:design
```

This validates:
- ✅ CSS design token usage
- ✅ No hard-coded colors or spacing
- ✅ WCAG 2.1 color contrast
- ✅ Dark mode consistency
- ✅ Accessibility compliance

---

## Individual Checks

### 1. Design System Compliance

Check for hard-coded values that violate the design system:

```bash
npm run audit:design
```

**What it checks:**
- Hard-coded hex colors (`#1F2937`)
- RGB/HSL colors (`rgb(31, 41, 55)`)
- Named colors (`red`, `blue`, etc.)
- Hard-coded padding/margin (`padding: 16px`)
- Hard-coded font sizes (`font-size: 14px`)
- Hard-coded font families
- Inline styles with design properties

**Example violation:**
```vue
<style>
.button {
  color: #FFFFFF;  /* ❌ Should use var(--text-primary) */
  padding: 16px;   /* ❌ Should use var(--spacing-md) */
}
</style>
```

**How to fix:**
```vue
<style>
.button {
  color: var(--text-primary);    /* ✅ Uses design token */
  padding: var(--spacing-md);  /* ✅ Uses spacing token */
}
</style>
```

---

###2. Color Contrast Validation

Ensure all colors meet WCAG standards:

```bash
npm run test:contrast
```

**What it checks:**
- Text on background contrast (light mode)
- Text on background contrast (dark mode)
- Accent color contrast
- Status color contrast (success, warning, error)
- Minimum 4.5:1 for normal text (AA)
- Minimum 7:1 for AAA compliance

**Example output:**
```
✅ Primary text on surface: 16.2:1 | 🏆 AAA
✅ Secondary text on surface: 7.1:1 | 🏆 AAA
✅ Accent color on surface: 5.2:1 | ✓ AA
```

**If violations found:**
1. Open `src/assets/css/design-system.css`
2. Adjust the color values
3. Use https://contrast-ratio.com to test
4. Re-run `npm run test:contrast`

---

### 3. CSS Linting

Enforce design token usage via Stylelint:

```bash
npm run lint:css
```

**What it enforces:**
- No hex colors in CSS
- No RGB/HSL color functions
- Must use CSS custom properties
- Proper unit usage (px, rem, em, %)

**Auto-fix:** Most issues are automatically fixed with `--fix` flag (already enabled)

---

### 4. Theme Consistency

Test dark mode functionality:

```bash
npm run test:theme
```

**What it tests:**
- Theme toggle button works
- Theme persists in localStorage
- Theme persists across page navigation
- All pages render in both themes
- CSS variables are properly defined
- No console errors during theme switch

---

### 5. Accessibility Audit

WCAG 2.1 compliance testing:

```bash
npm run test:a11y
```

**What it tests:**
- Color contrast compliance
- Keyboard navigation
- Tab order
- Focus indicators
- ARIA labels and attributes
- Landmark regions
- Heading hierarchy
- Screen reader compatibility

**Common violations:**
- Missing ARIA labels on buttons
- Insufficient color contrast
- Missing focus indicators
- Improper heading hierarchy
- Links without accessible names

---

### 6. Visual Regression Testing

Capture screenshots for visual comparison:

**With Percy (recommended for CI/CD):**
```bash
export PERCY_TOKEN=your_token_here
npm run test:visual
```

**Without Percy (local screenshots):**
```bash
npm run test:visual-local
```

**What it captures:**
- All critical pages
- Light and dark modes
- Mobile, tablet, desktop viewports
- Button states
- Form input states
- Component variations

---

## Interpreting Results

### Design System Audit

**Success:**
```
✅ All files comply with the design system!
   No violations found.
```

**Violations Found:**
```
❌ Found 15 design system violations in 3 files:

📊 Summary:
   🔴 Errors: 10
   🟡 Warnings: 5

🔴 ERRORS (must fix):

📄 src/components/Button.vue
   ├─ Hard-coded hex color found (3 occurrences)
   ├─ 💡 Use CSS custom properties like var(--text-primary)
   ├─ Line 45: #1F2937
   ├─ Line 52: #FFFFFF
   └─ Line 60: #0F62FE
```

**Action:** Fix all errors before committing

---

### Contrast Validation

**Pass:**
```
🎨 Light Mode Theme Contrast Validation
✅ Primary text on surface: 16.26:1 | 🏆 AAA
✅ Accent color on surface: 4.72:1 | ✓ AA
```

**Fail:**
```
❌ Secondary text on surface: 2.89:1 (needs 4.5:1)

⚠️  Critical Issues:
   • Secondary text on base background: 2.89:1 (needs 4.5:1)
```

**Action:** Adjust colors in design-system.css

---

### Accessibility Audit

**Pass:**
```
✓ Dashboard - Light Mode (500ms)
✓ Dashboard - Dark Mode (480ms)
✓ Routes - Light Mode (510ms)
```

**Fail:**
```
❌ Accessibility violations on Dashboard (Light Mode):

  button-name: Buttons must have discernible text
  Impact: critical
  Affected elements: 2
    - <button class="icon-btn"><i class="bi bi-x"></i></button>

  color-contrast: Elements must have sufficient color contrast
  Impact: serious
  Affected elements: 5
    - <span class="label-secondary">Last updated...</span>
```

**Action:** Add ARIA labels and improve contrast

---

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/design-quality.yml`:

```yaml
name: Design Quality

on:
  pull_request:
    paths:
      - 'src/**/*.vue'
      - 'src/**/*.css'
      - '.stylelintrc.json'

jobs:
  design-validation:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run design system audit
        run: npm run audit:design
      
      - name: Validate color contrast
        run: npm run test:contrast
      
      - name: Run accessibility tests
        run: npm run test:a11y
      
      - name: Visual regression (Percy)
        env:
          PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
        run: npm run test:visual
```

---

## Fixing Common Issues

### Hard-Coded Colors

**Before:**
```vue
<style scoped>
.header {
  background: #1E293B;
  color: #F8FAFC;
}
</style>
```

**After:**
```vue
<style scoped>
.header {
  background: var(--bg-surface);
  color: var(--text-primary);
}
</style>
```

---

### Hard-Coded Spacing

**Before:**
```vue
<style scoped>
.card {
  padding: 24px;
  margin: 16px;
  gap: 12px;
}
</style>
```

**After:**
```vue
<style scoped>
.card {
  padding: var(--spacing-lg);
  margin: var(--spacing-md);
  gap: var(--spacing-sm);
}
</style>
```

---

### Contrast Issues

**Before (2.5:1 - fails AA):**
```css
:root {
  --bg-surface: #FFFFFF;
  --text-secondary: #9CA3AF;  /* Too light! */
}
```

**After (7.2:1 - passes AAA):**
```css
:root {
  --bg-surface: #FFFFFF;
  --text-secondary: #6B7280;  /* Sufficient contrast */
}
```

---

### Missing ARIA Labels

**Before:**
```vue
<button @click="close">
  <i class="bi bi-x"></i>
</button>
```

**After:**
```vue
<button @click="close" aria-label="Close dialog">
  <i class="bi bi-x" aria-hidden="true"></i>
</button>
```

---

## Best Practices

### 1. Use Design Tokens Everywhere

```css
/* ✅ Good */
color: var(--text-primary);
padding: var(--spacing-md);
font-size: var(--font-size-base);

/* ❌ Bad */
color: #1F2937;
padding: 16px;
font-size: 14px;
```

### 2. Test Both Themes

Always verify changes in both light and dark mode:

```bash
npm run test:theme
```

### 3. Validate Accessibility

Run accessibility tests before committing:

```bash
npm run test:a11y
```

### 4. Check Contrast

Ensure sufficient contrast ratios:

```bash
npm run test:contrast
```

### 5. Automated Pre-commit Checks

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
npm run lint:design
```

---

## Troubleshooting

### Test Failures

**Issue:** "Design system audit finds too many violations"
- **Solution:** Refactor gradually, one component at a time
- **Tip:** Start with new components, then tackle existing ones

**Issue:** "Contrast test fails in dark mode"
- **Solution:** Lighten text colors or darken backgrounds
- **Tip:** Use https://leonardocolor.io for accessible palettes

**Issue:** "Percy visual tests timeout"
- **Solution:** Increase timeout in playwright.config.ts
- **Tip:** Mock slow API calls

**Issue:** "Accessibility tests fail with many violations"
- **Solution:** Focus on "critical" and "serious" impacts first
- **Tip:** Use browser axe DevTools extension for debugging

---

## Resources

- [Design System Docs](./DESIGN_SYSTEM.md)
- [Design Review Workflow](../../.agent/workflows/design-review.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Color Contrast Checker](https://contrast-ratio.com)
- [Percy Documentation](https://docs.percy.io/)
- [Stylelint Documentation](https://stylelint.io/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

---

## Getting Help

1. **Check documentation:** Read DESIGN_SYSTEM.md
2. **Run audit:** `npm run audit:design`
3. **Review workflow:** `.agent/workflows/design-review.md`
4. **Ask the team:** Consult design/frontend leads
5. **Use tools:** Browser DevTools, axe extension, contrast checkers
