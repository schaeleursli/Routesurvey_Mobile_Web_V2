<template>
    <transition name="toast-slide">
        <div v-if="visible" class="sync-notification-toast" :class="type">
            <div class="toast-icon">
                <component :is="iconComponent" :size="24" />
            </div>
            <div class="toast-content">
                <div class="toast-title">{{ title }}</div>
                <div class="toast-message">{{ message }}</div>
            </div>
            <div class="toast-actions">
                <button 
                    v-if="showSyncButton" 
                    class="btn-action" 
                    @click="handleSync"
                >
                    <PhArrowsClockwise :size="16" />
                    Sync Now
                </button>
                <button class="btn-dismiss" @click="handleDismiss">
                    <PhX :size="18" />
                </button>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { ref, computed, onMounted, watch, markRaw } from 'vue';
import { PhArrowsClockwise, PhX, PhWarning, PhCheckCircle, PhInfo } from '@phosphor-icons/vue';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: 'Engineering Data Updated'
    },
    message: {
        type: String,
        default: 'The linked calculation has new data available.'
    },
    type: {
        type: String,
        default: 'info', // info, warning, success
        validator: (value) => ['info', 'warning', 'success'].includes(value)
    },
    showSyncButton: {
        type: Boolean,
        default: true
    },
    autoDismissMs: {
        type: Number,
        default: 10000 // 10 seconds
    }
});

const emit = defineEmits(['sync', 'dismiss']);

let autoDismissTimeout = null;

const iconComponent = computed(() => {
    switch (props.type) {
        case 'warning':
            return markRaw(PhWarning);
        case 'success':
            return markRaw(PhCheckCircle);
        case 'info':
        default:
            return markRaw(PhInfo);
    }
});

const handleSync = () => {
    emit('sync');
};

const handleDismiss = () => {
    emit('dismiss');
};

const setupAutoDismiss = () => {
    if (autoDismissTimeout) {
        clearTimeout(autoDismissTimeout);
    }
    
    if (props.autoDismissMs > 0 && props.visible) {
        autoDismissTimeout = setTimeout(() => {
            handleDismiss();
        }, props.autoDismissMs);
    }
};

watch(() => props.visible, (newVal) => {
    if (newVal) {
        setupAutoDismiss();
    } else if (autoDismissTimeout) {
        clearTimeout(autoDismissTimeout);
    }
});

onMounted(() => {
    if (props.visible) {
        setupAutoDismiss();
    }
});
</script>

<style scoped>
.sync-notification-toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 420px;
    max-width: calc(100vw - 48px);
    background: var(--bg-elevated);
    border-radius: 8px;
    box-shadow: 0 4px 20px rgb(0 0 0 / 30%);
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    border-left: 4px solid var(--info);
    z-index: 2000;
}

.sync-notification-toast.warning {
    border-left-color: var(--warning);
}

.sync-notification-toast.success {
    border-left-color: var(--success);
}

.toast-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--info-bg);
    border-radius: 8px;
    flex-shrink: 0;
}

.sync-notification-toast.warning .toast-icon {
    background: var(--warning-bg);
}

.sync-notification-toast.success .toast-icon {
    background: var(--success-bg);
}

.toast-icon i {
    font-size: 24px;
    color: var(--info);
}

.sync-notification-toast.warning .toast-icon i {
    color: var(--warning);
}

.sync-notification-toast.success .toast-icon i {
    color: var(--success);
}

.toast-content {
    flex: 1;
}

.toast-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
}

.toast-message {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.4;
}

.toast-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

.btn-action,
.btn-dismiss {
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 4px;
    border: none;
}

.btn-action {
    background: var(--accent);
    color: white;
}

.btn-action:hover {
    background: var(--accent-hover);
    transform: translateY(-1px);
}

.btn-dismiss {
    background: var(--bg-surface);
    color: var(--text-secondary);
    padding: 6px;
    width: 32px;
    height: 32px;
    justify-content: center;
}

.btn-dismiss:hover {
    background: var(--bg-base);
    color: var(--text-primary);
}

.btn-dismiss i {
    font-size: 18px;
}

/* Toast Slide Animation */
.toast-slide-enter-active,
.toast-slide-leave-active {
    transition: all 0.3s ease;
}

.toast-slide-enter-from {
    transform: translateX(100%);
    opacity: 0;
}

.toast-slide-leave-to {
    transform: translateX(100%);
    opacity: 0;
}

/* Responsive */
@media (width <= 768px) {
    .sync-notification-toast {
        bottom: 16px;
        right: 16px;
        left: 16px;
        width: auto;
        max-width: none;
    }
}
</style>
