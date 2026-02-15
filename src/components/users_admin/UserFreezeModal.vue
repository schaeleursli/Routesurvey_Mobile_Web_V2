<template>
    <div v-if="visible" class="users-admin__modal-overlay" @click="$emit('close')">
        <div class="users-admin__modal users-admin__modal--small" @click.stop>
            <div class="users-admin__modal-header">
                <h3 class="users-admin__modal-title">{{ $t('freezeUser') }}</h3>
                <BaseButton @click="$emit('close')" variant="ghost" size="small">
                    <i class="fas fa-times"></i>
                </BaseButton>
            </div>

            <div class="users-admin__modal-body">
                <form @submit.prevent="handleSubmit" class="users-admin__modal-form">
                    <BaseFormField v-model="form.reason" type="textarea" :label="$t('freezeReason')"
                        :placeholder="$t('enterFreezeReason')" required :rows="4" class="users-admin__form-field" />
                </form>
            </div>

            <div class="users-admin__modal-footer">
                <BaseButton @click="$emit('close')" variant="secondary">
                    {{ $t('cancel') }}
                </BaseButton>
                <BaseButton type="submit" variant="primary" @click="handleSubmit">
                    {{ $t('freezeUser') }}
                </BaseButton>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { BaseButton, BaseFormField } from '@/components/ui';

defineProps({
    visible: Boolean
});

const emit = defineEmits(['close', 'submit']);

const form = ref({
    reason: ''
});

const handleSubmit = () => {
    emit('submit', form.value);
    form.value.reason = '';
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
    background: var(--bg-surface);
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 10%);
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

.users-admin__modal-body {
    flex: 1;
    overflow-y: auto;
}

.users-admin__modal-form {
    padding: 1rem;
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
