<template>
    <div class="segment-selection-example">
        <h2>Selectable Route Segments Example</h2>

        <div class="instructions">
            <h3>How to use:</h3>
            <ul>
                <li><strong>Hover</strong> over any route segment to see segment information</li>
                <li><strong>Click</strong> on a segment to add a waypoint at that location</li>
                <li><strong>Right-click</strong> on a segment to select/highlight it (it will turn orange)</li>
                <li><strong>Right-click again</strong> on the same segment to deselect it</li>
                <li><strong>Snap to Route</strong> button (when segment is selected) - calculates OSRM route between
                    start and end points</li>
                <li><strong>Unsnap to Route</strong> button (when segment is selected) - connects start and end points
                    with a straight line</li>
                <li><strong>Press Escape</strong> or click outside to clear selection</li>
                <li><strong>Drag waypoints</strong> to see how segments update dynamically</li>
            </ul>
        </div>

        <!-- Using the refactored component with selectable segments -->
        <div class="map-section">
            <h3>Interactive Route Map with Selectable Segments</h3>
            <PlannedRouteMapRefactored v-model="routeData" height="500px" />
        </div>

        <!-- Segment Information Panel -->
        <div class="segment-panel" v-if="selectedSegment || hoveredSegment">
            <h3>Segment Information</h3>
            <div class="segment-details">
                <div class="segment-status">
                    <span class="status-badge"
                        :class="{ selected: selectedSegment, hovered: hoveredSegment && !selectedSegment }">
                        {{ selectedSegment ? 'SELECTED' : 'HOVERED' }}
                    </span>
                </div>

                <div class="segment-info">
                    <div class="info-row">
                        <strong>Segment:</strong> {{ (selectedSegment || hoveredSegment).index + 1 }}
                    </div>
                    <div class="info-row">
                        <strong>From:</strong>
                        {{ getPointLabel((selectedSegment || hoveredSegment).startPoint) }}
                    </div>
                    <div class="info-row">
                        <strong>To:</strong>
                        {{ getPointLabel((selectedSegment || hoveredSegment).endPoint) }}
                    </div>
                    <div class="info-row">
                        <strong>Distance:</strong>
                        {{ formatDistance((selectedSegment || hoveredSegment).distance) }}
                    </div>
                    <div class="info-row">
                        <strong>Coordinates:</strong>
                        {{ (selectedSegment || hoveredSegment).coordinates.length }} points
                    </div>
                </div>

                <div class="segment-actions" v-if="selectedSegment">
                    <button @click="clearSegmentSelection" class="action-btn">
                        <i class="bi bi-x-circle"></i> Clear Selection
                    </button>
                </div>
            </div>
        </div>

        <!-- Controls -->
        <div class="controls-section">
            <h3>Controls</h3>
            <div class="control-buttons">
                <button @click="addSampleRoute" class="control-btn">
                    <i class="bi bi-plus-circle"></i> Add Sample Route
                </button>
                <button @click="clearRoute" class="control-btn">
                    <i class="bi bi-trash"></i> Clear Route
                </button>
                <button @click="clearSegmentSelection" class="control-btn" :disabled="!selectedSegment">
                    <i class="bi bi-x-circle"></i> Clear Segment Selection
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import PlannedRouteMapRefactored from '../PlannedRouteMapRefactored.vue';
import { formatDistance } from '../utils/calculations.js';

// Route data for the component
const routeData = ref({
    startPoint: null,
    endPoint: null,
    waypoints: [],
    routePath: [],
    routeInfo: null
});

// Sample route data with multiple waypoints to demonstrate segments
const addSampleRoute = () => {
    routeData.value = {
        startPoint: {
            lat: 30.0444,
            lng: 31.2357,
            address: {
                display_name: 'Cairo, Egypt'
            }
        },
        endPoint: {
            lat: 30.0330,
            lng: 31.2334,
            address: {
                display_name: 'Giza, Egypt'
            }
        },
        waypoints: [
            {
                lat: 30.0380,
                lng: 31.2300,
                address: {
                    display_name: 'Waypoint 1'
                }
            },
            {
                lat: 30.0350,
                lng: 31.2320,
                address: {
                    display_name: 'Waypoint 2'
                }
            },
            {
                lat: 30.0300,
                lng: 31.2340,
                address: {
                    display_name: 'Waypoint 3'
                }
            }
        ],
        routePath: [],
        routeInfo: null
    };
};

const clearRoute = () => {
    routeData.value = {
        startPoint: null,
        endPoint: null,
        waypoints: [],
        routePath: [],
        routeInfo: null
    };
};

// Mock segment data for demonstration (in real usage, this would come from the map component)
const selectedSegment = ref(null);
const hoveredSegment = ref(null);

const clearSegmentSelection = () => {
    selectedSegment.value = null;
    hoveredSegment.value = null;
};

const getPointLabel = (point) => {
    switch (point.type) {
        case 'start':
            return 'Start Point';
        case 'end':
            return 'End Point';
        case 'waypoint':
            return `Waypoint ${point.index}`;
        default:
            return 'Unknown Point';
    }
};
</script>

<style scoped>
.segment-selection-example {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.instructions {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    border-left: 4px solid var(--accent);
}

.instructions h3 {
    margin-top: 0;
    color: var(--accent);
}

.instructions ul {
    margin: 10px 0;
    padding-left: 20px;
}

.instructions li {
    margin: 5px 0;
    line-height: 1.5;
}

.map-section {
    margin-bottom: 30px;
}

.segment-panel {
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
}

.segment-panel h3 {
    margin-top: 0;
    color: #333;
    border-bottom: 2px solid var(--accent);
    padding-bottom: 10px;
}

.segment-status {
    margin-bottom: 15px;
}

.status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-badge.selected {
    background: #ff6b35;
    color: white;
}

.status-badge.hovered {
    background: #4ecdc4;
    color: white;
}

.segment-info {
    margin-bottom: 15px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
}

.info-row:last-child {
    border-bottom: none;
}

.info-row strong {
    color: #333;
    min-width: 100px;
}

.segment-actions {
    display: flex;
    gap: 10px;
}

.action-btn {
    padding: 8px 16px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
    transition: background 0.2s;
}

.action-btn:hover {
    background: #0056b3;
}

.action-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.controls-section {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #ddd;
}

.controls-section h3 {
    margin-top: 0;
    color: #333;
}

.control-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.control-btn {
    padding: 10px 16px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
    transition: all 0.2s;
}

.control-btn:hover {
    background: #f0f0f0;
    border-color: var(--accent);
}

.control-btn:disabled {
    background: #f5f5f5;
    color: #999;
    cursor: not-allowed;
}

h2,
h3 {
    color: #333;
    margin-bottom: 15px;
}
</style>