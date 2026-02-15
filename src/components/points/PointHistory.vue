<template>
    <div class="point-history">
        <h5 v-if="title" class="history-title">{{ title }}</h5>
        
        <div v-if="sortedHistory.length === 0" class="empty-history">
            <i class="bi bi-clock-history"></i>
            <span>No history available</span>
        </div>

        <div v-else class="history-timeline">
            <div v-for="(entry, index) in sortedHistory" :key="index" class="history-entry">
                <div class="entry-header">
                    <span class="entry-user">{{ entry.user }}</span>
                    <span class="entry-time">{{ formatDate(entry.timestamp) }}</span>
                </div>
                <div class="entry-action">
                    <span class="action-badge" :class="getActionClass(entry.action)">{{ entry.action }}</span>
                </div>
                <ul class="entry-changes" v-if="entry.changes && entry.changes.length > 0">
                    <li v-for="(change, cIndex) in entry.changes" :key="cIndex" class="change-item">
                        {{ change }}
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    history: {
        type: Array,
        default: () => []
    },
    title: {
        type: String,
        default: 'Audit Log'
    }
});

const sortedHistory = computed(() => {
    return [...props.history].sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
});

const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleString();
};

const getActionClass = (action) => {
    switch (action?.toLowerCase()) {
        case 'create': return 'bg-success';
        case 'update': return 'bg-primary';
        case 'delete': return 'bg-danger';
        default: return 'bg-secondary';
    }
};
</script>

<style scoped>
.point-history {
    background: var(--bg-secondary); /* Assuming css var exists, or verify in design system */
    border-radius: 8px;
    padding: 1rem;
    font-size: 0.9rem;
}

.history-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border);
    padding-bottom: 0.5rem;
}

.empty-history {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--text-secondary);
    padding: 1rem;
    gap: 0.5rem;
}

.history-timeline {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 300px;
    overflow-y: auto;
}

.history-entry {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.75rem;
    position: relative;
    border-left: 3px solid var(--accent);
}

.entry-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
}

.entry-user {
    font-weight: 600;
    color: var(--text-primary);
}

.entry-time {
    color: var(--text-secondary);
}

.entry-action {
    margin-bottom: 0.5rem;
}

.action-badge {
    text-transform: uppercase;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 4px;
    color: white;
    font-weight: bold;
}

.entry-changes {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

.change-item {
    font-size: 0.85rem;
    color: var(--text-secondary);
    padding-left: 0.5rem;
    border-left: 1px solid var(--border);
    margin-bottom: 0.25rem;
}

/* Fallback colors if vars are missing */
.bg-success { background-color: #28a745; }
.bg-primary { background-color: #0d6efd; }
.bg-danger { background-color: #dc3545; }
.bg-secondary { background-color: #6c757d; }
</style>
