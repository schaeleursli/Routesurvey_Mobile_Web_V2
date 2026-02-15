/**
 * Test suite for routeExporter.js
 * Tests KML and GPX export functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { exportToKML, exportToGPX, downloadAsKML, downloadAsGPX } from '@/utils/routes/routeExporter';

describe('routeExporter', () => {
    let mockRouteData;

    beforeEach(() => {
        mockRouteData = {
            points: [
                { lat: 40.7128, lng: -74.0060, type: 'route_point', name: 'Start' },
                { lat: 40.7589, lng: -73.9851, type: 'waypoint', name: 'Waypoint 1' },
                { lat: 40.7614, lng: -73.9776, type: 'route_point', name: 'End' }
            ],
            routePath: [
                [40.7128, -74.0060],
                [40.7589, -73.9851],
                [40.7614, -73.9776]
            ],
            routeInfo: {
                distance: 5000,
                duration: 600
            }
        };
    });

    describe('exportToKML', () => {
        it('should generate valid KML XML', () => {
            const kml = exportToKML(mockRouteData);

            expect(kml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
            expect(kml).toContain('<kml xmlns="http://www.opengis.net/kml/2.2">');
            expect(kml).toContain('</kml>');
        });

        it('should include all route points as placemarks', () => {
            const kml = exportToKML(mockRouteData);

            expect(kml).toContain('<name>Start</name>');
            expect(kml).toContain('<name>Waypoint 1</name>');
            expect(kml).toContain('<name>End</name>');
        });

        it('should include coordinates in correct format', () => {
            const kml = exportToKML(mockRouteData);

            // KML format is lng,lat,altitude
            expect(kml).toContain('-74.0060,40.7128,0');
            expect(kml).toContain('-73.9851,40.7589,0');
            expect(kml).toContain('-73.9776,40.7614,0');
        });

        it('should include route path as LineString', () => {
            const kml = exportToKML(mockRouteData);

            expect(kml).toContain('<LineString>');
            expect(kml).toContain('<coordinates>');
            expect(kml).toContain('</LineString>');
        });

        it('should handle metadata options', () => {
            const kml = exportToKML(mockRouteData, {
                name: 'Test Route',
                description: 'Test Description'
            });

            expect(kml).toContain('<name>Test Route</name>');
            expect(kml).toContain('<description>Test Description</description>');
        });

        it('should escape special XML characters', () => {
            const dataWithSpecialChars = {
                ...mockRouteData,
                points: [
                    { lat: 40.7128, lng: -74.0060, name: 'Point <1> & "Two"' }
                ]
            };

            const kml = exportToKML(dataWithSpecialChars);

            expect(kml).toContain('&lt;1&gt;');
            expect(kml).toContain('&amp;');
            expect(kml).toContain('&quot;');
        });
    });

    describe('exportToGPX', () => {
        it('should generate valid GPX XML', () => {
            const gpx = exportToGPX(mockRouteData);

            expect(gpx).toContain('<?xml version="1.0" encoding="UTF-8"?>');
            expect(gpx).toContain('<gpx version="1.1"');
            expect(gpx).toContain('xmlns="http://www.topografix.com/GPX/1/1"');
            expect(gpx).toContain('</gpx>');
        });

        it('should include all route points as waypoints', () => {
            const gpx = exportToGPX(mockRouteData);

            expect(gpx).toContain('<wpt lat="40.7128" lon="-74.0060">');
            expect(gpx).toContain('<wpt lat="40.7589" lon="-73.9851">');
            expect(gpx).toContain('<wpt lat="40.7614" lon="-73.9776">');
        });

        it('should include waypoint names', () => {
            const gpx = exportToGPX(mockRouteData);

            expect(gpx).toContain('<name>Start</name>');
            expect(gpx).toContain('<name>Waypoint 1</name>');
            expect(gpx).toContain('<name>End</name>');
        });

        it('should include route track', () => {
            const gpx = exportToGPX(mockRouteData);

            expect(gpx).toContain('<trk>');
            expect(gpx).toContain('<trkseg>');
            expect(gpx).toContain('<trkpt');
            expect(gpx).toContain('</trk>');
        });

        it('should handle metadata options', () => {
            const gpx = exportToGPX(mockRouteData, {
                name: 'Test Route',
                description: 'Test Description'
            });

            expect(gpx).toContain('<name>Test Route</name>');
            expect(gpx).toContain('<desc>Test Description</desc>');
        });

        it('should include timestamp', () => {
            const gpx = exportToGPX(mockRouteData);

            expect(gpx).toContain('<time>');
            expect(gpx).toMatch(/<time>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z<\/time>/);
        });
    });

    describe('downloadAsKML', () => {
        let createElementSpy;
        let clickSpy;

        beforeEach(() => {
            // Mock document.createElement and click
            createElementSpy = vi.spyOn(document, 'createElement');
            clickSpy = vi.fn();

            createElementSpy.mockReturnValue({
                href: '',
                download: '',
                click: clickSpy,
                style: {}
            });
        });

        afterEach(() => {
            createElementSpy.mockRestore();
        });

        it('should trigger download with correct filename', () => {
            downloadAsKML(mockRouteData, 'test-route');

            expect(createElementSpy).toHaveBeenCalledWith('a');
            expect(clickSpy).toHaveBeenCalled();
        });

        it('should use .kml extension', () => {
            const link = {};
            createElementSpy.mockReturnValue(link);

            downloadAsKML(mockRouteData, 'test-route');

            expect(link.download).toBe('test-route.kml');
        });
    });

    describe('downloadAsGPX', () => {
        let createElementSpy;
        let clickSpy;

        beforeEach(() => {
            createElementSpy = vi.spyOn(document, 'createElement');
            clickSpy = vi.fn();

            createElementSpy.mockReturnValue({
                href: '',
                download: '',
                click: clickSpy,
                style: {}
            });
        });

        afterEach(() => {
            createElementSpy.mockRestore();
        });

        it('should trigger download with correct filename', () => {
            downloadAsGPX(mockRouteData, 'test-route');

            expect(createElementSpy).toHaveBeenCalledWith('a');
            expect(clickSpy).toHaveBeenCalled();
        });

        it('should use .gpx extension', () => {
            const link = {};
            createElementSpy.mockReturnValue(link);

            downloadAsGPX(mockRouteData, 'test-route');

            expect(link.download).toBe('test-route.gpx');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty route data', () => {
            const emptyData = {
                points: [],
                routePath: [],
                routeInfo: null
            };

            const kml = exportToKML(emptyData);
            const gpx = exportToGPX(emptyData);

            expect(kml).toContain('<kml');
            expect(gpx).toContain('<gpx');
        });

        it('should handle points without names', () => {
            const dataWithoutNames = {
                points: [
                    { lat: 40.7128, lng: -74.0060 }
                ],
                routePath: [[40.7128, -74.0060]],
                routeInfo: null
            };

            const kml = exportToKML(dataWithoutNames);
            const gpx = exportToGPX(dataWithoutNames);

            expect(kml).toBeTruthy();
            expect(gpx).toBeTruthy();
        });

        it('should handle very large routes', () => {
            const largeRoute = {
                points: Array.from({ length: 1000 }, (_, i) => ({
                    lat: 40 + i * 0.001,
                    lng: -74 + i * 0.001,
                    name: `Point ${i}`
                })),
                routePath: Array.from({ length: 1000 }, (_, i) => [
                    40 + i * 0.001,
                    -74 + i * 0.001
                ]),
                routeInfo: { distance: 100000 }
            };

            const kml = exportToKML(largeRoute);
            const gpx = exportToGPX(largeRoute);

            expect(kml.split('<Placemark>').length - 1).toBe(1000);
            expect(gpx.split('<wpt').length - 1).toBe(1000);
        });
    });
});
