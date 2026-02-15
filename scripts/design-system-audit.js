#!/usr/bin/env node

/**
 * Design System Audit Script
 * 
 * Scans all Vue components and CSS files for design system compliance violations:
 * - Hard-coded colors (hex, rgb, named)
 * - Hard-coded pixel values for spacing/sizing
 * - Hard-coded font properties
 * - Inline style violations
 * 
 * Usage: node scripts/design-system-audit.js
 */

import fs from 'fs';
import path from 'path';
import globPkg from 'glob';
const { glob } = globPkg;

const PATTERNS = {
    hexColor: {
        regex: /#[0-9A-Fa-f]{3,8}(?![\w-])/g,
        message: 'Hard-coded hex color found',
        severity: 'error',
        suggestion: 'Use CSS custom properties like var(--text-primary) or var(--bg-surface)'
    },
    rgbColor: {
        regex: /\b(?:rgb|rgba|hsl|hsla)\s*\([^)]+\)/g,
        message: 'Hard-coded RGB/HSL color found',
        severity: 'error',
        suggestion: 'Use CSS custom properties for colors'
    },
    namedColor: {
        regex: /:\s*(red|blue|green|yellow|purple|pink|orange|gray|grey|black|white|brown|cyan|magenta|lime|navy|teal|olive|maroon|aqua|fuchsia|silver|gold|indigo|violet|coral|crimson|salmon|khaki|plum|orchid|turquoise|tan|beige|mint|lavender|peach)\s*[;}]/gi,
        message: 'Hard-coded named color found',
        severity: 'error',
        suggestion: 'Use CSS custom properties from the design system'
    },
    hardCodedPadding: {
        regex: /padding(?:-(?:top|right|bottom|left))?:\s*\d+px/g,
        message: 'Hard-coded padding value found',
        severity: 'warning',
        suggestion: 'Use spacing tokens like var(--spacing-md) or var(--spacing-lg)'
    },
    hardCodedMargin: {
        regex: /margin(?:-(?:top|right|bottom|left))?:\s*\d+px/g,
        message: 'Hard-coded margin value found',
        severity: 'warning',
        suggestion: 'Use spacing tokens like var(--spacing-md) or var(--spacing-lg)'
    },
    hardCodedFontSize: {
        regex: /font-size:\s*\d+px/g,
        message: 'Hard-coded font size found',
        severity: 'error',
        suggestion: 'Use font size tokens like var(--font-size-base) or var(--font-size-lg)'
    },
    hardCodedFontFamily: {
        regex: /font-family:\s*['"'][^'"]+['"']/g,
        message: 'Hard-coded font family found',
        severity: 'error',
        suggestion: 'Use font family tokens like var(--font-family-base) or var(--font-family-mono)'
    },
    hardCodedBorderRadius: {
        regex: /border-radius:\s*\d+px/g,
        message: 'Hard-coded border radius found',
        severity: 'warning',
        suggestion: 'Use border radius tokens like var(--radius-md) or var(--radius-lg)'
    },
    inlineStyles: {
        regex: /style=["'][^"']*(?:color|background|padding|margin|font-size):[^"']*["']/g,
        message: 'Inline styles found (potential design system violation)',
        severity: 'warning',
        suggestion: 'Use CSS classes with design tokens instead of inline styles'
    }
};

const EXCLUDED_PATTERNS = [
    '**/node_modules/**',
    '**/dist/**',
    '**/coverage/**',
    '**/*.spec.js',
    '**/*.test.js',
    '**/design-system.css' // Allow hard-coded values in the design system definition
];

async function auditDesignSystem() {
    console.log('🔍 Starting Design System Audit...\n');

    // Find all Vue and CSS files using callback API
    const files = await new Promise((resolve, reject) => {
        glob('src/**/*.{vue,css}', {
            ignore: EXCLUDED_PATTERNS,
            absolute: true
        }, (err, matches) => {
            if (err) reject(err);
            else resolve(matches);
        });
    });

    console.log(`📁 Scanning ${files.length} files...\n`);

    const violations = [];
    let totalViolations = 0;

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const fileViolations = [];

        // Check each pattern
        for (const [patternName, pattern] of Object.entries(PATTERNS)) {
            const matches = [...content.matchAll(pattern.regex)];

            if (matches.length > 0) {
                // Get line numbers for each match
                const lines = content.split('\n');
                const matchesWithLines = matches.map(match => {
                    const position = match.index;
                    let lineNumber = 1;
                    let currentPos = 0;

                    for (let i = 0; i < lines.length; i++) {
                        currentPos += lines[i].length + 1; // +1 for newline
                        if (currentPos > position) {
                            lineNumber = i + 1;
                            break;
                        }
                    }

                    return {
                        match: match[0],
                        line: lineNumber,
                        context: lines[lineNumber - 1]?.trim()
                    };
                });

                fileViolations.push({
                    pattern: patternName,
                    ...pattern,
                    matches: matchesWithLines,
                    count: matches.length
                });

                totalViolations += matches.length;
            }
        }

        if (fileViolations.length > 0) {
            violations.push({
                file: path.relative(process.cwd(), file),
                violations: fileViolations
            });
        }
    }

    // Generate report
    if (violations.length === 0) {
        console.log('✅ All files comply with the design system!');
        console.log('   No violations found.\n');
        return true;
    }

    console.log(`❌ Found ${totalViolations} design system violations in ${violations.length} files:\n`);

    const errorCount = violations.reduce((sum, v) =>
        sum + v.violations.filter(viol => viol.severity === 'error').length, 0
    );
    const warningCount = violations.reduce((sum, v) =>
        sum + v.violations.filter(viol => viol.severity === 'warning').length, 0
    );

    console.log(`📊 Summary:`);
    console.log(`   🔴 Errors: ${errorCount}`);
    console.log(`   🟡 Warnings: ${warningCount}\n`);

    // Group by severity
    const errors = violations.filter(v => v.violations.some(viol => viol.severity === 'error'));
    const warnings = violations.filter(v => v.violations.some(viol => viol.severity === 'warning'));

    // Report errors first
    if (errors.length > 0) {
        console.log('🔴 ERRORS (must fix):\n');
        errors.forEach(({ file, violations: fileViolations }) => {
            console.log(`📄 ${file}`);
            fileViolations.filter(v => v.severity === 'error').forEach(violation => {
                console.log(`   ├─ ${violation.message} (${violation.count} occurrences)`);
                console.log(`   ├─ 💡 ${violation.suggestion}`);

                // Show first 3 examples
                violation.matches.slice(0, 3).forEach((match, idx) => {
                    const prefix = idx === Math.min(2, violation.matches.length - 1) ? '   └─' : '   ├─';
                    console.log(`${prefix} Line ${match.line}: ${match.match}`);
                });

                if (violation.matches.length > 3) {
                    console.log(`   └─ ... and ${violation.matches.length - 3} more`);
                }
                console.log('');
            });
            console.log('');
        });
    }

    // Report warnings
    if (warnings.length > 0 && process.env.SHOW_WARNINGS !== 'false') {
        console.log('🟡 WARNINGS (should fix):\n');
        warnings.forEach(({ file, violations: fileViolations }) => {
            console.log(`📄 ${file}`);
            fileViolations.filter(v => v.severity === 'warning').forEach(violation => {
                console.log(`   ├─ ${violation.message} (${violation.count} occurrences)`);
                console.log(`   └─ 💡 ${violation.suggestion}\n`);
            });
        });
    }

    console.log('\n📝 Recommendations:');
    console.log('   1. Use CSS custom properties from src/assets/css/design-system.css');
    console.log('   2. For spacing, use var(--spacing-*) tokens');
    console.log('   3. For colors, use var(--text-*), var(--bg-*), var(--accent)');
    console.log('   4. For typography, use var(--font-size-*) and var(--font-family-*)');
    console.log('   5. Avoid inline styles, use CSS classes instead\n');

    // Exit with error if there are errors
    if (errorCount > 0) {
        process.exit(1);
    }

    return false;
}

// Run the audit
auditDesignSystem().catch(error => {
    console.error('❌ Audit failed:', error);
    process.exit(1);
});
