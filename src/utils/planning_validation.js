/**
 * Planning Validation Logic
 * 
 * Performs engineering checks for Transport Configuration vs Route Constraints.
 * STRICTLY SI UNITS (Meters, Kilograms) internally.
 */

export const ValidationSeverity = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',   // Blocks saving
    CRITICAL: 'critical' // Blocks saving + immediate visual alert
};

/**
 * Validates the complete transport configuration
 * @param {Object} cargo - { weight_kg, length_m, width_m, height_m, cog_x, cog_y, cog_z }
 * @param {Object} equipment - { primeMover: {}, trailer: { ...defaults } }
 * @returns {Object} { isValid, status, messages: [{ severity, message, field }] }
 */
export function validateTransport(cargo, equipment) {
    const result = {
        isValid: true,
        status: 'valid',
        messages: [],
        metrics: {
            totalWeight_kg: 0,
            totalLength_m: 0,
            totalWidth_m: 0,
            totalHeight_m: 0,
            axleLoad_kg: 0
        }
    };

    if (!cargo || !equipment) {
        return result;
    }

    // --- 1. Metric Calculations ---

    // Total Weight = Cargo + Trailer Tare + (Optional Prime Mover Tare if relevant for GCM)
    // For now, focusing on TRAILER LOAD
    const trailerTare = Number(equipment.trailer?.tare_weight_kg || 0);
    const cargoWeight = Number(cargo.weight_kg || 0);
    const totalLoad = trailerTare + cargoWeight;
    result.metrics.totalWeight_kg = totalLoad;

    // Axle Load
    const numAxles = Number(equipment.trailer?.num_axles || 0);
    if (numAxles > 0) {
        // Simple distribution: Total Load / Axles
        // In reality, Prime Mover takes some load, but for conservative planning we check trailer axles
        result.metrics.axleLoad_kg = totalLoad / numAxles;
    }

    // Dimensions
    const deckHeight = Number(equipment.trailer?.deck_height_m || 0);
    const cargoHeight = Number(cargo.height_m || 0);
    // Total H = Deck + Cargo (Simplification: supports are part of cargo height usually, or added)
    result.metrics.totalHeight_m = deckHeight + cargoHeight;

    const deckWidth = Number(equipment.trailer?.width_m || 0);
    const cargoWidth = Number(cargo.width_m || 0);
    result.metrics.totalWidth_m = Math.max(deckWidth, cargoWidth);

    const deckLength = Number(equipment.trailer?.deck_length_m || 0);
    const cargoLength = Number(cargo.length_m || 0);
    // Total L is tricky without Prime Mover, but let's assumeTrailer L is dominant or Cargo overhang
    // Simple verification: max of both
    result.metrics.totalLength_m = Math.max(deckLength, cargoLength);


    // --- 2. Validation Rules ---

    // A. Weight Checks
    if (cargoWeight <= 0) {
        result.messages.push({
            severity: ValidationSeverity.ERROR,
            message: 'Cargo weight must be greater than 0',
            field: 'cargo.weight'
        });
        result.isValid = false;
    }

    if (numAxles > 0) {
        // European Limits approx 12t / axle (12000kg)
        // Heavy Haul often allows 16-25t depending on equipment
        const AXLE_LIMIT_NORMAL = 12000;
        const AXLE_LIMIT_HEAVY = 18000;

        if (result.metrics.axleLoad_kg > AXLE_LIMIT_HEAVY) {
            result.messages.push({
                severity: ValidationSeverity.ERROR,
                message: `Axle load (${(result.metrics.axleLoad_kg / 1000).toFixed(1)}t) exceeds heavy haul limit (18t)`,
                field: 'equipment.axles'
            });
            result.isValid = false; // Block saving for dangerous loads
        } else if (result.metrics.axleLoad_kg > AXLE_LIMIT_NORMAL) {
            result.messages.push({
                severity: ValidationSeverity.WARNING,
                message: `Axle load (${(result.metrics.axleLoad_kg / 1000).toFixed(1)}t) requires permits (>12t)`,
                field: 'equipment.axles'
            });
        }
    }

    // B. Dimension Checks
    const HEIGHT_WARNING = 4.5;
    const HEIGHT_CRITICAL = 5.5;

    if (result.metrics.totalHeight_m > HEIGHT_CRITICAL) {
        result.messages.push({
            severity: ValidationSeverity.CRITICAL,
            message: `Total height (${result.metrics.totalHeight_m.toFixed(2)}m) is critical. Route Survey Mandatory.`,
            field: 'dimensions.height'
        });
        // We don't block isValid here, because it IS physically possible, just hard.
    } else if (result.metrics.totalHeight_m > HEIGHT_WARNING) {
        result.messages.push({
            severity: ValidationSeverity.WARNING,
            message: `Total height (${result.metrics.totalHeight_m.toFixed(2)}m) likely requires police escort/wire lifting.`,
            field: 'dimensions.height'
        });
    }

    // Stability (Center of Gravity)
    // Rule of thumb: CoG Height should not exceed Track Width significantly
    if (cargoWidth > 0 && cargo.cog_z > (cargoWidth * 0.8)) {
        result.messages.push({
            severity: ValidationSeverity.WARNING,
            message: `High Center of Gravity detected. Stability verification recommended.`,
            field: 'cargo.cog'
        });
    }

    // Update overall status
    if (!result.isValid) {
        result.status = 'error';
    } else if (result.messages.some(m => m.severity === ValidationSeverity.WARNING || m.severity === ValidationSeverity.CRITICAL)) {
        result.status = 'warning';
    }

    return result;
}
