<template>
    <div v-if="show" class="modal-backdrop" @click="handleCancel" @dragover.prevent.stop @drop.prevent.stop
        @dragenter.prevent.stop @dragleave.prevent.stop>
        <div class="modal-content row-body-editor-modal" @click.stop @dragover.stop.prevent @drop.stop.prevent
            @dragenter.stop.prevent @dragleave.stop.prevent>
            <div class="modal-header">
                <h5 class="modal-title">Edit Row Body</h5>
                <button type="button" class="btn-close" @click="handleCancel">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="row-editor-layout">
                    <!-- Variable Library Sidebar -->
                    <div class="variable-library-sidebar">
                        <div class="sidebar-title">Available Variables</div>

                        <!-- Tabs -->
                        <div class="library-tabs">
                            <button v-for="tab in availableTabs" :key="tab.id" class="tab-button"
                                :class="{ 'active': activeTab === tab.id }" @click="activeTab = tab.id">
                                <i class="bi" :class="tab.icon"></i>
                                <span>{{ tab.label }}</span>
                            </button>
                        </div>

                        <!-- Tab Content -->
                        <div class="tab-content">
                            <!-- Point Variables -->
                            <div v-show="activeTab === 'point'" class="group-blocks">
                                <div v-for="variable in filteredPointVariables" :key="variable.title"
                                    class="library-block" draggable="true"
                                    @dragstart="handleVariableDragStart($event, variable.value)"
                                    @dragend="handleVariableDragEnd"
                                    @dblclick="handleVariableDoubleClick(variable.value)">
                                    <i class="bi" :class="getVariableIcon(variable.title)"></i>
                                    <span>{{ variable.title }}</span>
                                </div>
                            </div>

                            <!-- Note Variables -->
                            <div v-show="activeTab === 'note'" class="group-blocks">
                                <div v-for="variable in noteVariables" :key="variable.title" class="library-block"
                                    draggable="true" @dragstart="handleVariableDragStart($event, variable.value)"
                                    @dragend="handleVariableDragEnd"
                                    @dblclick="handleVariableDoubleClick(variable.value)">
                                    <i class="bi" :class="getVariableIcon(variable.title)"></i>
                                    <span>{{ variable.title }}</span>
                                </div>
                            </div>

                            <!-- Route Variables -->
                            <div v-show="activeTab === 'route'" class="group-blocks">
                                <div v-for="variable in routeVariables" :key="variable.title" class="library-block"
                                    draggable="true" @dragstart="handleVariableDragStart($event, variable.value)"
                                    @dragend="handleVariableDragEnd"
                                    @dblclick="handleVariableDoubleClick(variable.value)">
                                    <i class="bi" :class="getVariableIcon(variable.title)"></i>
                                    <span>{{ variable.title }}</span>
                                </div>
                            </div>

                            <!-- User Variables -->
                            <div v-show="activeTab === 'user'" class="group-blocks">
                                <div v-for="variable in userVariables" :key="variable.title" class="library-block"
                                    draggable="true" @dragstart="handleVariableDragStart($event, variable.value)"
                                    @dragend="handleVariableDragEnd"
                                    @dblclick="handleVariableDoubleClick(variable.value)">
                                    <i class="bi" :class="getVariableIcon(variable.title)"></i>
                                    <span>{{ variable.title }}</span>
                                </div>
                            </div>

                            <!-- Date Variables -->
                            <div v-show="activeTab === 'date'" class="group-blocks">
                                <div v-for="variable in dateVariables" :key="variable.title" class="library-block"
                                    draggable="true" @dragstart="handleVariableDragStart($event, variable.value)"
                                    @dragend="handleVariableDragEnd"
                                    @dblclick="handleVariableDoubleClick(variable.value)">
                                    <i class="bi" :class="getVariableIcon(variable.title)"></i>
                                    <span>{{ variable.title }}</span>
                                </div>
                            </div>

                            <!-- Formatting Variables -->
                            <div v-show="activeTab === 'formatting'" class="group-blocks">
                                <div v-for="variable in formattingVariables" :key="variable.title" class="library-block"
                                    draggable="true" @dragstart="handleVariableDragStart($event, variable.value)"
                                    @dragend="handleVariableDragEnd"
                                    @dblclick="handleVariableDoubleClick(variable.value)">
                                    <i class="bi" :class="getVariableIcon(variable.title)"></i>
                                    <span>{{ variable.title }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Column Editor Area -->
                    <div class="column-editor-area">
                        <div class="editor-header">
                            <div class="editor-label">Row Columns</div>
                            <BaseButton variant="primary" size="small" @click="addColumn">
                                <i class="bi bi-plus-lg"></i> Add Column
                            </BaseButton>
                        </div>
                        <div class="columns-list">
                            <div v-for="(column, index) in columns" :key="index" class="column-item">
                                <div class="column-header">
                                    <span class="column-number">Column {{ index + 1 }}</span>
                                    <button type="button" class="btn-remove-column" @click="removeColumn(index)"
                                        :disabled="columns.length <= 1">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                                <RichTextEditorCustom :ref="el => setColumnEditorRef(el, index)"
                                    v-model="column.content" :route-id="routeId"
                                    :placeholder="'Drag variables here or type MASL expressions...'"
                                    :auto-parse-default="false" class="column-editor" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <BaseButton variant="secondary" @click="handleCancel">Cancel</BaseButton>
                <BaseButton variant="primary" @click="handleConfirm">Insert Row</BaseButton>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted, onBeforeUnmount } from 'vue';
import RichTextEditorCustom from './RichTextEditorCustom.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { useReportEditor } from '@/composables/useReportEditor';

// Get variables from useReportEditor
const {
    routeVariables,
    pointVariables,
    screenshotVariables,
    userVariables,
    dateVariables,
    formattingVariables
} = useReportEditor();

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    routeId: {
        type: [String, Number],
        default: null
    },
    initialColumnCount: {
        type: Number,
        default: 1
    }
});

const emit = defineEmits(['confirm', 'cancel']);

const columns = ref([{ content: '' }]);
const activeTab = ref('point');
const columnEditorRefs = ref([]);
let opacityStyleTag = null;

// Set editor ref for a column
function setColumnEditorRef(el, index) {
    if (el) {
        columnEditorRefs.value[index] = el;
    }
}

// Available tabs
const availableTabs = computed(() => [
    { id: 'point', label: 'Point', icon: 'bi-pin-map' },
    { id: 'note', label: 'Note', icon: 'bi-sticky' },
    { id: 'route', label: 'Route', icon: 'bi-signpost' },
    { id: 'user', label: 'User', icon: 'bi-person' },
    { id: 'date', label: 'Date', icon: 'bi-calendar' },
    { id: 'formatting', label: 'Format', icon: 'bi-layout-text-window' }
]);

// Filter out loop blocks from point variables
const filteredPointVariables = computed(() => {
    return pointVariables.filter(v => {
        if (v.title.includes('Start Point Loop') || v.title.includes('Start Note Loop')) {
            return false;
        }
        if (v.value && (v.value.includes("@note(") || v.value.includes("@noteimg("))) {
            return false;
        }
        return true;
    });
});

// Note-specific variables
const noteVariables = computed(() => {
    return pointVariables.filter(v => {
        if (!v.value) return false;
        return v.value.includes("@note(") ||
            v.value.includes("@noteimg(") ||
            v.title.includes("Start Note Loop");
    }).sort((a, b) => {
        const aIsLoop = a.title.includes("Start Note Loop");
        const bIsLoop = b.title.includes("Start Note Loop");
        if (aIsLoop && !bIsLoop) return -1;
        if (!aIsLoop && bIsLoop) return 1;
        return 0;
    });
});

// Watch for show changes to reset columns and manage page opacity
watch(() => props.show, (newVal) => {
    if (newVal) {
        // Initialize columns based on initialColumnCount prop
        const columnCount = Math.max(1, props.initialColumnCount || 1);
        columns.value = Array.from({ length: columnCount }, () => ({ content: '' }));
        columnEditorRefs.value = [];

        // Add a style tag to force body/html opacity to 1
        if (!opacityStyleTag) {
            opacityStyleTag = document.createElement('style');
            opacityStyleTag.id = 'row-body-editor-opacity-fix';
            opacityStyleTag.textContent = `
                body, html {
                    opacity: 1 !important;
                }
                body *, html * {
                    opacity: inherit !important;
                }
            `;
            document.head.appendChild(opacityStyleTag);
        }

        // Prevent page opacity changes during drag
        document.body.style.setProperty('opacity', '1', 'important');
        document.documentElement.style.setProperty('opacity', '1', 'important');

        // Add global drag event listeners to prevent page transparency
        document.addEventListener('dragover', preventPageOpacityChange, true);
        document.addEventListener('dragenter', preventPageOpacityChange, true);
        document.addEventListener('dragleave', preventPageOpacityChange, true);
        document.addEventListener('drop', preventPageOpacityChange, true);
    } else {
        // Clean up event listeners
        document.removeEventListener('dragover', preventPageOpacityChange, true);
        document.removeEventListener('dragenter', preventPageOpacityChange, true);
        document.removeEventListener('dragleave', preventPageOpacityChange, true);
        document.removeEventListener('drop', preventPageOpacityChange, true);

        // Remove style tag
        if (opacityStyleTag && document.head.contains(opacityStyleTag)) {
            document.head.removeChild(opacityStyleTag);
            opacityStyleTag = null;
        }

        // Reset opacity styles
        document.body.style.opacity = '';
        document.documentElement.style.opacity = '';
    }
});

// Function to prevent page opacity changes during drag
function preventPageOpacityChange(event) {
    // Force body and html to stay fully opaque during any drag operation
    if (props.show) {
        document.body.style.setProperty('opacity', '1', 'important');
        document.documentElement.style.setProperty('opacity', '1', 'important');

        // Also ensure all elements in the modal backdrop stay opaque
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.style.setProperty('opacity', '1', 'important');
        }
    }
}

// Clean up on unmount
onBeforeUnmount(() => {
    document.removeEventListener('dragover', preventPageOpacityChange, true);
    document.removeEventListener('dragenter', preventPageOpacityChange, true);
    document.removeEventListener('dragleave', preventPageOpacityChange, true);
    document.removeEventListener('drop', preventPageOpacityChange, true);
    document.body.style.opacity = '';
    document.documentElement.style.opacity = '';

    // Remove style tag if it exists
    if (opacityStyleTag && document.head.contains(opacityStyleTag)) {
        document.head.removeChild(opacityStyleTag);
        opacityStyleTag = null;
    }
});

function addColumn() {
    columns.value.push({ content: '' });
}

function removeColumn(index) {
    if (columns.value.length > 1) {
        columns.value.splice(index, 1);
        columnEditorRefs.value.splice(index, 1);
    }
}

function handleVariableDragStart(event, variableValue) {
    event.stopPropagation();
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('block-type', 'variable');
    event.dataTransfer.setData('block-config', JSON.stringify({ value: variableValue }));

    // Immediately force page elements to stay opaque
    document.body.style.setProperty('opacity', '1', 'important');
    document.documentElement.style.setProperty('opacity', '1', 'important');
}

function handleVariableDragEnd(event) {
    // Ensure opacity stays at 1 after drag ends
    document.body.style.setProperty('opacity', '1', 'important');
    document.documentElement.style.setProperty('opacity', '1', 'important');
}

async function handleVariableDoubleClick(variableValue) {
    // Insert variable at cursor position in the active column editor
    await nextTick();
    // Find the first visible editor or use the first one
    const activeEditor = columnEditorRefs.value.find(editor => editor) || columnEditorRefs.value[0];
    if (activeEditor && activeEditor.insertTextAtCursor) {
        activeEditor.insertTextAtCursor(variableValue);
    } else if (columns.value.length > 0) {
        // Fallback: append to first column
        const currentContent = columns.value[0].content || '';
        columns.value[0].content = currentContent + (currentContent ? '\n' : '') + variableValue;
    }
}

function handleConfirm() {
    // Extract content from each column, preserving HTML formatting
    const columnContents = columns.value.map(column => {
        let content = column.content.trim();

        // If content is empty, return empty string
        if (!content) {
            return '';
        }

        // Preserve HTML formatting - don't strip it
        // Only normalize excessive newlines
        if (content.includes('<')) {
            // Content has HTML - preserve it as-is
            // Just clean up excessive newlines in text nodes
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;

            // Normalize the HTML structure but preserve formatting
            // Remove empty paragraphs and normalize whitespace
            const walker = document.createTreeWalker(
                tempDiv,
                NodeFilter.SHOW_TEXT,
                null
            );

            const textNodes = [];
            let node;
            while ((node = walker.nextNode())) {
                textNodes.push(node);
            }

            // Clean up excessive newlines in text nodes
            textNodes.forEach(textNode => {
                if (textNode.textContent) {
                    textNode.textContent = textNode.textContent.replace(/\n{3,}/g, '\n\n');
                }
            });

            content = tempDiv.innerHTML;
        } else {
            // Plain text - just clean up excessive newlines
            content = content.replace(/\n{3,}/g, '\n\n').trim();
        }

        return content;
    });

    // Build the row structure with HTML content preserved
    // Return an object with both the structured content and HTML content
    const rowData = {
        columns: columnContents,
        // Also provide a string format for backward compatibility
        stringFormat: ''
    };

    // Build string format: @beginrow @begincol ... @endcol @begincol ... @endcol @endrow
    let rowContent = '@beginrow\n';
    columnContents.forEach((colContent, index) => {
        if (colContent) {
            rowContent += '@begincol\n';
            // For string format, we need to preserve HTML but MASL parser will handle it
            rowContent += colContent;
            rowContent += '\n@endcol';
            if (index < columnContents.length - 1) {
                rowContent += '\n';
            }
        }
    });
    rowContent += '\n@endrow';

    rowData.stringFormat = rowContent;

    emit('confirm', rowData);
    columns.value = [{ content: '' }];
}

function handleCancel() {
    emit('cancel');
    columns.value = [{ content: '' }];
}

// Get appropriate icon for variable
function getVariableIcon(title) {
    const titleLower = title.toLowerCase();

    if (titleLower.includes('route') || titleLower.includes('survey')) {
        if (titleLower.includes('map')) return 'bi-map';
        if (titleLower.includes('distance')) return 'bi-sign-turn-left';
        if (titleLower.includes('location') || titleLower.includes('start') || titleLower.includes('end')) return 'bi-geo-alt-fill';
        if (titleLower.includes('name') || titleLower.includes('title')) return 'bi-signpost';
        if (titleLower.includes('description') || titleLower.includes('notes')) return 'bi-file-text';
        if (titleLower.includes('date') || titleLower.includes('time')) return 'bi-calendar';
        if (titleLower.includes('screenshot')) return 'bi-camera';
        if (titleLower.includes('planned')) return 'bi-map';
        if (titleLower.includes('client')) return 'bi-person-badge';
        if (titleLower.includes('cargo')) return 'bi-box';
        if (titleLower.includes('trailer')) return 'bi-truck';
        return 'bi-file-earmark-text';
    }

    if (titleLower.includes('point') || titleLower.includes('note')) {
        if (titleLower.includes('loop') || titleLower.includes('begin')) return 'bi-arrow-repeat';
        if (titleLower.includes('address') || titleLower.includes('location')) return 'bi-geo-alt';
        if (titleLower.includes('gps') || titleLower.includes('coordinate') || titleLower.includes('lat') || titleLower.includes('lon')) return 'bi-geo';
        if (titleLower.includes('distance')) return 'bi-rulers';
        if (titleLower.includes('image') || titleLower.includes('photo')) return 'bi-image';
        if (titleLower.includes('type')) return 'bi-tag';
        if (titleLower.includes('heading') || titleLower.includes('altitude')) return 'bi-compass';
        if (titleLower.includes('date') || titleLower.includes('time')) return 'bi-clock';
        return 'bi-pin-map';
    }

    if (titleLower.includes('user') || titleLower.includes('company')) {
        if (titleLower.includes('name') || titleLower.includes('firstname') || titleLower.includes('lastname')) return 'bi-person';
        if (titleLower.includes('email')) return 'bi-envelope';
        if (titleLower.includes('phone')) return 'bi-telephone';
        if (titleLower.includes('company') || titleLower.includes('organization')) return 'bi-building';
        if (titleLower.includes('website')) return 'bi-globe';
        if (titleLower.includes('address') || titleLower.includes('street') || titleLower.includes('city') || titleLower.includes('state') || titleLower.includes('zip') || titleLower.includes('country')) return 'bi-geo-alt';
        if (titleLower.includes('logo')) return 'bi-image';
        if (titleLower.includes('qrcode') || titleLower.includes('qr')) return 'bi-qr-code';
        if (titleLower.includes('disclaimer')) return 'bi-shield-exclamation';
        return 'bi-person-circle';
    }

    if (titleLower.includes('date') || titleLower.includes('time')) {
        if (titleLower.includes('time') && !titleLower.includes('date')) return 'bi-clock';
        if (titleLower.includes('date') && !titleLower.includes('time')) return 'bi-calendar';
        return 'bi-calendar-event';
    }

    if (titleLower.includes('new line') || titleLower.includes('line break')) return 'bi-arrow-down';
    if (titleLower.includes('horizontal') || titleLower.includes('divider')) return 'bi-hr';
    if (titleLower.includes('page break')) return 'bi-file-break';
    if (titleLower.includes('row') || titleLower.includes('column')) return 'bi-grid';
    if (titleLower.includes('header')) return 'bi-layout-top';
    if (titleLower.includes('footer')) return 'bi-layout-bottom';
    if (titleLower.includes('cover')) return 'bi-file-earmark-text';
    if (titleLower.includes('page number')) return 'bi-123';

    if (titleLower.includes('screenshot')) {
        if (titleLower.includes('image') || titleLower.includes('url')) return 'bi-image';
        if (titleLower.includes('note')) return 'bi-sticky';
        if (titleLower.includes('type')) return 'bi-tag';
        return 'bi-camera';
    }

    return 'bi-code-square';
}
</script>

<style scoped>
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 50%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2100;
    opacity: 1 !important;
    pointer-events: auto;
    backdrop-filter: none;
}

.row-body-editor-modal {
    background: var(--bg-surface);
    border-radius: 8px;
    box-shadow: var(--shadow-lg);
    width: 90%;
    max-width: 1400px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    height: 90vh;
    opacity: 1 !important;
    position: relative;
    z-index: 2101;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--border);
}

.modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
}

.btn-close {
    background: none;
    border: none;
    font-size: 1.25rem;
    color: var(--text-secondary);
    cursor: pointer;
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
    background: var(--bg-elevated);
    color: var(--text-primary);
}

.modal-body {
    flex: 1;
    overflow: hidden;
    padding: var(--spacing-md);
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.row-editor-layout {
    display: flex;
    gap: var(--spacing-md);
    flex: 1;
    min-height: 0;
    overflow: hidden;
    height: 100%;
}

.variable-library-sidebar {
    width: 300px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--bg-surface);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
}

.sidebar-title {
    padding: var(--spacing-sm);
    font-weight: 600;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border);
    background: var(--bg-elevated);
    flex-shrink: 0;
}

.library-tabs {
    display: flex;
    flex-wrap: nowrap;
    gap: 8px;
    padding: 0 var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
    border-bottom: 1.5px solid var(--border);
    overflow: auto hidden;
    scrollbar-width: thin;
    scrollbar-color: var(--text-secondary) transparent;
    -webkit-overflow-scrolling: touch;
    flex-shrink: 0;
}

.library-tabs::-webkit-scrollbar {
    height: 4px;
}

.library-tabs::-webkit-scrollbar-track {
    background: transparent;
}

.library-tabs::-webkit-scrollbar-thumb {
    background-color: var(--text-secondary);
    border-radius: 2px;
}

.library-tabs::-webkit-scrollbar-thumb:hover {
    background-color: var(--accent);
}

.tab-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: none;
    border: none;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    cursor: pointer;
    transition: all var(--transition-normal);
    font-size: 12px;
    font-weight: var(--font-weight-medium);
    color: var(--text-secondary);
    white-space: nowrap;
    min-width: fit-content;
    position: relative;
    flex-shrink: 0;
}

.tab-button:hover:not(.active) {
    background: var(--bg-elevated);
    color: var(--accent);
}

.tab-button.active {
    background: var(--bg-surface);
    color: var(--accent);
    border-bottom: 3px solid var(--accent);
}

.tab-button i {
    font-size: 14px;
}

.tab-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.group-blocks {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    flex: 1;
    overflow: hidden auto;
    padding-right: var(--spacing-xs);
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
}

.group-blocks::-webkit-scrollbar {
    width: 6px;
}

.group-blocks::-webkit-scrollbar-track {
    background: transparent;
}

.group-blocks::-webkit-scrollbar-thumb {
    background-color: var(--border);
    border-radius: 3px;
}

.group-blocks::-webkit-scrollbar-thumb:hover {
    background-color: var(--text-secondary);
}

.library-block {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    cursor: grab;
    transition: all 0.2s;
    user-select: none;
    position: relative;
    z-index: 1;
}

.library-block:hover {
    background: var(--bg-elevated);
    border-color: var(--accent);
    transform: translateX(4px);
}

.library-block:active {
    cursor: grabbing;
    transform: translateX(2px);
}

/* Prevent drag ghost from affecting page transparency */
.library-block[draggable="true"] {
    -webkit-user-drag: element;
}

/* Ensure backdrop and modal stay visible during drag - matching LoopBodyEditor */
.modal-backdrop {
    opacity: 1 !important;
    backdrop-filter: none !important;
}

/* Prevent page-level opacity changes during drag */
:global(body),
:global(html) {
    opacity: 1 !important;
}

/* When modal is open, ensure body/html stay opaque */
body:has(.row-body-editor-modal),
html:has(.row-body-editor-modal) {
    opacity: 1 !important;
}

.library-block i {
    font-size: 18px;
    color: var(--accent);
    width: 24px;
    text-align: center;
}

.library-block span {
    font-size: 13px;
    color: var(--text-primary);
    font-weight: 500;
    line-height: 1.3;
    overflow-wrap: break-word;
}

.column-editor-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
}

.editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-sm);
}

.editor-label {
    font-weight: 500;
    color: var(--text-primary);
    font-size: 0.875rem;
}

.columns-list {
    flex: 1;
    overflow: hidden auto;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    padding-right: var(--spacing-xs);
}

.column-item {
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: var(--spacing-md);
    background: var(--bg-surface);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.column-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.column-number {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.875rem;
}

.btn-remove-column {
    background: var(--danger, var(--error));
    color: white;
    border: none;
    border-radius: 4px;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s;
}

.btn-remove-column:hover:not(:disabled) {
    background: var(--danger-dark, #c82333);
}

.btn-remove-column:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.column-editor {
    min-height: 150px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    border-top: 1px solid var(--border);
}
</style>
