<template>
    <div class="engineering-status-badge" :class="`status-${statusClass}`">
        <component :is="statusIcon" :size="14" />
        <span class="status-text">{{ statusText }}</span>
        <button
            v-if="canLink"
            class="btn-action"
            @click="$emit('link')"
            title="Link Engineering"
        >
            <PhLink :size="14" />
        </button>
        <button
            v-if="canSync"
            class="btn-action sync"
            @click="$emit('sync')"
            title="Sync Engineering Data"
        >
            <PhArrowsClockwise :size="14" />
        </button>
    </div>
</template>

<script setup>
import { computed, markRaw } from 'vue';
import { PhLink, PhArrowsClockwise, PhPlug, PhWarning, PhCheckCircle } from '@phosphor-icons/vue';

const props = defineProps({
    engineeringStatus: {
        type: Object,
        default: null
    },
    permitStatus: {
        type: String,
        default: 'draft'
    }
});

const emit = defineEmits(['link', 'sync']);

const isLinked = computed(() => {
    return props.engineeringStatus?.is_linked || false;
});

const isOutOfSync = computed(() => {
    return props.engineeringStatus?.out_of_sync || false;
});

const statusClass = computed(() => {
    if (!isLinked.value) return 'not-linked';
    if (isOutOfSync.value) return 'out-of-sync';
    return 'linked';
});

const statusIcon = computed(() => {
    if (!isLinked.value) return markRaw(PhPlug);
    if (isOutOfSync.value) return markRaw(PhWarning);
    return markRaw(PhCheckCircle);
});

const statusText = computed(() => {
    if (!isLinked.value) return 'Not Linked';
    if (isOutOfSync.value) return 'Out of Sync';
    return 'Linked';
});

const canLink = computed(() => {
    return !isLinked.value;
});

const canSync = computed(() => {
    return isLinked.value && isOutOfSync.value;
});
</script>

<style scoped>
.engineering-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    border: 1px solid;
    transition: all 0.2s;
}

.status-not-linked {
    background: var(--bg-elevated);
    border-color: var(--border);
    color: var(--text-secondary);
}

.status-linked {
    background: var(--success-bg);
    border-color: var(--success);
    color: var(--success);
}

.status-out-of-sync {
    background: var(--warning-bg);
    border-color: var(--warning);
    color: var(--warning);
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
        transform: scale(1);
    }
    50% {
        opacity: 0.8;
        transform: scale(1.02);
    }
}

.status-text {
    font-size: 12px;
}

.btn-action {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.btn-action:hover {
    background: rgb(0 0 0 / 10%);
}

.btn-action i {
    font-size: 14px;
}
</style>
