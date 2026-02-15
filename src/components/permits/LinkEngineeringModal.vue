<template>
    <div class="link-engineering-modal">
        <div class="modal-overlay" @click="handleClose"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Link Engineering Calculation</h3>
                <button class="btn-close" @click="handleClose">
                    <PhX :size="20" />
                </button>
            </div>

            <div class="modal-body">
                <p class="description">
                    Link a completed transport engineering calculation to auto-populate permit fields
                    with dimensions, weights, and axle configurations.
                </p>

                <!-- Loading State -->
                <div v-if="loading" class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading available calculations...</p>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="error-state">
                    <PhWarning :size="48" />
                    <p>{{ error }}</p>
                    <button class="btn-secondary" @click="fetchCalcJobs">Retry</button>
                </div>

                <!-- Calc Job Selection -->
                <div v-else>
                    <!-- Search/Filter -->
                    <div class="search-box">
                        <PhMagnifyingGlass :size="16" />
                        <input
                            v-model="searchQuery"
                            type="text"
                            placeholder="Search calculations..."
                            class="search-input"
                        />
                    </div>

                    <!-- Calc Jobs List -->
                    <div v-if="filteredCalcJobs.length > 0" class="calc-jobs-list">
                        <div
                            v-for="job in filteredCalcJobs"
                            :key="job.id"
                            class="calc-job-item"
                            :class="{ selected: selectedCalcJobId === job.id }"
                            @click="selectCalcJob(job)"
                        >
                            <div class="job-header">
                                <div class="job-icon">
                                    <PhCalculator :size="20" />
                                </div>
                                <div class="job-info">
                                    <div class="job-name">{{ job.name || `Calculation ${job.id.substring(0, 8)}` }}</div>
                                    <div class="job-meta">
                                        <span class="meta-item">
                                            <PhCalendarBlank :size="12" />
                                            {{ formatDate(job.created_at) }}
                                        </span>
                                        <span class="meta-item">
                                            <PhClock :size="12" />
                                            {{ formatTime(job.created_at) }}
                                        </span>
                                    </div>
                                </div>
                                <div class="job-status" :class="`status-${job.status}`">
                                    {{ job.status }}
                                </div>
                            </div>
                            <div v-if="selectedCalcJobId === job.id" class="job-details">
                                <div class="detail-row">
                                    <span class="label">Job ID:</span>
                                    <span class="value">{{ job.id }}</span>
                                </div>
                                <div v-if="job.description" class="detail-row">
                                    <span class="label">Description:</span>
                                    <span class="value">{{ job.description }}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Available Data:</span>
                                    <div class="data-tags">
                                        <span class="data-tag">Dimensions</span>
                                        <span class="data-tag">Axle Config</span>
                                        <span v-if="job.has_performance" class="data-tag">Performance</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-else class="empty-state">
                        <PhTray :size="64" />
                        <p v-if="searchQuery">No calculations match your search</p>
                        <p v-else>No completed calculations available</p>
                        <p class="hint">Complete a transport engineering calculation first</p>
                    </div>

                    <!-- Warning Box -->
                    <div class="warning-box">
                        <PhInfo :size="20" />
                        <div>
                            <strong>Note:</strong> Linking will auto-populate permit fields from engineering data.
                            Existing manual entries will be preserved unless you choose to override them.
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn-secondary" @click="handleClose">
                    Cancel
                </button>
                <button
                    class="btn-primary"
                    @click="handleLink"
                    :disabled="!selectedCalcJobId || loading"
                >
                    <PhLink :size="16" />
                    Link Calculation
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { PhX, PhWarning, PhMagnifyingGlass, PhCalculator, PhCalendarBlank, PhClock, PhTray, PhInfo, PhLink } from '@phosphor-icons/vue';

const props = defineProps({
    projectId: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['close', 'link']);

const loading = ref(false);
const error = ref(null);
const calcJobs = ref([]);
const selectedCalcJobId = ref(null);
const searchQuery = ref('');

const filteredCalcJobs = computed(() => {
    if (!searchQuery.value) return calcJobs.value;
    
    const query = searchQuery.value.toLowerCase();
    return calcJobs.value.filter(job => 
        (job.name && job.name.toLowerCase().includes(query)) ||
        job.id.toLowerCase().includes(query) ||
        (job.description && job.description.toLowerCase().includes(query))
    );
});

const selectedCalcJob = computed(() => {
    return calcJobs.value.find(j => j.id === selectedCalcJobId.value);
});

const fetchCalcJobs = async () => {
    loading.value = true;
    error.value = null;
    
    try {
        const response = await fetch(`/api/v1/calc-jobs?project=${props.projectId}&status=complete`);
        
        if (!response.ok) {
            throw new Error('Failed to load calculations');
        }
        
        const data = await response.json();
        calcJobs.value = data;
    } catch (err) {
        error.value = err.message;
        console.error('Failed to fetch calc jobs:', err);
    } finally {
        loading.value = false;
    }
};

const selectCalcJob = (job) => {
    selectedCalcJobId.value = job.id;
};

const handleLink = () => {
    if (selectedCalcJobId.value) {
        emit('link', selectedCalcJobId.value);
    }
};

const handleClose = () => {
    emit('close');
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
};

const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
    });
};

onMounted(() => {
    fetchCalcJobs();
});
</script>

<style scoped>
.link-engineering-modal {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-overlay {
    position: absolute;
    inset: 0;
    background: rgb(0 0 0 / 50%);
}

.modal-content {
    position: relative;
    background: var(--bg-elevated);
    border-radius: 8px;
    width: 650px;
    max-width: 90vw;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 20px rgb(0 0 0 / 30%);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--border);
}

.modal-header h3 {
    margin: 0;
    font-size: 18px;
    color: var(--text-primary);
}

.btn-close {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 24px;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
}

.btn-close:hover {
    background: var(--bg-surface);
}

.modal-body {
    padding: var(--spacing-lg);
    overflow-y: auto;
    flex: 1;
}

.description {
    margin: 0 0 var(--spacing-md) 0;
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.5;
}

.loading-state,
.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl) 0;
    gap: var(--spacing-md);
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.error-state i {
    font-size: 48px;
    color: var(--danger);
}

.search-box {
    position: relative;
    margin-bottom: var(--spacing-md);
}

.search-box i {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
    font-size: 16px;
}

.search-input {
    width: 100%;
    padding: var(--spacing-xs) var(--spacing-sm) var(--spacing-xs) 38px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: 14px;
    transition: all 0.2s;
}

.search-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-bg);
}

.calc-jobs-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
    max-height: 300px;
    overflow-y: auto;
}

.calc-job-item {
    padding: var(--spacing-md);
    border: 2px solid var(--border);
    border-radius: 8px;
    background: var(--bg-surface);
    cursor: pointer;
    transition: all 0.2s;
}

.calc-job-item:hover {
    border-color: var(--accent);
    background: var(--bg-elevated);
}

.calc-job-item.selected {
    border-color: var(--accent);
    background: var(--accent-bg);
}

.job-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.job-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent-bg);
    color: var(--accent);
    border-radius: 8px;
    font-size: 20px;
    flex-shrink: 0;
}

.job-info {
    flex: 1;
}

.job-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
}

.job-meta {
    display: flex;
    gap: var(--spacing-sm);
    font-size: 12px;
    color: var(--text-secondary);
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
}

.job-status {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
}

.job-status.status-complete {
    background: var(--success-bg);
    color: var(--success);
}

.job-details {
    margin-top: var(--spacing-md);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--border);
}

.detail-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    font-size: 13px;
}

.detail-row .label {
    color: var(--text-secondary);
    font-weight: 500;
}

.detail-row .value {
    color: var(--text-primary);
    font-family: monospace;
    font-size: 12px;
}

.data-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.data-tag {
    padding: 3px 8px;
    background: var(--info-bg);
    color: var(--info);
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
}

.empty-state {
    text-align: center;
    padding: var(--spacing-xl) 0;
}

.empty-state i {
    font-size: 64px;
    color: var(--text-tertiary);
    margin-bottom: var(--spacing-md);
}

.empty-state p {
    margin: 0;
    color: var(--text-secondary);
}

.empty-state .hint {
    font-size: 12px;
    color: var(--text-tertiary);
    margin-top: var(--spacing-xs);
}

.warning-box {
    display: flex;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--info-bg);
    border: 1px solid var(--info);
    border-radius: 6px;
    font-size: 13px;
    color: var(--text-primary);
}

.warning-box i {
    font-size: 20px;
    color: var(--info);
    flex-shrink: 0;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-sm);
    padding: var(--spacing-md) var(--spacing-lg);
    border-top: 1px solid var(--border);
    background: var(--bg-surface);
}

.btn-secondary,
.btn-primary {
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
}

.btn-secondary {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    color: var(--text-primary);
}

.btn-secondary:hover {
    background: var(--bg-base);
}

.btn-primary {
    background: var(--accent);
    border: 1px solid var(--accent);
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: var(--accent-hover);
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>

<style scoped>
.link-engineering-modal {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-overlay {
    position: absolute;
    inset: 0;
    background: rgb(0 0 0 / 50%);
}

.modal-content {
    position: relative;
    background: var(--bg-elevated);
    border-radius: 8px;
    width: 500px;
    max-width: 90vw;
    box-shadow: 0 4px 20px rgb(0 0 0 / 30%);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--border);
}

.modal-header h3 {
    margin: 0;
    font-size: 18px;
    color: var(--text-primary);
}

.btn-close {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 24px;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
}

.btn-close:hover {
    background: var(--bg-surface);
}

.modal-body {
    padding: var(--spacing-lg);
}

.description {
    margin: 0 0 var(--spacing-md) 0;
    font-size: 14px;
    color: var(--text-secondary);
}

.calc-job-selector {
    margin-bottom: var(--spacing-md);
}

.calc-job-selector label {
    display: block;
    font-weight: 600;
    font-size: 13px;
    margin-bottom: var(--spacing-xs);
    color: var(--text-primary);
}

.form-select {
    width: 100%;
    padding: var(--spacing-xs) var(--spacing-sm);
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: 14px;
}

.calc-job-details {
    padding: var(--spacing-md);
    background: var(--bg-surface);
    border-radius: 6px;
    margin-bottom: var(--spacing-md);
}

.calc-job-details h4 {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: 14px;
    color: var(--text-primary);
}

.detail-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    font-size: 13px;
}

.detail-row .label {
    color: var(--text-secondary);
    font-weight: 500;
}

.detail-row .value {
    color: var(--text-primary);
}

.data-tag {
    display: inline-block;
    padding: 2px 6px;
    background: var(--accent-bg);
    color: var(--accent);
    border-radius: 4px;
    font-size: 11px;
    margin-left: 4px;
}

.warning-box {
    display: flex;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--accent-bg);
    border: 1px solid var(--accent);
    border-radius: 6px;
    font-size: 13px;
    color: var(--accent);
}

.warning-box i {
    font-size: 20px;
    flex-shrink: 0;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-sm);
    padding: var(--spacing-md) var(--spacing-lg);
    border-top: 1px solid var(--border);
}

.btn-secondary,
.btn-primary {
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 4px;
}

.btn-secondary {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
}

.btn-secondary:hover {
    background: var(--bg-base);
}

.btn-primary {
    background: var(--accent);
    border: 1px solid var(--accent);
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: var(--accent-hover);
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
