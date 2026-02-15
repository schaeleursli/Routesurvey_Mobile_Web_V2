<template>
    <div class="block-library">
        <!-- Tabs -->
        <div class="library-tabs">
            <button v-for="tab in tabs" :key="tab.id" class="tab-button" :class="{ 'active': activeTab === tab.id }"
                @click="activeTab = tab.id">
                <i class="bi" :class="tab.icon"></i>
                <span>{{ tab.label }}</span>
            </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
            <!-- Text & Formatting -->
            <!-- Text & Formatting -->
            <div v-show="activeTab === 'text'" class="group-blocks">
                <div class="library-block" draggable="true"
                    @dragstart="handleDragStart($event, 'heading', { level: 1 })"
                    @dblclick="handleDoubleClick('heading', { level: 1 })">
                    <i class="bi bi-type-h1"></i>
                    <span>Heading 1</span>
                </div>
                <div class="library-block" draggable="true"
                    @dragstart="handleDragStart($event, 'heading', { level: 2 })"
                    @dblclick="handleDoubleClick('heading', { level: 2 })">
                    <i class="bi bi-type-h2"></i>
                    <span>Heading 2</span>
                </div>
                <div class="library-block" draggable="true"
                    @dragstart="handleDragStart($event, 'heading', { level: 3 })"
                    @dblclick="handleDoubleClick('heading', { level: 3 })">
                    <i class="bi bi-type-h3"></i>
                    <span>Heading 3</span>
                </div>
                <div class="library-block" draggable="true" @dragstart="handleDragStart($event, 'text')"
                    @dblclick="handleDoubleClick('text')">
                    <i class="bi bi-text-paragraph"></i>
                    <span>Text Block</span>
                </div>
                <div class="library-block" draggable="true" @dragstart="handleDragStart($event, 'divider')"
                    @dblclick="handleDoubleClick('divider')">
                    <i class="bi bi-hr"></i>
                    <span>Divider</span>
                </div>
                <div class="library-block" draggable="true" @dragstart="handleDragStart($event, 'page_break')"
                    @dblclick="handleDoubleClick('page_break')">
                    <i class="bi bi-file-break"></i>
                    <span>Page Break</span>
                </div>
            </div>

            <!-- Route & Survey Data -->
            <div v-show="activeTab === 'route'" class="group-blocks">
                <div v-for="variable in routeVariables" :key="variable.title" class="library-block" draggable="true"
                    @dragstart="handleDragStartVariable($event, variable.value, variable.title)"
                    @dblclick="handleDoubleClickVariable(variable.value, variable.title)">
                    <i class="bi" :class="getVariableIcon(variable.title)"></i>
                    <span>{{ variable.title }}</span>
                </div>
            </div>

            <!-- Planned Route Data -->
            <div v-show="activeTab === 'route-data'" class="group-blocks">
                <div v-for="variable in plannedRouteVariables" :key="variable.title" class="library-block"
                    draggable="true" @dragstart="handleDragStartVariable($event, variable.value, variable.title)"
                    @dblclick="handleDoubleClickVariable(variable.value, variable.title)">
                    <i class="bi" :class="getVariableIcon(variable.title)"></i>
                    <span>{{ variable.title }}</span>
                </div>
            </div>

            <!-- Loops -->
            <div v-show="activeTab === 'loops'" class="group-blocks">
                <div v-for="variable in loopVariables" :key="variable.title" class="library-block" draggable="true"
                    @dragstart="handleDragStartVariable($event, variable.value, variable.title)"
                    @dblclick="handleDoubleClickVariable(variable.value, variable.title)">
                    <i class="bi" :class="getVariableIcon(variable.title)"></i>
                    <span>{{ variable.title }}</span>
                </div>
            </div>

            <!-- User & Company Data -->
            <div v-show="activeTab === 'user'" class="group-blocks">
                <div v-for="variable in userVariables" :key="variable.title" class="library-block" draggable="true"
                    @dragstart="handleDragStartVariable($event, variable.value, variable.title)"
                    @dblclick="handleDoubleClickVariable(variable.value, variable.title)">
                    <i class="bi" :class="getVariableIcon(variable.title)"></i>
                    <span>{{ variable.title }}</span>
                </div>
            </div>

            <!-- Date & Time -->
            <div v-show="activeTab === 'date'" class="group-blocks">
                <div v-for="variable in dateVariables" :key="variable.title" class="library-block" draggable="true"
                    @dragstart="handleDragStartVariable($event, variable.value, variable.title)"
                    @dblclick="handleDoubleClickVariable(variable.value, variable.title)">
                    <i class="bi" :class="getVariableIcon(variable.title)"></i>
                    <span>{{ variable.title }}</span>
                </div>
            </div>

            <!-- Formatting & Layout -->
            <div v-show="activeTab === 'formatting'" class="group-blocks">
                <div v-for="variable in formattingVariables" :key="variable.title" class="library-block"
                    draggable="true" @dragstart="handleDragStartVariable($event, variable.value, variable.title)"
                    @dblclick="handleDoubleClickVariable(variable.value, variable.title)">
                    <i class="bi" :class="getVariableIcon(variable.title)"></i>
                    <span>{{ variable.title }}</span>
                </div>
            </div>

            <!-- Tables -->
            <div v-show="activeTab === 'tables'" class="group-blocks">
                <div class="library-block" draggable="true"
                    @dragstart="handleDragStart($event, 'table', { type: 'obstructions' })"
                    @dblclick="handleDoubleClick('table', { type: 'obstructions' })">
                    <i class="bi bi-table"></i>
                    <span>Obstructions Table</span>
                </div>
                <div class="library-block" draggable="true"
                    @dragstart="handleDragStart($event, 'table', { type: 'clearance' })"
                    @dblclick="handleDoubleClick('table', { type: 'clearance' })">
                    <i class="bi bi-table"></i>
                    <span>Clearance Table</span>
                </div>
                <div class="library-block" draggable="true"
                    @dragstart="handleDragStart($event, 'table', { type: 'notes' })"
                    @dblclick="handleDoubleClick('table', { type: 'notes' })">
                    <i class="bi bi-table"></i>
                    <span>Notes Table</span>
                </div>
            </div>

            <!-- Auto Elements -->
            <div v-show="activeTab === 'auto'" class="group-blocks">
                <div class="library-block" draggable="true" @dragstart="handleDragStart($event, 'toc')"
                    @dblclick="handleDoubleClick('toc')">
                    <i class="bi bi-list-ul"></i>
                    <span>Table of Contents</span>
                </div>
                <div class="library-block" draggable="true"
                    @dragstart="handleDragStart($event, 'data_block', { dataType: 'photos' })"
                    @dblclick="handleDoubleClick('data_block', { dataType: 'photos' })">
                    <i class="bi bi-images"></i>
                    <span>Photos</span>
                </div>
                <!-- <div class="library-block" draggable="true"
                    @dragstart="handleDragStart($event, 'data_block', { dataType: 'elevation_profile' })"
                    @dblclick="handleDoubleClick('data_block', { dataType: 'elevation_profile' })">
                    <i class="bi bi-graph-up"></i>
                    <span>Elevation Profile</span>
                </div> -->
            </div>

            <!-- Media -->
            <div v-show="activeTab === 'media'" class="group-blocks">
                <div class="library-block" draggable="true" @dragstart="handleDragStart($event, 'image')"
                    @dblclick="handleDoubleClick('image')">
                    <i class="bi bi-image"></i>
                    <span>Image</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { DATA_BLOCK_TYPES } from '@/composables/useReportBuilder';
import { useReportEditor } from '@/composables/useReportEditor';

const emit = defineEmits(['insert-block', 'edit-loop']);

// Get all variables from useReportEditor
const {
    routeVariables,
    plannedRouteVariables,
    loopVariables,
    userVariables,
    dateVariables,
    formattingVariables,
} = useReportEditor();

// Tab management
const activeTab = ref('route');

const tabs = [
    { id: 'text', label: 'Text', icon: 'bi-type' },
    { id: 'route', label: 'Route', icon: 'bi-signpost' },
    { id: 'route-data', label: 'Route Data', icon: 'bi-map' },
    { id: 'loops', label: 'Loops', icon: 'bi-arrow-repeat' },
    { id: 'user', label: 'User', icon: 'bi-person' },
    { id: 'date', label: 'Date', icon: 'bi-calendar' },
    { id: 'formatting', label: 'Format', icon: 'bi-layout-text-window' },
    { id: 'tables', label: 'Tables', icon: 'bi-table' },
    { id: 'auto', label: 'Auto', icon: 'bi-magic' },
    { id: 'media', label: 'Media', icon: 'bi-image' },
];

function handleDragStart(event, blockType, config = {}) {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('block-type', blockType);
    event.dataTransfer.setData('block-config', JSON.stringify(config));
}

function handleDoubleClick(blockType, config = {}) {
    emit('insert-block', blockType, config);
}

// Check if variable is a loop block
function isLoopBlock(variableTitle, variableValue) {
    const titleLower = (variableTitle || '').toLowerCase();
    return titleLower.includes('start point loop') ||
        titleLower.includes('start note loop') ||
        titleLower.includes('start map screenshot loop') ||
        (variableValue && (variableValue.includes('@beginforpoint') || variableValue.includes('@beginfornote') || variableValue.includes('@beginformapscreenshot')));
}

// Check if variable is a row block
function isRowBlock(variableTitle, variableValue) {
    const titleLower = (variableTitle || '').toLowerCase();
    return titleLower.includes('start row') ||
        (variableValue && variableValue.includes('@beginrow'));
}

// Handle variable blocks (MASL expressions)
function handleDragStartVariable(event, variableValue, variableTitle) {
    // Check if this is a loop block
    if (isLoopBlock(variableTitle, variableValue)) {
        // Store loop info for drop handler
        event.dataTransfer.effectAllowed = 'copy';
        event.dataTransfer.setData('block-type', 'loop');
        event.dataTransfer.setData('block-config', JSON.stringify({
            value: variableValue,
            title: variableTitle
        }));
    } else if (isRowBlock(variableTitle, variableValue)) {
        // Store row info for drop handler
        event.dataTransfer.effectAllowed = 'copy';
        event.dataTransfer.setData('block-type', 'row');
        event.dataTransfer.setData('block-config', JSON.stringify({
            value: variableValue,
            title: variableTitle
        }));
    } else {
        event.dataTransfer.effectAllowed = 'copy';
        event.dataTransfer.setData('block-type', 'variable');
        event.dataTransfer.setData('block-config', JSON.stringify({ value: variableValue }));
    }
}

function handleDoubleClickVariable(variableValue, variableTitle) {
    // Check if this is a loop block
    if (isLoopBlock(variableTitle, variableValue)) {
        // Determine loop type
        const titleLower = (variableTitle || '').toLowerCase();
        let loopType = 'point';
        if (titleLower.includes('note loop')) {
            loopType = 'note';
        } else if (titleLower.includes('screenshot loop')) {
            loopType = 'screenshot';
        }
        emit('edit-loop', loopType, variableTitle || '');
    } else if (isRowBlock(variableTitle, variableValue)) {
        // Emit event to open row editor
        emit('edit-row', variableTitle || '');
    } else {
        emit('insert-block', 'variable', { value: variableValue });
    }
}

// Get appropriate icon for variable based on title
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

    // Default icon
    return 'bi-code-square';
}
</script>

<style scoped>
.block-library {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.library-tabs {
    display: flex;
    flex-wrap: nowrap;
    gap: 16px;
    margin-bottom: 16px;
    border-bottom: 1.5px solid var(--border);
    overflow: auto hidden;
    scrollbar-width: thin;
    scrollbar-color: var(--text-secondary) transparent;
    -webkit-overflow-scrolling: touch;
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
    gap: 8px;
    padding: 8px 16px;
    background: none;
    border: none;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    cursor: pointer;
    transition: all var(--transition-normal);
    font-size: 14px;
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
    font-size: 1em;
}

.tab-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.group-blocks {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
    flex: 1;
    overflow: hidden auto;
    padding: var(--spacing-xs);
    align-content: start;
}

.library-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-md);
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    cursor: grab;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    user-select: none;
    text-align: center;
    aspect-ratio: 1; /* Make them square-ish */
    box-shadow: var(--shadow-sm);
}

.library-block:hover {
    background: var(--bg-elevated);
    border-color: var(--accent);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.library-block:active {
    cursor: grabbing;
    transform: translateY(0);
    box-shadow: var(--shadow-sm);
}

.library-block i {
    font-size: 24px; /* Larger icons */
    color: var(--accent);
    margin-bottom: 4px;
    width: auto;
}

.library-block span {
    font-size: 11px;
    color: var(--text-secondary);
    font-weight: 500;
    line-height: 1.2;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.library-block:hover span {
    color: var(--text-primary);
}
</style>
