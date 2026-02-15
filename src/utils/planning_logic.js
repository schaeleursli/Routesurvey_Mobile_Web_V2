/**
 * Planning Calculation Logic
 * Pure function to calculate transport dimensions and validate inputs.
 * 
 * @param {Object} cargo - Cargo details
 * @param {Object} trailer - Trailer details
 * @returns {Object} { dimensions: { h, w, l, gvw }, errors: [], warnings: [], isBlocked: boolean }
 */
export function calculatePlanningDimensions(cargo, trailer) {
    const result = {
        dimensions: { h: 0, w: 0, l: 0, gvw: 0 },
        errors: [],
        warnings: [],
        isBlocked: false
    };

    // 1. Required Field Validation
    const requiredCargo = ['weight_kg', 'length_m', 'width_m', 'height_m'];
    const requiredTrailer = ['tare_weight_kg', 'deck_height_m', 'deck_length_m', 'width_m'];

    requiredCargo.forEach(field => {
        if (cargo[field] === null || cargo[field] === undefined || cargo[field] === '') {
            result.errors.push(`Cargo ${field.replace(/_/g, ' ')} is required`);
        }
    });

    requiredTrailer.forEach(field => {
        if (trailer[field] === null || trailer[field] === undefined || trailer[field] === '') {
            result.errors.push(`Trailer ${field.replace(/_/g, ' ')} is required`);
        }
    });

    if (result.errors.length > 0) {
        result.isBlocked = true;
        return result;
    }

    // 2. Sanity Checks (Bounds)
    const bounds = {
        deck_height_m: { min: 0.2, max: 2.0, name: 'Trailer Deck Height' },
        cargo_height_m: { min: 0.2, max: 10.0, name: 'Cargo Height' },
        width_m: { min: 0.5, max: 10.0, name: 'Width' }, // Applied to both
        length_m: { min: 0.5, max: 60.0, name: 'Length' }, // Applied to both
        weight_kg: { min: 100, max: 500000, name: 'Weight' } // Loose check
    };

    // Helper for bounds
    const checkBound = (val, field, contextName) => {
        const bound = bounds[field];
        if (bound && (val < bound.min || val > bound.max)) {
            result.warnings.push(`${contextName} ${bound.name} (${val}) seems out of normal range (${bound.min}-${bound.max}). Check units?`);
        }
        // Generic width/length checks
        if (field.includes('width') && (val < bounds.width_m.min || val > bounds.width_m.max)) {
            result.warnings.push(`${contextName} Width (${val}) seems out of normal range.`);
        }
        if (field.includes('length') && (val < bounds.length_m.min || val > bounds.length_m.max)) {
            result.warnings.push(`${contextName} Length (${val}) seems out of normal range.`);
        }
    };

    // Run checks
    checkBound(trailer.deck_height_m, 'deck_height_m', 'Trailer');
    checkBound(cargo.height_m, 'cargo_height_m', 'Cargo');
    checkBound(trailer.width_m, 'width_m', 'Trailer');
    checkBound(cargo.width_m, 'width_m', 'Cargo');
    checkBound(trailer.deck_length_m, 'length_m', 'Trailer Deck');
    checkBound(cargo.length_m, 'length_m', 'Cargo');

    // 3. Calculation
    // H = H_deck + H_support + H_cargo
    const hSupport = Number(cargo.support_height_m) || 0;
    result.dimensions.h = Number(trailer.deck_height_m) + hSupport + Number(cargo.height_m);

    // W = max(W_trailer, W_cargo)
    result.dimensions.w = Math.max(Number(trailer.width_m), Number(cargo.width_m));

    // L = max(L_deck, L_cargo)
    // NOTE: This assumes overlapping. 
    result.dimensions.l = Math.max(Number(trailer.deck_length_m), Number(cargo.length_m));

    // GVW = Trailer Tare + Cargo Weight
    result.dimensions.gvw = Number(trailer.tare_weight_kg) + Number(cargo.weight_kg);

    // Rounding for clean output (2 decimals for dims, 0 for weight)
    result.dimensions.h = Number(result.dimensions.h.toFixed(3));
    result.dimensions.w = Number(result.dimensions.w.toFixed(3));
    result.dimensions.l = Number(result.dimensions.l.toFixed(3));
    result.dimensions.gvw = Math.round(result.dimensions.gvw);

    return result;
}
