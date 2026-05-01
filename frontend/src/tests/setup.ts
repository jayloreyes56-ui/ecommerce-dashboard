/**
 * Vitest + Testing Library setup.
 * Runs before every test file.
 */
import '@testing-library/jest-dom'
import { afterEach, beforeAll, afterAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './mocks/server'

// Start MSW before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))

// Reset handlers after each test so one test can't bleed into another
afterEach(() => {
  server.resetHandlers()
  cleanup()
})

// Clean up after all tests
afterAll(() => server.close())

// Silence console.error for expected error boundary renders
vi.spyOn(console, 'error').mockImplementation(() => {})
