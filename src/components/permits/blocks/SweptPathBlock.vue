<template>
    <div class="swept-path-block">
        <div class="block-header">
            <h4>Swept-Path Analysis</h4>
            <span v-if="hasConflicts" class="conflict-badge">
                <PhWarning :size="14" weight="fill" />
                {{ totalConflicts }} Conflict{{ totalConflicts !== 1 ? 's' : '' }}
            </span>
        </div>

        <div v-if="!hasSweptPathData" class="info-banner">
            <PhInfo :size="24" />
            <div class="info-content">
                <div class="info-title">No Critical Segments Identified</div>
                <div class="info-message">
                    Swept-path analysis not required for this route.
                </div>
            </div>
        </div>

        <div v-else class="swept-path-content">
            <!-- Segments List -->
            <div class="segments-list">
                <div
                    v-for="(segment, idx) in sweptPathSegments"
                    :key="segment.segmentId"
                    class="segment-item"
                    :class="getSegmentClass(segment)"
                    @click="selectSegment(idx)"
                >
                    <div class="segment-header">
                        <div class="segment-title">
                            <PhMapPin :size="14" />
                            <span>{{ segment.segmentName }}</span>
                        </div>
                        <div class="segment-status">
                            <span class="clearance-value" :class="getClearanceClass(segment.minClearance_m)">
                                {{ formatClearance(segment.minClearance_m) }}
                            </span>
                        </div>
                    </div>

                    <div v-if="segment.conflicts.length > 0" class="segment-conflicts">
                        <div
                            v-for="(conflict, cidx) in segment.conflicts"
                            :key="cidx"
                            class="conflict-item"
                            :class="`severity-${conflict.severity}`"
                        >
                            <PhWarningCircle :size="12" />
                            <span>{{ formatConflict(conflict) }}</span>
                        </div>
                    </div>

                    <div class="segment-meta">
                        <span class="meta-item">
                            <PhCpu :size="12" />
                            {{ segment._meta.source }}
                        </span>
                        <span class="meta-item">
                            <PhShieldCheck :size="12" />
                            {{ segment._meta.confidence }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Map Preview (Placeholder) -->
            <div class="map-preview">
                <div class="map-header">
                    <h5>Swept Path Envelope</h5>
                    <button class="btn-toggle" @click="toggleMapView">
                        <PhMap :size="14" />
                        {{ mapExpanded ? 'Collapse' : 'Expand' }} Map
                    </button>
                </div>

                <div v-if="selectedSegment" class="map-container" :class="{ expanded: mapExpanded }">
                    <div class="map-placeholder">
                        <PhMap :size="14" />
                        <p>Map Overlay: {{ selectedSegment.segmentName }}</p>
                        <div class="envelope-legend">
                            <div class="legend-item">
                                <span class="color-box inner"></span>
                                <span>Inner Envelope</span>
                            </div>
                            <div class="legend-item">
                                <span class="color-box outer"></span>
                                <span>Outer Envelope</span>
                            </div>
                            <div class="legend-item">
                                <span class="color-box conflict"></span>
                                <span>Conflict Point</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { PhWarning, PhInfo, PhMapPin, PhWarningCircle, PhCpu, PhShieldCheck, PhMap } from '@phosphor-icons/vue';
import { formatDimension } from '@/utils/imperialUnits';

const props = defineProps({
    payload: {
        type: Object,
        required: true
    }
});

const selectedSegmentIdx = ref(0);
const mapExpanded = ref(false);

const hasSweptPathData = computed(() => {
    return props.payload.sweptPath?.segments?.length > 0;
});

const sweptPathSegments = computed(() => {
    return props.payload.sweptPath?.segments || [];
});

const selectedSegment = computed(() => {
    if (!hasSweptPathData.value) return null;
    return sweptPathSegments.value[selectedSegmentIdx.value] || sweptPathSegments.value[0];
});

const totalConflicts = computed(() => {
    return sweptPathSegments.value.reduce((sum, seg) => sum + seg.conflicts.length, 0);
});

const hasConflicts = computed(() => {
    return totalConflicts.value > 0;
});

const formatClearance = (meters) => {
    return formatDimension(meters);
};

const getClearanceClass = (meters) => {
    if (meters < 0) return 'insufficient';
    if (meters < 0.3) return 'marginal';  // < 1 ft
    if (meters < 0.6) return 'tight';      // < 2 ft
    return 'safe';
};

const getSegmentClass = (segment) => {
    if (segment.conflicts.some(c => c.severity === 'block')) return 'has-blocking';
    if (segment.conflicts.length > 0) return 'has-warnings';
    return 'ok';
};

const formatConflict = (conflict) => {
    const margin = formatDimension(Math.abs(conflict.margin_m));
    if (conflict.severity === 'block') {
        return `Insufficient clearance: ${margin} short`;
    }
    return `Tight clearance: ${margin} margin`;
};

const selectSegment = (idx) => {
    selectedSegmentIdx.value = idx;
};

const toggleMapView = () => {
    mapExpanded.value = !mapExpanded.value;
};
</script>

<style scoped>
.swept-path-block {
    padding: var(--spacing-md);
}

.block-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
}

.block-header h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
}

.conflict-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: var(--danger-bg);
    color: var(--danger);
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
}

.info-banner {
    display: flex;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: var(--accent-bg);
    border: 1px solid var(--accent);
    border-radius: 6px;
    color: var(--accent);
}

.info-banner i {
    font-size: 24px;
    flex-shrink: 0;
}

.info-content {
    flex: 1;
}

.info-title {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 4px;
}

.info-message {
    font-size: 13px;
    opacity: 0.9;
}

.swept-path-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
}

.segments-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.segment-item {
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: var(--spacing-md);
    background: var(--bg-elevated);
    cursor: pointer;
    transition: all 0.2s;
}

.segment-item:hover {
    border-color: var(--accent);
    background: var(--bg-surface);
}

.segment-item.has-blocking {
    border-color: var(--danger);
}

.segment-item.has-warnings {
    border-color: var(--warning);
}

.segment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-xs);
}

.segment-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-weight: 600;
    font-size: 14px;
    color: var(--text-primary);
}

.segment-status {
    display: flex;
    align-items: center;
}

.clearance-value {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 700;
    font-family: monospace;
}

.clearance-value.safe {
    background: var(--success-bg);
    color: var(--success);
}

.clearance-value.tight {
    background: rgb(255 193 7 / 10%);
    color: #FFC107;
}

.clearance-value.marginal {
    background: var(--warning-bg);
    color: var(--warning);
}

.clearance-value.insufficient {
    background: var(--danger-bg);
    color: var(--danger);
}

.segment-conflicts {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: var(--spacing-xs) 0;
}

.conflict-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.conflict-item.severity-block {
    background: var(--danger-bg);
    color: var(--danger);
}

.conflict-item.severity-warn {
    background: var(--warning-bg);
    color: var(--warning);
}

.segment-meta {
    display: flex;
    gap: var(--spacing-sm);
    padding-top: var(--spacing-xs);
    border-top: 1px solid var(--border);
    margin-top: var(--spacing-xs);
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--text-secondary);
}

.meta-item i {
    font-size: 12px;
}

.map-preview {
    border: 1px solid var(--border);
    border-radius: 6px;
    overflow: hidden;
}

.map-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border);
}

.map-header h5 {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
}

.btn-toggle {
    background: none;
    border: 1px solid var(--border);
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.2s;
}

.btn-toggle:hover {
    background: var(--accent-bg);
    border-color: var(--accent);
    color: var(--accent);
}

.map-container {
    height: 300px;
    transition: height 0.3s;
}

.map-container.expanded {
    height: 600px;
}

.map-placeholder {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--bg-base);
    color: var(--text-secondary);
}

.map-placeholder i {
    font-size: 48px;
    opacity: 0.3;
    margin-bottom: var(--spacing-sm);
}

.map-placeholder p {
    margin: 0 0 var(--spacing-md) 0;
    font-size: 14px;
}

.envelope-legend {
    display: flex;
    gap: var(--spacing-md);
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
}

.color-box {
    width: 20px;
    height: 12px;
    border: 1px solid var(--border);
}

.color-box.inner {
    background: rgb(76 175 80 / 30%);
}

.color-box.outer {
    background: rgb(33 150 243 / 30%);
}

.color-box.conflict {
    background: rgb(244 67 54 / 50%);
}
</style>
