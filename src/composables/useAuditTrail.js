import { ref } from 'vue';

/**
 * Composable for Audit Trail
 * 
 * Handles fetching and displaying audit history for permit cases
 */
export function useAuditTrail(caseId) {
    const auditTrail = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    const total = ref(0);

    /**
     * Fetch audit trail
     */
    const fetchAuditTrail = async (options = {}) => {
        if (!caseId) return;

        isLoading.value = true;
        error.value = null;

        try {
            const params = new URLSearchParams();

            if (options.eventTypes) {
                options.eventTypes.forEach(type => {
                    params.append('event_types', type);
                });
            }

            if (options.limit) params.append('limit', options.limit);
            if (options.offset) params.append('offset', options.offset);

            const response = await fetch(
                `/api/v1/permit-cases/${caseId}/audit-trail?${params.toString()}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch audit trail');
            }

            const data = await response.json();
            auditTrail.value = data.entries || [];
            total.value = data.total || 0;

        } catch (err) {
            error.value = err.message;
            console.error('Fetch audit trail error:', err);
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Fetch field history
     */
    const fetchFieldHistory = async (fieldPath, limit = 50) => {
        if (!caseId || !fieldPath) return null;

        try {
            const response = await fetch(
                `/api/v1/permit-cases/${caseId}/field-history/${encodeURIComponent(fieldPath)}?limit=${limit}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch field history');
            }

            return await response.json();
        } catch (err) {
            console.error('Fetch field history error:', err);
            return null;
        }
    };

    /**
     * Group entries by date
     */
    const groupByDate = (entries) => {
        const grouped = {};

        entries.forEach(entry => {
            const date = new Date(entry.created_at).toLocaleDateString();
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(entry);
        });

        return grouped;
    };

    /**
     * Get event display info
     */
    const getEventInfo = (eventType) => {
        const eventConfig = {
            'field_change': {
                icon: 'bi-pencil',
                color: 'info',
                label: 'Field Updated'
            },
            'engineering_override': {
                icon: 'bi-exclamation-triangle',
                color: 'warning',
                label: 'Engineering Override'
            },
            'engineering_linked': {
                icon: 'bi-link-45deg',
                color: 'success',
                label: 'Engineering Linked'
            },
            'engineering_synced': {
                icon: 'bi-arrow-repeat',
                color: 'info',
                label: 'Engineering Synced'
            },
            'status_changed': {
                icon: 'bi-flag',
                color: 'primary',
                label: 'Status Changed'
            },
            'case_created': {
                icon: 'bi-plus-circle',
                color: 'success',
                label: 'Case Created'
            }
        };

        return eventConfig[eventType] || {
            icon: 'bi-circle',
            color: 'secondary',
            label: eventType
        };
    };

    return {
        // State
        auditTrail,
        isLoading,
        error,
        total,

        // Methods
        fetchAuditTrail,
        fetchFieldHistory,
        groupByDate,
        getEventInfo
    };
}
