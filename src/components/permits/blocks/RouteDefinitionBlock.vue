<template>
    <div class="route-definition-block">
        <h4>Route Definition</h4>

        <div class="route-fields">
            <div class="field-group">
                <label>Origin</label>
                <input
                    type="text"
                    :modelValue="payload.route.origin"
                    @input="updateRoute('origin', $event.target.value)"
                    class="form-control"
                    placeholder="City, State"
                />
            </div>

            <div class="field-group">
                <label>Destination</label>
                <input
                    type="text"
                    :modelValue="payload.route.destination"
                    @input="updateRoute('destination', $event.target.value)"
                    class="form-control"
                    placeholder="City, State"
                />
            </div>

            <div class="field-group">
                <label>Total Distance</label>
                <div class="distance-input">
                    <input
                        type="number"
                        v-model.number="distanceMiles"
                        @input="updateDistanceKm"
                        class="form-control"
                        placeholder="0"
                        min="0"
                    />
                    <span class="unit-label">miles</span>
                </div>
            </div>

            <div class="field-group">
                <label>Route Type</label>
                <select
                    v-model="payload.route.type"
                    @change="handleUpdate"
                    class="form-control"
                >
                    <option value="highway">Interstate/Highway</option>
                    <option value="local">Local Roads</option>
                    <option value="mixed">Mixed</option>
                </select>
            </div>
        </div>

        <div class="waypoints-section">
            <div class="section-header">
                <h5>Waypoints</h5>
                <button class="btn-add" @click="addWaypoint">
                    <PhPlusCircle :size="14" />
                    Add Waypoint
                </button>
            </div>

            <div v-if="waypoints.length === 0" class="empty-state">
                No waypoints added
            </div>

            <div v-else class="waypoints-list">
                <div
                    v-for="(waypoint, idx) in waypoints"
                    :key="idx"
                    class="waypoint-item"
                >
                    <span class="waypoint-number">{{ idx + 1 }}</span>
                    <input
                        type="text"
                        v-model="waypoint.name"
                        @input="handleUpdate"
                        class="form-control"
                        placeholder="Waypoint name"
                    />
                    <button
                        class="btn-remove"
                        @click="removeWaypoint(idx)"
                        title="Remove"
                    >
                        <PhX :size="18" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { PhPlusCircle, PhX } from '@phosphor-icons/vue';

const props = defineProps({
    payload: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['update']);

const updateRoute = (field, value) => {
    const newPayload = { ...props.payload };
    newPayload.route = { ...newPayload.route, [field]: value };
    emit('update', newPayload);
};

const distanceMiles = ref(0);

const waypoints = computed(() => {
    return props.payload.route?.waypoints || [];
});

watch(() => props.payload, (val) => {
    if (val && val.route) {
        if (!val.route.waypoints) val.route.waypoints = [];
    }
}, { immediate: true });

// Convert km to miles for display
watch(() => props.payload.route.distance_km, (km) => {
    distanceMiles.value = Math.round(km * 0.621371);
}, { immediate: true });

const updateDistanceKm = () => {
    props.payload.route.distance_km = Math.round(distanceMiles.value / 0.621371);
    handleUpdate();
};

const addWaypoint = () => {
    waypoints.value.push({
        name: '',
        coordinates: null
    });
    handleUpdate();
};

const removeWaypoint = (idx) => {
    waypoints.value.splice(idx, 1);
    handleUpdate();
};

const handleUpdate = () => {
    emit('update', props.payload);
};
</script>

<style scoped>
.route-definition-block {
    padding: var(--spacing-md);
}

.route-definition-block h4 {
    margin: 0 0 var(--spacing-md) 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
}

.route-fields {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
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

.distance-input {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

.unit-label {
    font-size: 13px;
    color: var(--text-secondary);
    font-weight: 500;
}

.waypoints-section {
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

.waypoints-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.waypoint-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.waypoint-number {
    width: 24px;
    height: 24px;
    background: var(--accent-bg);
    color: var(--accent);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
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
    flex-shrink: 0;
}

.btn-remove:hover {
    background: var(--danger-bg);
}
</style>
