<template>
    <div class="report-block" :class="`block-${block.type}`">
        <div class="block-header">
            <div class="block-type-label">{{ getBlockLabel() }}</div>
            <div class="block-actions" v-if="block.type !== 'text'">
                <BaseButton variant="ghost" size="small" @click="$emit('remove')" title="Remove block">
                    <i class="bi bi-x"></i>
                </BaseButton>
            </div>
        </div>
        <div class="block-content">
            <!-- Heading Block -->
            <div v-if="block.type === 'heading'" class="block-heading">
                <input v-model="localContent" @input="updateContent" class="heading-input"
                    :placeholder="`Heading ${block.config.level || 2}`" />
            </div>

            <!-- Text Block -->
            <div v-else-if="block.type === 'text'" class="block-text" @drop.stop @dragover.stop>
                <RichTextEditor v-model="localContent" @update:modelValue="(value) => updateContent(value)"
                    :route-id="props.routeId || routeData?.id || routeData?.RouteId || null"
                    :locked="props.editorsLocked" placeholder="Enter text content..." @loop-drop="handleLoopDrop" />
            </div>

            <!-- Image Block -->
            <div v-else-if="block.type === 'image'" class="block-image">
                <div v-if="block.config.src" class="image-preview">
                    <img :src="block.config.src" :alt="block.config.alt || ''" />
                </div>
                <div v-else class="image-placeholder">
                    <i class="bi bi-image"></i>
                    <p>No image</p>
                </div>
            </div>

            <!-- Table Block -->
            <div v-else-if="block.type === 'table'" class="block-table">
                <TableConfigPanel :block="block" :config="tableConfig"
                    @update-config="$emit('update-table-config', $event)" />
            </div>

            <!-- Data Block -->
            <div v-else-if="block.type === 'data_block'" class="block-data">
                <div class="data-block-preview">
                    <i class="bi bi-database"></i>
                    <span>{{ getDataBlockLabel() }}</span>
                    <span class="data-badge">Auto-generated</span>
                </div>
            </div>

            <!-- TOC Block -->
            <div v-else-if="block.type === 'toc'" class="block-toc">
                <div class="toc-preview">
                    <i class="bi bi-list-ul"></i>
                    <span>Table of Contents</span>
                    <span class="data-badge">Auto-generated</span>
                </div>
            </div>

            <!-- Page Break -->
            <div v-else-if="block.type === 'page_break'" class="block-page-break">
                <div class="page-break-line"></div>
                <span>Page Break</span>
            </div>

            <!-- Divider -->
            <div v-else-if="block.type === 'divider'" class="block-divider">
                <hr />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { BaseButton } from '@/components/ui';
import { BLOCK_TYPES, DATA_BLOCK_TYPES } from '@/composables/useReportBuilder';
import TableConfigPanel from './TableConfigPanel.vue';
import RichTextEditor from './RichTextEditorCustom.vue';

const props = defineProps({
    block: {
        type: Object,
        required: true,
    },
    routeData: {
        type: Object,
        default: null,
    },
    routeId: {
        type: [String, Number],
        default: null,
    },
    tableConfig: {
        type: Object,
        default: null,
    },
    editorsLocked: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['update-content', 'update-table-config', 'remove', 'loop-drop']);

function handleLoopDrop(data) {
    // Pass through the loop-drop event with the editor element
    emit('loop-drop', {
        ...data,
        blockId: props.block.id
    });
}

const localContent = ref(props.block.config?.content || '');

watch(() => props.block.config?.content, (newVal) => {
    localContent.value = newVal || '';
});

function updateContent(value) {
    if (value !== undefined) {
        localContent.value = value;
    }
    emit('update-content', localContent.value);
}

function getBlockLabel() {
    const labels = {
        [BLOCK_TYPES.TEXT]: 'Text Block',
        [BLOCK_TYPES.HEADING]: 'Heading',
        [BLOCK_TYPES.IMAGE]: 'Image',
        [BLOCK_TYPES.TABLE]: 'Table',
        [BLOCK_TYPES.DATA_BLOCK]: 'Data Block',
        [BLOCK_TYPES.TOC]: 'Table of Contents',
        [BLOCK_TYPES.PAGE_BREAK]: 'Page Break',
        [BLOCK_TYPES.DIVIDER]: 'Divider',
    };
    return labels[props.block.type] || 'Block';
}

function getDataBlockLabel() {
    const dataType = props.block.config?.dataType;
    const labels = {
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
    return labels[dataType] || 'Data Block';
}
</script>

<style scoped>
.report-block {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0 var(--spacing-sm) var(--spacing-sm);
    transition: all 0.2s;
}

.report-block:hover {
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.block-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0;
    margin-bottom: 4px;
    padding: 2px 0;
    border-bottom: 1px solid var(--border);
}

.block-type-label {
    font-size: 9px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.3px;
    text-align: left;
}

.block-actions {
    display: flex;
    gap: var(--spacing-xs);
}

.block-content {
    min-height: 20px;
}

.heading-input {
    width: 100%;
    font-size: 18px;
    font-weight: 600;
    border: none;
    background: transparent;
    color: var(--text-primary);
    padding: 2px 0;
}

.heading-input:focus {
    outline: none;
    border-bottom: 2px solid var(--accent);
}

.text-input {
    width: 100%;
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: var(--spacing-xs);
    background: var(--bg-elevated);
    color: var(--text-primary);
    font-family: inherit;
    font-size: 13px;
    resize: vertical;
    min-height: 40px;
}

.text-input:focus {
    outline: none;
    border-color: var(--accent);
}

.image-preview img {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
}

.image-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-md);
    border: 2px dashed var(--border);
    border-radius: 4px;
    color: var(--text-secondary);
}

.image-placeholder i {
    font-size: 32px;
    margin-bottom: var(--spacing-xs);
}

.block-data {
    padding: var(--spacing-xs);
}

.data-block-preview {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--bg-elevated);
    border-radius: 4px;
}

.data-badge {
    margin-left: auto;
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--accent);
    color: white;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
}

.block-toc {
    padding: var(--spacing-xs);
}

.toc-preview {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--bg-elevated);
    border-radius: 4px;
}

.block-page-break {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-xs);
    color: var(--text-secondary);
}

.page-break-line {
    flex: 1;
    height: 1px;
    background: var(--border);
    border-top: 2px dashed var(--text-secondary);
}

.block-divider hr {
    margin: var(--spacing-xs) 0;
    border: none;
    border-top: 1px solid var(--border);
}
</style>
