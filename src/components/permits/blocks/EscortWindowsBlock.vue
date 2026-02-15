<template>
    <div class="escort-windows-block">
        <h4>Escort & Travel Time Restrictions</h4>

        <div class="escort-summary">
            <div class="summary-item">
                <span class="label">Required Escort Level:</span>
                <select
                    v-model="payload.escort.required"
                    @change="handleUpdate"
                    class="form-control inline"
                    :class="`escort-${payload.escort.required.toLowerCase()}`"
                >
                    <option value="NONE">None</option>
                    <option value="PILOT_1">Pilot (1 vehicle)</option>
                    <option value="PILOT_2">Pilot (2 vehicles)</option>
                    <option value="POLICE">Police Escort</option>
                    <option value="SPECIAL">Special Arrangement</option>
                </select>
            </div>
        </div>

        <div class="travel-windows-section">
            <div class="section-header">
                <h5>Travel Windows</h5>
                <button class="btn-add" @click="addWindow">
                    <PhPlusCircle :size="14" />
                    Add Window
                </button>
            </div>

            <div v-if="travelWindows.length === 0" class="empty-state">
                No travel time restrictions
            </div>

            <div v-else class="windows-list">
                <div
                    v-for="(window, idx) in travelWindows"
                    :key="idx"
                    class="window-item"
                >
                    <div class="window-header">
                        <span class="window-title">Window #{{ idx + 1 }}</span>
                        <button
                            class="btn-remove"
                            @click="removeWindow(idx)"
                            title="Remove"
                        >
                            <PhX :size="18" />
                        </button>
                    </div>

                    <div class="window-fields">
                        <div class="field-group">
                            <label>Days of Week</label>
                            <div class="days-selector">
                                <label
                                    v-for="day in daysOfWeek"
                                    :key="day.value"
                                    class="day-checkbox"
                                    :class="{ active: window.days.includes(day.value) }"
                                >
                                    <input
                                        type="checkbox"
                                        :value="day.value"
                                        v-model="window.days"
                                        @change="handleUpdate"
                                    />
                                    <span>{{ day.label }}</span>
                                </label>
                            </div>
                        </div>

                        <div class="time-fields">
                            <div class="field-group">
                                <label>Start Time</label>
                                <input
                                    type="time"
                                    v-model="window.startTime"
                                    @input="handleUpdate"
                                    class="form-control"
                                />
                            </div>

                            <div class="field-group">
                                <label>End Time</label>
                                <input
                                    type="time"
                                    v-model="window.endTime"
                                    @input="handleUpdate"
                                    class="form-control"
                                />
                            </div>
                        </div>

                        <div class="field-group full-width">
                            <label>Notes</label>
                            <input
                                type="text"
                                v-model="window.notes"
                                @input="handleUpdate"
                                class="form-control"
                                placeholder="e.g., Avoid rush hour"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import { PhPlusCircle, PhX } from '@phosphor-icons/vue';

const props = defineProps({
    payload: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['update']);

// Ensure escort object exists
if (!props.payload.escort) {
    props.payload.escort = {
        required: 'NONE',
        travelWindows: []
    };
}

const travelWindows = computed(() => {
    return props.payload.escort?.travelWindows || [];
});

watch(() => props.payload, (val) => {
    if (val && val.escort) {
         if (!val.escort.travelWindows) val.escort.travelWindows = [];
    }
}, { immediate: true });

const daysOfWeek = [
    { value: 'MON', label: 'M' },
    { value: 'TUE', label: 'T' },
    { value: 'WED', label: 'W' },
    { value: 'THU', label: 'T' },
    { value: 'FRI', label: 'F' },
    { value: 'SAT', label: 'S' },
    { value: 'SUN', label: 'S' }
];

const addWindow = () => {
    travelWindows.value.push({
        days: [],
        startTime: '08:00',
        endTime: '17:00',
        notes: ''
    });
    handleUpdate();
};

const removeWindow = (idx) => {
    travelWindows.value.splice(idx, 1);
    handleUpdate();
};

const handleUpdate = () => {
    emit('update', props.payload);
};
</script>

<style scoped>
.escort-windows-block {
    padding: var(--spacing-md);
}

.escort-windows-block h4 {
    margin: 0 0 var(--spacing-md) 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
}

.escort-summary {
    margin-bottom: var(--spacing-lg);
    padding: var(--spacing-md);
    background: var(--bg-elevated);
    border-radius: 6px;
}

.summary-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.summary-item .label {
    font-weight: 600;
    font-size: 14px;
    color: var(--text-primary);
}

.form-control {
    padding: var(--spacing-xs) var(--spacing-sm);
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: 14px;
    transition: border-color 0.2s;
}

.form-control.inline {
    flex: 1;
}

.form-control:focus {
    outline: none;
    border-color: var(--accent);
}

.form-control.escort-none {
    border-color: var(--success);
}

.form-control.escort-pilot_1,
.form-control.escort-pilot_2 {
    border-color: var(--warning);
}

.form-control.escort-police,
.form-control.escort-special {
    border-color: var(--danger);
}

.travel-windows-section {
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--border);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
}

.section-header h5 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
}

.btn-add {
    background: var(--accent);
    color: white;
    border: none;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.2s;
}

.btn-add:hover {
    background: var(--accent-hover);
}

.empty-state {
    text-align: center;
    padding: var(--spacing-lg);
    color: var(--text-secondary);
    font-size: 14px;
    border: 1px dashed var(--border);
    border-radius: 4px;
}

.windows-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.window-item {
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: var(--spacing-md);
    background: var(--bg-elevated);
}

.window-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-sm);
}

.window-title {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 13px;
}

.btn-remove {
    background: none;
    border: none;
    color: var(--danger);
    cursor: pointer;
    font-size: 18px;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
}

.btn-remove:hover {
    background: var(--danger-bg);
}

.window-fields {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.field-group label {
    display: block;
    font-weight: 600;
    font-size: 13px;
    margin-bottom: var(--spacing-xs);
    color: var(--text-primary);
}

.days-selector {
    display: flex;
    gap: 4px;
}

.day-checkbox {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--bg-surface);
    transition: all 0.2s;
}

.day-checkbox input {
    display: none;
}

.day-checkbox span {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
}

.day-checkbox.active {
    background: var(--accent);
    border-color: var(--accent);
}

.day-checkbox.active span {
    color: white;
}

.time-fields {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
}

.field-group.full-width {
    grid-column: 1 / -1;
}
</style>
