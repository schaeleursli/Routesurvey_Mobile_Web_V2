import { describe, it, expect } from 'vitest';
import RouteUtils from '../../../src/utils/route_utils';

describe('RouteUtils', () => {

    describe('calculateDistance', () => {
        it('should calculate distance between two points correctly (approx 111km for 1 deg lat)', () => {
            // 1 degree of latitude is approximately 111km (111,000 meters)
            const dist = RouteUtils.calculateDistance(0, 0, 1, 0);
            expect(dist).toBeGreaterThan(111000);
            expect(dist).toBeLessThan(111320);
        });

        it('should return 0 for same points', () => {
            const dist = RouteUtils.calculateDistance(10, 10, 10, 10);
            expect(dist).toBe(0);
        });
    });

    describe('calculateRoutePointsDistances', () => {
        it('should calculate cumulative distances for a list of points', () => {
            const points = [
                { lat: 0, lng: 0 },
                { lat: 1, lng: 0 }, // ~111km away
                { lat: 1, lng: 1 }  // Another ~111km away (at equator)
            ];

            const result = RouteUtils.calculateRoutePointsDistances(points);

            expect(result).toHaveLength(3);
            expect(result[0].distance).toBe(0);

            // Second point should be approx 111km
            expect(result[1].distance).toBeGreaterThan(111000);

            // Third point should be approx 222km (cumulative)
            expect(result[2].distance).toBeGreaterThan(222000);
        });

        it('should handle empty array', () => {
            const result = RouteUtils.calculateRoutePointsDistances([]);
            expect(result).toEqual([]);
        });
    });

    describe('escapeXml', () => {
        it('should escape special XML characters', () => {
            const input = '<div class="test">Me & You</div>';
            const expected = '&lt;div class=&quot;test&quot;&gt;Me &amp; You&lt;/div&gt;';
            expect(RouteUtils.escapeXml(input)).toBe(expected);
        });

        it('should return original string if no special chars', () => {
            expect(RouteUtils.escapeXml('Hello World')).toBe('Hello World');
        });
    });

    describe('getShortAddress', () => {
        it('should return first two parts of string address', () => {
            const addr = "123 Main St, Springfield, IL, USA";
            expect(RouteUtils.getShortAddress(addr)).toBe("123 Main St,  Springfield");
        });

        it('should handle address object with display_name', () => {
            const addrObj = { address: { display_name: "123 Main St, Springfield, IL" } };
            expect(RouteUtils.getShortAddress(addrObj)).toBe("123 Main St,  Springfield");
        });

        it('should handle empty input', () => {
            expect(RouteUtils.getShortAddress(null)).toBe("");
        });
    });

    describe('formatDateTime', () => {
        it('should return Unknown for null input', () => {
            expect(RouteUtils.formatDateTime(null)).toBe("Unknown");
        });

        it('should format date correctly', () => {
            // Use a fixed date
            const dateStr = "2023-01-15T10:30:00.000Z";
            // Note: Output depends on local time zone of the runner (node)
            // Ideally we mock Date or Intl, but for a basic unit test checking structure is okay
            const result = RouteUtils.formatDateTime(dateStr);

            expect(result).toContain("Jan");
            expect(result).toContain("15");
            expect(result).toContain("2023");
            expect(result).toContain("<br/>");
        });
    });
});
