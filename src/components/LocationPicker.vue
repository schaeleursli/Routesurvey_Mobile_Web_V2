<template>
  <div class="location-picker">
    <div class="search-container">
      <div class="search-input-group">
        <input v-model="searchQuery" @input="handleSearchInput" @keyup.enter="searchLocation" :placeholder="placeholder"
          class="search-input" type="text" />
        <button @click="searchLocation" class="search-btn" :disabled="searching">
          <PhMagnifyingGlass :size="18" />
        </button>
      </div>

      <!-- Search Results Dropdown -->
      <div v-if="searchResults.length > 0 && showResults" class="search-results">
        <div v-for="result in searchResults" :key="result.place_id" @click="selectSearchResult(result)"
          class="search-result-item">
          <div class="result-name" v-if="result">{{ result.display_name }}</div>
          <div class="result-type" v-if="result">{{ result.type }}</div>
        </div>
      </div>
    </div>

    <!-- Map Container -->
    <div class="map-container">
      <div ref="mapContainer" class="map"></div>
      <div class="map-controls">
        <button @click="getCurrentLocation" class="location-btn" title="Use Current Location">
          <PhMapPin :size="18" />
        </button>
        <button @click="clearLocation" class="clear-btn" title="Clear Location">
          <PhXCircle :size="18" />
        </button>
      </div>
    </div>

    <!-- Selected Location Display -->
    <div v-if="selectedLocation" class="selected-location">
      <div class="location-info">
        <strong>{{ t('selectedLocation') }}:</strong>
        <span>{{ selectedLocation.display_name }}</span>
      </div>
      <div class="coordinates">
        <a :href="`https://maps.google.com/?q=${selectedLocation.lat},${selectedLocation.lon}`" target="_blank"
          class="coordinates-link">
          <span>{{ t('latitude') }}: {{ selectedLocation.lat.toFixed(6) }}</span>
          <span>{{ t('longitude') }}: {{ selectedLocation.lon.toFixed(6) }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PhMagnifyingGlass, PhMapPin, PhXCircle } from '@phosphor-icons/vue';

const { t } = useI18n();

const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  },
  placeholder: {
    type: String,
    default: 'Search for a location...'
  },
  height: {
    type: String,
    default: '300px'
  }
});

const emit = defineEmits(['update:modelValue']);

// Reactive data
const mapContainer = ref(null);
const searchQuery = ref('');
const searchResults = ref([]);
const showResults = ref(false);
const searching = ref(false);
const selectedLocation = ref(null);
let map = null;
let marker = null;

// Initialize map
const initMap = () => {
  if (!mapContainer.value) return;

  // Create map instance
  map = L.map(mapContainer.value, {
    center: [51.505, -0.09], // Default to London
    zoom: 13,
    zoomControl: true
  });

  // Add OSM tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Handle map clicks
  map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    updateMarker(lat, lng);
    reverseGeocode(lat, lng);
  });
};

// Update marker position
const updateMarker = (lat, lng) => {
  try {
    if (marker) {
      map.removeLayer(marker);
    }
  } catch (error) {
    console.error('Error removing marker:', error);
  }

  marker = L.marker([lat, lng]).addTo(map);
  map.setView([lat, lng], 15);
};

// Search for locations using Nominatim API
const searchLocation = async () => {
  if (!searchQuery.value.trim()) return;

  searching.value = true;
  showResults.value = true;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.value)}&limit=5`
    );
    const data = await response.json();
    searchResults.value = data;
  } catch (error) {
    console.error('Error searching for location:', error);
    searchResults.value = [];
  } finally {
    searching.value = false;
  }
};

// Handle search input
const handleSearchInput = () => {
  if (searchQuery.value.trim()) {
    showResults.value = true;
  } else {
    showResults.value = false;
  }
};

// Select search result
const selectSearchResult = (result) => {
  selectedLocation.value = result;
  updateMarker(parseFloat(result.lat), parseFloat(result.lon));
  searchQuery.value = result.display_name;
  showResults.value = false;

  // Emit the selected location
  emit('update:modelValue', {
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
    display_name: result.display_name,
    address: result
  });
};

// Reverse geocoding
const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await response.json();

    selectedLocation.value = {
      lat: lat,
      lon: lng,
      display_name: data.display_name
    };

    searchQuery.value = data.display_name;

    // Emit the selected location
    emit('update:modelValue', {
      lat: lat,
      lng: lng,
      display_name: data.display_name,
      address: data
    });
  } catch (error) {
    console.error('Error reverse geocoding:', error);
  }
};

// Get current location
const getCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateMarker(latitude, longitude);
        reverseGeocode(latitude, longitude);
      },
      (error) => {
        console.error('Error getting current location:', error);
      }
    );
  }
};

// Clear location
const clearLocation = () => {
  if (marker) {
    map.removeLayer(marker);
    marker = null;
  }
  selectedLocation.value = null;
  searchQuery.value = '';
  showResults.value = false;
  emit('update:modelValue', null);
};

// Watch for external value changes
watch(() => props.modelValue, (newValue) => {
  // console.log('🔧 LocationPicker - newValue:', newValue);
  try {
    if (newValue && newValue.lat && newValue.lng) {
      updateMarker(newValue.lat, newValue.lng);
      selectedLocation.value = {
        lat: newValue.lat,
        lon: newValue.lng,
        display_name: newValue.display_name || ''
      };
      searchQuery.value = newValue.display_name || '';
    }
  } catch (error) {
    // console.error('Error updating location:', error);
  }
}, { immediate: true });

// Lifecycle hooks
onMounted(() => {
  nextTick(() => {
    initMap();
  });
});

onUnmounted(() => {
  if (map) {
    map.remove();
  }
});
</script>

<style scoped>
.location-picker {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.search-container {
  position: relative;
}

.search-input-group {
  display: flex;
  border: 1px solid var(--bs-border-color);
  border-radius: 8px;
  overflow: hidden;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  outline: none;
  font-size: 1rem;
  background: var(--bs-body-bg);
  color: var(--bs-body-color);
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-btn {
  padding: 0.75rem 1rem;
  background: var(--bs-primary);
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-btn:hover {
  background: var(--bs-primary-dark);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
}

.search-result-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid var(--bs-border-color);
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background: var(--bs-tertiary-bg);
}

.search-result-item:last-child {
  border-bottom: none;
}

.result-name {
  font-weight: 500;
  color: var(--bs-body-color);
  margin-bottom: 0.25rem;
}

.result-type {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.map-container {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--bs-border-color);
}

.map {
  height: v-bind(height);
  width: 100%;
}

.map-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 1000;
}

.location-btn,
.clear-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: white;
  color: var(--bs-body-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
  transition: all 0.2s;
}

.location-btn:hover,
.clear-btn:hover {
  background: var(--bs-primary);
  color: white;
}

.selected-location {
  background: var(--bs-tertiary-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 8px;
  padding: 1rem;
}

.location-info {
  margin-bottom: 0.5rem;
}

.location-info strong {
  color: var(--bs-body-color);
}

.coordinates {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.coordinates span {
  font-family: monospace;
}

.coordinates-link {
  color: var(--bs-primary);
  text-decoration: none;
  display: flex;
  gap: 1rem;
  transition: color 0.2s;
}

.coordinates-link:hover {
  color: var(--bs-primary-dark);
  text-decoration: underline;
}

/* Leaflet map styles */
:deep(.leaflet-container) {
  background: var(--bs-body-bg);
}

:deep(.leaflet-popup-content-wrapper) {
  background: var(--bs-body-bg);
  color: var(--bs-body-color);
}

:deep(.leaflet-popup-tip) {
  background: var(--bs-body-bg);
}
</style>