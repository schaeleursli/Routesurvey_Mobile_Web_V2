<template>
    <div class="route-map-example">
        <h2>Route Map Example</h2>

        <!-- Using the refactored component -->
        <div class="map-section">
            <h3>Full Component</h3>
            <PlannedRouteMapRefactored v-model="routeData" height="400px" />
        </div>

        <!-- Using individual composables -->
        <div class="controls-section">
            <h3>Custom Controls</h3>
            <div class="control-buttons">
                <button @click="setMapStyle('osm')" :class="{ active: mapStyle === 'osm' }">
                    OpenStreetMap
                </button>
                <button @click="setMapStyle('satellite')" :class="{ active: mapStyle === 'satellite' }">
                    Satellite
                </button>
                <button @click="clearRoute">
                    Clear Route
                </button>
                <button @click="addSampleRoute">
                    Add Sample Route
                </button>
            </div>

            <div class="route-info" v-if="routeInfo">
                <p><strong>Distance:</strong> {{ formatDistance(routeInfo.distance) }}</p>
                <p><strong>Time:</strong> {{ formatTime(routeInfo.duration) }}</p>
                <p><strong>Waypoints:</strong> {{ waypoints.length }}</p>
            </div>
        </div>

        <!-- Search example -->
        <div class="search-section">
            <h3>Custom Search</h3>
            <div class="search-container">
                <input v-model="searchQuery" @input="handleSearchInput" @keyup.enter="searchLocation"
                    placeholder="Search for a location..." class="search-input" />
                <button @click="searchLocation" :disabled="searching">
                    {{ searching ? 'Searching...' : 'Search' }}
                </button>
            </div>

            <div class="search-results" v-if="searchResults.length > 0 && showResults">
                <div v-for="result in searchResults" :key="result.place_id" @click="selectSearchResult(result)"
                    class="search-result">
                    <div class="result-name">{{ result.display_name }}</div>
                    <div class="result-type">{{ result.type }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import PlannedRouteMapRefactored from '../PlannedRouteMapRefactored.vue';

// Import composables
import {
    useMapState,
    useRouteState,
    useSearchState
} from '../composables';

// Import utilities
import { formatDistance, formatTime } from '../utils';

// Initialize composables
const {
    mapStyle,
    setMapStyle
} = useMapState();

const {
    startPoint,
    endPoint,
    waypoints,
    routePath,
    routeInfo,
    clearRoute
} = useRouteState();

const {
    searchQuery,
    searchResults,
    showResults,
    searching,
    searchLocation,
    handleSearchInput,
    selectSearchResult: selectSearchResultBase
} = useSearchState();

// Route data for the full component
const routeData = ref({
    startPoint: null,
    endPoint: null,
    waypoints: [],
    routePath: [],
    routeInfo: null
});

// Sample route data
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
                lat: 30.0280,
                lng: 31.2300,
                address: {
                    display_name: 'Sample Waypoint'
                }
            }
        ],
        routePath: [],
        routeInfo: null
    };
};

// Custom search result handler
const selectSearchResult = (result) => {
    const resultData = selectSearchResultBase(result);
    console.log('Selected location:', resultData);

    // You can add custom logic here, like automatically setting as start/end point
    if (!startPoint.value) {
        startPoint.value = {
            lat: resultData.lat,
            lng: resultData.lng,
            address: resultData.addressInfo
        };
    } else if (!endPoint.value) {
        endPoint.value = {
            lat: resultData.lat,
            lng: resultData.lng,
            address: resultData.addressInfo
        };
    }
};
</script>

<style scoped>
.route-map-example {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.map-section {
    margin-bottom: 30px;
}

.controls-section {
    margin-bottom: 30px;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
}

.control-buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.control-buttons button {
    padding: 8px 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
}

.control-buttons button:hover {
    background: #f0f0f0;
}

.control-buttons button.active {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
}

.route-info {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 4px;
}

.route-info p {
    margin: 5px 0;
}

.search-section {
    margin-bottom: 30px;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
}

.search-container {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
}

.search-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
}

.search-container button {
    padding: 8px 16px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.search-container button:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.search-results {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.search-result {
    padding: 10px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: background 0.2s;
}

.search-result:hover {
    background: #f8f9fa;
}

.search-result:last-child {
    border-bottom: none;
}

.result-name {
    font-weight: 500;
    margin-bottom: 2px;
}

.result-type {
    font-size: 12px;
    color: #666;
}

h2,
h3 {
    color: #333;
    margin-bottom: 15px;
}
</style>