<template>
    <div class="clearance-obstructions-block">
        <h4>Clearance Measurements & Obstructions</h4>
        
        <div class="measurements-section">
            <div class="section-header">
                <h5>Vertical Clearances</h5>
                <button class="btn-add" @click="addMeasurement">
                    <PhPlusCircle :size="14" />
                    Add Measurement
                </button>
            </div>

            <div v-if="measurements.length === 0" class="empty-state">
                No clearance measurements recorded yet
            </div>

            <div v-else class="measurements-list">
                <div
                    v-for="(measurement, idx) in measurements"
                    :key="idx"
                    class="measurement-item"
                >
                    <div class="measurement-header">
                        <span class="measurement-number">#{{ idx + 1 }}</span>
                        <button
                            class="btn-remove"
                            @click="removeMeasurement(idx)"
                            title="Remove"
                        >
                            <PhX :size="18" />
                        </button>
                    </div>

                    <div class="measurement-fields">
                        <div class="field-group">
                            <label>Location</label>
                            <input
                                type="text"
                                v-model="measurement.location"
                                @input="handleUpdate"
                                class="form-control"
                                placeholder="e.g., Bridge at KM 45.2"
                            />
                        </div>

                        <div class="field-group">
                            <label>Clearance Height</label>
                            <ImperialDimensionInput
                                v-model="measurement.clearance_m"
                                @update:modelValue="handleUpdate"
                            />
                        </div>

                        <div class="field-group">
                            <label>Measurement Method</label>
                            <select
                                v-model="measurement.method"
                                @change="handleUpdate"
                                class="form-control"
                            >
                                <option value="laser">Laser</option>
                                <option value="tape">Tape Measure</option>
                                <option value="estimated">Estimated</option>
                                <option value="as-built">As-Built Drawing</option>
                            </select>
                        </div>

                        <div class="field-group">
                            <label>Confidence</label>
                            <select
                                v-model="measurement.confidence"
                                @change="handleUpdate"
                                class="form-control"
                                :class="`confidence-${measurement.confidence}`"
                            >
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                    </div>

                    <div v-if="measurement.confidence === 'low'" class="confidence-warning">
                        <PhWarning :size="14" />
                        Low confidence measurements may trigger warnings
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import { PhPlusCircle, PhX, PhWarning } from '@phosphor-icons/vue';
import ImperialDimensionInput from '@/components/permits/inputs/ImperialDimensionInput.vue';

const props = defineProps({
    payload: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['update']);

const measurements = computed(() => {
    return props.payload.clearance?.measurements || [];
});

watch(() => props.payload, (val) => {
    if (val) {
        if (!val.clearance) val.clearance = { measurements: [] };
        if (!val.clearance.measurements) val.clearance.measurements = [];
    }
}, { immediate: true });

const addMeasurement = () => {
    measurements.value.push({
        location: '',
        clearance_m: null,
        method: 'laser',
        confidence: 'high'
    });
    handleUpdate();
};

const removeMeasurement = (idx) => {
    measurements.value.splice(idx, 1);
    handleUpdate();
};

const handleUpdate = () => {
    emit('update', props.payload);
};
</script>

<style scoped>
.clearance-obstructions-block {
    padding: var(--spacing-md);
}

.clearance-obstructions-block h4 {
    margin: 0 0 var(--spacing-md) 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
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

.measurements-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.measurement-item {
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: var(--spacing-md);
    background: var(--bg-elevated);
}

.measurement-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-sm);
}

.measurement-number {
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 12px;
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

.measurement-fields {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
}

.field-group label {
    display: block;
    font-weight: 600;
    font-size: 13px;
    margin-bottom: var(--spacing-xs);
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
    width: 100%;
}

.form-control:focus {
    outline: none;
    border-color: var(--accent);
}

.form-control.confidence-low {
    border-color: var(--warning);
}

.confidence-warning {
    margin-top: var(--spacing-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--warning-bg);
    color: var(--warning);
    border-radius: 4px;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
}
</style>
