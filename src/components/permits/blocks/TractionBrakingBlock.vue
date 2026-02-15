<template>
    <div class="traction-braking-block">
        <div class="block-header">
            <h4>Traction & Braking Analysis</h4>
            <span v-if="isRequired" class="required-badge">
                <PhWarningCircle :size="14" />
                Required by Rules
            </span>
        </div>

        <div v-if="!hasPerformanceData" class="warning-banner">
            <PhWarning :size="24" weight="fill" />
            <div class="warning-content">
                <div class="warning-title">Engineering Data Required</div>
                <div class="warning-message">
                    Traction and braking analysis must be provided for this permit application.
                </div>
            </div>
        </div>

        <div v-else class="performance-panels">
            <!-- Traction Analysis -->
            <div v-if="tractionData" class="analysis-panel">
                <div class="panel-header">
                    <PhArrowCircleUp :size="20" />
                    <h5>Traction Analysis</h5>
                </div>
                
                <div class="analysis-data">
                    <div class="data-row">
                        <span class="label">Maximum Grade:</span>
                        <span class="value">{{ tractionData.gradePct }}%</span>
                    </div>
                    
                    <div class="data-row">
                        <span class="label">Required Force:</span>
                        <span class="value">{{ formatForce(tractionData.requiredForce_N) }}</span>
                    </div>
                    
                    <div class="data-row">
                        <span class="label">Available Force:</span>
                        <span class="value">{{ formatForce(tractionData.availableForce_N) }}</span>
                    </div>
                    
                    <div class="data-row highlight">
                        <span class="label">Safety Factor:</span>
                        <span 
                            class="value safety-factor"
                            :class="getSafetyClass(tractionData.safetyFactor)"
                        >
                            {{ tractionData.safetyFactor.toFixed(2) }}
                        </span>
                    </div>
                </div>

                <div class="metadata">
                    <div class="meta-item">
                        <PhFileCode :size="12" />
                        <span>Calc Job: {{ tractionData._meta.calcJobId }}</span>
                    </div>
                    <div class="meta-item">
                        <PhShieldCheck :size="12" />
                        <span>Confidence: {{ tractionData._meta.confidence }}</span>
                    </div>
                </div>
            </div>

            <!-- Braking Analysis -->
            <div v-if="brakingData" class="analysis-panel">
                <div class="panel-header">
                    <PhArrowCircleDown :size="20" />
                    <h5>Braking Analysis</h5>
                </div>
                
                <div class="analysis-data">
                    <div class="data-row">
                        <span class="label">Required Force:</span>
                        <span class="value">{{ formatForce(brakingData.requiredForce_N) }}</span>
                    </div>
                    
                    <div class="data-row">
                        <span class="label">Available Force:</span>
                        <span class="value">{{ formatForce(brakingData.availableForce_N) }}</span>
                    </div>
                    
                    <div class="data-row highlight">
                        <span class="label">Safety Factor:</span>
                        <span 
                            class="value safety-factor"
                            :class="getSafetyClass(brakingData.safetyFactor)"
                        >
                            {{ brakingData.safetyFactor.toFixed(2) }}
                        </span>
                    </div>
                </div>

                <div class="metadata">
                    <div class="meta-item">
                        <PhFileCode :size="12" />
                        <span>Calc Job: {{ brakingData._meta.calcJobId }}</span>
                    </div>
                    <div class="meta-item">
                        <PhShieldCheck :size="12" />
                        <span>Confidence: {{ brakingData._meta.confidence }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { PhWarningCircle, PhWarning, PhArrowCircleUp, PhArrowCircleDown, PhFileCode, PhShieldCheck } from '@phosphor-icons/vue';

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

const hasPerformanceData = computed(() => {
    return props.payload.transport?.performance?.braking || 
           props.payload.transport?.performance?.traction;
});

const brakingData = computed(() => {
    return props.payload.transport?.performance?.braking;
});

const tractionData = computed(() => {
    return props.payload.transport?.performance?.traction;
});

const isRequired = computed(() => {
    // Check if rules require this section
    if (!props.rollup?.rollup?.requiredItems) return false;
    
    return props.rollup.rollup.requiredItems.some(
        item => item.section === 'traction_braking'
    );
});

const formatForce = (newtons) => {
    // Convert Newtons to lbf (pounds-force)
    const lbf = newtons * 0.224809;
    return `${Math.round(lbf).toLocaleString()} lbf`;
};

const getSafetyClass = (factor) => {
    if (factor >= 1.5) return 'excellent';
    if (factor >= 1.2) return 'good';
    if (factor >= 1.0) return 'marginal';
    return 'insufficient';
};
</script>

<style scoped>
.traction-braking-block {
    padding: var(--spacing-md);
}

.block-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
}

.block-header h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
}

.required-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: var(--warning-bg);
    color: var(--warning);
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
}

.warning-banner {
    display: flex;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: var(--warning-bg);
    border: 1px solid var(--warning);
    border-radius: 6px;
    color: var(--warning);
}

.warning-banner i {
    font-size: 24px;
    flex-shrink: 0;
}

.warning-content {
    flex: 1;
}

.warning-title {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 4px;
}

.warning-message {
    font-size: 13px;
    opacity: 0.9;
}

.performance-panels {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
}

.analysis-panel {
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: var(--spacing-md);
    background: var(--bg-elevated);
}

.panel-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-md);
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--border);
}

.panel-header i {
    font-size: 20px;
    color: var(--accent);
}

.panel-header h5 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
}

.analysis-data {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-md);
}

.data-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-xs) 0;
    font-size: 13px;
}

.data-row.highlight {
    padding-top: var(--spacing-sm);
    border-top: 1px solid var(--border);
}

.data-row .label {
    color: var(--text-secondary);
    font-weight: 500;
}

.data-row .value {
    color: var(--text-primary);
    font-weight: 600;
    font-family: monospace;
}

.safety-factor {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 14px;
}

.safety-factor.excellent {
    background: var(--success-bg);
    color: var(--success);
}

.safety-factor.good {
    background: rgb(76 175 80 / 10%);
    color: #4CAF50;
}

.safety-factor.marginal {
    background: var(--warning-bg);
    color: var(--warning);
}

.safety-factor.insufficient {
    background: var(--danger-bg);
    color: var(--danger);
}

.metadata {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-top: var(--spacing-sm);
    border-top: 1px solid var(--border);
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--text-secondary);
}

.meta-item i {
    font-size: 12px;
}
</style>
