<template>
    <span class="source-chip" :class="`source-${source.toLowerCase()}`" :title="tooltip">
        <component :is="iconComponent" :size="10" />
        <span class="source-label">{{ label }}</span>
    </span>
</template>

<script setup>
import { computed, markRaw } from 'vue';
import { PhCpu, PhPencil, PhCalculator, PhQuestion } from '@phosphor-icons/vue';

const props = defineProps({
    meta: {
        type: Object,
        default: null
    }
});

const source = computed(() => {
    return props.meta?.source || 'MANUAL';
});

const label = computed(() => {
    if (source.value === 'ENGINEERING') return 'Eng';
    if (source.value === 'MANUAL') return 'Manual';
    if (source.value === 'CALCULATED') return 'Calc';
    return source.value;
});

const iconComponent = computed(() => {
    if (source.value === 'ENGINEERING') return markRaw(PhCpu);
    if (source.value === 'MANUAL') return markRaw(PhPencil);
    if (source.value === 'CALCULATED') return markRaw(PhCalculator);
    return markRaw(PhQuestion);
});

const tooltip = computed(() => {
    if (!props.meta) return 'Manual input';
    
    let text = `Source: ${source.value}`;
    if (props.meta.calcJobId) {
        text += `\nCalc Job: ${props.meta.calcJobId.substring(0, 8)}`;
    }
    if (props.meta.syncedAt) {
        text += `\nSynced: ${new Date(props.meta.syncedAt).toLocaleString()}`;
    }
    return text;
});
</script>

<style scoped>
.source-chip {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.source-engineering {
    background: rgb(33 150 243 / 10%);
    color: #2196F3;
}

.source-manual {
    background: rgb(156 39 176 / 10%);
    color: #9C27B0;
}

.source-calculated {
    background: rgb(76 175 80 / 10%);
    color: #4CAF50;
}

.source-chip i {
    font-size: 10px;
}

.source-label {
    font-size: 9px;
}
</style>
