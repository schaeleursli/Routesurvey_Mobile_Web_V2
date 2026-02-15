export const AuditUtils = {
    /**
     * Calculates the differences between two objects.
     * @param {Object} oldData - The original data object.
     * @param {Object} newData - The new data object.
     * @param {Array} ignoreFields - Fields to ignore in comparison.
     * @returns {Array} An array of change strings (e.g., "Field: 'Old' -> 'New'").
     */
    calculateDiff(oldData, newData, ignoreFields = ['media', 'history', 'timestamp', 'createdBy', 'gpsAccuracy']) {
        const changes = [];
        const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);

        for (const key of allKeys) {
            if (ignoreFields.includes(key)) continue;

            const oldVal = oldData?.[key];
            const newVal = newData?.[key];

            // Simple equality check (works for primitives)
            // For objects/arrays, we might want deeper comparison or just log that it changed
            if (oldVal !== newVal) {
                // Handle "null" vs "undefined" vs "empty string" noise
                if (!oldVal && !newVal) continue; // Both falsy (e.g., null and "") - treat as same

                // Format values for readability
                const formatVal = (v) => (v === undefined || v === null || v === '') ? 'Empty' : `'${v}'`;

                changes.push({
                    field: key,
                    oldValue: oldVal,
                    newValue: newVal,
                    message: `${this.formatFieldName(key)}: ${formatVal(oldVal)} → ${formatVal(newVal)}`
                });
            }
        }
        return changes;
    },

    /**
     * Creates a standard audit entry.
     * @param {Object} user - The user object (must have name/email).
     * @param {String} action - The action performed (e.g., 'update', 'create').
     * @param {Array} changes - The list of changes (from calculateDiff).
     * @returns {Object} The audit entry object.
     */
    createAuditEntry(user, action, changes) {
        return {
            timestamp: new Date().toISOString(),
            user: user?.name || user?.email || 'Unknown User',
            userId: user?.uid || user?.id,
            action: action,
            changes: changes.map(c => c.message) // Store human-readable messages
        };
    },

    /**
     * Appends an audit entry to the point data.
     * @param {Object} pointData - The current point data object (parsed JSON).
     * @param {Object} entry - The audit entry to append.
     * @returns {Object} The updated point data object with history.
     */
    appendAuditLog(pointData, entry) {
        const updatedData = { ...pointData };
        if (!updatedData.history) {
            updatedData.history = [];
        }
        updatedData.history.push(entry);
        return updatedData;
    },

    /**
     * Helper to format camelCase field names to Title Case.
     */
    formatFieldName(fieldName) {
        // "roadAddress" -> "Road Address"
        return fieldName
            .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
            .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
    }
};

export default AuditUtils;
