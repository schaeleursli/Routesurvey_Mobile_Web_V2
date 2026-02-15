<template>
    <div class="report-outline">
        <div v-for="section in sections" :key="section.id" class="outline-section"
            :class="{ 'collapsed': section.collapsed, 'hidden': !section.visible }">
            <div class="section-header" @click="toggleCollapse(section.id)">
                <div class="section-header-left">
                    <i class="bi" :class="section.collapsed ? 'bi-chevron-right' : 'bi-chevron-down'"></i>
                    <span class="section-title">{{ section.title }}</span>
                </div>
                <div class="section-actions" @click.stop>
                    <BaseButton variant="ghost" size="small" @click="toggleVisibility(section.id)"
                        :title="section.visible ? 'Hide section' : 'Show section'">
                        <i class="bi" :class="section.visible ? 'bi-eye' : 'bi-eye-slash'"></i>
                    </BaseButton>
                </div>
            </div>
            <div v-if="!section.collapsed" class="section-blocks">
                <div v-for="block in section.blocks" :key="block.id" class="outline-block"
                    :class="{ 'selected': selectedBlockId === block.id }" @click="$emit('select-block', block.id)">
                    <div class="block-icon">
                        <i class="bi" :class="getBlockIcon(block.type)"></i>
                    </div>
                    <div class="block-info">
                        <div class="block-title">{{ getBlockTitle(block) }}</div>
                        <div class="block-type">{{ getBlockTypeLabel(block.type) }}</div>
                    </div>
                </div>
                <div v-if="section.blocks.length === 0" class="empty-section">
                    No blocks in this section
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { BaseButton } from '@/components/ui';
import { BLOCK_TYPES, DATA_BLOCK_TYPES } from '@/composables/useReportBuilder';

const props = defineProps({
    sections: {
        type: Array,
        required: true,
    },
    selectedBlockId: {
        type: String,
        default: null,
    },
});

const emit = defineEmits(['select-block', 'toggle-visibility', 'toggle-collapse', 'reorder-sections']);

function toggleVisibility(sectionId) {
    emit('toggle-visibility', sectionId);
}

function toggleCollapse(sectionId) {
    emit('toggle-collapse', sectionId);
}

function getBlockIcon(type) {
    const icons = {
        [BLOCK_TYPES.TEXT]: 'bi-text-paragraph',
        [BLOCK_TYPES.HEADING]: 'bi-type-h1',
        [BLOCK_TYPES.IMAGE]: 'bi-image',
        [BLOCK_TYPES.TABLE]: 'bi-table',
        [BLOCK_TYPES.DATA_BLOCK]: 'bi-database',
        [BLOCK_TYPES.TOC]: 'bi-list-ul',
        [BLOCK_TYPES.PAGE_BREAK]: 'bi-file-break',
        [BLOCK_TYPES.DIVIDER]: 'bi-hr',
    };
    return icons[type] || 'bi-square';
}

function getBlockTitle(block) {
    if (block.type === BLOCK_TYPES.HEADING) {
        return block.config.content || 'Heading';
    }
    if (block.type === BLOCK_TYPES.TEXT) {
        const content = block.config.content || '';
        return content.substring(0, 30) + (content.length > 30 ? '...' : '') || 'Text Block';
    }
    if (block.type === BLOCK_TYPES.DATA_BLOCK) {
        return getDataBlockTitle(block.config.dataType);
    }
    if (block.type === BLOCK_TYPES.TABLE) {
        return `Table: ${block.config.type || 'Custom'}`;
    }
    return getBlockTypeLabel(block.type);
}

function getDataBlockTitle(dataType) {
    const titles = {
        [DATA_BLOCK_TYPES.ROUTE_NAME]: 'Route Name',
        [DATA_BLOCK_TYPES.ROUTE_DESCRIPTION]: 'Route Description',
        [DATA_BLOCK_TYPES.START_LOCATION]: 'Start Location',
        [DATA_BLOCK_TYPES.END_LOCATION]: 'End Location',
        [DATA_BLOCK_TYPES.ROUTE_DISTANCE]: 'Route Distance',
        [DATA_BLOCK_TYPES.SURVEYOR_INFO]: 'Surveyor Info',
        [DATA_BLOCK_TYPES.DATE]: 'Date',
        [DATA_BLOCK_TYPES.ORGANIZATION]: 'Organization',
        [DATA_BLOCK_TYPES.ROUTE_MAP]: 'Route Map',
        [DATA_BLOCK_TYPES.PHOTOS]: 'Photos',
        [DATA_BLOCK_TYPES.OBSTRUCTIONS_TABLE]: 'Obstructions',
        [DATA_BLOCK_TYPES.ELEVATION_PROFILE]: 'Elevation Profile',
    };
    return titles[dataType] || 'Data Block';
}

function getBlockTypeLabel(type) {
    const labels = {
        [BLOCK_TYPES.TEXT]: 'Text',
        [BLOCK_TYPES.HEADING]: 'Heading',
        [BLOCK_TYPES.IMAGE]: 'Image',
        [BLOCK_TYPES.TABLE]: 'Table',
        [BLOCK_TYPES.DATA_BLOCK]: 'Data',
        [BLOCK_TYPES.TOC]: 'Table of Contents',
        [BLOCK_TYPES.PAGE_BREAK]: 'Page Break',
        [BLOCK_TYPES.DIVIDER]: 'Divider',
    };
    return labels[type] || 'Block';
}
</script>

<style scoped>
.report-outline {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.outline-section {
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
}

.outline-section.hidden {
    opacity: 0.5;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--bg-elevated);
    cursor: pointer;
    user-select: none;
}

.section-header:hover {
    background: var(--bg-surface);
}

.section-header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    flex: 1;
}

.section-title {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 14px;
}

.section-actions {
    display: flex;
    gap: var(--spacing-xs);
}

.section-blocks {
    padding: var(--spacing-xs);
    background: var(--bg-surface);
}

.outline-block {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
}

.outline-block:hover {
    background: var(--bg-elevated);
}

.outline-block.selected {
    background: var(--accent);
    color: white;
}

.block-icon {
    font-size: 18px;
    width: 24px;
    text-align: center;
}

.block-info {
    flex: 1;
    min-width: 0;
}

.block-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.outline-block.selected .block-title {
    color: white;
}

.block-type {
    font-size: 11px;
    color: var(--text-secondary);
    margin-top: 2px;
}

.outline-block.selected .block-type {
    color: rgb(255 255 255 / 80%);
}

.empty-section {
    padding: var(--spacing-md);
    text-align: center;
    color: var(--text-secondary);
    font-size: 12px;
    font-style: italic;
}
</style>
