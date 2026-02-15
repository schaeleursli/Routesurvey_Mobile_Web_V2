// Global setup for Vitest
import { cleanup } from '@testing-library/vue'
import { beforeAll, afterEach, afterAll } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { server } from '../mocks/server'

// Start server before all tests
beforeAll(() => server.listen())

// Reset handlers after each test `important for test isolation`
afterEach(() => {
    cleanup()
    server.resetHandlers()
})

// Close server after all tests
afterAll(() => server.close())
