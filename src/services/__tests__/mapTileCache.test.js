/**
 * Test suite for mapTileCache.js
 * Tests offline tile caching functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import mapTileCache from '@/services/mapTileCache';

// Mock IndexedDB
const mockIndexedDB = {
    open: vi.fn(),
    deleteDatabase: vi.fn()
};

global.indexedDB = mockIndexedDB;

describe('mapTileCache', () => {
    let mockDB;
    let mockTransaction;
    let mockObjectStore;

    beforeEach(() => {
        // Reset mock DB structure
        mockObjectStore = {
            get: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
            openCursor: vi.fn(),
            count: vi.fn(),
            getAll: vi.fn()
        };

        mockTransaction = {
            objectStore: vi.fn(() => mockObjectStore),
            oncomplete: null,
            onerror: null
        };

        mockDB = {
            transaction: vi.fn(() => mockTransaction),
            createObjectStore: vi.fn(() => mockObjectStore),
            close: vi.fn()
        };

        const mockRequest = {
            onsuccess: null,
            onerror: null,
            onupgradeneeded: null,
            result: mockDB
        };

        mockIndexedDB.open.mockReturnValue(mockRequest);

        // Trigger success immediately
        setTimeout(() => {
            if (mockRequest.onsuccess) {
                mockRequest.onsuccess({ target: { result: mockDB } });
            }
        }, 0);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('init', () => {
        it('should initialize IndexedDB', async () => {
            await mapTileCache.init();

            expect(mockIndexedDB.open).toHaveBeenCalledWith('mapTileCache', 1);
        });

        it('should create object store on upgrade', async () => {
            const mockRequest = mockIndexedDB.open.mockReturnValue({
                onsuccess: null,
                onerror: null,
                onupgradeneeded: null
            });

            const initPromise = mapTileCache.init();

            // Trigger upgrade
            mockRequest.onupgradeneeded({ target: { result: mockDB } });
            mockRequest.onsuccess({ target: { result: mockDB } });

            await initPromise;

            expect(mockDB.createObjectStore).toHaveBeenCalledWith('tiles', {
                keyPath: 'key'
            });
        });
    });

    describe('cacheTile', () => {
        beforeEach(async () => {
            await mapTileCache.init();
            await mapTileCache.enable();
        });

        it('should store tile in cache', async () => {
            const tileUrl = 'https://tile.openstreetmap.org/14/4823/6160.png';
            const mockBlob = new Blob(['tile data'], { type: 'image/png' });

            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    blob: () => Promise.resolve(mockBlob)
                })
            );

            mockObjectStore.put.mockReturnValue({
                onsuccess: null,
                onerror: null
            });

            await mapTileCache.cacheTile(tileUrl, 14, 4823, 6160);

            expect(global.fetch).toHaveBeenCalledWith(tileUrl);
            expect(mockObjectStore.put).toHaveBeenCalled();
        });

        it('should not cache when disabled', async () => {
            await mapTileCache.disable();

            global.fetch = vi.fn();

            await mapTileCache.cacheTile('url', 14, 4823, 6160);

            expect(global.fetch).not.toHaveBeenCalled();
        });

        it('should handle fetch errors', async () => {
            global.fetch = vi.fn(() =>
                Promise.reject(new Error('Network error'))
            );

            await expect(
                mapTileCache.cacheTile('url', 14, 4823, 6160)
            ).rejects.toThrow('Network error');
        });
    });

    describe('getTile', () => {
        beforeEach(async () => {
            await mapTileCache.init();
            await mapTileCache.enable();
        });

        it('should retrieve cached tile', async () => {
            const mockBlob = new Blob(['tile data'], { type: 'image/png' });
            const mockTile = {
                key: '14/4823/6160',
                blob: mockBlob,
                timestamp: Date.now()
            };

            mockObjectStore.get.mockReturnValue({
                onsuccess: null,
                result: mockTile
            });

            setTimeout(() => {
                mockObjectStore.get().onsuccess({
                    target: { result: mockTile }
                });
            }, 0);

            const tile = await mapTileCache.getTile('url', 14, 4823, 6160);

            expect(tile).toBe(mockBlob);
        });

        it('should return null for missing tile', async () => {
            mockObjectStore.get.mockReturnValue({
                onsuccess: null,
                result: null
            });

            setTimeout(() => {
                mockObjectStore.get().onsuccess({
                    target: { result: null }
                });
            }, 0);

            const tile = await mapTileCache.getTile('url', 14, 4823, 6160);

            expect(tile).toBeNull();
        });
    });

    describe('cacheBoundingBox', () => {
        beforeEach(async () => {
            await mapTileCache.init();
            await mapTileCache.enable();
        });

        it('should cache all tiles in bounding box', async () => {
            const bounds = {
                north: 40.8,
                south: 40.7,
                east: -73.9,
                west: -74.0
            };

            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    blob: () => Promise.resolve(new Blob())
                })
            );

            mockObjectStore.put.mockReturnValue({
                onsuccess: null
            });

            const result = await mapTileCache.cacheBoundingBox(
                bounds,
                [14],
                'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            );

            expect(result.total).toBeGreaterThan(0);
            expect(result.cached).toBe(result.total);
        });

        it('should handle partial failures', async () => {
            const bounds = {
                north: 40.71,
                south: 40.70,
                east: -73.99,
                west: -74.00
            };

            let callCount = 0;
            global.fetch = vi.fn(() => {
                callCount++;
                if (callCount % 2 === 0) {
                    return Promise.reject(new Error('Failed'));
                }
                return Promise.resolve({
                    ok: true,
                    blob: () => Promise.resolve(new Blob())
                });
            });

            mockObjectStore.put.mockReturnValue({
                onsuccess: null
            });

            const result = await mapTileCache.cacheBoundingBox(
                bounds,
                [14],
                'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            );

            expect(result.cached).toBeLessThan(result.total);
            expect(result.failed).toBeGreaterThan(0);
        });
    });

    describe('getStats', () => {
        beforeEach(async () => {
            await mapTileCache.init();
        });

        it('should return cache statistics', async () => {
            mockObjectStore.count.mockReturnValue({
                onsuccess: null,
                result: 42
            });

            mockObjectStore.getAll.mockReturnValue({
                onsuccess: null,
                result: [
                    { blob: new Blob(['x'.repeat(1000)]) },
                    { blob: new Blob(['x'.repeat(2000)]) }
                ]
            });

            setTimeout(() => {
                mockObjectStore.count().onsuccess({
                    target: { result: 42 }
                });
                mockObjectStore.getAll().onsuccess({
                    target: {
                        result: [
                            { blob: new Blob(['x'.repeat(1000)]) },
                            { blob: new Blob(['x'.repeat(2000)]) }
                        ]
                    }
                });
            }, 0);

            const stats = await mapTileCache.getStats();

            expect(stats.tileCount).toBe(42);
            expect(stats.totalSize).toBe(3000);
        });
    });

    describe('evictOldestTiles', () => {
        beforeEach(async () => {
            await mapTileCache.init();
        });

        it('should evict oldest tiles to free space', async () => {
            const mockCursor = {
                value: {
                    key: '14/4823/6160',
                    timestamp: Date.now() - 10000,
                    blob: new Blob(['x'.repeat(1000)])
                },
                continue: vi.fn(),
                delete: vi.fn().mockReturnValue({
                    onsuccess: null
                })
            };

            mockObjectStore.openCursor.mockReturnValue({
                onsuccess: null
            });

            setTimeout(() => {
                const request = mockObjectStore.openCursor();
                request.onsuccess({ target: { result: mockCursor } });

                // Simulate cursor continuation
                setTimeout(() => {
                    request.onsuccess({ target: { result: null } });
                }, 10);
            }, 0);

            await mapTileCache.evictOldestTiles(500);

            expect(mockCursor.delete).toHaveBeenCalled();
        });
    });

    describe('clear', () => {
        beforeEach(async () => {
            await mapTileCache.init();
        });

        it('should clear all cached tiles', async () => {
            const mockCursor = {
                value: { key: '14/4823/6160' },
                continue: vi.fn(),
                delete: vi.fn().mockReturnValue({
                    onsuccess: null
                })
            };

            mockObjectStore.openCursor.mockReturnValue({
                onsuccess: null
            });

            setTimeout(() => {
                const request = mockObjectStore.openCursor();
                request.onsuccess({ target: { result: mockCursor } });

                setTimeout(() => {
                    request.onsuccess({ target: { result: null } });
                }, 10);
            }, 0);

            await mapTileCache.clear();

            expect(mockCursor.delete).toHaveBeenCalled();
        });
    });

    describe('Cache Size Management', () => {
        it('should respect cache size limit', async () => {
            await mapTileCache.init();
            await mapTileCache.enable();

            // Mock current cache size at 99MB
            mockObjectStore.getAll.mockReturnValue({
                onsuccess: null,
                result: [{ blob: new Blob(['x'.repeat(99 * 1024 * 1024)]) }]
            });

            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    blob: () => Promise.resolve(new Blob(['x'.repeat(2 * 1024 * 1024)]))
                })
            );

            // Should trigger eviction
            await mapTileCache.cacheTile('url', 14, 4823, 6160);

            // Verify eviction was called
            expect(mockObjectStore.openCursor).toHaveBeenCalled();
        });
    });
});
