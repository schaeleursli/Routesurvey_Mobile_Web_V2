#!/usr/bin/env node

/**
 * Design System Migration Script
 * Automatically replaces hard-coded CSS values with design tokens
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define replacement mappings
const replacements = [
    // Border radius - most common violations
    { pattern: /border-radius:\s*2px/g, replacement: 'border-radius: var(--radius-sm)', comment: '2px → --radius-sm (4px)' },
    { pattern: /border-radius:\s*4px/g, replacement: 'border-radius: var(--radius-sm)', comment: '4px → --radius-sm' },
    { pattern: /border-radius:\s*6px/g, replacement: 'border-radius: var(--radius-md)', comment: '6px → --radius-md' },
    { pattern: /border-radius:\s*8px/g, replacement: 'border-radius: var(--radius-lg)', comment: '8px → --radius-lg' },
    { pattern: /border-radius:\s*10px/g, replacement: 'border-radius: var(--radius-xl)', comment: '10px → --radius-xl (12px - close enough)' },
    { pattern: /border-radius:\s*12px/g, replacement: 'border-radius: var(--radius-xl)', comment: '12px → --radius-xl' },
    { pattern: /border-radius:\s*16px/g, replacement: 'border-radius: var(--radius-2xl)', comment: '16px → --radius-2xl' },

    // Padding - common violations
    { pattern: /padding:\s*4px/g, replacement: 'padding: var(--spacing-2xs)', comment: '4px → --spacing-2xs' },
    { pattern: /padding:\s*5px/g, replacement: 'padding: var(--spacing-xs)', comment: '5px → --spacing-xs (8px - close enough)' },
    { pattern: /padding:\s*8px/g, replacement: 'padding: var(--spacing-xs)', comment: '8px → --spacing-xs' },
    { pattern: /padding:\s*12px/g, replacement: 'padding: var(--spacing-sm)', comment: '12px → --spacing-sm' },
    { pattern: /padding:\s*15px/g, replacement: 'padding: var(--spacing-md)', comment: '15px → --spacing-md (16px)' },
    { pattern: /padding:\s*16px/g, replacement: 'padding: var(--spacing-md)', comment: '16px → --spacing-md' },
    { pattern: /padding:\s*20px/g, replacement: 'padding: var(--spacing-lg)', comment: '20px → --spacing-lg (24px)' },
    { pattern: /padding:\s*24px/g, replacement: 'padding: var(--spacing-lg)', comment: '24px → --spacing-lg' },
    { pattern: /padding:\s*32px/g, replacement: 'padding: var(--spacing-xl)', comment: '32px → --spacing-xl' },

    // Margin - common violations
    { pattern: /margin:\s*4px/g, replacement: 'margin: var(--spacing-2xs)', comment: '4px → --spacing-2xs' },
    { pattern: /margin:\s*5px/g, replacement: 'margin: var(--spacing-xs)', comment: '5px → --spacing-xs (8px)' },
    { pattern: /margin:\s*8px/g, replacement: 'margin: var(--spacing-xs)', comment: '8px → --spacing-xs' },
    { pattern: /margin:\s*12px/g, replacement: 'margin: var(--spacing-sm)', comment: '12px → --spacing-sm' },
    { pattern: /margin:\s*16px/g, replacement: 'margin: var(--spacing-md)', comment: '16px → --spacing-md' },
    { pattern: /margin:\s*20px/g, replacement: 'margin: var(--spacing-lg)', comment: '20px → --spacing-lg (24px)' },
    { pattern: /margin:\s*24px/g, replacement: 'margin: var(--spacing-lg)', comment: '24px → --spacing-lg' },
    { pattern: /margin:\s*32px/g, replacement: 'margin: var(--spacing-xl)', comment: '32px → --spacing-xl' },
];

// Files to migrate (top priority from design review)
const TARGET_FILES = [
    'src/views/routes/RouteViewOnlyWithOverlay.vue',
    'src/views/routes/RouteViewOnly.vue',
    'src/views/routes/RouteFilterView.vue',
    'src/views/templates/admin/AddTemplate.vue',
    'src/views/templates/admin/EditTemplate.vue',
    'src/views/settings/MfaSettings.vue',
    'src/views/routes/RouteManager.vue',
    'src/views/routes/Routes.vue',
];

let totalFiles = 0;
let totalReplacements = 0;

function migrateFile(filePath) {
    try {
        const absolutePath = path.resolve(filePath);

        if (!fs.existsSync(absolutePath)) {
            console.log(`⚠️  File not found: ${filePath}`);
            return false;
        }

        let content = fs.readFileSync(absolutePath, 'utf8');
        let changed = false;
        let fileReplacements = 0;

        replacements.forEach(({ pattern, replacement, comment }) => {
            const matches = content.match(pattern);
            if (matches) {
                content = content.replace(pattern, replacement);
                changed = true;
                fileReplacements += matches.length;
            }
        });

        if (changed) {
            fs.writeFileSync(absolutePath, content, 'utf8');
            console.log(`✅ ${path.basename(filePath)} - ${fileReplacements} replacements`);
            totalFiles++;
            totalReplacements += fileReplacements;
            return true;
        } else {
            console.log(`ℹ️  ${path.basename(filePath)} - no changes needed`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error migrating ${filePath}:`, error.message);
        return false;
    }
}

function main() {
    console.log('🚀 Starting Design System Migration\n');
    console.log('Replacing hard-coded values with design tokens...\n');

    TARGET_FILES.forEach(file => {
        migrateFile(file);
    });

    console.log('\n' + '='.repeat(50));
    console.log(`📊 Migration Summary:`);
    console.log(`   Files modified: ${totalFiles}`);
    console.log(`   Total replacements: ${totalReplacements}`);
    console.log('='.repeat(50));

    if (totalFiles > 0) {
        console.log('\n💡 Next steps:');
        console.log('   1. Review the changes with git diff');
        console.log('   2. Test the affected components');
        console.log('   3. Run npm run audit:design to verify');
    }
}

// Run the migration
main();
