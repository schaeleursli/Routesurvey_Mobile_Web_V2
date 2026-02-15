<template>
    <teleport to="body">
        <div v-if="visible" class="tips-modal-backdrop" @click.self="close">
            <BaseCard class="tips-modal">
                <template #header>
                    <div class="tips-modal-header">
                        <h3>
                            <i class="bi bi-lightbulb"></i>
                            {{ content.title }}
                        </h3>
                        <BaseButton size="small" variant="ghost" @click="close">
                            <i class="bi bi-x-lg"></i>
                        </BaseButton>
                    </div>
                </template>

                <div class="tips-content">
                    <!-- Editing Controls Section -->
                    <div v-if="content.editingControls.length > 0" class="tips-section">
                        <h4 class="tips-section-title">
                            <i class="bi bi-sliders"></i>
                            Editing Controls
                        </h4>
                        <div class="tips-list">
                            <div v-for="(control, index) in content.editingControls" :key="index" class="tip-item">
                                <i :class="'bi ' + control.icon"></i>
                                <div class="tip-content">
                                    <strong>{{ control.title }}:</strong> {{ control.description }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Keyboard Shortcuts Section -->
                    <div v-if="content.shortcuts.length > 0" class="tips-section">
                        <h4 class="tips-section-title">
                            <i class="bi bi-keyboard"></i>
                            Keyboard Shortcuts
                        </h4>
                        <div class="shortcuts-list">
                            <div v-for="(shortcut, index) in content.shortcuts" :key="index" class="shortcut-item">
                                <template v-for="(key, keyIndex) in shortcut.keys" :key="keyIndex">
                                    <kbd v-if="key === 'Ctrl'" class="shortcut-key">
                                        <span v-if="isMac">⌘</span>
                                        <span v-else>Ctrl</span>
                                    </kbd>
                                    <kbd v-else class="shortcut-key">{{ key }}</kbd>
                                    <span v-if="keyIndex < shortcut.keys.length - 1" class="shortcut-separator">
                                        {{ shortcut.keys.length > 2 && keyIndex === 0 ? '+' : (keyIndex === 0 &&
                                            shortcut.keys.length === 2 ? '+' : 'or') }}
                                    </span>
                                </template>
                                <span class="shortcut-description">{{ shortcut.description }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Snapping Behavior Section -->
                    <div v-if="content.snappingBehavior.length > 0" class="tips-section">
                        <h4 class="tips-section-title">
                            <i class="bi bi-magnet"></i>
                            Snapping Behavior
                        </h4>
                        <div class="tips-list">
                            <div v-for="(behavior, index) in content.snappingBehavior" :key="index" class="tip-item">
                                <i :class="'bi ' + behavior.icon"></i>
                                <div class="tip-content">
                                    <strong>{{ behavior.title }}:</strong> {{ behavior.description }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <template #footer>
                    <div class="tips-modal-footer">
                        <BaseButton variant="primary" @click="close">
                            Got it!
                        </BaseButton>
                    </div>
                </template>
            </BaseCard>
        </div>
    </teleport>
</template>

<script setup>
import { computed } from 'vue'
import { BaseCard, BaseButton } from '@/components/ui'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    context: {
        type: String,
        default: 'default',
        validator: (value) => ['planned-routes', 'route-viewer', 'default'].includes(value)
    }
})

const emit = defineEmits(['close'])

const close = () => {
    emit('close')
}

// Detect if user is on Mac
const isMac = computed(() => {
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0
})

// Content based on context
const content = computed(() => {
    if (props.context === 'planned-routes') {
        return {
            title: 'Planned Routes Tips & Tricks',
            editingControls: [
                {
                    icon: 'bi-cursor',
                    title: 'Add Waypoints',
                    description: 'Click anywhere on the map to add a waypoint. The route will automatically update.'
                },
                {
                    icon: 'bi-arrows-move',
                    title: 'Move Markers',
                    description: 'Drag start point, end point, or waypoint markers to reposition them.'
                },
                {
                    icon: 'bi-mouse',
                    title: 'Select Segments',
                    description: 'Right-click on a route segment to select it. Click "Snap to Route" to calculate the actual road path.'
                },
                {
                    icon: 'bi-arrow-counterclockwise',
                    title: 'Undo/Redo',
                    description: 'Use the undo and redo buttons in the bottom-left corner to revert or reapply changes.'
                },
                {
                    icon: 'bi-search',
                    title: 'Search Location',
                    description: 'Click the search icon to find and navigate to specific locations on the map.'
                },
                {
                    icon: 'bi-map',
                    title: 'Map Styles',
                    description: 'Switch between OSM (OpenStreetMap) and Satellite views using the style buttons in the top-right corner.'
                }
            ],
            shortcuts: [
                { keys: ['Delete', 'Backspace'], description: 'Delete selected waypoint' },
                { keys: ['Esc'], description: 'Clear selection and hide context menu' },
                { keys: ['Ctrl', 'Z'], description: 'Undo last action' },
                { keys: ['Ctrl', 'Y'], description: 'Redo last action' },
                { keys: ['Enter'], description: 'Search for location (when search field is active)' }
            ],
            snappingBehavior: [
                {
                    icon: 'bi-diagram-3',
                    title: 'Straight Line Segments',
                    description: 'By default, segments between waypoints are drawn as straight lines for quick route planning.'
                },
                {
                    icon: 'bi-signpost-2',
                    title: 'Snap to Route',
                    description: 'Select a segment and click "Snap to Route" to calculate the actual road path using OSRM routing. Snapped segments are highlighted in a different color.'
                },
                {
                    icon: 'bi-info-circle',
                    title: 'Segment Information',
                    description: 'Hover over or select a segment to see detailed information including distance, start/end points, and route type.'
                },
                {
                    icon: 'bi-arrow-right-circle',
                    title: 'Visual Indicators',
                    description: 'Snapped segments appear with a different color and style to distinguish them from straight-line segments.'
                }
            ]
        }
    } else if (props.context === 'route-viewer') {
        return {
            title: 'Route Viewer Tips & Tricks',
            editingControls: [
                {
                    icon: 'bi-pencil',
                    title: 'Edit Mode',
                    description: 'Toggle edit mode to modify route points, add obstacles, and update route information.'
                },
                {
                    icon: 'bi-cursor',
                    title: 'Add Points',
                    description: 'In edit mode, click on the map to add new route points or obstacles along your route.'
                },
                {
                    icon: 'bi-arrows-move',
                    title: 'Move Points',
                    description: 'Drag any route point or marker to reposition it. Changes are saved automatically.'
                },
                {
                    icon: 'bi-mouse',
                    title: 'Context Menu',
                    description: 'Right-click on segments to snap to route or insert route points. Right-click on markers to delete them.'
                },
                {
                    icon: 'bi-camera',
                    title: 'Screenshots',
                    description: 'Take screenshots of your route map for reports and documentation.'
                },
                {
                    icon: 'bi-arrow-counterclockwise',
                    title: 'Undo/Redo',
                    description: 'Use undo/redo buttons or keyboard shortcuts (Ctrl+Z / Ctrl+Y) to revert or reapply changes.'
                }
            ],
            shortcuts: [
                { keys: ['Ctrl', 'Z'], description: 'Undo last action' },
                { keys: ['Ctrl', 'Y'], description: 'Redo last action' },
                { keys: ['Esc'], description: 'Cancel current action or close modals' },
                { keys: ['Delete'], description: 'Delete selected point or marker' }
            ],
            snappingBehavior: [
                {
                    icon: 'bi-arrow-repeat',
                    title: 'Snap to Route',
                    description: 'Right-click on a segment and select "Snap to Route" to calculate the actual road path using OSRM routing.'
                },
                {
                    icon: 'bi-plus-circle',
                    title: 'Insert Route Points',
                    description: 'Right-click on a segment and select "Insert Route Point" to add a new point along the route.'
                },
                {
                    icon: 'bi-info-circle',
                    title: 'Route Information',
                    description: 'Click "Route Info" to view and edit detailed route information including title, description, and metadata.'
                }
            ]
        }
    } else {
        return {
            title: 'Tips & Tricks',
            editingControls: [
                {
                    icon: 'bi-lightbulb',
                    title: 'Navigation',
                    description: 'Use the sidebar to navigate between different sections of the application.'
                },
                {
                    icon: 'bi-search',
                    title: 'Search',
                    description: 'Use the search bar in the top navigation to quickly find routes, planned routes, and pages.'
                },
                {
                    icon: 'bi-bell',
                    title: 'Notifications',
                    description: 'Check the notifications icon for important updates and messages.'
                }
            ],
            shortcuts: [
                { keys: ['Esc'], description: 'Close modals or cancel actions' }
            ],
            snappingBehavior: []
        }
    }
})
</script>

<style scoped>
.tips-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 50%);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    backdrop-filter: blur(4px);
}

.tips-modal {
    max-width: 700px;
    width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
}

.tips-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.tips-modal-header h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.tips-modal-header h3 i {
    color: var(--accent);
}

.tips-content {
    overflow-y: auto;
    max-height: calc(90vh - 180px);
    padding: 0.5rem 0;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
}

.tips-content::-webkit-scrollbar {
    width: 6px;
}

.tips-content::-webkit-scrollbar-track {
    background: transparent;
}

.tips-content::-webkit-scrollbar-thumb {
    background-color: var(--border);
    border-radius: 3px;
}

.tips-content::-webkit-scrollbar-thumb:hover {
    background-color: var(--text-secondary);
}

.tips-section {
    margin-bottom: 2rem;
}

.tips-section:last-child {
    margin-bottom: 0;
}

.tips-section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid var(--border);
}

.tips-section-title i {
    color: var(--accent);
}

.tips-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.tip-item {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    padding: 0.75rem;
    background: var(--bg-elevated);
    border-radius: 8px;
    border: 1px solid var(--border);
    transition: all 0.2s ease;
}

.tip-item:hover {
    border-color: var(--accent);
    box-shadow: 0 2px 8px rgb(0 167 225 / 10%);
}

.tip-item i {
    color: var(--accent);
    font-size: 1.25rem;
    flex-shrink: 0;
    margin-top: 0.125rem;
}

.tip-content {
    flex: 1;
    color: var(--text-secondary);
    line-height: 1.6;
}

.tip-content strong {
    color: var(--text-primary);
    font-weight: 600;
    display: block;
    margin-bottom: 0.25rem;
}

.shortcuts-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.shortcut-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: var(--bg-elevated);
    border-radius: 8px;
    border: 1px solid var(--border);
    transition: all 0.2s ease;
    flex-wrap: wrap;
}

.shortcut-item:hover {
    border-color: var(--accent);
    box-shadow: 0 2px 8px rgb(0 167 225 / 10%);
}

.shortcut-key {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2rem;
    padding: 0.375rem 0.625rem;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    font-family: 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', monospace;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    box-shadow: 0 1px 2px rgb(0 0 0 / 10%);
}

.shortcut-separator {
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.shortcut-description {
    color: var(--text-secondary);
    font-size: 0.875rem;
    margin-left: auto;
    flex: 1;
    min-width: 200px;
}

.tips-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

/* Responsive adjustments */
@media (width <= 768px) {
    .tips-modal {
        max-width: 95vw;
        max-height: 95vh;
    }

    .tips-content {
        max-height: calc(95vh - 180px);
    }

    .shortcut-item {
        flex-direction: column;
        align-items: flex-start;
    }

    .shortcut-description {
        margin-left: 0;
        margin-top: 0.5rem;
        width: 100%;
    }

    .tips-modal-header h3 {
        font-size: 1.25rem;
    }
}
</style>
