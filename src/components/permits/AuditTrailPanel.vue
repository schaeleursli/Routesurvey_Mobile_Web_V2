<template>
    <div class="audit-trail-panel">
        <div class="panel-header">
            <h3>
                <i class="bi bi-clock-history"></i>
                Audit Trail
            </h3>
            
            <div class="header-actions">
                <div class="filter-group">
                    <select v-model="selectedFilter" class="filter-select">
                        <option value="">All Events</option>
                        <option value="field_change">Field Changes</option>
                        <option value="engineering_override">Engineering Overrides</option>
                        <option value="engineering_linked">Engineering Link</option>
                        <option value="engineering_synced">Engineering Sync</option>
                        <option value="status_changed">Status Changes</option>
                    </select>
                </div>
                
                <button class="btn-refresh" @click="refresh" :disabled="isLoading">
                    <i class="bi bi-arrow-clockwise" :class="{ spinning: isLoading }"></i>
                </button>
            </div>
        </div>

        <div class="panel-body">
            <AuditTimeline
                :case-id="caseId"
                :entries="auditTrail"
                :is-loading="isLoading"
                :error="error"
            />
            
            <div v-if="hasMore" class="load-more">
                <button class="btn-load-more" @click="loadMore" :disabled="isLoading">
                    Load More
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuditTrail } from '@/composables/useAuditTrail';
import AuditTimeline from './AuditTimeline.vue';

const props = defineProps({
    caseId: {
        type: String,
        required: true
    }
});

const { auditTrail, isLoading, error, total, fetchAuditTrail } = useAuditTrail(props.caseId);

const selectedFilter = ref('');
const limit = ref(50);
const offset = ref(0);

const hasMore = computed(() => {
    return auditTrail.value.length < total.value;
});

const load = async () => {
    const options = {
        limit: limit.value,
        offset: offset.value
    };
    
    if (selectedFilter.value) {
        options.eventTypes = [selectedFilter.value];
    }
    
    await fetchAuditTrail(options);
};

const refresh = () => {
    offset.value = 0;
    load();
};

const loadMore = () => {
    offset.value += limit.value;
    load();
};

watch(selectedFilter, () => {
    refresh();
});

onMounted(() => {
    load();
});
</script>

<style scoped>
.audit-trail-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--bg-base);
    border-radius: 8px;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--border);
}

.panel-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

.header-actions {
    display: flex;
    gap: var(--spacing-sm);
}

.filter-select {
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
}

.filter-select:hover {
    border-color: var(--accent);
}

.filter-select:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-bg);
}

.btn-refresh {
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--bg-surface);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
}

.btn-refresh:hover:not(:disabled) {
    background: var(--bg-elevated);
    color: var(--accent);
}

.btn-refresh:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-refresh i.spinning {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.panel-body {
    flex: 1;
    overflow-y: auto;
}

.load-more {
    display: flex;
    justify-content: center;
    padding: var(--spacing-md);
}

.btn-load-more {
    padding: var(--spacing-xs) var(--spacing-lg);
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-load-more:hover:not(:disabled) {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
}

.btn-load-more:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
