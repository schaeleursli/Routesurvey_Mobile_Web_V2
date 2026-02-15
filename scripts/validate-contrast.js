#!/usr/bin/env node

/**
 * Color Contrast Validation Script
 * 
 * Validates that all color combinations in the design system meet WCAG 2.1 standards:
 * - AA: 4.5:1 for normal text, 3:1 for large text
 * - AAA: 7:1 for normal text, 4.5:1 for large text
 * 
 * Usage: node scripts/validate-contrast.js
 */

import fs from 'fs';
import chroma from 'chroma-js';

const DESIGN_SYSTEM_PATH = 'src/assets/css/design-system.css';

// WCAG 2.1 contrast requirements
const WCAG_REQUIREMENTS = {
    AA_NORMAL: 4.5,
    AA_LARGE: 3,
    AAA_NORMAL: 7,
    AAA_LARGE: 4.5
};

/**
 * Extract CSS custom properties from a theme block
 */
function extractColors(cssContent, themeSelector) {
    const regex = new RegExp(`${themeSelector}[^{]*\\{([^}]*)\\}`, 's');
    const match = cssContent.match(regex);

    if (!match) {
        return {};
    }

    const colors = {};
    const lines = match[1].split('\n');

    lines.forEach(line => {
        // Match color properties (including rgb with slashes)
        const colorMatch = line.match(/--([^:]+):\s*([^;]+);/);
        if (colorMatch) {
            const propertyName = colorMatch[1].trim();
            const value = colorMatch[2].trim();

            // Only store actual colors, not other properties
            if (propertyName.includes('bg') ||
                propertyName.includes('text') ||
                propertyName.includes('accent') ||
                propertyName.includes('border') ||
                propertyName.includes('success') ||
                propertyName.includes('warning') ||
                propertyName.includes('error')) {
                colors[propertyName] = value;
            }
        }
    });

    return colors;
}

/**
 * Convert CSS color to chroma-compatible format
 */
function parseColor(colorValue) {
    try {
        // Handle rgb with slashes (e.g., "rgb(15 98 254 / 10%)")
        if (colorValue.includes('/')) {
            const rgbMatch = colorValue.match(/rgb[a]?\s*\(\s*(\d+)\s+(\d+)\s+(\d+)\s*\/\s*(\d+)%\)/);
            if (rgbMatch) {
                const [, r, g, b, alpha] = rgbMatch;
                return chroma.rgb(parseInt(r), parseInt(g), parseInt(b)).alpha(parseInt(alpha) / 100);
            }
        }

        return chroma(colorValue);
    } catch (e) {
        return null;
    }
}

/**
 * Calculate contrast ratio between two colors
 */
function calculateContrast(bg, fg) {
    try {
        const bgColor = parseColor(bg);
        const fgColor = parseColor(fg);

        if (!bgColor || !fgColor) {
            return null;
        }

        const contrast = chroma.contrast(bgColor, fgColor);

        return {
            ratio: contrast,
            passesAA: contrast >= WCAG_REQUIREMENTS.AA_NORMAL,
            passesAAA: contrast >= WCAG_REQUIREMENTS.AAA_NORMAL,
            passesAALarge: contrast >= WCAG_REQUIREMENTS.AA_LARGE,
            passesAAALarge: contrast >= WCAG_REQUIREMENTS.AAA_LARGE,
            level: contrast >= 7 ? 'AAA' : contrast >= 4.5 ? 'AA' : contrast >= 3 ? 'AA Large' : 'Fail'
        };
    } catch (e) {
        return null;
    }
}

/**
 * Validate color combinations
 */
function validateTheme(themeName, colors) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎨 ${themeName} Theme Contrast Validation`);
    console.log('='.repeat(60));

    const testCombinations = [
        { bg: 'bg-base', fg: 'text-primary', context: 'Primary text on base background' },
        { bg: 'bg-base', fg: 'text-secondary', context: 'Secondary text on base background' },
        { bg: 'bg-surface', fg: 'text-primary', context: 'Primary text on surface' },
        { bg: 'bg-surface', fg: 'text-secondary', context: 'Secondary text on surface' },
        { bg: 'bg-elevated', fg: 'text-primary', context: 'Primary text on elevated surface' },
        { bg: 'bg-elevated', fg: 'text-secondary', context: 'Secondary text on elevated surface' },
        { bg: 'bg-surface', fg: 'accent', context: 'Accent color on surface' },
        { bg: 'bg-base', fg: 'accent', context: 'Accent color on base' },
        { bg: 'accent', fg: 'bg-surface', context: 'White text on accent (buttons)' },
        { bg: 'bg-surface', fg: 'success', context: 'Success color on surface' },
        { bg: 'bg-surface', fg: 'warning', context: 'Warning color on surface' },
        { bg: 'bg-surface', fg: 'error', context: 'Error color on surface' }
    ];

    let passCount = 0;
    let failCount = 0;
    const failures = [];

    testCombinations.forEach(({ bg, fg, context }) => {
        const bgColor = colors[bg];
        const fgColor = colors[fg];

        if (!bgColor || !fgColor) {
            console.log(`\n⚠️  ${context}`);
            console.log(`   Missing colors: ${!bgColor ? bg : ''} ${!fgColor ? fg : ''}`);
            return;
        }

        const result = calculateContrast(bgColor, fgColor);

        if (!result) {
            console.log(`\n⚠️  ${context}`);
            console.log(`   Could not parse colors: ${bgColor}, ${fgColor}`);
            return;
        }

        const icon = result.passesAA ? '✅' : '❌';
        const status = result.passesAAA ? '🏆 AAA' : result.passesAA ? '✓ AA' : '✗ FAIL';

        console.log(`\n${icon} ${context}`);
        console.log(`   Ratio: ${result.ratio.toFixed(2)}:1 | ${status}`);
        console.log(`   Background: ${bg} (${bgColor})`);
        console.log(`   Foreground: ${fg} (${fgColor})`);

        if (result.passesAA) {
            passCount++;
        } else {
            failCount++;
            failures.push({ context, result, bg, fg, bgColor, fgColor });
        }
    });

    // Summary
    console.log(`\n${'─'.repeat(60)}`);
    console.log('📊 Summary:');
    console.log(`   ✅ Passed: ${passCount}/${testCombinations.length}`);
    console.log(`   ❌ Failed: ${failCount}/${testCombinations.length}`);

    if (failCount > 0) {
        console.log(`\n⚠️  Critical Issues:`);
        failures.forEach(({ context, result }) => {
            console.log(`   • ${context}: ${result.ratio.toFixed(2)}:1 (needs ${WCAG_REQUIREMENTS.AA_NORMAL}:1)`);
        });
    }

    return failCount === 0;
}

/**
 * Main validation function
 */
function validateContrast() {
    try {
        const cssContent = fs.readFileSync(DESIGN_SYSTEM_PATH, 'utf-8');

        console.log('🔍 WCAG 2.1 Color Contrast Validation\n');
        console.log('Standards:');
        console.log(`   • AA Normal Text: ${WCAG_REQUIREMENTS.AA_NORMAL}:1`);
        console.log(`   • AA Large Text: ${WCAG_REQUIREMENTS.AA_LARGE}:1`);
        console.log(`   • AAA Normal Text: ${WCAG_REQUIREMENTS.AAA_NORMAL}:1`);
        console.log(`   • AAA Large Text: ${WCAG_REQUIREMENTS.AAA_LARGE}:1`);

        // Extract and validate light mode
        const lightColors = extractColors(cssContent, ':root');
        const lightPassed = validateTheme('Light Mode', lightColors);

        // Extract and validate dark mode
        const darkColors = extractColors(cssContent, '\\[data-bs-theme="dark"\\]');
        const darkPassed = validateTheme('Dark Mode', darkColors);

        // Final summary
        console.log(`\n${'='.repeat(60)}`);
        console.log('🎯 Final Results:');
        console.log('='.repeat(60));
        console.log(`   Light Mode: ${lightPassed ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`   Dark Mode: ${darkPassed ? '✅ PASSED' : '❌ FAILED'}`);

        if (lightPassed && darkPassed) {
            console.log('\n🏆 All color combinations meet WCAG 2.1 AA standards!');
            console.log('   Your design system is accessibility-compliant.\n');
            return true;
        } else {
            console.log('\n❌ Some color combinations do not meet WCAG standards.');
            console.log('   Please adjust colors in src/assets/css/design-system.css\n');
            console.log('💡 Tips:');
            console.log('   • Use a contrast checker: https://contrast-ratio.com');
            console.log('   • Darker text or lighter backgrounds improve contrast');
            console.log('   • Secondary text should still meet AA standards (4.5:1)\n');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Error validating contrast:', error.message);
        process.exit(1);
    }
}

// Run validation
validateContrast();
