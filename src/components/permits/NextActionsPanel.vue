<template>
    <div class="next-actions-panel">
        <h4>Next Actions</h4>
        <p v-if="actions.length === 0" class="no-actions">
            ✅ All set! No immediate actions required.
        </p>
        <div v-else class="actions-list">
            <div
                v-for="(action, idx) in actions"
                :key="idx"
                class="action-item"
                :class="`priority-${action.priority}`"
                @click="$emit('action-click', action)"
            >
                <div class="action-icon">
                    <component :is="getIcon(action.type)" :size="16" weight="fill" />
                </div>
                <div class="action-content">
                    <div class="action-title">{{ action.title }}</div>
                    <div class="action-description">{{ action.description }}</div>
                </div>
                <div class="action-arrow">
                    <PhCaretRight :size="14" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, markRaw } from 'vue';
import { PhWarning, PhTextCursor, PhPaperclip, PhInfo, PhDotOutline, PhCaretRight } from '@phosphor-icons/vue';

const props = defineProps({
    rollup: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['action-click']);

const actions = computed(() => {
    if (!props.rollup) return [];
    
    const actionsList = [];
    
    const validation = props.rollup.validation || {};
    const blockingIssues = validation.blockingIssues || [];
    const warnings = validation.warnings || [];
    const conflicts = props.rollup.conflicts || [];
    const blockingConflicts = conflicts.filter(c => c.severity === 'block');
    
    // Blocking conflicts (highest priority)
    blockingConflicts.forEach(conflict => {
        actionsList.push({
            type: 'conflict',
            priority: 'high',
            title: 'Resolve Blocking Conflict',
            description: conflict.message,
            context: conflict
        });
    });
    
    // Missing required fields
    blockingIssues.forEach(issue => {
        if (issue.kind === 'FIELD') {
            actionsList.push({
                type: 'missing_field',
                priority: 'high',
                title: 'Complete Required Field',
                description: issue.message,
                context: issue
            });
        }
    });
    
    // Missing attachments
    blockingIssues.forEach(issue => {
        if (issue.kind === 'ATTACHMENT') {
            actionsList.push({
                type: 'missing_attachment',
                priority: 'high',
                title: 'Upload Required Attachment',
                description: issue.message,
                context: issue
            });
        }
    });
    
    // Warnings (medium priority)
    warnings.slice(0, 3).forEach(warning => {
        actionsList.push({
            type: 'warning',
            priority: 'medium',
            title: 'Address Warning',
            description: warning.message,
            context: warning
        });
    });
    
    // Limit to top 5 actions
    return actionsList.slice(0, 5);
});

const iconMap = {
    'conflict': markRaw(PhWarning),
    'missing_field': markRaw(PhTextCursor),
    'missing_attachment': markRaw(PhPaperclip),
    'warning': markRaw(PhInfo),
    'default': markRaw(PhDotOutline)
};

const getIcon = (type) => {
    return iconMap[type] || iconMap['default'];
};
</script>

<style scoped>
.next-actions-panel {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
}

.next-actions-panel h4 {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
}

.no-actions {
    color: var(--text-secondary);
    font-size: 13px;
    text-align: center;
    padding: var(--spacing-md) 0;
    margin: 0;
}

.actions-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.action-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    border: 1px solid var(--border);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
}

.action-item:hover {
    background: var(--bg-elevated);
    border-color: var(--accent);
}

.action-item.priority-high {
    border-left: 3px solid var(--danger);
}

.action-item.priority-medium {
    border-left: 3px solid var(--warning);
}

.action-icon {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
}

.priority-high .action-icon {
    background: var(--danger-bg);
    color: var(--danger);
}

.priority-medium .action-icon {
    background: var(--warning-bg);
    color: var(--warning);
}

.action-content {
    flex: 1;
}

.action-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 2px;
}

.action-description {
    font-size: 12px;
    color: var(--text-secondary);
}

.action-arrow {
    color: var(--text-tertiary);
    font-size: 14px;
}
</style>
