<template>
    <BaseModal :visible="visible" :size="size" :close-on-backdrop="false" @close="handleClose">
        <template #header>
            <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                <i v-if="icon" :class="icon" :style="{ color: iconColor }"></i>
                <span>{{ title }}</span>
            </div>
        </template>

        <div class="confirmation-content">
            <p v-if="message" class="confirmation-message">{{ message }}</p>
            <slot name="content">
                <p v-if="!message && !$slots.content" class="confirmation-message">
                    {{ defaultMessage }}
                </p>
            </slot>
            <div v-if="details" class="confirmation-details">
                <p class="text-muted">
                    <strong>{{ detailsLabel }}:</strong> {{ details }}
                </p>
            </div>
        </div>

        <template #footer>
            <BaseButton v-if="showCancelButton" variant="secondary" size="small" @click="handleCancel"
                :disabled="loading">
                {{ cancelText }}
            </BaseButton>
            <BaseButton v-if="showDangerButton" variant="danger" size="small" @click="handleConfirm" :disabled="loading"
                :left-icon="loading ? 'fas fa-spinner fa-spin' : dangerIcon">
                {{ dangerText }}
            </BaseButton>
            <BaseButton v-if="showPrimaryButton" variant="primary" size="small" @click="handlePrimary"
                :disabled="loading || primaryDisabled"
                :left-icon="loading && primaryLoading ? 'fas fa-spinner fa-spin' : primaryIcon">
                {{ primaryText }}
            </BaseButton>
        </template>
    </BaseModal>
</template>

<script setup>
import { computed } from 'vue';
import BaseModal from './BaseModal.vue';
import BaseButton from './BaseButton.vue';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        default: null
    },
    defaultMessage: {
        type: String,
        default: 'Are you sure you want to proceed?'
    },
    details: {
        type: String,
        default: null
    },
    detailsLabel: {
        type: String,
        default: 'Item'
    },
    icon: {
        type: String,
        default: null
    },
    iconColor: {
        type: String,
        default: null
    },
    size: {
        type: String,
        default: 'medium',
        validator: (value) => ['small', 'medium', 'large', 'fullscreen'].includes(value)
    },
    // Button configuration
    showCancelButton: {
        type: Boolean,
        default: true
    },
    showDangerButton: {
        type: Boolean,
        default: false
    },
    showPrimaryButton: {
        type: Boolean,
        default: false
    },
    cancelText: {
        type: String,
        default: 'Cancel'
    },
    dangerText: {
        type: String,
        default: 'Delete'
    },
    primaryText: {
        type: String,
        default: 'Save'
    },
    dangerIcon: {
        type: String,
        default: null
    },
    primaryIcon: {
        type: String,
        default: null
    },
    loading: {
        type: Boolean,
        default: false
    },
    primaryLoading: {
        type: Boolean,
        default: false
    },
    primaryDisabled: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['close', 'cancel', 'confirm', 'primary']);

const handleClose = () => {
    emit('close');
};

const handleCancel = () => {
    emit('cancel');
    emit('close');
};

const handleConfirm = () => {
    emit('confirm');
};

const handlePrimary = () => {
    emit('primary');
};
</script>

<style scoped>
.confirmation-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.confirmation-message {
    margin: 0;
    color: var(--text-primary);
    font-size: var(--font-size-base);
    line-height: 1.5;
}

.confirmation-details {
    margin-top: var(--spacing-xs);
}

.confirmation-details p {
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
}

.text-muted {
    color: var(--text-secondary);
}
</style>
