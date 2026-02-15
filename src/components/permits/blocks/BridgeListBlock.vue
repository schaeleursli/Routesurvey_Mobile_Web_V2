<template>
    <div class="bridge-list-block">
        <h4>Bridges Along Route</h4>
        
        <div class="section-header">
            <p class="section-description">
                Document all bridges that the load will cross
            </p>
            <button class="btn-add" @click="addBridge">
                <PhPlusCircle :size="14" />
                Add Bridge
            </button>
        </div>

        <div v-if="bridges.length === 0" class="empty-state">
            No bridges documented yet
        </div>

        <div v-else class="bridges-list">
            <div
                v-for="(bridge, idx) in bridges"
                :key="idx"
                class="bridge-item"
            >
                <div class="bridge-header">
                    <span class="bridge-number">Bridge #{{ idx + 1 }}</span>
                    <button
                        class="btn-remove"
                        @click="removeBridge(idx)"
                        title="Remove"
                    >
                        <PhX :size="18" />
                    </button>
                </div>

                <div class="bridge-fields">
                    <div class="field-group full-width">
                        <label>Bridge Name/ID</label>
                        <input
                            type="text"
                            v-model="bridge.name"
                            @input="handleUpdate"
                            class="form-control"
                            placeholder="e.g., I-5 Bridge over Sacramento River"
                        />
                    </div>

                    <div class="field-group">
                        <label>Location (KM)</label>
                        <input
                            type="number"
                            v-model.number="bridge.location_km"
                            @input="handleUpdate"
                            class="form-control"
                            placeholder="0"
                            step="0.1"
                        />
                    </div>

                    <div class="field-group">
                        <label>Vertical Clearance</label>
                        <ImperialDimensionInput
                            v-model="bridge.clearance_m"
                            @update:modelValue="handleUpdate"
                        />
                    </div>

                    <div class="field-group">
                        <label>Weight Rating</label>
                        <ImperialWeightInput
                            v-model="bridge.weight_rating_kg"
                            @update:modelValue="handleUpdate"
                        />
                    </div>

                    <div class="field-group">
                        <label>Status</label>
                        <select
                            v-model="bridge.status"
                            @change="handleUpdate"
                            class="form-control"
                            :class="`status-${bridge.status}`"
                        >
                            <option value="ok">Adequate</option>
                            <option value="marginal">Marginal</option>
                            <option value="insufficient">Insufficient</option>
                        </select>
                    </div>
                </div>

                <div v-if="bridge.status === 'insufficient'" class="status-warning">
                    <PhWarning :size="14" weight="fill" />
                    This bridge may block permit approval
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import { PhPlusCircle, PhX, PhWarning } from '@phosphor-icons/vue';
import ImperialDimensionInput from '@/components/permits/inputs/ImperialDimensionInput.vue';
import ImperialWeightInput from '@/components/permits/inputs/ImperialWeightInput.vue';

const props = defineProps({
    payload: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['update']);

const bridges = computed(() => {
    return props.payload.bridges?.list || [];
});

watch(() => props.payload, (val) => {
    if (val) {
        if (!val.bridges) val.bridges = { list: [] };
        if (!val.bridges.list) val.bridges.list = [];
    }
}, { immediate: true });

const addBridge = () => {
    bridges.value.push({
        name: '',
        location_km: 0,
        clearance_m: null,
        weight_rating_kg: null,
        status: 'ok'
    });
    handleUpdate();
};

const removeBridge = (idx) => {
    bridges.value.splice(idx, 1);
    handleUpdate();
};

const handleUpdate = () => {
    emit('update', props.payload);
};
</script>

<style scoped>
.bridge-list-block {
    padding: var(--spacing-md);
}

.bridge-list-block h4 {
    margin: 0 0 var(--spacing-sm) 0;
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

.section-description {
    margin: 0;
    font-size: 13px;
    color: var(--text-secondary);
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

.bridges-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.bridge-item {
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: var(--spacing-md);
    background: var(--bg-elevated);
}

.bridge-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-sm);
}

.bridge-number {
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

.bridge-fields {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
}

.field-group {
    display: flex;
    flex-direction: column;
}

.field-group.full-width {
    grid-column: 1 / -1;
}

.field-group label {
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
}

.form-control:focus {
    outline: none;
    border-color: var(--accent);
}

.form-control.status-ok {
    border-color: var(--success);
}

.form-control.status-marginal {
    border-color: var(--warning);
}

.form-control.status-insufficient {
    border-color: var(--danger);
}

.status-warning {
    margin-top: var(--spacing-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--danger-bg);
    color: var(--danger);
    border-radius: 4px;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
}
</style>
