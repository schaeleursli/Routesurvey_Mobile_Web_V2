<template>
    <div v-if="visible" class="qr-modal-backdrop" @click.self="close">
        <BaseCard class="qr-modal">
            <template #header>
                <div class="qr-modal-header">
                    <h3>QR Code</h3>
                    <BaseButton size="small" variant="ghost" @click="close">
                        <i class="fas fa-times"></i>
                    </BaseButton>
                </div>
            </template>

            <div class="qr-content">
                <QrcodeVue :value="value" :size="200" />
                <div class="qr-url">
                    <input class="qr-url-input" :value="value" readonly @click="selectAll" />
                    <BaseButton size="small" @click="copyUrl">
                        <i class="fas fa-copy"></i> Copy URL
                    </BaseButton>
                </div>
            </div>

            <template #footer>
                <div class="qr-modal-footer">
                    <BaseButton variant="primary" @click="close">
                        Close
                    </BaseButton>
                </div>
            </template>
        </BaseCard>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { BaseCard, BaseButton } from '@/components/ui'
import QrcodeVue from 'qrcode.vue'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    value: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['close'])

const close = () => {
    emit('close')
}

const copyUrl = async () => {
    try {
        await navigator.clipboard.writeText(props.value)
        // You could add a toast notification here
    } catch (e) {
        console.error('Failed to copy URL:', e)
    }
}

const selectAll = (event) => {
    event.target.select()
}
</script>

<style scoped>
.qr-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 50%);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-md);
}

.qr-modal {
    max-width: 400px;
    width: 100%;
}

.qr-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.qr-modal-header h3 {
    margin: 0;
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
}

.qr-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-lg);
    padding: var(--spacing-lg) 0;
}

.qr-url {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    width: 100%;
}

.qr-url-input {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    font-size: var(--font-size-sm);
    background: var(--bg-elevated);
    color: var(--text-primary);
    font-family: var(--font-family-mono);
    text-align: center;
}

.qr-modal-footer {
    display: flex;
    justify-content: center;
}

/* Responsive adjustments */
@media (width <= 480px) {
    .qr-modal {
        max-width: 100%;
        margin: var(--spacing-md);
    }

    .qr-content {
        padding: var(--spacing-md) 0;
    }
}
</style>
