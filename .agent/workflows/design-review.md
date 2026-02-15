---
description: Run comprehensive autonomous UI design review
---

# Autonomous UI Design Review Workflow

This workflow runs a comprehensive design review to ensure UI/UX quality, consistency, and WCAG compliance across light and dark modes.

## Prerequisites

- Development server running (`npm run dev`)
- Percy API token (optional, for visual regression)
- All dependencies installed

## Steps

### 1. Run Design System Audit

Scan all Vue components and CSS files for hard-coded values that violate the design system:

```bash
npm run audit:design
```

This checks for:
- Hard-coded hex colors
- Hard-coded RGB/HSL colors
- Named colors (red, blue, etc.)
- Hard-coded padding/margin values
- Hard-coded font sizes and families
- Inline styles

**Expected result:** Zero violations or documented exceptions

---

### 2. Validate Color Contrast

Check that all color combinations meet WCAG 2.1 standards:

```bash
npm run test:contrast
```

This validates:
- Text colors on backgrounds (light mode)
- Text colors on backgrounds (dark mode)
- Accent colors and status colors
- AA compliance (4.5:1 minimum)
- AAA compliance (7:1 for enhanced accessibility)

**Expected result:** All color combinations meet at least AA standards

---

### 3. Run CSS Linting

Enforce strict design token usage in all stylesheets:

```bash
npm run lint:css
```

This enforces:
-No hex colors in CSS
- No hard-coded RGB/HSL colors
- CSS custom properties for all design values
- Consistent unit usage

**Expected result:** All CSS files pass or auto-fixed

---

### 4. Test Theme Consistency

Verify dark mode functionality and persistence:

```bash
npm run test:theme
```

This tests:
- Theme toggle functionality
- Theme persistence across navigation
- All components render in both themes
- No theme-related console errors

**Expected result:** All theme tests pass

---

### 5. Run Accessibility Audit

Test WCAG 2.1 AA/AAA compliance:

```bash
npm run test:a11y
```

This validates:
- Color contrast ratios
- Keyboard navigation
- ARIA attributes
- Screen reader compatibility
- Focus management
- Heading hierarchy

**Expected result:** Zero accessibility violations

---

### 6. Visual Regression Testing (Optional)

Capture screenshots for visual comparison:

**With Percy:**
```bash
export PERCY_TOKEN=your_percy_token
npm run test:visual
```

**Without Percy (local screenshots):**
```bash
npm run test:visual-local
```

This captures:
- All critical pages in light/dark mode
- Multiple viewport sizes
- Component states
- Visual diffs detected automatically

**Expected result:** No unexpected visual changes

---

### 7. Run Full Design Validation Suite

Execute all design tests together:

```bash
npm run test:design
```

This runs in sequence:
1. CSS linting
2. Design system audit
3. Color contrast validation
4. Theme consistency tests
5. Accessibility audits

**Expected result:** All tests pass

---

## Continuous Integration

Add to your CI/CD pipeline (.github/workflows/design-quality.yml):

```yaml
name: Design Quality

on: [pull_request]

jobs:
 design-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:design
```

---

## Fixing Violations

When violations are found:

### Design System Violations

1. Replace hard-coded colors with CSS variables:
   ```css
   /* ❌ Bad */
   color: #1F2937;
   
   /* ✅ Good */
   color: var(--text-primary);
   ```

2. Use spacing tokens:
   ```css
   /* ❌ Bad */
   padding: 16px;
   
   /* ✅ Good */
   padding: var(--spacing-md);
   ```

3. Use typography tokens:
   ```css
   /* ❌ Bad */
   font-size: 14px;
   
   /* ✅ Good */
   font-size: var(--font-size-base);
   ```

### Contrast Violations

1. Adjust colors in `src/assets/css/design-system.css`
2. Use a contrast checker: https://contrast-ratio.com
3. Re-run `npm run test:contrast` to verify

### Accessibility Violations

1. Add ARIA labels where needed
2. Ensure keyboard navigation works
3. Fix focus indicators
4. Verify heading hierarchy
5. Re-run `npm run test:a11y` to verify

---

## Best Practices

1. **Run before committing:** Use `npm run lint:design` before each commit
2. **Review Percy snapshots:** Check visual diffs in Percy dashboard
3. **Test both themes:** Always verify changes in light and dark mode
4. **Prioritize AA compliance:** AAA is nice-to-have, AA is required
5. **Use design tokens:** Never hard-code design values
6. **Document exceptions:** If you must break a rule, document why

---

## Troubleshooting

**Issue:** Design audit fails with many violations
- **Solution:** Gradually refactor components to use design tokens
- **Tip:** Start with new components, then refactor existing ones

**Issue:** Contrast tests fail
- **Solution:** Adjust colors in design-system.css
- **Tip:** Use https://leonardocolor.io for accessible color palettes

**Issue:** Visual tests timeout
- **Solution:** Increase timeout in test files or mock API calls
- **Tip:** Check that dev server is running

**Issue:** Accessibility tests fail
- **Solution:** Review axe-core output for specific violations
- **Tip:** Focus on critical violations first (impact: serious/critical)

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Contrast Checker](https://contrast-ratio.com)
- [WebAIM Color Contrast](https://webaim.org/resources/contrastchecker/)
- [Percy Documentation](https://docs.percy.io/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
