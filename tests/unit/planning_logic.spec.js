import { describe, it, expect } from 'vitest';
import { calculatePlanningDimensions } from '@/utils/planning_logic';

describe('Planning Logic - Dimensions Calculation', () => {
    const validCargo = {
        name: 'Transformer',
        weight_kg: 50000,
        length_m: 6.0,
        width_m: 2.5,
        height_m: 3.0,
        support_height_m: 0.5
    };

    const validTrailer = {
        name: 'Platform',
        tare_weight_kg: 15000,
        deck_height_m: 1.0,
        deck_length_m: 12.0,
        width_m: 2.5
    };

    it('calculates dimensions correctly for standard inputs', () => {
        const result = calculatePlanningDimensions(validCargo, validTrailer);

        expect(result.isBlocked).toBe(false);
        expect(result.errors).toHaveLength(0);

        // Height = Deck (1.0) + Support (0.5) + Cargo (3.0) = 4.5
        expect(result.dimensions.h).toBe(4.5);

        // Width = max(Trailer 2.5, Cargo 2.5) = 2.5
        expect(result.dimensions.w).toBe(2.5);

        // Length = max(Trailer 12.0, Cargo 6.0) = 12.0
        expect(result.dimensions.l).toBe(12.0);

        // GVW = Tare (15000) + Cargo (50000) = 65000
        expect(result.dimensions.gvw).toBe(65000);
    });

    it('handles wide load correctly', () => {
        const wideCargo = { ...validCargo, width_m: 4.5 }; // Wider than trailer
        const result = calculatePlanningDimensions(wideCargo, validTrailer);

        expect(result.dimensions.w).toBe(4.5);
    });

    it('handles long load correctly', () => {
        const longCargo = { ...validCargo, length_m: 15.0 }; // Longer than deck
        const result = calculatePlanningDimensions(longCargo, validTrailer);

        expect(result.dimensions.l).toBe(15.0);
    });

    it('returns errors for missing required cargo fields', () => {
        const invalidCargo = { ...validCargo, weight_kg: null };
        const result = calculatePlanningDimensions(invalidCargo, validTrailer);

        expect(result.isBlocked).toBe(true);
        expect(result.errors).toContain('Cargo weight kg is required');
    });

    it('returns errors for missing required trailer fields', () => {
        const invalidTrailer = { ...validTrailer, deck_height_m: undefined };
        const result = calculatePlanningDimensions(validCargo, invalidTrailer);

        expect(result.isBlocked).toBe(true);
        expect(result.errors).toContain('Trailer deck height m is required');
    });

    it('generates warnings for out-of-bounds values', () => {
        // Cargo height 12m is > max 10m
        const tallCargo = { ...validCargo, height_m: 12.0 };
        const result = calculatePlanningDimensions(tallCargo, validTrailer);

        expect(result.isBlocked).toBe(false);
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings[0]).toContain('Cargo Height');
    });

    it('handles string inputs gracefully by converting to numbers', () => {
        const stringCargo = {
            ...validCargo,
            weight_kg: "50000",
            height_m: "3.0"
        };
        const stringTrailer = {
            ...validTrailer,
            deck_height_m: "1.0"
        };

        const result = calculatePlanningDimensions(stringCargo, stringTrailer);

        expect(result.dimensions.h).toBe(4.5); // 1.0 + 0.5 + 3.0
        expect(result.dimensions.gvw).toBe(65000);
    });
});
