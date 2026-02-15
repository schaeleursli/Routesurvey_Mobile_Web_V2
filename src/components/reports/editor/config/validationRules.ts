/**
 * Validation utilities for configuration values
 */

export interface ValidationRule {
    type: 'required' | 'min' | 'max' | 'range' | 'pattern' | 'custom';
    message: string;
    value?: unknown; // For min/max/pattern
    validator?: (value: unknown, allValues: Record<string, unknown>) => boolean;
}

export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string[]>;
}

/**
 * Validate a single field value against rules
 */
export function validateField(
    fieldKey: string,
    value: unknown,
    rules: ValidationRule[],
    allValues: Record<string, unknown> = {}
): string[] {
    const errors: string[] = [];

    for (const rule of rules) {
        switch (rule.type) {
            case 'required':
                if (value === null || value === undefined || value === '') {
                    errors.push(rule.message);
                }
                break;

            case 'min':
                if (typeof value === 'number' && typeof rule.value === 'number' && value < rule.value) {
                    errors.push(rule.message);
                }
                break;

            case 'max':
                if (typeof value === 'number' && typeof rule.value === 'number' && value > rule.value) {
                    errors.push(rule.message);
                }
                break;

            case 'range':
                if (typeof value === 'number' && Array.isArray(rule.value)) {
                    const [min, max] = rule.value as [number, number];
                    if (value < min || value > max) {
                        errors.push(rule.message);
                    }
                }
                break;

            case 'pattern':
                if (typeof value === 'string' && typeof rule.value === 'string' && !new RegExp(rule.value).test(value)) {
                    errors.push(rule.message);
                } else if (typeof value === 'string' && rule.value instanceof RegExp && !rule.value.test(value)) {
                    errors.push(rule.message);
                }
                break;

            case 'custom':
                if (rule.validator && !rule.validator(value, allValues)) {
                    errors.push(rule.message);
                }
                break;
        }
    }

    return errors;
}

/**
 * Validate all configuration values
 */
export function validateConfiguration(
    values: Record<string, unknown>,
    fieldRules: Record<string, ValidationRule[]>
): ValidationResult {
    const errors: Record<string, string[]> = {};
    let isValid = true;

    for (const [fieldKey, rules] of Object.entries(fieldRules)) {
        const fieldErrors = validateField(fieldKey, values[fieldKey], rules, values);
        if (fieldErrors.length > 0) {
            errors[fieldKey] = fieldErrors;
            isValid = false;
        }
    }

    return { isValid, errors };
}

/**
 * Common validation rules factory
 */
export const ValidationRules = {
    required: (message = 'This field is required'): ValidationRule => ({
        type: 'required',
        message
    }),

    min: (value: number, message?: string): ValidationRule => ({
        type: 'min',
        value,
        message: message || `Value must be at least ${value}`
    }),

    max: (value: number, message?: string): ValidationRule => ({
        type: 'max',
        value,
        message: message || `Value must be at most ${value}`
    }),

    range: (min: number, max: number, message?: string): ValidationRule => ({
        type: 'range',
        value: [min, max],
        message: message || `Value must be between ${min} and ${max}`
    }),

    pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule => ({
        type: 'pattern',
        value: regex,
        message
    }),

    lessThan: (otherField: string, message?: string): ValidationRule => ({
        type: 'custom',
        message: message || `Must be less than ${otherField}`,
        validator: (value, allValues) => {
            const otherValue = allValues[otherField];
            return typeof value === 'number' && typeof otherValue === 'number'
                ? value < otherValue
                : true;
        }
    }),

    greaterThan: (otherField: string, message?: string): ValidationRule => ({
        type: 'custom',
        message: message || `Must be greater than ${otherField}`,
        validator: (value, allValues) => {
            const otherValue = allValues[otherField];
            return typeof value === 'number' && typeof otherValue === 'number'
                ? value > otherValue
                : true;
        }
    })
};
