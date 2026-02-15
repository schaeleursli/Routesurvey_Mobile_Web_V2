import { describe, it, expect } from 'vitest';
import { validateField, validateConfiguration, ValidationRules } from '@/components/reports/editor/config/validationRules';

describe('validationRules', () => {
    describe('validateField', () => {
        it('should pass for valid required field', () => {
            const rules = [ValidationRules.required()];
            const errors = validateField('testField', 'value', rules);
            expect(errors).toHaveLength(0);
        });

        it('should fail for empty required field', () => {
            const rules = [ValidationRules.required()];
            const errors = validateField('testField', '', rules);
            expect(errors).toHaveLength(1);
            expect(errors[0]).toContain('required');
        });

        it('should fail for null required field', () => {
            const rules = [ValidationRules.required()];
            const errors = validateField('testField', null, rules);
            expect(errors).toHaveLength(1);
        });

        it('should pass min validation', () => {
            const rules = [ValidationRules.min(5)];
            const errors = validateField('testField', 10, rules);
            expect(errors).toHaveLength(0);
        });

        it('should fail min validation', () => {
            const rules = [ValidationRules.min(5)];
            const errors = validateField('testField', 3, rules);
            expect(errors).toHaveLength(1);
            expect(errors[0]).toContain('at least 5');
        });

        it('should pass max validation', () => {
            const rules = [ValidationRules.max(100)];
            const errors = validateField('testField', 50, rules);
            expect(errors).toHaveLength(0);
        });

        it('should fail max validation', () => {
            const rules = [ValidationRules.max(100)];
            const errors = validateField('testField', 150, rules);
            expect(errors).toHaveLength(1);
            expect(errors[0]).toContain('at most 100');
        });

        it('should validate range correctly', () => {
            const rules = [ValidationRules.range(10, 20)];

            expect(validateField('test', 15, rules)).toHaveLength(0);
            expect(validateField('test', 10, rules)).toHaveLength(0);
            expect(validateField('test', 20, rules)).toHaveLength(0);
            expect(validateField('test', 5, rules)).toHaveLength(1);
            expect(validateField('test', 25, rules)).toHaveLength(1);
        });

        it('should validate pattern correctly', () => {
            const rules = [ValidationRules.pattern(/^\d{3}-\d{4}$/, 'Must be format XXX-XXXX')];

            expect(validateField('phone', '123-4567', rules)).toHaveLength(0);
            expect(validateField('phone', '123-456', rules)).toHaveLength(1);
            expect(validateField('phone', 'abc-defg', rules)).toHaveLength(1);
        });

        it('should run custom validator', () => {
            const rules = [{
                type: 'custom' as const,
                message: 'Must be even',
                validator: (value: unknown) => typeof value === 'number' && value % 2 === 0
            }];

            expect(validateField('num', 4, rules)).toHaveLength(0);
            expect(validateField('num', 5, rules)).toHaveLength(1);
        });

        it('should support cross-field validation', () => {
            const rules = [ValidationRules.lessThan('maxValue')];
            const allValues = { maxValue: 100 };

            expect(validateField('minValue', 50, rules, allValues)).toHaveLength(0);
            expect(validateField('minValue', 150, rules, allValues)).toHaveLength(1);
        });

        it('should accumulate multiple errors', () => {
            const rules = [
                ValidationRules.required(),
                ValidationRules.min(10),
                ValidationRules.max(20)
            ];

            // Value too small
            const errors1 = validateField('test', 5, rules);
            expect(errors1).toHaveLength(1);
            expect(errors1[0]).toContain('at least 10');

            // Value too large
            const errors2 = validateField('test', 25, rules);
            expect(errors2).toHaveLength(1);
            expect(errors2[0]).toContain('at most 20');
        });
    });

    describe('validateConfiguration', () => {
        it('should validate entire configuration object', () => {
            const schema = {
                minClearance: [ValidationRules.required(), ValidationRules.min(2)],
                maxClearance: [ValidationRules.required(), ValidationRules.min(2)]
            };

            const validConfig = {
                minClearance: 4.5,
                maxClearance: 10.0
            };

            const result = validateConfiguration(validConfig, schema);
            expect(result.isValid).toBe(true);
            expect(Object.keys(result.errors)).toHaveLength(0);
        });

        it('should return errors for invalid fields', () => {
            const schema = {
                minClearance: [ValidationRules.required(), ValidationRules.min(2)],
                maxClearance: [ValidationRules.required()]
            };

            const invalidConfig = {
                minClearance: 1.0, // Below min
                maxClearance: null // Missing required
            };

            const result = validateConfiguration(invalidConfig, schema);
            expect(result.isValid).toBe(false);
            expect(Object.keys(result.errors)).toHaveLength(2);
            expect(result.errors.minClearance).toBeDefined();
            expect(result.errors.maxClearance).toBeDefined();
        });

        it('should handle cross-field validation in configuration', () => {
            const schema = {
                minClearance: [ValidationRules.required()],
                maxClearance: [
                    ValidationRules.required(),
                    ValidationRules.greaterThan('minClearance')
                ]
            };

            const invalidConfig = {
                minClearance: 10.0,
                maxClearance: 5.0 // Less than min!
            };

            const result = validateConfiguration(invalidConfig, schema);
            expect(result.isValid).toBe(false);
            expect(result.errors.maxClearance).toBeDefined();
            expect(result.errors.maxClearance[0]).toContain('greater than');
        });
    });

    describe('ValidationRules factory', () => {
        it('should create required rule', () => {
            const rule = ValidationRules.required();
            expect(rule.type).toBe('required');
            expect(rule.message).toBeTruthy();
        });

        it('should create custom message for required', () => {
            const rule = ValidationRules.required('Custom message');
            expect(rule.message).toBe('Custom message');
        });

        it('should create min rule with value', () => {
            const rule = ValidationRules.min(5);
            expect(rule.type).toBe('min');
            expect(rule.value).toBe(5);
        });

        it('should create lessThan cross-field rule', () => {
            const rule = ValidationRules.lessThan('otherField');
            expect(rule.type).toBe('custom');
            expect(rule.validator).toBeDefined();

            // Test the validator
            const result = rule.validator!(10, { otherField: 20 });
            expect(result).toBe(true);

            const result2 = rule.validator!(30, { otherField: 20 });
            expect(result2).toBe(false);
        });
    });
});
