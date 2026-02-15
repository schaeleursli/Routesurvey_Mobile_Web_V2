// MSW Browser Setup for Permits Mock Data
// Place this in src/mocks/browser.ts or integrate into existing MSW setup

import { setupWorker } from 'msw/browser';
import { permitsHandlers } from './permits/permits.msw';

import { authHandlers } from './auth.msw';

// Combine with other handlers if you have them
export const worker = setupWorker(...permitsHandlers, ...authHandlers);

/**
 * Usage in main.ts or main.js:
 * 
 * if (import.meta.env.DEV) {
 *   const { worker } = await import('./mocks/browser');
 *   await worker.start({
 *     onUnhandledRequest: 'bypass', // Don't warn for non-mocked requests
 *   });
 *   console.log('🔶 MSW enabled - using mock permits data');
 * }
 */
