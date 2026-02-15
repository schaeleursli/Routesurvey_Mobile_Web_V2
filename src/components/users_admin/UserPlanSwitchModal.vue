<template>
    <div v-if="visible" class="users-admin__modal-overlay" @click="$emit('close')">
        <BaseCard class="users-admin__modal users-admin__modal--small" @click.stop>
            <template #header>
                <div class="users-admin__modal-header">
                    <h3 class="users-admin__modal-title">{{ $t('switchUserPlan') }}</h3>
                    <BaseButton @click="$emit('close')" variant="ghost" size="small">
                        <i class="fas fa-times"></i>
                    </BaseButton>
                </div>
            </template>

            <form @submit.prevent="handleSubmit" class="users-admin__modal-form">
                <div class="users-admin__form-field">
                    <label class="users-admin__form-label">{{ $t('newPlan') }}</label>
                    <select v-model="form.newPlan" class="users-admin__form-select" required>
                        <option value="" disabled>{{ $t('selectPlan') }}</option>
                        <option v-for="plan in planOptions" :key="plan.value" :value="plan.value">
                            {{ plan.label }}
                        </option>
                    </select>
                </div>
            </form>

            <template #footer>
                <div class="users-admin__modal-footer">
                    <BaseButton @click="$emit('close')" variant="secondary">
                        {{ $t('cancel') }}
                    </BaseButton>
                    <BaseButton type="submit" variant="primary" @click="handleSubmit">
                        {{ $t('switchPlan') }}
                    </BaseButton>
                </div>
            </template>
        </BaseCard>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { BaseCard, BaseButton } from '@/components/ui';

defineProps({
    visible: Boolean,
    planOptions: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['close', 'submit']);

const form = ref({
    newPlan: ''
});

const handleSubmit = () => {
    emit('submit', form.value);
    form.value.newPlan = '';
};
</script>

<style scoped>
.users-admin__modal-overlay {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 50%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
    padding: var(--spacing-lg);
    backdrop-filter: blur(4px);
}

.users-admin__modal {
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.users-admin__modal--small {
    max-width: 400px;
}

.users-admin__modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border);
    background: var(--bg-elevated);
}

.users-admin__modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
}

.users-admin__modal-form {
    padding: 1rem;
}

.users-admin__form-label {
    display: block;
    margin-bottom: var(--spacing-xs);
    font-weight: var(--font-weight-medium);
    color: var(--text-primary);
    font-size: var(--font-size-sm);
}

.users-admin__form-select {
    width: 100%;
    padding: var(--spacing-sm);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    background-color: var(--bg-base);
    color: var(--text-primary);
    font-size: var(--font-size-sm);
    transition: border-color 0.2s ease;
}

.users-admin__form-select:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-light);
}

.users-admin__modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border);
    background: var(--bg-elevated);
}
</style>
