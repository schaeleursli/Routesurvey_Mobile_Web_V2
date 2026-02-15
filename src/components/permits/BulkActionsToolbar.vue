<template>
    <transition name="toolbar-slide">
        <div v-if="selectedCount > 0" class="bulk-actions-toolbar">
            <div class="toolbar-content">
                <div class="selection-info">
                    <PhCheckCircle :size="20" />
                    <span class="count">{{ selectedCount }} selected</span>
                </div>

                <div class="action-buttons">
                    <button
                        v-if="canLink"
                        class="btn-bulk btn-link"
                        @click="$emit('bulk-link')"
                        :disabled="disabled"
                    >
                        <PhLink :size="16" />
                        Link Engineering
                    </button>

                    <button
                        v-if="canSync"
                        class="btn-bulk btn-sync"
                        @click="$emit('bulk-sync')"
                        :disabled="disabled"
                    >
                        <PhArrowsClockwise :size="16" />
                        Sync All
                    </button>

                    <button
                        v-if="canExport"
                        class="btn-bulk btn-export"
                        @click="$emit('bulk-export')"
                        :disabled="disabled"
                    >
                        <PhDownloadSimple :size="16" />
                        Export All
                    </button>

                    <button
                        class="btn-bulk btn-clear"
                        @click="$emit('clear-selection')"
                        title="Clear selection"
                    >
                        <PhX :size="16" />
                        Clear
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { computed } from 'vue';
import { PhCheckCircle, PhLink, PhArrowsClockwise, PhDownloadSimple, PhX } from '@phosphor-icons/vue';

const props = defineProps({
    selectedCount: {
        type: Number,
        required: true
    },
    summary: {
        type: Object,
        default: null
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

defineEmits(['bulk-link', 'bulk-sync', 'bulk-export', 'clear-selection']);

const canLink = computed(() => {
    return props.summary && props.summary.not_linked > 0;
});

const canSync = computed(() => {
    return props.summary && props.summary.linked > 0;
});

const canExport = computed(() => {
    return props.summary && props.summary.ready_to_export > 0;
});
</script>

<style scoped>
.bulk-actions-toolbar {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    background: var(--bg-elevated);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgb(0 0 0 / 30%);
    border: 1px solid var(--border);
}

.toolbar-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    padding: var(--spacing-md) var(--spacing-lg);
}

.selection-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding-right: var(--spacing-md);
    border-right: 1px solid var(--border);
}

.selection-info i {
    font-size: 20px;
    color: var(--accent);
}

.selection-info .count {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
}

.action-buttons {
    display: flex;
    gap: var(--spacing-sm);
}

.btn-bulk {
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
    border: none;
}

.btn-bulk i {
    font-size: 16px;
}

.btn-link {
    background: var(--accent);
    color: white;
}

.btn-link:hover:not(:disabled) {
    background: var(--accent-hover);
    transform: translateY(-2px);
}

.btn-sync {
    background: var(--info);
    color: white;
}

.btn-sync:hover:not(:disabled) {
    background: var(--info-hover);
    transform: translateY(-2px);
}

.btn-export {
    background: var(--success);
    color: white;
}

.btn-export:hover:not(:disabled) {
    background: var(--success-hover);
    transform: translateY(-2px);
}

.btn-clear {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    color: var(--text-secondary);
}

.btn-clear:hover {
    background: var(--bg-base);
    color: var(--text-primary);
}

.btn-bulk:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Toolbar Slide Animation */
.toolbar-slide-enter-active,
.toolbar-slide-leave-active {
    transition: all 0.3s ease;
}

.toolbar-slide-enter-from {
    transform: translate(-50%, 100%);
    opacity: 0;
}

.toolbar-slide-leave-to {
    transform: translate(-50%, 100%);
    opacity: 0;
}

/* Responsive */
@media (width <= 768px) {
    .bulk-actions-toolbar {
        left: 16px;
        right: 16px;
        transform: translateX(0);
        bottom: 16px;
    }

    .toolbar-content {
        flex-wrap: wrap;
        gap: var(--spacing-sm);
    }

    .selection-info {
        flex: 1 1 100%;
        border-right: none;
        border-bottom: 1px solid var(--border);
        padding-bottom: var(--spacing-sm);
    }

    .action-buttons {
        flex: 1;
        justify-content: space-between;
    }

    .btn-bulk {
        font-size: 13px;
        padding: 6px 12px;
    }
}
</style>
