<template>
    <div v-if="show" class="modal-backdrop" @click="handleCancel" @dragover.prevent @drop.prevent>
        <div class="modal-content loop-body-editor-modal" @click.stop @dragover.stop @drop.stop>
            <div class="modal-header">
                <h5 class="modal-title">{{ loopTitle }}</h5>
                <button type="button" class="btn-close" @click="handleCancel">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="loop-editor-layout">
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
                            <!-- Point Variables (only for point loop) -->
                            <div v-show="activeTab === 'point' && loopType === 'point'" class="group-blocks">
                                <div v-for="variable in filteredPointVariables" :key="variable.title"
                                    class="library-block" draggable="true"
                                    @dragstart="handleVariableDragStart($event, variable.value)"
                                    @dblclick="handleVariableDoubleClick(variable.value)">
                                    <i class="bi" :class="getVariableIcon(variable.title)"></i>
                                    <span>{{ variable.title }}</span>
                                </div>
                            </div>

                            <!-- Point Variables (for note loop - to access point data) -->
                            <div v-show="activeTab === 'point' && loopType === 'note'" class="group-blocks">
                                <div v-for="variable in filteredPointVariables" :key="variable.title"
                                    class="library-block" draggable="true"
                                    @dragstart="handleVariableDragStart($event, variable.value)"
                                    @dblclick="handleVariableDoubleClick(variable.value)">
                                    <i class="bi" :class="getVariableIcon(variable.title)"></i>
                                    <span>{{ variable.title }}</span>
                                </div>
                            </div>

                            <!-- Note Variables (for note loop and point loop) - includes Start Note Loop and note variables -->
                            <div v-show="activeTab === 'note' && (loopType === 'note' || loopType === 'point')"
                                class="group-blocks">
                                <div v-for="variable in noteVariables" :key="variable.title" class="library-block"
                                    draggable="true" @dragstart="handleVariableDragStart($event, variable.value)"
                                    @dblclick="handleVariableDoubleClick(variable.value)">
                                    <i class="bi" :class="getVariableIcon(variable.title)"></i>
                                    <span>{{ variable.title }}</span>
                                </div>
                            </div>

                            <!-- Screenshot Variables (only for screenshot loop) -->
                            <div v-show="activeTab === 'screenshot' && loopType === 'screenshot'" class="group-blocks">
                                <div v-for="variable in screenshotVariables" :key="variable.title" class="library-block"
                                    draggable="true" @dragstart="handleVariableDragStart($event, variable.value)"
                                    @dblclick="handleVariableDoubleClick(variable.value)">
                                    <i class="bi" :class="getVariableIcon(variable.title)"></i>
                                    <span>{{ variable.title }}</span>
                                </div>
                            </div>

                            <!-- Route Variables -->
                            <div v-show="activeTab === 'route'" class="group-blocks">
                                <div v-for="variable in routeVariables" :key="variable.title" class="library-block"
                                    draggable="true" @dragstart="handleVariableDragStart($event, variable.value)"
                                    @dblclick="handleVariableDoubleClick(variable.value)">
                                    <i class="bi" :class="getVariableIcon(variable.title)"></i>
                                    <span>{{ variable.title }}</span>
                                </div>
                            </div>

                            <!-- User Variables -->
                            <div v-show="activeTab === 'user'" class="group-blocks">
                                <div v-for="variable in userVariables" :key="variable.title" class="library-block"
                                    draggable="true" @dragstart="handleVariableDragStart($event, variable.value)"
                                    @dblclick="handleVariableDoubleClick(variable.value)">
                                    <i class="bi" :class="getVariableIcon(variable.title)"></i>
                                    <span>{{ variable.title }}</span>
                                </div>
                            </div>

                            <!-- Date Variables -->
                            <div v-show="activeTab === 'date'" class="group-blocks">
                                <div v-for="variable in dateVariables" :key="variable.title" class="library-block"
                                    draggable="true" @dragstart="handleVariableDragStart($event, variable.value)"
                                    @dblclick="handleVariableDoubleClick(variable.value)">
                                    <i class="bi" :class="getVariableIcon(variable.title)"></i>
                                    <span>{{ variable.title }}</span>
                                </div>
                            </div>

                            <!-- Formatting Variables -->
                            <div v-show="activeTab === 'formatting'" class="group-blocks">
                                <div v-for="variable in formattingVariables" :key="variable.title" class="library-block"
                                    draggable="true" @dragstart="handleVariableDragStart($event, variable.value)"
                                    @dblclick="handleVariableDoubleClick(variable.value)">
                                    <i class="bi" :class="getVariableIcon(variable.title)"></i>
                                    <span>{{ variable.title }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Editor Area -->
                    <div class="loop-editor-area">
                        <div class="editor-label">Loop Body Content</div>
                        <RichTextEditor ref="editorRef" v-model="loopBody" :route-id="routeId"
                            :placeholder="'Drag variables here or type MASL expressions...'"
                            :auto-parse-default="false" />
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <BaseButton variant="secondary" @click="handleCancel">Cancel</BaseButton>
                <BaseButton variant="primary" @click="handleConfirm">Insert Loop</BaseButton>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import RichTextEditor from './RichTextEditorCustom.vue';
import { BaseButton } from '@/components/ui';
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
    loopType: {
        type: String,
        default: 'point', // 'point', 'note', or 'screenshot'
        validator: (value) => ['point', 'note', 'screenshot'].includes(value)
    },
    routeId: {
        type: [String, Number],
        default: null
    }
});

const emit = defineEmits(['confirm', 'cancel']);

const loopBody = ref('');
const activeTab = ref('point'); // Default tab based on loop type
const editorRef = ref(null);

// Compute available tabs based on loop type
const availableTabs = computed(() => {
    const tabs = [];

    // Add loop-specific tab first
    if (props.loopType === 'point') {
        tabs.push({ id: 'point', label: 'Point', icon: 'bi-pin-map' });
        tabs.push({ id: 'note', label: 'Note', icon: 'bi-sticky' });
    } else if (props.loopType === 'note') {
        tabs.push({ id: 'point', label: 'Point', icon: 'bi-pin-map' });
        tabs.push({ id: 'note', label: 'Note', icon: 'bi-sticky' });
    } else if (props.loopType === 'screenshot') {
        tabs.push({ id: 'screenshot', label: 'Screenshot', icon: 'bi-camera' });
    }

    // Add common tabs
    tabs.push({ id: 'route', label: 'Route', icon: 'bi-signpost' });
    tabs.push({ id: 'user', label: 'User', icon: 'bi-person' });
    tabs.push({ id: 'date', label: 'Date', icon: 'bi-calendar' });
    tabs.push({ id: 'formatting', label: 'Format', icon: 'bi-layout-text-window' });

    return tabs;
});

// Set default active tab when loop type changes
watch(() => props.loopType, (newType) => {
    if (newType === 'point') {
        activeTab.value = 'point';
    } else if (newType === 'note') {
        activeTab.value = 'point';
    } else if (newType === 'screenshot') {
        activeTab.value = 'screenshot';
    }
}, { immediate: true });

// Filter out loop blocks and note variables from point variables (to avoid nesting and keep notes in Notes tab)
const filteredPointVariables = computed(() => {
    return pointVariables.filter(v => {
        // Exclude loop blocks
        if (v.title.includes('Start Point Loop') || v.title.includes('Start Note Loop')) {
            return false;
        }
        // Exclude note variables (they belong in Notes tab)
        if (v.value && (v.value.includes("@note(") || v.value.includes("@noteimg("))) {
            return false;
        }
        return true;
    });
});

// Note-specific variables (extract from pointVariables) - includes Start Note Loop for point loops only
const noteVariables = computed(() => {
    const filtered = pointVariables.filter(v => {
        if (!v.value) return false;

        // For note loops, exclude "Start Note Loop" (nested loops not needed)
        if (props.loopType === 'note' && v.title.includes("Start Note Loop")) {
            return false;
        }

        // Include note variables and Start Note Loop (for point loops)
        return v.value.includes("@note(") ||
            v.value.includes("@noteimg(") ||
            v.title.includes("Start Note Loop");
    });

    // Sort to put "Start Note Loop" first (only for point loops)
    return filtered.sort((a, b) => {
        const aIsLoop = a.title.includes("Start Note Loop");
        const bIsLoop = b.title.includes("Start Note Loop");
        if (aIsLoop && !bIsLoop) return -1;
        if (!aIsLoop && bIsLoop) return 1;
        return 0;
    });
});

const loopTitle = computed(() => {
    if (props.loopType === 'note') {
        return 'Edit Note Loop Body';
    } else if (props.loopType === 'screenshot') {
        return 'Edit Screenshot Loop Body';
    } else {
        return 'Edit Point Loop Body';
    }
});

// Watch for show changes to reset body
watch(() => props.show, (newVal) => {
    if (newVal) {
        loopBody.value = '';
    }
});

function handleVariableDragStart(event, variableValue) {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('block-type', 'variable');
    event.dataTransfer.setData('block-config', JSON.stringify({ value: variableValue }));
}

async function handleVariableDoubleClick(variableValue) {
    // Insert variable at cursor position in the editor
    await nextTick();
    if (editorRef.value && editorRef.value.insertTextAtCursor) {
        editorRef.value.insertTextAtCursor(variableValue);
    } else {
        // Fallback: append to content
        const currentBody = loopBody.value || '';
        loopBody.value = currentBody + (currentBody ? '\n' : '') + variableValue;
    }
}


function handleConfirm() {
    // Get the body content - it might be HTML from the editor
    let bodyContent = loopBody.value.trim();

    // Extract text content from HTML, preserving MASL expressions
    if (bodyContent.includes('<')) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = bodyContent;

        // Get text content, which should preserve MASL expressions
        // Replace <br> and <br/> with newlines
        const textContent = tempDiv.textContent || tempDiv.innerText || '';

        // Also check innerHTML for any MASL expressions that might be in attributes or comments
        // But primarily use textContent as it should contain the MASL expressions
        bodyContent = textContent;

        // If textContent doesn't have MASL expressions but innerHTML does, extract from HTML
        const maslPattern = /@(survey|point|user|plannedroute|date|beginfor|endfor|mapscreenshot|noteimg|note|pointimg|beginrow|endrow|begincol|endcol)\s*\([^)]*\)|@date|@beginfor|@endfor|@beginrow|@endrow|@begincol|@endcol/g;
        if (!maslPattern.test(textContent) && maslPattern.test(tempDiv.innerHTML)) {
            // Try to extract MASL from HTML more carefully
            // Replace HTML tags but preserve MASL expressions
            bodyContent = tempDiv.innerHTML
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<\/p>/gi, '\n')
                .replace(/<p[^>]*>/gi, '')
                .replace(/<div[^>]*>/gi, '')
                .replace(/<\/div>/gi, '\n')
                .replace(/<span[^>]*>/gi, '')
                .replace(/<\/span>/gi, '')
                .replace(/<[^>]+>/g, '') // Remove any remaining HTML tags
                .trim();
        }
    }

    // Clean up: remove extra newlines but preserve structure
    bodyContent = bodyContent.replace(/\n{3,}/g, '\n\n').trim();

    // Construct the full loop
    let fullLoop = '';
    if (props.loopType === 'note') {
        fullLoop = `@beginforpoint\n@beginfornote\n${bodyContent}\n@endfornote\n@endforpoint`;
    } else if (props.loopType === 'screenshot') {
        fullLoop = `@beginformapscreenshot\n${bodyContent}\n@endformapscreenshot`;
    } else {
        fullLoop = `@beginforpoint\n${bodyContent}\n@endforpoint`;
    }

    emit('confirm', fullLoop);
    loopBody.value = '';
}

function handleCancel() {
    emit('cancel');
    loopBody.value = '';
}

// Get appropriate icon for variable (matching BlockLibrary logic)
function getVariableIcon(title) {
    const titleLower = title.toLowerCase();

    // Route/Survey icons
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

    // Point/Note icons
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

    // User/Company icons
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

    // Date/Time icons
    if (titleLower.includes('date') || titleLower.includes('time')) {
        if (titleLower.includes('time') && !titleLower.includes('date')) return 'bi-clock';
        if (titleLower.includes('date') && !titleLower.includes('time')) return 'bi-calendar';
        return 'bi-calendar-event';
    }

    // Formatting/Layout icons
    if (titleLower.includes('new line') || titleLower.includes('line break')) return 'bi-arrow-down';
    if (titleLower.includes('horizontal') || titleLower.includes('divider')) return 'bi-hr';
    if (titleLower.includes('page break')) return 'bi-file-break';
    if (titleLower.includes('row') || titleLower.includes('column')) return 'bi-grid';
    if (titleLower.includes('header')) return 'bi-layout-top';
    if (titleLower.includes('footer')) return 'bi-layout-bottom';
    if (titleLower.includes('cover')) return 'bi-file-earmark-text';
    if (titleLower.includes('page number')) return 'bi-123';

    // Screenshot icons
    if (titleLower.includes('screenshot')) {
        if (titleLower.includes('image') || titleLower.includes('url')) return 'bi-image';
        if (titleLower.includes('note')) return 'bi-sticky';
        if (titleLower.includes('type')) return 'bi-tag';
        return 'bi-camera';
    }

    // Default icon
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
}

.loop-body-editor-modal {
    background: var(--bg-surface);
    border-radius: 8px;
    box-shadow: var(--shadow-lg);
    width: 90%;
    max-width: 1200px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    height: 90vh;
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

.loop-editor-layout {
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

/* Tabs styling - matching BlockLibrary */
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

.loop-editor-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.editor-label {
    margin-bottom: var(--spacing-xs);
    font-weight: 500;
    color: var(--text-primary);
    font-size: 0.875rem;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    border-top: 1px solid var(--border);
}
</style>
