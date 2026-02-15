<template>
    <div class="point-list-panel">
        <!-- Header -->
        <div class="panel-header">
            <h4>Points ({{ store.filteredPoints.length }})</h4>
            <div class="search-box">
                <i class="bi bi-search"></i>
                <input 
                    type="text" 
                    v-model="searchQuery" 
                    placeholder="Search points..."
                    class="search-input"
                />
            </div>
        </div>

        <!-- List -->
        <div class="list-container" ref="listContainer">
            <template v-if="store.filteredPoints.length > 0">
                <div 
                    v-for="point in store.filteredPoints" 
                    :key="point.id"
                    class="point-item-wrapper"
                    :id="`point-${point.id}`"
                >
                    <div 
                        class="point-item"
                        :class="{ 
                            'active': point.id === store.activePointId,
                            'status-ready': point.workflowStatus === 'ready',
                            'status-reviewed': point.workflowStatus === 'reviewed',
                            'status-surveyed': point.workflowStatus === 'surveyed'
                        }"
                        @click="handlePointClick(point.id)"
                    >
                        <!-- Status Indicator (Left Border + Dot) -->
                        <div class="status-indicator">
                            <i v-if="point.workflowStatus === 'ready'" class="bi bi-check-circle-fill text-success"></i>
                            <i v-else-if="point.workflowStatus === 'reviewed'" class="bi bi-check-circle-fill text-warning"></i>
                            <i v-else-if="point.workflowStatus === 'surveyed'" class="bi bi-check-circle-fill text-info"></i>
                            <i v-else class="bi bi-circle text-muted"></i>
                        </div>

                        <!-- Content -->
                        <div class="point-content">
                            <div class="point-header">
                                <span class="point-type">{{ getPointLabel(point) }}</span>
                                <span class="point-distance">{{ formatDistance(point.distance_m) }}</span>
                            </div>
                            
                            <div class="point-meta">
                                <span class="badge kind" :class="point.category">
                                    {{ getCategoryLabel(point.category) }}
                                </span>
                                <span class="badge severity" :class="point.severity" v-if="point.severity">
                                    {{ point.severity }}
                                </span>
                            </div>

                            <div class="point-address" v-if="point.road?.display || point.roadName || point.address">
                                {{ point.road?.display || point.roadName || point.address }}
                            </div>
                        </div>

                        <!-- Chevron -->
                        <div class="point-action">
                            <i class="bi bi-chevron-right"></i>
                        </div>
                    </div>
                </div>
            </template>
             <div v-else class="empty-state">
                <i class="bi bi-geo-alt"></i>
                <p>No points match your filters</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { useSurveyStore } from '@/stores/surveyStore';

const store = useSurveyStore();
const searchQuery = ref(''); // Note: Search logic needs integration with store filter
const listContainer = ref(null);

const formatDistance = (m) => {
    if (m === undefined || m === null) return '--';
    if (store.unitSystem === 'imperial') {
        const mi = m * 0.000621371;
        return `${mi.toFixed(2)} mi`;
    }
    return m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`;
};

const getPointLabel = (point) => {
    const t = point.type;
    if (t === 'custom') return point.customLabel || 'Custom';
    return t ? t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Point';
};

const getCategoryLabel = (cat) => {
    if (cat === 'obstruction') return 'Obstruction';
    if (cat === 'observation') return 'Observation';
    return 'Uncategorized';
};

const handlePointClick = (id) => {
    store.setActivePoint(id);
};

// Scroll to active
watch(() => store.activePointId, async (newId) => {
    if (newId && listContainer.value) {
        await nextTick();
        const el = document.getElementById(`point-${newId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
});
</script>

<style scoped>
.point-list-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--bg-base);
    border-right: 1px solid var(--border);
}

.panel-header {
    padding: 1rem;
    border-bottom: 1px solid var(--border);
    background-color: var(--bg-surface);
}

.panel-header h4 {
    margin: 0 0 0.5rem;
    font-size: 0.95rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--text-secondary);
    letter-spacing: 0.5px;
}

.search-box {
    position: relative;
    display: flex;
    align-items: center;
}

.search-box i {
    position: absolute;
    left: 10px;
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.search-input {
    width: 100%;
    padding: 8px 8px 8px 32px;
    border-radius: 6px;
    border: 1px solid var(--border);
    font-size: 0.9rem;
    background-color: var(--bg-surface-2);
    transition: all 0.2s;
}
.search-input:focus {
    background-color: var(--bg-surface);
    border-color: var(--primary);
    outline: none;
    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.list-container {
    flex: 1;
    overflow-y: auto;
    padding: 0;
}

.point-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-light);
    cursor: pointer;
    transition: background-color 0.2s;
    gap: 12px;
    position: relative;
}

.point-item:hover {
    background-color: var(--bg-hover);
}

.point-item.active {
    background-color: var(--bg-active); 
    border-left: 4px solid var(--primary);
    padding-left: 12px; /* Adjust for border width */
}

/* Status Indicators */
.status-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
}
.status-indicator i { font-size: 1.1rem; }

.text-success { color: #2e7d32; } /* Ready */
.text-warning { color: #f57c00; } /* Reviewed */
.text-info { color: #1976d2; }    /* Surveyed */
.text-muted { color: var(--text-tertiary); }

.point-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
}

.point-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.point-type {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text-primary);
}

.point-distance {
    font-size: 0.8rem;
    color: var(--text-secondary);
    font-family: monospace;
    background: var(--bg-surface-2);
    padding: 2px 6px;
    border-radius: 4px;
}

.point-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
}

.badge {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    border: 1px solid transparent;
}

.badge.kind.obstruction { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
.badge.kind.observation { background: #e0f2fe; color: #0369a1; border-color: #bae6fd; }
.badge.kind.uncategorized { background: #f3f4f6; color: #6b7280; border-color: #e5e7eb; }

.badge.severity { font-size: 0.65rem; padding: 1px 5px; }
.badge.severity.high, .badge.severity.critical { background: #fff1f2; color: #be123c; border: 1px solid #fecdd3; }
.badge.severity.medium { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
.badge.severity.low { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }

.point-address {
    font-size: 0.8rem;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
}

.point-action {
    color: var(--text-tertiary);
    font-size: 0.9rem;
}
.point-item:hover .point-action { color: var(--text-secondary); }

.empty-state {
    padding: 3rem;
    text-align: center;
    color: var(--text-secondary);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}
.empty-state i { font-size: 2.5rem; opacity: 0.3; }
</style>
