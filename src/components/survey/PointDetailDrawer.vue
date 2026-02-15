<template>
    <div class="point-detail-drawer" v-if="point">
        <!-- Header -->
        <div class="drawer-header">
            <div class="header-left">
                <div class="nav-controls">
                    <button class="nav-btn" @click="prev" :disabled="!hasPrev" title="Previous Point (K)">
                        <i class="bi bi-chevron-left"></i>
                    </button>
                    <button class="nav-btn" @click="next" :disabled="!hasNext" title="Next Point (J)">
                        <i class="bi bi-chevron-right"></i>
                    </button>
                </div>
                <div class="header-titles">
                    <h3 class="header-title">{{ pointTypeLabel }}</h3>
                    <span class="header-subtitle">{{ formattedDistance }}</span>
                </div>
            </div>
            <div class="header-right">
                <div class="status-badge" :class="point.workflowStatus">
                    {{ formatStatus(point.workflowStatus) }}
                </div>
                <button class="close-btn" @click="close">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
        </div>

        <!-- Content Area -->
        <div class="drawer-content">
            
            <!-- VIEW MODE -->
            <div v-if="isViewMode" class="view-mode">
                <!-- Gallery Preview -->
                <div class="section gallery-section">
                    <RsPhotoGallery 
                        :photos="point.images || []" 
                        :read-only="true" 
                    />
                </div>

                <!-- Info Grid -->
                <div class="section info-section">
                    <div class="info-row">
                        <label>Location</label>
                        <span>{{ point.address || 'No location info' }}</span>
                    </div>
                    <div class="info-row">
                        <label>Coordinates</label>
                        <span class="mono">{{ formatCoords(point.lat, point.lng) }}</span>
                    </div>
                </div>

                <!-- Classification -->
                <div class="section classification-section">
                    <div class="tags-row">
                        <span class="badge kind" :class="point.category">
                            {{ point.category === 'obstruction' ? 'Obstruction' : 'Observation' }}
                        </span>
                        <span class="badge severity" :class="point.severity">
                            {{ point.severity || 'Low' }} Severity
                        </span>
                    </div>
                </div>

                <!-- Notes -->
                <div class="section notes-section" v-if="point.notes">
                    <label>Notes</label>
                    <p class="notes-text">{{ point.notes }}</p>
                </div>

                <!-- Actions -->
                <div class="section actions-section">
                    <button class="btn btn-primary-ghost" @click="enableEdit">
                        <i class="bi bi-pencil"></i> Edit Details
                    </button>
                </div>
            </div>

            <!-- EDIT MODE -->
            <div v-else class="edit-mode">
                <!-- Core Info Form -->
                <div class="section form-section">
                    <h4 class="section-title">Core Info</h4>
                    
                    <div class="form-group">
                        <label>Type <span class="text-danger">*</span></label>
                        <select v-model="form.type" class="form-control">
                            <option value="" disabled>Select Type...</option>
                            <optgroup v-for="(group, key) in CANONICAL_TYPES" :key="key" :label="group.label">
                                <option v-for="t in group.types" :key="t" :value="t">{{ formatTypeLabel(t) }}</option>
                            </optgroup>
                        </select>
                    </div>

                    <div class="form-group" v-if="form.type === 'custom'">
                        <label>Custom Label <span class="text-danger">*</span></label>
                        <input type="text" v-model="form.customLabel" class="form-control" />
                    </div>

                    <div class="form-group">
                        <label>Distance <span class="text-danger">*</span></label>
                         <input 
                            type="number" 
                            step="0.001"
                            :value="getDistanceInputVal()"
                            @input="updateDistance"
                            class="form-control"
                        />
                         <span class="unit-hint">{{ unitLabel }}</span>
                    </div>

                    <div class="form-group">
                         <label>Location</label>
                         <input type="text" v-model="form.address" class="form-control" />
                    </div>
                </div>

                <!-- Classification Form -->
                <div class="section form-section">
                    <h4 class="section-title">Classification</h4>
                    <div class="form-row">
                         <div class="form-group">
                            <label>Kind</label>
                            <div class="toggle-group">
                                <button 
                                    type="button"
                                    :class="{ active: form.category === 'obstruction' }" 
                                    @click="form.category = 'obstruction'"
                                >Obstruction</button>
                                <button 
                                    type="button"
                                    :class="{ active: form.category === 'observation' }" 
                                    @click="form.category = 'observation'"
                                >Observation</button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Severity</label>
                            <select v-model="form.severity" class="form-control">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Media Form -->
                <div class="section form-section">
                    <h4 class="section-title">Evidence & Notes</h4>
                    <div class="form-group">
                         <label>Photos</label>
                         <RsPhotoGallery 
                            :photos="formImages" 
                        />
                    </div>
                    <div class="form-group">
                        <label>Notes</label>
                        <textarea v-model="form.notes" rows="3" class="form-control"></textarea>
                    </div>
                </div>

                <!-- Edit Actions -->
                <div class="edit-actions-footer">
                    <button class="btn btn-text" @click="cancelEdit">Cancel</button>
                    <button class="btn btn-primary" @click="saveEdit">Save Changes</button>
                </div>
            </div>
        </div>

        <!-- Sticky Footer: Workflow -->
        <div class="drawer-footer" v-if="isViewMode">
            <div class="workflow-bar">
                 <button 
                    v-for="status in ['draft', 'surveyed', 'reviewed', 'ready']" 
                    :key="status"
                    class="status-step-btn"
                    :class="{ 
                        'active': point.workflowStatus === status,
                        'completed': getStatusIndex(point.workflowStatus) > getStatusIndex(status)
                    }"
                    @click="updateStatus(status)"
                    :title="status"
                >
                    <span class="step-dot"></span>
                    <span class="step-label">{{ getStatusAbbrev(status) }}</span>
                </button>
            </div>
        </div>
    </div>
    <div v-else class="empty-drawer">
         <i class="bi bi-arrow-left-circle"></i>
        <p>Select a point from the list or map to view details.</p>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useSurveyStore, CANONICAL_TYPES } from '@/stores/surveyStore';
import RsPhotoGallery from '@/components/survey/RsPhotoGallery.vue';

const store = useSurveyStore();

// -- Computed --
const point = computed(() => store.activePoint);
const hasNext = computed(() => !!store.nextPointId);
const hasPrev = computed(() => !!store.prevPointId);

const pointTypeLabel = computed(() => {
    if (!point.value) return '';
    const t = point.value.type;
    if (t === 'custom') return point.value.customLabel || 'Custom';
    return t ? t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Unknown Point';
});

const unitLabel = computed(() => store.unitSystem === 'imperial' ? 'mi' : 'km');

const formattedDistance = computed(() => {
    if (!point.value || point.value.distance_m === undefined) return '';
    const m = point.value.distance_m;
    if (store.unitSystem === 'imperial') {
        const mi = m * 0.000621371;
        return `${mi.toFixed(3)} mi`;
    }
    return m >= 1000 ? `${(m / 1000).toFixed(3)} km` : `${Math.round(m)} m`;
});

// -- State --
const isViewMode = ref(true);
const form = ref({});
const formImages = ref([]);

// -- Watchers --
watch(point, (newPoint) => {
    if (newPoint) {
        // Reset to view mode on navigation
        if (!isViewMode.value) cancelEdit(); 
        isViewMode.value = true;
    }
});

// -- Methods --
const next = () => store.navigateNext();
const prev = () => store.navigatePrev();
const close = () => store.setActivePoint(null);

const enableEdit = () => {
    // Clone point data for editing
    form.value = JSON.parse(JSON.stringify(point.value));
    formImages.value = point.value.images ? [...point.value.images] : [];
    isViewMode.value = false;
};

const cancelEdit = () => {
    isViewMode.value = true;
    form.value = {};
    formImages.value = [];
};

const saveEdit = () => {
    // Basic validation
    if (!form.value.type) {
         alert('Type is required'); return;
    }
    if (form.value.type === 'custom' && !form.value.customLabel) {
        alert('Custom Label is required'); return;
    }

    // Prepare update object
    const updateData = {
        ...form.value,
        images: formImages.value
    };

    store.updatePoint(point.value.id, updateData);
    isViewMode.value = true;
};

const updateDistance = (e) => {
    const val = parseFloat(e.target.value);
    if (isNaN(val)) return;
    
    // Convert back to meters
    form.value.distance_m = store.unitSystem === 'imperial' 
        ? val / 0.000621371 
        : val * 1000;
};

const getDistanceInputVal = () => {
    const m = form.value.distance_m;
    if (m === undefined) return '';
    return store.unitSystem === 'imperial' 
        ? (m * 0.000621371).toFixed(3)
        : (m / 1000).toFixed(3);
};

const updateStatus = (status) => {
    // Validation for 'Ready'
    if (status === 'ready') {
        const errors = [];
        if (!point.value.type) errors.push('Type');
        if (!point.value.distance_m) errors.push('Distance');
        
        // Critical Rule
        const isCritical = point.value.severity === 'critical' || point.value.severity === 'high';
        const hasPhoto = point.value.images && point.value.images.length > 0;
        const hasException = point.value.evidenceExceptionReason;
        
        if (isCritical && !hasPhoto && !hasException) {
             errors.push('Critical Evidence (Photo or Exception Reason)');
        }
        
        if (errors.length > 0) {
            alert(`Cannot mark Ready. Missing: ${errors.join(', ')}`);
            return;
        }
    }
    store.updatePointStatus(point.value.id, status);
};

// Helpers
const formatCoords = (lat, lng) => {
    if (!lat || !lng) return '--';
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
};

const formatTypeLabel = (t) => t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const formatStatus = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Draft';

const getStatusIndex = (s) => ['draft', 'surveyed', 'reviewed', 'ready'].indexOf(s);
const getStatusAbbrev = (s) => {
    const map = { draft: 'Draft', surveyed: 'Surveyed', reviewed: 'Reviewed', ready: 'Ready' };
    return map[s] || s;
};

</script>

<style scoped>
.point-detail-drawer {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--bg-surface);
    border-left: 1px solid var(--border);
    width: 100%;
}

.drawer-header {
    padding: 1rem;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-surface);
}

.header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.nav-controls {
    display: flex;
    gap: 4px;
}

.nav-btn {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--bg-surface-2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}
.nav-btn:hover:not(:disabled) { background: var(--bg-hover); color: var(--primary); }
.nav-btn:disabled { opacity: 0.5; cursor: default; }

.header-titles {
    display: flex;
    flex-direction: column;
}

.header-title {
    font-size: 1rem;
    font-weight: 700;
    margin: 0;
    line-height: 1.2;
}

.header-subtitle {
    font-size: 0.8rem;
    color: var(--text-secondary);
    font-family: monospace;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 12px;
}

.status-badge {
    font-size: 0.75rem;
    padding: 4px 8px;
    border-radius: 100px;
    font-weight: 600;
    text-transform: uppercase;
    background: var(--bg-elevated);
    color: var(--text-secondary);
}
.status-badge.surveyed { background: #e3f2fd; color: #1976d2; }
.status-badge.reviewed { background: #fff3e0; color: #f57c00; }
.status-badge.ready { background: #e8f5e9; color: #2e7d32; }

.close-btn {
    border: none;
    background: none;
    font-size: 1.2rem;
    color: var(--text-secondary);
    cursor: pointer;
}

/* Content */
.drawer-content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--border-light);
}
.info-row label { font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; }
.info-row span { font-size: 0.9rem; font-weight: 500; }
.mono { font-family: monospace; }

.tags-row { display: flex; gap: 8px; }

.badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    border: 1px solid transparent;
}
.badge.kind.obstruction { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
.badge.kind.observation { background: #e0f2fe; color: #0369a1; border-color: #bae6fd; }

.badge.severity.high, .badge.severity.critical { background: #fff1f2; color: #be123c; }
.badge.severity.low { background: #f0fdf4; color: #15803d; }

.notes-text {
    background: var(--bg-surface-2);
    padding: 12px;
    border-radius: 6px;
    font-size: 0.9rem;
    line-height: 1.5;
    color: var(--text-primary);
}

/* Edit Mode */
.section-title {
    font-size: 0.85rem;
    text-transform: uppercase;
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border);
    padding-bottom: 8px;
    margin-bottom: 12px;
}

.form-group {
    margin-bottom: 12px;
}
.form-group label {
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    margin-bottom: 6px;
    color: var(--text-secondary);
}
.form-control {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 0.95rem;
    background: var(--bg-surface);
}
.form-control:focus {
    border-color: var(--primary);
    outline: none;
    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.unit-hint {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-align: right;
    display: block;
    margin-top: 2px;
}

.toggle-group {
    display: flex;
    border: 1px solid var(--border);
    border-radius: 6px;
    overflow: hidden;
}
.toggle-group button {
    flex: 1;
    padding: 8px;
    border: none;
    background: var(--bg-surface);
    cursor: pointer;
    font-size: 0.9rem;
}
.toggle-group button.active {
    background: var(--primary);
    color: white;
}

.edit-actions-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
}

.btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 8px;
}
.btn-primary { background: var(--primary); color: white; }
.btn-primary:hover { opacity: 0.9; }
.btn-primary-ghost { background: var(--bg-elevated); color: var(--primary); border: 1px solid var(--border); }
.btn-text { background: none; color: var(--text-secondary); }
.btn-text:hover { color: var(--text-primary); }

.text-danger { color: var(--error); }

/* Workflow Footer */
.drawer-footer {
    padding: 1rem;
    background: var(--bg-surface-2);
    border-top: 1px solid var(--border);
}

.workflow-bar {
    display: flex;
    justify-content: space-between;
    position: relative;
}
.workflow-bar::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 10px;
    right: 10px;
    height: 2px;
    background: var(--border);
    z-index: 0;
    transform: translateY(-50%);
}

.status-step-btn {
    position: relative;
    z-index: 1;
    background: var(--bg-surface);
    border: 2px solid var(--border);
    border-radius: 20px;
    padding: 4px 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.2s;
}

.status-step-btn.active {
    border-color: var(--primary);
    color: var(--primary);
    font-weight: 600;
    box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1);
}
.status-step-btn.completed {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
}

.step-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentcolor;
}
.step-label { font-size: 0.75rem; }

.empty-drawer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-secondary);
    padding: 2rem;
    text-align: center;
}
.empty-drawer i { font-size: 3rem; margin-bottom: 1rem; opacity: 0.3; }
</style>
