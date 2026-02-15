<template>
    <div class="authority-card" :class="`jurisdiction-${authority.jurisdiction}`">
        <div class="card-header">
            <div class="authority-info">
                <h4>{{ authority.name }}</h4>
                <span class="authority-label">{{ authority.authorityLabel }}</span>
            </div>
            <div v-if="blockingCount > 0" class="blocking-badge">
                {{ blockingCount }}
            </div>
        </div>

        <div class="card-body">
            <!-- Escort Level -->
            <div class="detail-row">
                <span class="label">Escort:</span>
                <span class="value escort-level" :class="`escort-${escortLevel.toLowerCase()}`">
                    {{ formatEscortLevel(escortLevel) }}
                </span>
            </div>

            <!-- Travel Window Summary -->
            <div class="detail-row">
                <span class="label">Travel:</span>
                <span class="value">{{ travelWindowSummary }}</span>
            </div>

            <!-- Speed Limit -->
            <div v-if="speedLimit" class="detail-row">
                <span class="label">Speed:</span>
                <span class="value">{{ speedLimit }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { formatSpeed } from '@/utils/imperialUnits';

const props = defineProps({
    authority: {
        type: Object,
        required: true
    },
    decision: {
        type: Object,
        required: true
    },
    conflicts: {
        type: Array,
        default: () => []
    }
});

const escortLevel = computed(() => {
    return props.decision.constraints?.escort || 'NONE';
});

const travelWindowSummary = computed(() => {
    const windows = props.decision.constraints?.travelWindows || [];
    
    if (windows.length === 0) return 'No restrictions';
    if (windows.length === 1) {
        const w = windows[0];
        return `${formatDays(w.days)}, ${w.startTime}–${w.endTime}`;
    }
    
    return `${windows.length} windows`;
});

const speedLimit = computed(() => {
    const limit = props.decision.constraints?.maxSpeed;
    if (!limit) return null;
    
    return formatSpeed(limit); // Converts km/h to mph
});

const blockingCount = computed(() => {
    return props.conflicts.filter(c =>
        c.jurisdiction === props.authority.jurisdiction &&
        c.severity === 'block'
    ).length;
});

const formatEscortLevel = (level) => {
    const labels = {
        'NONE': 'None',
        'PILOT_1': 'Pilot (1)',
        'PILOT_2': 'Pilot (2)',
        'POLICE': 'Police',
        'SPECIAL': 'Special'
    };
    return labels[level] || level;
};

const formatDays = (days) => {
    if (!days || days.length === 0) return 'Any day';
    if (days.length === 7) return 'Any day';
    if (days.length === 5 && !days.includes('SAT') && !days.includes('SUN')) return 'Weekdays';
    if (days.length === 2 && days.includes('SAT') && days.includes('SUN')) return 'Weekends';
    
    return days.join(', ');
};
</script>

<style scoped>
.authority-card {
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg-surface);
    overflow: hidden;
    transition: all 0.2s;
}

.authority-card:hover {
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.card-header {
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--bg-elevated);
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.authority-info h4 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
}

.authority-label {
    font-size: 11px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.blocking-badge {
    background: var(--danger);
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
}

.card-body {
    padding: var(--spacing-md);
}

.detail-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--spacing-xs);
    font-size: 13px;
}

.detail-row .label {
    color: var(--text-secondary);
    font-weight: 500;
}

.detail-row .value {
    color: var(--text-primary);
    font-weight: 600;
}

.escort-level {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
}

.escort-level.escort-none {
    background: var(--success-bg);
    color: var(--success);
}

.escort-level.escort-pilot_1,
.escort-level.escort-pilot_2 {
    background: var(--warning-bg);
    color: var(--warning);
}

.escort-level.escort-police,
.escort-level.escort-special {
    background: var(--danger-bg);
    color: var(--danger);
}
</style>
