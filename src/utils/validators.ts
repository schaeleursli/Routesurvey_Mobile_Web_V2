/**
 * Type narrowing helper for numbers.
 * Returns the number if value is a finite number, otherwise null.
 */
export const asNumber = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    return null;
};
