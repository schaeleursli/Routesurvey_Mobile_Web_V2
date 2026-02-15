<template>
    <div v-if="visible" class="users-admin__modal-overlay" @click="$emit('close')">
        <BaseCard class="users-admin__modal" @click.stop>
            <template #header>
                <div class="users-admin__modal-header">
                    <h3 class="users-admin__modal-title">
                        {{ isEditing ? $t('editUser') : $t('addNewUser') }}
                    </h3>
                    <BaseButton @click="$emit('close')" variant="ghost" size="small">
                        <i class="fas fa-times"></i>
                    </BaseButton>
                </div>
            </template>

            <form @submit.prevent="handleSubmit" class="users-admin__modal-form">
                <div class="users-admin__form-grid">
                    <BaseFormField v-model="form.firstName" type="text" :label="$t('firstName')" required
                        class="users-admin__form-field" />
                    <BaseFormField v-model="form.lastName" type="text" :label="$t('lastName')" required
                        class="users-admin__form-field" />
                </div>

                <div v-if="!isEditing" class="users-admin__form-grid">
                    <BaseFormField v-model="form.email" type="email" :label="$t('email')" required
                        class="users-admin__form-field" />
                    <BaseFormField v-model="form.password" type="password" :label="$t('password')" required
                        minlength="6" class="users-admin__form-field" />
                </div>

                <div class="users-admin__form-grid">
                    <BaseFormField v-model="form.userType" type="select" :label="$t('userType')"
                        :options="userTypeOptions" required class="users-admin__form-field" />
                    <BaseFormField v-model="form.mobilePhone" type="tel" :label="$t('mobileNumber')"
                        class="users-admin__form-field" />
                </div>

                <div class="users-admin__form-grid">
                    <BaseFormField v-model="form.companyName" type="text" :label="$t('companyName')"
                        class="users-admin__form-field" />
                    <BaseFormField v-model="form.companyWebsite" type="url" :label="$t('companyWebsite')"
                        class="users-admin__form-field" />
                </div>

                <div class="users-admin__form-grid">
                    <BaseFormField v-model="form.companyADStreet" type="text" :label="$t('companyADStreet')"
                        class="users-admin__form-field" />
                    <BaseFormField v-model="form.companyADCity" type="text" :label="$t('companyADCity')"
                        class="users-admin__form-field" />
                </div>

                <div class="users-admin__form-grid">
                    <BaseFormField v-model="form.companyADState" type="text" :label="$t('companyADState')"
                        class="users-admin__form-field" />
                    <BaseFormField v-model="form.companyADZipcode" type="text" :label="$t('companyADZipcode')"
                        class="users-admin__form-field" />
                </div>

                <div class="users-admin__form-grid">
                    <BaseFormField v-model="form.companyADCountry" type="select" :label="$t('companyADCountry')"
                        :options="countryOptions" class="users-admin__form-field"
                        :disabled="currentUserType === 'RestrictedAdmin'" />
                    <BaseFormField v-model="form.disclaimer" type="text" :label="$t('disclaimer')"
                        class="users-admin__form-field" />
                </div>
            </form>

            <template #footer>
                <div class="users-admin__modal-footer">
                    <BaseButton @click="$emit('close')" variant="secondary">
                        {{ $t('cancel') }}
                    </BaseButton>
                    <BaseButton type="submit" variant="primary" @click="handleSubmit">
                        {{ isEditing ? $t('updateUser') : $t('createUser') }}
                    </BaseButton>
                </div>
            </template>
        </BaseCard>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { BaseCard, BaseButton, BaseFormField } from '@/components/ui';
import { COUNTRIES_WITH_FLAGS } from '@/constants/countries';

const props = defineProps({
    visible: Boolean,
    isEditing: Boolean,
    userData: {
        type: Object,
        default: () => ({})
    },
    currentUserType: String,
    userTypeOptions: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['close', 'submit']);

const form = ref({ ...props.userData });

watch(() => props.userData, (newVal) => {
    form.value = { ...newVal };
}, { deep: true });

const countryOptions = computed(() => {
    return COUNTRIES_WITH_FLAGS.map(c => ({
        value: c.name,
        label: `${c.flag} ${c.name}`
    }));
});

const handleSubmit = () => {
    emit('submit', form.value);
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
    overflow-y: auto;
    max-height: calc(90vh - 140px);
}

.users-admin__form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
}

.users-admin__modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border);
    background: var(--bg-elevated);
}

@media (width <= 768px) {
    .users-admin__form-grid {
        grid-template-columns: 1fr;
    }
}
</style>
