<template>
    <div v-if="visible" class="users-admin__modal-overlay" @click="$emit('close')">
        <BaseCard class="users-admin__modal users-admin__modal--small" @click.stop>
            <template #header>
                <div class="users-admin__modal-header">
                    <h3 class="users-admin__modal-title">{{ $t('cancelUserPlan') }}</h3>
                    <BaseButton @click="$emit('close')" variant="ghost" size="small">
                        <i class="fas fa-times"></i>
                    </BaseButton>
                </div>
            </template>

            <form @submit.prevent="handleSubmit" class="users-admin__modal-form">
                <div class="users-admin__warning-alert">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>{{ $t('cancelPlanWarning') }}</span>
                </div>
            </form>

            <template #footer>
                <div class="users-admin__modal-footer">
                    <BaseButton @click="$emit('close')" variant="secondary">
                        {{ $t('cancel') }}
                    </BaseButton>
                    <BaseButton type="submit" variant="danger" @click="handleSubmit">
                        {{ $t('cancelPlan') }}
                    </BaseButton>
                </div>
            </template>
        </BaseCard>
    </div>
</template>

<script setup>
import { BaseCard, BaseButton } from '@/components/ui';

defineProps({
    visible: Boolean
});

const emit = defineEmits(['close', 'submit']);

const handleSubmit = () => {
    emit('submit');
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

.users-admin__warning-alert {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: rgb(243 156 18 / 10%);
    border: 1px solid var(--warning);
    border-radius: var(--radius-lg);
    color: var(--warning);
    font-weight: var(--font-weight-medium);
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
