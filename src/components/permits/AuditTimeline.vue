<template>
    <div class="audit-timeline">
        <div v-if="isLoading" class="loading-state">
            <div class="spinner"></div>
            <span>Loading audit trail...</span>
        </div>

        <div v-else-if="error" class="error-state">
            <PhWarningCircle :size="32" />
            <span>{{ error }}</span>
        </div>

        <div v-else-if="groupedEntries && Object.keys(groupedEntries).length > 0" class="timeline">
            <div
                v-for="(entries, date) in groupedEntries"
                :key="date"
                class="timeline-day"
            >
                <div class="day-header">{{ formatDate(date) }}</div>
                
                <div class="timeline-entries">
                    <div
                        v-for="entry in entries"
                        :key="entry.id"
                        class="timeline-entry"
                        :class="`event-${getEventInfo(entry.event_type).color}`"
                    >
                        <div class="entry-icon">
                            <component :is="getEventIcon(entry.event_type)" :size="16" />
                        </div>
                        
                        <div class="entry-content">
                            <div class="entry-header">
                                <span class="entry-title">{{ getEventInfo(entry.event_type).label }}</span>
                                <span class="entry-time">{{ formatTime(entry.created_at) }}</span>
                            </div>
                            
                            <div class="entry-body">
                                <div v-if="entry.user_name" class="entry-user">
                                    <PhUser :size="14" />
                                    {{ entry.user_name }}
                                </div>
                                
                                <div v-if="entry.field_path" class="entry-field">
                                    Field: <code>{{ entry.field_path }}</code>
                                </div>
                                
                                <div v-if="entry.old_value !== null || entry.new_value !== null" class="entry-change">
                                    <span class="old-value">{{ formatValue(entry.old_value) }}</span>
                                    <PhArrowRight :size="14" />
                                    <span class="new-value">{{ formatValue(entry.new_value) }}</span>
                                </div>
                                
                                <div v-if="entry.reason" class="entry-reason">
                                    <PhChatCenteredText :size="14" />
                                    {{ entry.reason }}
                                </div>
                                
                                <div v-if="entry.metadata" class="entry-metadata">
                                    <button
                                        class="btn-expand"
                                        @click="toggleDetails(entry.id)"
                                    >
                                        <component :is="isExpanded(entry.id) ? PhCaretUp : PhCaretDown" :size="14" />
                                        Details
                                    </button>
                                    
                                    <div v-if="isExpanded(entry.id)" class="metadata-content">
                                        <pre>{{ JSON.stringify(entry.metadata, null, 2) }}</pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="empty-state">
            <PhClockCounterClockwise :size="32" />
            <span>No audit trail entries yet</span>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, markRaw } from 'vue';
import { 
    PhWarningCircle, PhUser, PhArrowRight, PhChatCenteredText, PhCaretUp, PhCaretDown, 
    PhClockCounterClockwise, PhPencil, PhPlus, PhTrash, PhArrowsClockwise, PhLink, PhFile,
    PhCheckCircle, PhInfo
} from '@phosphor-icons/vue';
import { useAuditTrail } from '@/composables/useAuditTrail';

const props = defineProps({
    caseId: {
        type: String,
        required: true
    },
    entries: {
        type: Array,
        default: () => []
    },
    isLoading: {
        type: Boolean,
        default: false
    },
    error: {
        type: String,
        default: null
    }
});

const { groupByDate, getEventInfo } = useAuditTrail(props.caseId);
const expandedEntries = ref(new Set());

const groupedEntries = computed(() => {
    return groupByDate(props.entries);
});

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }
return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
    });
};

const formatValue = (value) => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
};

const toggleDetails = (entryId) => {
    if (expandedEntries.value.has(entryId)) {
        expandedEntries.value.delete(entryId);
    } else {
        expandedEntries.value.add(entryId);
    }
    expandedEntries.value = new Set(expandedEntries.value);
};

const isExpanded = (entryId) => {
    return expandedEntries.value.has(entryId);
};

// Map event types to Phosphor icons
const eventIconMap = {
    'field_updated': markRaw(PhPencil),
    'created': markRaw(PhPlus),
    'deleted': markRaw(PhTrash),
    'synced': markRaw(PhArrowsClockwise),
    'linked': markRaw(PhLink),
    'status_changed': markRaw(PhCheckCircle),
    'attachment_added': markRaw(PhFile),
    'default': markRaw(PhInfo)
};

const getEventIcon = (eventType) => {
    return eventIconMap[eventType] || eventIconMap['default'];
};
</script>

<style scoped>
.audit-timeline {
    padding: var(--spacing-md);
}

.loading-state,
.error-state,
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-xl);
    color: var(--text-secondary);
}

.loading-state .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.error-state {
    color: var(--danger);
}

.error-state i,
.empty-state i {
    font-size: 32px;
}

.timeline {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.timeline-day {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.day-header {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.timeline-entries {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.timeline-entry {
    display: flex;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--bg-surface);
    border-radius: 8px;
    border-left: 3px solid;
    transition: all 0.2s;
}

.timeline-entry:hover {
    background: var(--bg-elevated);
}

.timeline-entry.event-info {
    border-left-color: var(--info);
}

.timeline-entry.event-warning {
    border-left-color: var(--warning);
}

.timeline-entry.event-success {
    border-left-color: var(--success);
}

.timeline-entry.event-primary {
    border-left-color: var(--accent);
}

.entry-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-base);
    border-radius: 6px;
    flex-shrink: 0;
}

.entry-icon i {
    font-size: 16px;
}

.entry-content {
    flex: 1;
}

.entry-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-xs);
}

.entry-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
}

.entry-time {
    font-size: 12px;
    color: var(--text-secondary);
}

.entry-body {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    font-size: 13px;
}

.entry-user {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--text-secondary);
}

.entry-field code {
    background: var(--bg-base);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
}

.entry-change {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

.old-value {
    color: var(--danger);
    text-decoration: line-through;
}

.new-value {
    color: var(--success);
    font-weight: 600;
}

.entry-change i {
    color: var(--text-secondary);
}

.entry-reason {
    display: flex;
    align-items: start;
    gap: 6px;
    padding: var(--spacing-xs);
    background: var(--bg-base);
    border-radius: 4px;
    font-style: italic;
    color: var(--text-secondary);
}

.btn-expand {
    background: none;
    border: none;
    color: var(--accent);
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 0;
    transition: all 0.2s;
}

.btn-expand:hover {
    color: var(--accent-hover);
}

.metadata-content {
    margin-top: var(--spacing-xs);
    background: var(--bg-base);
    border-radius: 4px;
    padding: var(--spacing-sm);
    overflow-x: auto;
}

.metadata-content pre {
    margin: 0;
    font-size: 11px;
    color: var(--text-secondary);
}
</style>
