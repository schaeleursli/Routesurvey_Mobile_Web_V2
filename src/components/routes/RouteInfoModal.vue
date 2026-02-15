<template>
    <div v-if="show" class="modal-overlay">
        <div class="modal-box">
            <div class="modal-header">
                <h3>Route Information</h3>
                <button class="close-btn" @click="$emit('close')">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>

            <div class="modal-body">
                <div class="info-grid">
                    <div class="info-item">
                        <label>Route Title</label>
                        <input type="text" v-model="localRouteData.title" class="form-control"
                            placeholder="Enter route title..." :disabled="readonly">
                    </div>
                    <div class="info-item">
                        <label>Survey Date</label>
                        <div class="date-input">
                            <input type="date" v-model="surveyDate" class="form-control" disabled>
                            <i class="bi bi-calendar"></i>
                        </div>
                    </div>
                    <div class="info-item">
                        <label>Start Point *</label>
                        <input disabled type="text" :value="routeData.start" class="form-control">
                    </div>
                    <div class="info-item">
                        <label>End Point *</label>
                        <input disabled type="text" :value="routeData.end" class="form-control">
                    </div>
                    <div class="info-item">
                        <label>Distance ({{ currentUserData?.imperial ? 'miles' : 'km' }}) *</label>
                        <input disabled type="number"
                            :value="(currentUserData.imperial ? routeData.distance / 1609.34 : routeData.distance / 1000.0).toFixed(2)"
                            class="form-control">
                    </div>
                    <div class="info-item">
                        <label>Survey Points</label>
                        <input disabled type="number" :value="nonRoutePointsCount" class="form-control" readonly>
                    </div>
                </div>
                <div class="info-item full-width mt-2">
                    <label>Route Notes</label>
                    <textarea v-model="localRouteData.note" class="form-control" rows="3"
                        placeholder="Enter route notes..." :disabled="readonly"></textarea>
                </div>
            </div>

            <div class="modal-footer" v-if="!readonly">
                <button class="btn btn-secondary" @click="$emit('close')">
                    Cancel
                </button>
                <button class="btn btn-primary" @click="handleSave" :disabled="isSaving">
                    <span v-if="isSaving">Saving...</span>
                    <span v-else>Save Changes</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue';

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    routeData: {
        type: Object,
        required: true
    },
    currentUserData: {
        type: Object,
        required: true
    },
    nonRoutePointsCount: {
        type: Number,
        default: 0
    },
    readonly: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['close', 'save']);

// Local state for editing
const localRouteData = ref({
    title: '',
    note: ''
});

const surveyDate = ref('');
const isSaving = ref(false);

// Initialize local data when modal opens or routeData changes
watch([() => props.show, () => props.routeData], () => {
    if (props.show && props.routeData) {
        localRouteData.value = {
            title: props.routeData.title || '',
            note: props.routeData.note || ''
        };
        // Extract date from dateAdded (format: "2024-01-15T10:30:00" -> "2024-01-15")
        if (props.routeData.dateAdded) {
            surveyDate.value = props.routeData.dateAdded.split('T')[0];
        } else {
            surveyDate.value = new Date().toISOString().split('T')[0];
        }
    }
    // Reset saving state when modal closes
    if (!props.show) {
        isSaving.value = false;
    }
}, { immediate: true });

const handleSave = () => {
    isSaving.value = true;

    // Prepare updated route data
    const updatedData = {
        ...props.routeData,
        title: localRouteData.value.title,
        note: localRouteData.value.note,
        dateAdded: surveyDate.value ? new Date(surveyDate.value).toISOString() : props.routeData.dateAdded
    };

    emit('save', updatedData);

    // // Reset saving state after a short delay (parent will handle actual save)
    // setTimeout(() => {
    //     isSaving.value = false;
    // }, 500);
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 18%);
    z-index: 3000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-box {
    background: var(--bs-body-bg, #fff);
    border-radius: 16px;
    box-shadow: 0 4px 32px rgb(0 0 0 / 18%);
    min-width: 500px;
    max-width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem 1rem;
    border-bottom: 1px solid var(--bs-border-color);
}

.modal-header h3 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--bs-body-color);
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    color: var(--bs-body-color);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: background 0.2s;
}

.close-btn:hover {
    background: var(--bs-tertiary-bg);
}

.modal-body {
    padding: 1.5rem 2rem;
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.info-item.full-width {
    grid-column: 1 / -1;
}

.info-item label {
    font-weight: 600;
    color: var(--bs-body-color);
    font-size: 0.9rem;
}

.form-control {
    padding: 0.75rem;
    border: 1px solid var(--bs-border-color);
    border-radius: 8px;
    font-size: 0.9rem;
    transition: border-color 0.2s;
}

.form-control:focus {
    outline: none;
    border-color: var(--bs-primary);
    box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.25);
}

.form-control:disabled {
    background-color: var(--bs-tertiary-bg);
    color: var(--bs-secondary-color);
}

.date-input {
    position: relative;
}

.date-input i {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--bs-secondary-color);
    pointer-events: none;
}

textarea.form-control {
    resize: vertical;
    min-height: 80px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1rem 2rem 1.5rem;
    border-top: 1px solid var(--bs-border-color);
}

.btn {
    padding: 0.7rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-primary {
    background: var(--bs-primary);
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: var(--bs-primary-dark);
}

.btn-primary:disabled {
    background: var(--bs-secondary);
    cursor: not-allowed;
}

.btn-secondary {
    background: var(--bs-tertiary-bg);
    color: var(--bs-body-color);
}

.btn-secondary:hover {
    background: var(--bs-border-color);
}

@media (width <= 600px) {
    .modal-box {
        min-width: 90vw;
        margin: 1rem;
    }

    .modal-header,
    .modal-body,
    .modal-footer {
        padding: 1rem;
    }

    .info-grid {
        grid-template-columns: 1fr;
    }
}
</style>
