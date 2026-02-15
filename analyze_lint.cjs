/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');

try {
    const data = fs.readFileSync('lint-report.json', 'utf8');
    // Find the start of the JSON array
    const jsonStart = data.indexOf('[');
    if (jsonStart === -1) {
        throw new Error('No JSON content found in lint-report.json');
    }

    const cleanData = data.substring(jsonStart);
    const report = JSON.parse(cleanData);

    let fileStats = [];
    let ruleStats = {};

    report.forEach(file => {
        if (file.errorCount > 0 || file.warningCount > 0) {
            fileStats.push({
                path: file.filePath.replace(process.cwd() + '/', ''),
                errors: file.errorCount,
                warnings: file.warningCount,
                total: file.errorCount + file.warningCount
            });

            file.messages.forEach(msg => {
                if (!ruleStats[msg.ruleId]) {
                    ruleStats[msg.ruleId] = { count: 0, type: msg.severity === 2 ? 'error' : 'warning' };
                }
                ruleStats[msg.ruleId].count++;
            });
        }
    });

    // Sort by total issues
    fileStats.sort((a, b) => b.total - a.total);

    console.log('--- Top 10 Files by Issue Count ---');
    fileStats.slice(0, 10).forEach(f => {
        console.log(`${f.path}: ${f.total} (Err: ${f.errors}, Warn: ${f.warnings})`);
    });

    console.log('\n--- Top 10 Rules by Violation Count ---');
    Object.entries(ruleStats)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 10)
        .forEach(([rule, stat]) => {
            console.log(`${rule} (${stat.type}): ${stat.count}`);
        });

    console.log('\n--- Files with vue/no-parsing-error ---');
    report.forEach(file => {
        const hasParsingError = file.messages.some(m => m.ruleId === 'vue/no-parsing-error');
        if (hasParsingError) {
            console.log(file.filePath);
            file.messages.filter(m => m.ruleId === 'vue/no-parsing-error').forEach(m => console.log(`  Line ${m.line}: ${m.message}`));
        }
    });

    console.log('\n--- Files with no-constant-binary-expression ---');
    report.forEach(file => {
        const hasBinaryError = file.messages.some(m => m.ruleId === 'no-constant-binary-expression');
        if (hasBinaryError) {
            console.log(file.filePath);
            file.messages.filter(m => m.ruleId === 'no-constant-binary-expression').forEach(m => console.log(`  Line ${m.line}: ${m.message}`));
        }
    });

    console.log('\n--- Files with vue/no-side-effects-in-computed-properties ---');
    report.forEach(file => {
        const hasSideEffect = file.messages.some(m => m.ruleId === 'vue/no-side-effects-in-computed-properties');
        if (hasSideEffect) {
            console.log(file.filePath);
            file.messages.filter(m => m.ruleId === 'vue/no-side-effects-in-computed-properties').forEach(m => console.log(`  Line ${m.line}: ${m.message}`));
        }
    });

    console.log('\n--- Files with vue/no-mutating-props ---');
    report.forEach(file => {
        const hasMutation = file.messages.some(m => m.ruleId === 'vue/no-mutating-props');
        if (hasMutation) {
            console.log(file.filePath);
            file.messages.filter(m => m.ruleId === 'vue/no-mutating-props').forEach(m => console.log(`  Line ${m.line}: ${m.message}`));
        }
    });

    console.log('\n--- Files with @typescript-eslint/no-explicit-any ---');
    report.forEach(file => {
        const hasAny = file.messages.some(m => m.ruleId === '@typescript-eslint/no-explicit-any');
        if (hasAny) {
            console.log(`${file.filePath}: ${file.messages.filter(m => m.ruleId === '@typescript-eslint/no-explicit-any').length} issues`);
        }
    });
    const miscRules = [
        'no-empty-pattern',
        '@typescript-eslint/no-require-imports',
        'no-prototype-builtins',
        'no-cond-assign',
        'no-empty',
        'vue/no-unused-vars'
    ];

    console.log('\n--- Files with Miscellaneous Errors ---');
    report.forEach(file => {
        file.messages.forEach(m => {
            if (miscRules.includes(m.ruleId)) {
                console.log(`${file.filePath}: Line ${m.line} - ${m.ruleId}: ${m.message}`);
            }
        });
    });
} catch (e) {
    console.error('Error parsing report:', e.message);
    // console.error(e);
}
