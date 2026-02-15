<template>
    <div class="evidence-annex-block">
        <h4>Evidence & Attachments</h4>

        <div class="attachments-section">
            <div class="attachment-item">
                <div class="attachment-header">
                    <PhFilePdf :size="20" />
                    <span class="attachment-label">Route Map</span>
                </div>
                <label class="checkbox-label">
                    <input
                        type="checkbox"
                        v-model="payload.attachments.routeMapProvided"
                        @change="handleUpdate"
                    />
                    <span>Provided</span>
                </label>
            </div>

            <div class="attachment-item">
                <div class="attachment-header">
                    <PhFileImage :size="20" />
                    <span class="attachment-label">Load Photos</span>
                </div>
                <label class="checkbox-label">
                    <input
                        type="checkbox"
                        v-model="payload.attachments.loadPhotosProvided"
                        @change="handleUpdate"
                    />
                    <span>Provided</span>
                </label>
            </div>

            <div class="attachment-item">
                <div class="attachment-header">
                    <PhFileText :size="20" />
                    <span class="attachment-label">Engineering Drawings</span>
                </div>
                <label class="checkbox-label">
                    <input
                        type="checkbox"
                        v-model="payload.attachments.drawingsProvided"
                        @change="handleUpdate"
                    />
                    <span>Provided</span>
                </label>
            </div>

            <div class="attachment-item">
                <div class="attachment-header">
                    <PhTable :size="20" />
                    <span class="attachment-label">Weight Distribution</span>
                </div>
                <label class="checkbox-label">
                    <input
                        type="checkbox"
                        v-model="payload.attachments.weightDistProvided"
                        @change="handleUpdate"
                    />
                    <span>Provided</span>
                </label>
            </div>
        </div>

        <div class="notes-section">
            <label>Additional Notes</label>
            <textarea
                v-model="payload.attachments.notes"
                @input="handleUpdate"
                class="form-control"
                rows="4"
                placeholder="Any additional notes about attachments or evidence..."
            ></textarea>
        </div>
    </div>
</template>

<script setup>
import { PhFilePdf, PhFileImage, PhFileText, PhTable } from '@phosphor-icons/vue';

const props = defineProps({
    payload: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['update']);

// Ensure attachments object exists
if (!props.payload.attachments) {
    props.payload.attachments = {
        routeMapProvided: false,
        loadPhotosProvided: false,
        drawingsProvided: false,
        weightDistProvided: false,
        notes: ''
    };
}

const handleUpdate = () => {
    emit('update', props.payload);
};
</script>

<style scoped>
.evidence-annex-block {
    padding: var(--spacing-md);
}

.evidence-annex-block h4 {
    margin: 0 0 var(--spacing-md) 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
}

.attachments-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-lg);
}

.attachment-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg-elevated);
}

.attachment-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    flex: 1;
}

.attachment-header i {
    font-size: 20px;
    color: var(--text-secondary);
}

.attachment-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    cursor: pointer;
    font-size: 13px;
    color: var(--text-secondary);
}

.checkbox-label input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
}

.notes-section {
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--border);
}

.notes-section label {
    display: block;
    font-weight: 600;
    font-size: 14px;
    margin-bottom: var(--spacing-xs);
    color: var(--text-primary);
}

.form-control {
    padding: var(--spacing-sm);
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    width: 100%;
    transition: border-color 0.2s;
}

.form-control:focus {
    outline: none;
    border-color: var(--accent);
}
</style>
