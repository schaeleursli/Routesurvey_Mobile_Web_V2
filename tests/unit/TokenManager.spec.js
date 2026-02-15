import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import TokenManager from '@/utils/token-manager'
import Cookies from 'js-cookie'

// Mock dependencies
vi.mock('js-cookie')
const refreshTokenMock = vi.fn()
vi.mock('@/stores/auth', () => ({
    useAuthStore: () => ({
        refreshToken: refreshTokenMock
    })
}))

describe('TokenManager', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Reset singleton state if possible or rely on mocks
        TokenManager.stopTokenMonitoring()
    })

    afterEach(() => {
        TokenManager.cleanup()
    })

    describe('isTokenExpired', () => {
        it('returns true if token is invalid or missing payload', () => {
            expect(TokenManager.isTokenExpired('invalid-token')).toBe(true)
        })

        it('returns true if token is expired', () => {
            // Mock decodeJWT implementation
            const spy = vi.spyOn(TokenManager, 'decodeJWT').mockReturnValue({ exp: Math.floor(Date.now() / 1000) - 100 })

            expect(TokenManager.isTokenExpired('any-token')).toBe(true)
            spy.mockRestore()
        })

        it('returns false if token is valid', () => {
            const spy = vi.spyOn(TokenManager, 'decodeJWT').mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 })

            expect(TokenManager.isTokenExpired('any-token')).toBe(false)
            spy.mockRestore()
        })
    })

    describe('init', () => {
        it('starts monitoring if token exists and is valid', () => {
            Cookies.get.mockReturnValue('valid-token')
            const spyExpired = vi.spyOn(TokenManager, 'isTokenExpired').mockReturnValue(false)
            const spyStart = vi.spyOn(TokenManager, 'startTokenMonitoring')

            TokenManager.init()

            expect(spyStart).toHaveBeenCalled()
            spyExpired.mockRestore()
            spyStart.mockRestore()
        })

        it('does not start monitoring if token is missing', () => {
            Cookies.get.mockReturnValue(undefined)
            const spyStart = vi.spyOn(TokenManager, 'startTokenMonitoring')

            TokenManager.init()

            expect(spyStart).not.toHaveBeenCalled()
            spyStart.mockRestore()
        })
    })

    describe('checkTokenExpiration', () => {
        it('refreshes token if it is expiring soon', async () => {
            Cookies.get.mockReturnValue('expiring-token')
            // Mock time to be "now"
            const now = Math.floor(Date.now() / 1000)
            vi.spyOn(TokenManager, 'decodeJWT').mockReturnValue({ exp: now + 60 }) // Expires in 60s (threshold is 5m)

            await TokenManager.checkTokenExpiration()

            expect(refreshTokenMock).toHaveBeenCalled()
        })

        it('does not refresh if token is fresh', async () => {
            Cookies.get.mockReturnValue('fresh-token')
            const now = Math.floor(Date.now() / 1000)
            vi.spyOn(TokenManager, 'decodeJWT').mockReturnValue({ exp: now + 3600 }) // Expires in 1h

            await TokenManager.checkTokenExpiration()

            expect(refreshTokenMock).not.toHaveBeenCalled()
        })
    })
})
