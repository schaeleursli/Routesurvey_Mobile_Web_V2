/**
 * RoadIdentityService - resolves road identity from GPS coordinates
 *
 * Fallback Hierarchy (V1):
 * Level 0: Manual override (never auto-update unless forceRefresh)
 * Level 1: OSRM nearest + OSM tags (primary, best quality)
 * Level 2: OSRM name only (no tags available)
 * Level 3: Reverse geocode (Nominatim)
 * Level 4: Offline/unknown
 *
 * @see docs/API_RoadIdentityService_V1.md
 */

// Default OSRM server (can be overridden)
const OSRM_BASE_URL = 'https://router.project-osrm.org';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

// Highway rank for candidate selection (higher = more important)
const HIGHWAY_RANK = {
    motorway: 10,
    trunk: 9,
    primary: 8,
    secondary: 7,
    tertiary: 6,
    unclassified: 5,
    residential: 4,
    service: 3,
    living_street: 2,
    pedestrian: 1,
};

/**
 * Normalize road reference patterns
 * @param {string} ref - Raw ref string
 * @param {string} [country] - ISO2 country code for country-specific rules
 * @returns {string} Normalized ref
 */
export function normalizeRoadRef(ref, country = null) {
    if (!ref || typeof ref !== 'string') return '';

    let normalized = ref.trim();

    // Split multi-refs and take first
    const multiRefSeparators = /[;,/|]/;
    if (multiRefSeparators.test(normalized)) {
        normalized = normalized.split(multiRefSeparators)[0].trim();
    }

    // Common normalization: remove extra whitespace
    normalized = normalized.replace(/\s+/g, ' ');

    // Country-specific patterns (expandable)
    if (country === 'AR') {
        // Argentina: "Ruta Nacional 40" → "RN-40"
        normalized = normalized.replace(/^Ruta Nacional\s*(\d+)/i, 'RN-$1');
        normalized = normalized.replace(/^Ruta Provincial\s*(\d+)/i, 'RP-$1');
    } else if (country === 'CL') {
        // Chile: "Ruta 5 Sur" stays as-is, but standardize spacing
        normalized = normalized.replace(/\s+/g, ' ');
    } else if (country === 'US') {
        // USA: "Interstate 78" → "I-78"
        normalized = normalized.replace(/^Interstate\s*(\d+)/i, 'I-$1');
        normalized = normalized.replace(/^US Route\s*(\d+)/i, 'US-$1');
        normalized = normalized.replace(/^State Route\s*(\d+)/i, 'SR-$1');
    }

    // General: hyphenate "Letter Number" patterns
    normalized = normalized.replace(/^([A-Z]{1,3})\s+(\d+)/i, '$1-$2');

    return normalized;
}

/**
 * Compute display value from road identity fields
 * @param {Object} road - Road identity object
 * @returns {string} Display value
 */
export function computeRoadDisplay(road) {
    if (road?.refPrimary) return road.refPrimary;
    if (road?.name) return road.name;
    return '—';
}

/**
 * Compute confidence score based on snap distance and source
 * @param {number} distanceM - Distance in meters
 * @param {string} source - Road identity source
 * @param {Object} [road] - Road identity for boost calculations
 * @returns {number} Confidence score (0.0 to 1.0)
 */
export function computeConfidence(distanceM, source, road = null) {
    // Base confidence from distance
    let confidence;
    if (distanceM <= 10) {
        confidence = 0.85;
    } else if (distanceM <= 25) {
        confidence = 0.65;
    } else {
        confidence = 0.45;
    }

    // Source penalty
    if (source === 'osrm') {
        confidence *= 0.9; // 10% penalty for no tags
    } else if (source === 'reverse_geocode') {
        confidence = Math.min(confidence, 0.65); // Cap at 0.65
    } else if (source === 'offline') {
        confidence = 0.0;
    }

    // Boosts
    if (road?.refPrimary) {
        confidence += 0.10;
    }
    if (road?.highway && ['motorway', 'trunk', 'primary'].includes(road.highway)) {
        confidence += 0.05;
    }

    // Clamp to 0-1
    return Math.max(0, Math.min(1, confidence));
}

/**
 * Build Overpass query for road tags
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} [radiusM=25] - Search radius in meters
 * @returns {string} Overpass QL query
 */
function buildOverpassQuery(lat, lng, radiusM = 25) {
    return `
[out:json][timeout:10];
(
  way(around:${radiusM},${lat},${lng})["highway"];
);
out tags center;
`.trim();
}

/**
 * Extract road tags from Overpass way element
 * @param {Object} way - Overpass way element
 * @returns {Object} Extracted tags
 */
function extractRoadTags(way) {
    const tags = way.tags || {};
    return {
        ref: tags.ref || null,
        intRef: tags.int_ref || null,
        name: tags.name || null,
        officialName: tags.official_name || null,
        altName: tags.alt_name || null,
        highway: tags.highway || null,
        network: tags.network || null,
    };
}

/**
 * RoadIdentityService class
 */
export class RoadIdentityService {
    constructor(options = {}) {
        this.osrmBaseUrl = options.osrmBaseUrl || OSRM_BASE_URL;
        this.overpassUrl = options.overpassUrl || OVERPASS_URL;
        this.nominatimUrl = options.nominatimUrl || NOMINATIM_URL;
        this.timeout = options.timeout || 10000;
    }

    /**
     * Resolve road identity for coordinates
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @param {Object} [options] - Options
     * @param {Object} [options.existingRoad] - Existing road identity
     * @param {boolean} [options.forceRefresh] - Force refresh even if manualOverride
     * @param {string} [options.countryHint] - ISO2 country hint
     * @param {string} [options.languageHint] - Language hint
     * @returns {Promise<{road: Object, meta: Object}>} Road identity result
     */
    async resolve(lat, lng, options = {}) {
        const { existingRoad, forceRefresh = false, countryHint, languageHint } = options;
        const startTime = Date.now();
        const timings = { osrmNearest: 0, tagsFetch: 0, reverseGeocode: 0, total: 0 };

        // Level 0: Manual override - return unchanged unless forceRefresh
        if (existingRoad?.manualOverride && !forceRefresh) {
            return {
                road: existingRoad,
                meta: {
                    cacheHit: false,
                    fallbackLevel: 0,
                    timingsMs: { ...timings, total: Date.now() - startTime },
                },
            };
        }

        let road = null;
        let fallbackLevel = 4;
        let osrmResult = null;

        // Level 1 & 2: OSRM nearest
        try {
            const osrmStart = Date.now();
            osrmResult = await this.fetchOsrmNearest(lat, lng);
            timings.osrmNearest = Date.now() - osrmStart;

            if (osrmResult) {
                fallbackLevel = 2; // At minimum we have OSRM

                // Try to fetch OSM tags (Level 1)
                try {
                    const tagsStart = Date.now();
                    const tags = await this.fetchOsmTags(lat, lng, osrmResult);
                    timings.tagsFetch = Date.now() - tagsStart;

                    if (tags) {
                        fallbackLevel = 1;
                        road = this._buildRoadFromTags(tags, osrmResult, countryHint);
                    }
                } catch (tagError) {
                    console.warn('Tags fetch failed, using OSRM name:', tagError.message);
                }

                // If no tags, use OSRM waypoint name (Level 2)
                if (!road && osrmResult.name) {
                    road = this._buildRoadFromOsrmName(osrmResult, countryHint);
                }
            }
        } catch (osrmError) {
            console.warn('OSRM nearest failed:', osrmError.message);
        }

        // Level 3: Reverse geocode fallback
        if (!road) {
            try {
                const geocodeStart = Date.now();
                const geocodeResult = await this.reverseGeocode(lat, lng);
                timings.reverseGeocode = Date.now() - geocodeStart;

                if (geocodeResult) {
                    fallbackLevel = 3;
                    road = this._buildRoadFromGeocode(geocodeResult, countryHint);
                }
            } catch (geocodeError) {
                console.warn('Reverse geocode failed:', geocodeError.message);
            }
        }

        // Level 4: Offline/unknown fallback
        if (!road) {
            road = {
                display: '—',
                source: 'offline',
                confidence: 0.0,
                manualOverride: false,
                updatedAt: new Date().toISOString(),
            };
        }

        timings.total = Date.now() - startTime;

        return {
            road,
            meta: {
                cacheHit: false,
                fallbackLevel,
                timingsMs: timings,
            },
        };
    }

    /**
     * Fetch OSRM nearest road snap
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {Promise<Object|null>} OSRM result
     */
    async fetchOsrmNearest(lat, lng) {
        const url = `${this.osrmBaseUrl}/nearest/v1/driving/${lng},${lat}?number=1`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`OSRM returned ${response.status}`);
            }

            const data = await response.json();

            if (data.code === 'Ok' && data.waypoints && data.waypoints.length > 0) {
                const wp = data.waypoints[0];
                return {
                    location: wp.location, // [lng, lat]
                    distance: wp.distance, // meters
                    name: wp.name || null,
                    snappedLat: wp.location[1],
                    snappedLng: wp.location[0],
                };
            }

            return null;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    /**
     * Fetch OSM tags for road near coordinates
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @param {Object} osrmResult - OSRM result for snapped location
     * @returns {Promise<Object|null>} Road tags
     */
    async fetchOsmTags(lat, lng, osrmResult) {
        // Use snapped coordinates if available
        const queryLat = osrmResult?.snappedLat || lat;
        const queryLng = osrmResult?.snappedLng || lng;

        const query = buildOverpassQuery(queryLat, queryLng, 25);
        const url = `${this.overpassUrl}?data=${encodeURIComponent(query)}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Overpass returned ${response.status}`);
            }

            const data = await response.json();

            if (!data.elements || data.elements.length === 0) {
                return null;
            }

            // Select best candidate based on highway rank
            const ways = data.elements.filter((e) => e.type === 'way');
            if (ways.length === 0) return null;

            const ranked = ways
                .map((way) => ({
                    way,
                    rank: HIGHWAY_RANK[way.tags?.highway] || 0,
                }))
                .sort((a, b) => b.rank - a.rank);

            const bestWay = ranked[0].way;
            return {
                osmWayId: bestWay.id,
                ...extractRoadTags(bestWay),
            };
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    /**
     * Reverse geocode to get road name
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {Promise<Object|null>} Geocode result
     */
    async reverseGeocode(lat, lng) {
        const url = `${this.nominatimUrl}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=17&addressdetails=1`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'RouteSurvey/1.0',
                },
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Nominatim returned ${response.status}`);
            }

            const data = await response.json();

            if (!data || !data.address) {
                return null;
            }

            return {
                road: data.address.road || data.address.route || data.address.street || null,
                country: data.address.country_code?.toUpperCase() || null,
                region: data.address.state || data.address.region || null,
            };
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    /**
     * Build road identity from OSM tags
     * @private
     */
    _buildRoadFromTags(tags, osrmResult, countryHint) {
        const country = countryHint || null;
        const refs = [];

        // Collect refs
        if (tags.ref) refs.push(tags.ref);
        if (tags.intRef && tags.intRef !== tags.ref) refs.push(tags.intRef);

        // Normalize primary ref
        const refPrimary = refs.length > 0 ? normalizeRoadRef(refs[0], country) : null;

        const road = {
            refPrimary,
            refs: refs.length > 0 ? refs : null,
            name: tags.name || null,
            display: computeRoadDisplay({ refPrimary, name: tags.name }),
            country,
            region: null,
            source: 'osm',
            snap: osrmResult
                ? {
                    provider: 'osrm',
                    distanceM: osrmResult.distance,
                    snappedLat: osrmResult.snappedLat,
                    snappedLng: osrmResult.snappedLng,
                }
                : null,
            osmWayId: tags.osmWayId || null,
            confidence: computeConfidence(osrmResult?.distance || 0, 'osm', { refPrimary, highway: tags.highway }),
            manualOverride: false,
            updatedAt: new Date().toISOString(),
        };

        return road;
    }

    /**
     * Build road identity from OSRM waypoint name only
     * @private
     */
    _buildRoadFromOsrmName(osrmResult, countryHint) {
        const name = osrmResult.name;
        const country = countryHint || null;

        return {
            refPrimary: null, // Do not pretend OSRM name is a ref
            refs: null,
            name,
            display: name,
            country,
            region: null,
            source: 'osrm',
            snap: {
                provider: 'osrm',
                distanceM: osrmResult.distance,
                snappedLat: osrmResult.snappedLat,
                snappedLng: osrmResult.snappedLng,
            },
            osmWayId: null,
            confidence: computeConfidence(osrmResult.distance, 'osrm'),
            manualOverride: false,
            updatedAt: new Date().toISOString(),
        };
    }

    /**
     * Build road identity from reverse geocode
     * @private
     */
    _buildRoadFromGeocode(geocodeResult, countryHint) {
        const name = geocodeResult.road;
        const country = countryHint || geocodeResult.country;

        // Try to extract ref from road name
        const refPrimary = normalizeRoadRef(name, country);
        const hasRef = refPrimary && refPrimary !== name;

        return {
            refPrimary: hasRef ? refPrimary : null,
            refs: hasRef ? [refPrimary] : null,
            name,
            display: hasRef ? refPrimary : (name || '—'),
            country,
            region: geocodeResult.region || null,
            source: 'reverse_geocode',
            snap: null,
            osmWayId: null,
            confidence: computeConfidence(25, 'reverse_geocode'), // Default distance for geocode
            manualOverride: false,
            updatedAt: new Date().toISOString(),
        };
    }
}

// Default instance
export const roadIdentityService = new RoadIdentityService();
