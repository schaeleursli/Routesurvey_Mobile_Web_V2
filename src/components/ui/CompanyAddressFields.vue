<template>
    <div class="company-address-fields">
        <div class="company-address-fields__container">
            <div v-if="title" class="company-address-fields__title">
                {{ title }}
            </div>
            <div class="company-address-fields__content">
                <!-- Street - Full Width -->
                <div class="company-address-fields__row company-address-fields__row--full">
                    <BaseFormField 
                        v-model="localAddress.street" 
                        :label="$t('companyStreet')"
                        :placeholder="$t('companyStreet')" 
                    />
                </div>
                
                <!-- City, State, Zip - Three Column Row -->
                <div class="company-address-fields__row company-address-fields__row--three">
                    <BaseFormField 
                        v-model="localAddress.city" 
                        :label="$t('companyCity')" 
                        :placeholder="$t('companyCity')" 
                    />
                    <BaseFormField 
                        v-model="localAddress.state" 
                        :label="$t('companyState')" 
                        :placeholder="$t('companyState')" 
                    />
                    <BaseFormField 
                        v-model="localAddress.zip" 
                        :label="$t('companyZip')" 
                        :placeholder="$t('companyZip')" 
                    />
                </div>
                
                <!-- Country - Full Width -->
                <div class="company-address-fields__row company-address-fields__row--full">
                    <BaseFormField 
                        v-model="localAddress.country" 
                        type="select" 
                        :label="$t('companyCountry')"
                        :options="countryOptions" 
                        :disabled="countryDisabled" 
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { BaseFormField } from '@/components/ui'

const props = defineProps({
    modelValue: {
        type: Object,
        required: true,
        default: () => ({
            street: '',
            city: '',
            state: '',
            zip: '',
            country: ''
        })
    },
    countryOptions: {
        type: Array,
        default: () => []
    },
    countryDisabled: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: null
    }
})

const emit = defineEmits(['update:modelValue'])

// Create a local reactive copy of the address
const localAddress = reactive({
    street: props.modelValue?.street || '',
    city: props.modelValue?.city || '',
    state: props.modelValue?.state || '',
    zip: props.modelValue?.zip || '',
    country: props.modelValue?.country || ''
})

// Watch for changes in localAddress and emit updates
watch(
    () => localAddress,
    (newValue) => {
        emit('update:modelValue', { ...newValue })
    },
    { deep: true }
)

// Watch for external changes to modelValue (only update if different to avoid circular updates)
watch(
    () => props.modelValue,
    (newValue) => {
        if (newValue) {
            if (localAddress.street !== (newValue.street || '')) {
                localAddress.street = newValue.street || ''
            }
            if (localAddress.city !== (newValue.city || '')) {
                localAddress.city = newValue.city || ''
            }
            if (localAddress.state !== (newValue.state || '')) {
                localAddress.state = newValue.state || ''
            }
            if (localAddress.zip !== (newValue.zip || '')) {
                localAddress.zip = newValue.zip || ''
            }
            if (localAddress.country !== (newValue.country || '')) {
                localAddress.country = newValue.country || ''
            }
        }
    },
    { deep: true, immediate: true }
)
</script>

<style scoped>
.company-address-fields {
    width: 100%;
    margin-top: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
}

.company-address-fields__container {
    padding: var(--spacing-sm);
    background: var(--bg-elevated);
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
}

.company-address-fields__title {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
    padding-bottom: var(--spacing-xs);
    border-bottom: 1px solid var(--border);
    letter-spacing: var(--letter-spacing-wide);
    text-align: left;
}

.company-address-fields__content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.company-address-fields__row {
    display: grid;
    gap: var(--spacing-xs);
}

.company-address-fields__row--full {
    grid-template-columns: 1fr;
}

.company-address-fields__row--three {
    grid-template-columns: repeat(3, 1fr);
}

/* Compact form fields */
.company-address-fields :deep(.base-form-field) {
    gap: var(--spacing-2xs);
    margin-bottom: 0;
}

.company-address-fields :deep(.base-form-field__label) {
    margin-bottom: var(--spacing-2xs);
    font-size: var(--font-size-xs);
    text-align: left;
}

.company-address-fields :deep(.base-form-field__input),
.company-address-fields :deep(.base-form-field__select) {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-sm);
    border-radius: var(--radius-md);
}

/* Responsive design */
@media (width <= 768px) {
    .company-address-fields {
        margin-top: var(--spacing-xs);
        margin-bottom: var(--spacing-xs);
    }

    .company-address-fields__container {
        padding: var(--spacing-xs);
    }

    .company-address-fields__row--three {
        grid-template-columns: 1fr;
        gap: var(--spacing-xs);
    }

    .company-address-fields__content {
        gap: var(--spacing-xs);
    }
}

@media (width <= 480px) {
    .company-address-fields__container {
        padding: var(--spacing-xs);
    }
}
</style>

