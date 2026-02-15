/**
 * Utility functions for converting and formatting imperial units
 */

/**
 * Convert meters to feet and inches
 * @param {number} meters - Distance in meters
 * @returns {{feet: number, inches: number}} - Separated feet and inches
 */
export function metersToFeetInches(meters) {
    if (meters === null || meters === undefined || isNaN(meters)) {
        return { feet: null, inches: null };
    }

    const totalInches = meters * 39.3701; // 1m = 39.3701in
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);

    return { feet, inches };
}

/**
 * Convert feet and inches to meters
 * @param {number} feet - Feet
 * @param {number} inches - Inches
 * @returns {number} - Distance in meters
 */
export function feetInchesToMeters(feet, inches) {
    if (feet === null || feet === undefined) feet = 0;
    if (inches === null || inches === undefined) inches = 0;

    const totalInches = (feet * 12) + inches;
    return totalInches / 39.3701;
}

/**
 * Convert kilograms to pounds
 * @param {number} kg - Mass in kilograms
 * @returns {number} - Mass in pounds
 */
export function kgToLbs(kg) {
    if (kg === null || kg === undefined || isNaN(kg)) {
        return null;
    }
    return Math.round(kg * 2.20462);
}

/**
 * Convert pounds to kilograms
 * @param {number} lbs - Mass in pounds
 * @returns {number} - Mass in kilograms
 */
export function lbsToKg(lbs) {
    if (lbs === null || lbs === undefined || isNaN(lbs)) {
        return null;
    }
    return lbs / 2.20462;
}

/**
 * Format meters as imperial dimension string (e.g., "18'-11\"")
 * @param {number} meters - Distance in meters
 * @returns {string} - Formatted string like "18'-11\""
 */
export function formatDimension(meters) {
    const { feet, inches } = metersToFeetInches(meters);

    if (feet === null) return '—';

    return `${feet}'-${inches}"`;
}

/**
 * Format weight for display
 * @param {number} kg - Weight in kilograms
 * @returns {string} Formatted weight (e.g., "440,000 lb")
 */
export function formatWeight(kg) {
    const lbs = kgToLbs(kg);
    if (lbs === null) return '—';

    return `${lbs.toLocaleString('en-US')} lb`;
}

/**
 * Convert km/h to mph
 * @param {number} kmh - Speed in km/h
 * @returns {number} Speed in mph
 */
export function kmhToMph(kmh) {
    if (kmh === null || kmh === undefined || isNaN(kmh)) {
        return null;
    }
    return Math.round(kmh * 0.621371);
}

/**
 * Convert mph to km/h
 * @param {number} mph - Speed in mph
 * @returns {number} Speed in km/h
 */
export function mphToKmh(mph) {
    if (mph === null || mph === undefined || isNaN(mph)) {
        return null;
    }
    return mph / 0.621371;
}

/**
 * Format speed for display
 * @param {number} kmh - Speed in km/h
 * @returns {string} Formatted string like "55 mph"
 */
export function formatSpeed(kmh) {
    const mph = kmhToMph(kmh);
    if (mph === null) return '—';

    return `${mph} mph`;
}
