import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
    plugins: [vue()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/tests/setup.js'], // Will create this if needed, or remove if not. Let's stick to simple first.
        // Actually, let's keep it simple for now as requested "Minimal".
        // I won't add setupFiles unless I need them (e.g. for cleanup).
        include: ['tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}', 'tests/components/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'coverage/**',
                'dist/**',
                '**/[.]**',
                'packages/*/test?(s)/**',
                '**/*.d.ts',
                '**/virtual:*',
                '**/__x00__*',
                '**/*{.,-}{test,spec}.?(c|m)js?(x)',
                'src/main.js',
            ],
        },
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@testing-library/vue': path.resolve(__dirname, '../../node_modules/@testing-library/vue'),
            '@testing-library/jest-dom': path.resolve(__dirname, '../../node_modules/@testing-library/jest-dom')
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
})
