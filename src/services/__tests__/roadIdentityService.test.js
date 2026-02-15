import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    RoadIdentityService,
    normalizeRoadRef,
    computeRoadDisplay,
    computeConfidence,
} from '../roadIdentityService.js';

describe('RoadIdentityService', () => {
    describe('normalizeRoadRef', () => {
        it('should normalize Argentina route patterns', () => {
            expect(normalizeRoadRef('Ruta Nacional 40', 'AR')).toBe('RN-40');
            expect(normalizeRoadRef('Ruta Provincial 7', 'AR')).toBe('RP-7');
        });

        it('should normalize US route patterns', () => {
            expect(normalizeRoadRef('Interstate 78', 'US')).toBe('I-78');
            expect(normalizeRoadRef('US Route 101', 'US')).toBe('US-101');
        });

        it('should handle multi-refs by taking first', () => {
            expect(normalizeRoadRef('A-1;B-2;C-3', null)).toBe('A-1');
            expect(normalizeRoadRef('RN-40/RP-7', 'AR')).toBe('RN-40');
        });

        it('should hyphenate letter-number patterns', () => {
            expect(normalizeRoadRef('A 1', null)).toBe('A-1');
            expect(normalizeRoadRef('RN 40', null)).toBe('RN-40');
        });

        it('should return empty string for invalid input', () => {
            expect(normalizeRoadRef(null, null)).toBe('');
            expect(normalizeRoadRef('', null)).toBe('');
            expect(normalizeRoadRef(undefined, null)).toBe('');
        });
    });

    describe('computeRoadDisplay', () => {
        it('should prefer refPrimary over name', () => {
            expect(computeRoadDisplay({ refPrimary: 'A-1', name: 'Route One' })).toBe('A-1');
        });

        it('should fall back to name when refPrimary is missing', () => {
            expect(computeRoadDisplay({ name: 'Route One' })).toBe('Route One');
            expect(computeRoadDisplay({ refPrimary: null, name: 'Route One' })).toBe('Route One');
        });

        it('should return dash when both are missing', () => {
            expect(computeRoadDisplay({})).toBe('—');
            expect(computeRoadDisplay(null)).toBe('—');
            expect(computeRoadDisplay(undefined)).toBe('—');
        });
    });

    describe('computeConfidence', () => {
        it('should return high confidence for close distance', () => {
            expect(computeConfidence(5, 'osm')).toBeCloseTo(0.85, 1);
            expect(computeConfidence(10, 'osm')).toBeCloseTo(0.85, 1);
        });

        it('should return medium confidence for medium distance', () => {
            expect(computeConfidence(15, 'osm')).toBeCloseTo(0.65, 1);
            expect(computeConfidence(25, 'osm')).toBeCloseTo(0.65, 1);
        });

        it('should return low confidence for far distance', () => {
            expect(computeConfidence(50, 'osm')).toBeCloseTo(0.45, 1);
        });

        it('should apply source penalties', () => {
            const osmConfidence = computeConfidence(5, 'osm');
            const osrmConfidence = computeConfidence(5, 'osrm');
            const geocodeConfidence = computeConfidence(5, 'reverse_geocode');
            const offlineConfidence = computeConfidence(5, 'offline');

            expect(osrmConfidence).toBeLessThan(osmConfidence);
            expect(geocodeConfidence).toBeLessThanOrEqual(0.65);
            expect(offlineConfidence).toBe(0);
        });

        it('should boost confidence for refPrimary', () => {
            const withRef = computeConfidence(10, 'osm', { refPrimary: 'A-1' });
            const withoutRef = computeConfidence(10, 'osm', {});

            expect(withRef).toBeGreaterThan(withoutRef);
        });
    });

    describe('resolve', () => {
        let service;
        let mockFetch;

        beforeEach(() => {
            service = new RoadIdentityService();
            mockFetch = vi.fn();
            global.fetch = mockFetch;
        });

        it('should return existing road if manualOverride and not forceRefresh', async () => {
            const existingRoad = {
                display: 'Custom Road',
                manualOverride: true,
                source: 'manual',
            };

            const result = await service.resolve(-33.4, -70.6, { existingRoad });

            expect(result.road).toBe(existingRoad);
            expect(result.meta.fallbackLevel).toBe(0);
        });

        it('should resolve when forceRefresh even with manualOverride', async () => {
            const existingRoad = {
                display: 'Custom Road',
                manualOverride: true,
                source: 'manual',
            };

            // Mock OSRM response
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    code: 'Ok',
                    waypoints: [{
                        location: [-70.6, -33.4],
                        distance: 5,
                        name: 'Test Road',
                    }],
                }),
            });

            // Mock Overpass failure (to test fallback)
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 429,
            });

            const result = await service.resolve(-33.4, -70.6, { existingRoad, forceRefresh: true });

            expect(result.road.display).toBe('Test Road');
            expect(result.meta.fallbackLevel).toBe(2); // OSRM name only
        });

        it('should fall back to offline when all services fail', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'));

            const result = await service.resolve(-33.4, -70.6);

            expect(result.road.display).toBe('—');
            expect(result.road.source).toBe('offline');
            expect(result.road.confidence).toBe(0);
            expect(result.meta.fallbackLevel).toBe(4);
        });

        it('should never throw, always return a road object', async () => {
            mockFetch.mockImplementation(() => {
                throw new Error('Catastrophic failure');
            });

            await expect(service.resolve(-33.4, -70.6)).resolves.toHaveProperty('road');
        });
    });
});
