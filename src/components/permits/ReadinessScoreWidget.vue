<template>
    <div class="readiness-score-widget">
        <div class="score-circle" :class="scoreClass">
            <div class="score-value">{{ score }}</div>
            <div class="score-label">/ 100</div>
        </div>
        <div class="score-breakdown">
            <div class="breakdown-item" v-if="blockingIssues > 0">
                <span class="count">−{{ blockingIssues * 30 }}</span>
                <span class="label">Blocking issues</span>
            </div>
            <div class="breakdown-item" v-if="blockingConflicts > 0">
                <span class="count">−{{ blockingConflicts * 15 }}</span>
                <span class="label">Conflicts</span>
            </div>
            <div class="breakdown-item" v-if="warnings > 0">
                <span class="count">−{{ warnings * 5 }}</span>
                <span class="label">Warnings</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    score: {
        type: Number,
        required: true
    },
    rollup: {
        type: Object,
        default: null
    }
});

const validation = computed(() => props.rollup?.validation || {});
const conflicts = computed(() => props.rollup?.conflicts || []);

const blockingIssues = computed(() => validation.value.blockingIssues?.length || 0);
const blockingConflicts = computed(() => 
    conflicts.value.filter(c => c.severity === 'block').length
);
const warnings = computed(() => validation.value.warnings?.length || 0);

const scoreClass = computed(() => {
    if (props.score >= 80) return 'score-excellent';
    if (props.score >= 60) return 'score-good';
    if (props.score >= 40) return 'score-fair';
    return 'score-poor';
});
</script>

<style scoped>
.readiness-score-widget {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

.score-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 4px solid;
    position: relative;
}

.score-circle.score-excellent {
    border-color: var(--success);
    background: var(--success-bg);
}

.score-circle.score-good {
    border-color: #4CAF50;
    background: rgb(76 175 80 / 10%);
}

.score-circle.score-fair {
    border-color: var(--warning);
    background: var(--warning-bg);
}

.score-circle.score-poor {
    border-color: var(--danger);
    background: var(--danger-bg);
}

.score-value {
    font-size: 32px;
    font-weight: 700;
    line-height: 1;
    color: var(--text-primary);
}

.score-label {
    font-size: 11px;
    color: var(--text-secondary);
    font-weight: 600;
}

.score-breakdown {
    flex: 1;
}

.breakdown-item {
    display: flex;
    gap: var(--spacing-xs);
    margin-bottom: 4px;
    font-size: 12px;
}

.breakdown-item .count {
    color: var(--danger);
    font-weight: 700;
    min-width: 40px;
}

.breakdown-item .label {
    color: var(--text-secondary);
}
</style>
