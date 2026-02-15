import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

import vueTs from '@vue/eslint-config-typescript';

export default [
    {
        name: 'app/files-to-lint',
        files: ['**/*.{js,mjs,cjs,ts,vue}'],
    },
    {
        name: 'app/ignores',
        ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**', '**/*_backup*'],
    },
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2021
            }
        }
    },
    js.configs.recommended,
    ...pluginVue.configs['flat/essential'],
    ...vueTs(),
    {
        rules: {
            // Add custom rules here
            'vue/multi-word-component-names': 'off',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'warn',
            'no-undef': 'off',
            'vue/block-lang': 'off',
            'no-dupe-keys': 'warn',
            'vue/no-mutating-props': 'warn',
            'vue/no-unused-components': 'warn',
            'vue/return-in-emits-validator': 'warn',
            'no-cond-assign': 'warn',
            'no-case-declarations': 'warn',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/consistent-type-assertions': 'warn'
        }
    },
    prettier
];
