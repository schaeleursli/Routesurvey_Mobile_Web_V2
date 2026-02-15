<template>
    <div class="state-addenda-block">
        <h4>State-Specific Requirements</h4>
        <p class="description">
            Auto-generated requirements based on jurisdiction decisions
        </p>

        <div v-if="jurisdictionRequirements.length === 0" class="empty-state">
            <PhInfo :size="48" />
            <p>No state-specific requirements yet. Complete vehicle and route information to see requirements.</p>
        </div>

        <div v-else class="jurisdictions-list">
            <div
                v-for="jurisdiction in jurisdictionRequirements"
                :key="jurisdiction.code"
                class="jurisdiction-panel"
                :class="`jurisdiction-${jurisdiction.code.toLowerCase()}`"
            >
                <div class="panel-header">
                    <div class="header-left">
                        <h5>{{ jurisdiction.name }}</h5>
                        <span class="jurisdiction-code">{{ jurisdiction.code }}</span>
                    </div>
                    <div class="status-indicator" :class="`status-${jurisdiction.status}`">
                        {{ jurisdiction.status }}
                    </div>
                </div>

                <div class="panel-body">
                    <!-- Escort Requirements -->
                    <div v-if="jurisdiction.requirements.escort" class="requirement-item">
                        <div class="requirement-icon">
                            <PhIdentificationBadge :size="16" />
                        </div>
                        <div class="requirement-content">
                            <div class="requirement-title">Escort Required</div>
                            <div class="requirement-value">{{ formatEscort(jurisdiction.requirements.escort) }}</div>
                        </div>
                    </div>

                    <!-- Travel Windows -->
                    <div v-if="jurisdiction.requirements.travelWindows" class="requirement-item">
                        <div class="requirement-icon">
                            <PhClock :size="16" />
                        </div>
                        <div class="requirement-content">
                            <div class="requirement-title">Travel Restrictions</div>
                            <div class="requirement-value">
                                {{ formatTravelWindows(jurisdiction.requirements.travelWindows) }}
                            </div>
                        </div>
                    </div>

                    <!-- Speed Limit -->
                    <div v-if="jurisdiction.requirements.maxSpeed" class="requirement-item">
                        <div class="requirement-icon">
                            <PhGauge :size="16" />
                        </div>
                        <div class="requirement-content">
                            <div class="requirement-title">Max Speed</div>
                            <div class="requirement-value">{{ jurisdiction.requirements.maxSpeed }} mph</div>
                        </div>
                    </div>

                    <!-- Additional Documents -->
                    <div v-if="jurisdiction.requirements.additionalDocs?.length > 0" class="requirement-item">
                        <div class="requirement-icon">
                            <PhFileText :size="16" />
                        </div>
                        <div class="requirement-content">
                            <div class="requirement-title">Additional Documents</div>
                            <ul class="documents-list">
                                <li v-for="(doc, idx) in jurisdiction.requirements.additionalDocs" :key="idx">
                                    {{ doc }}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { PhInfo, PhIdentificationBadge, PhClock, PhGauge, PhFileText } from '@phosphor-icons/vue';

const props = defineProps({
    payload: {
        type: Object,
        required: true
    },
    rollup: {
        type: Object,
        default: null
    }
});

const jurisdictionRequirements = computed(() => {
    if (!props.rollup || !props.rollup.decisions) {
        return [];
    }

    return props.rollup.decisions.map(decision => ({
        code: decision.jurisdiction,
        name: decision.jurisdictionName || decision.jurisdiction,
        status: decision.triggered ? 'required' : 'ok',
        requirements: {
            escort: decision.constraints?.escort,
            travelWindows: decision.constraints?.travelWindows,
            maxSpeed: decision.constraints?.maxSpeed,
            additionalDocs: decision.constraints?.additionalDocuments || []
        }
    }));
});

const formatEscort = (level) => {
    const labels = {
        'NONE': 'None Required',
        'PILOT_1': 'Pilot (1 vehicle)',
        'PILOT_2': 'Pilot (2 vehicles)',
        'POLICE': 'Police Escort Required',
        'SPECIAL': 'Special Arrangement'
    };
    return labels[level] || level;
};

const formatTravelWindows = (windows) => {
    if (!windows || windows.length === 0) return 'No restrictions';
    if (windows.length === 1) {
        const w = windows[0];
        return `${w.days?.join(', ') || 'Any day'}, ${w.startTime}–${w.endTime}`;
    }
    return `${windows.length} time windows defined`;
};
</script>

<style scoped>
.state-addenda-block {
    padding: var(--spacing-md);
}

.state-addenda-block h4 {
    margin: 0 0 var(--spacing-xs) 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
}

.description {
    margin: 0 0 var(--spacing-md) 0;
    font-size: 13px;
    color: var(--text-secondary);
}

.empty-state {
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--text-secondary);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
}

.empty-state i {
    font-size: 48px;
    opacity: 0.3;
}

.empty-state p {
    margin: 0;
    max-width: 300px;
}

.jurisdictions-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.jurisdiction-panel {
    border: 1px solid var(--border);
    border-radius: 6px;
    overflow: hidden;
    background: var(--bg-elevated);
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border);
}

.header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.panel-header h5 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
}

.jurisdiction-code {
    font-size: 11px;
    padding: 2px 6px;
    background: var(--accent-bg);
    color: var(--accent);
    border-radius: 4px;
    font-weight: 700;
}

.status-indicator {
    font-size: 11px;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: 600;
    text-transform: uppercase;
}

.status-indicator.status-ok {
    background: var(--success-bg);
    color: var(--success);
}

.status-indicator.status-required {
    background: var(--warning-bg);
    color: var(--warning);
}

.panel-body {
    padding: var(--spacing-md);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.requirement-item {
    display: flex;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    background: var(--bg-base);
    border-radius: 4px;
}

.requirement-icon {
    width: 32px;
    height: 32px;
    background: var(--accent-bg);
    color: var(--accent);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
}

.requirement-content {
    flex: 1;
}

.requirement-title {
    font-weight: 600;
    font-size: 13px;
    color: var(--text-primary);
    margin-bottom: 2px;
}

.requirement-value {
    font-size: 13px;
    color: var(--text-secondary);
}

.documents-list {
    margin: 4px 0 0;
    padding-left: 20px;
    font-size: 12px;
    color: var(--text-secondary);
}

.documents-list li {
    margin-bottom: 2px;
}
</style>
