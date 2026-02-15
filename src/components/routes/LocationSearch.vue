<template>
    <div class="location-search">
        <div class="search-input-wrapper">
            <BaseFormField
                v-model="searchQuery"
                :label="label"
                :placeholder="placeholder"
                @input="handleInput"
                @keydown.enter.prevent="handleSearch"
            >
                <template #prefix>
                    <i class="bi bi-search"></i>
                </template>
                <template #suffix>
                    <button
                        v-if="searchQuery"
                        class="clear-button"
                        @click="clearSearch"
                        type="button"
                    >
                        <i class="bi bi-x-circle-fill"></i>
                    </button>
                    <button
                        v-if="!loading"
                        class="search-button"
                        @click="handleSearch"
                        type="button"
                        :disabled="!searchQuery"
                    >
                        <i class="bi bi-arrow-right-circle-fill"></i>
                    </button>
                    <div v-else class="loading-spinner">
                        <BaseLoadingIndicator size="small" inline />
                    </div>
                </template>
            </BaseFormField>
        </div>

        <!-- Search Results Dropdown -->
        <div v-if="showResults && results.length > 0" class="search-results" ref="resultsRef">
            <div
                v-for="(result, index) in results"
                :key="index"
                class="search-result-item"
                :class="{ 'selected': selectedIndex === index }"
                @click="selectResult(result)"
                @mouseenter="selectedIndex = index"
            >
                <i class="bi bi-geo-alt-fill result-icon"></i>
                <div class="result-content">
                    <div class="result-name">{{ result.display_name }}</div>
                    <div class="result-type">{{ formatResultType(result.type) }}</div>
                </div>
            </div>
        </div>

        <!-- No Results Message -->
        <div v-if="showResults && results.length === 0 && !loading && searchQuery" class="no-results">
            <i class="bi bi-exclamation-circle"></i>
            <span>{{ t('noResultsFound') || 'No results found' }}</span>
        </div>

        <!-- Recent Searches -->
        <div v-if="showRecentSearches && recentSearches.length > 0" class="recent-searches">
            <div class="recent-header">
                <span>{{ t('recentSearches') || 'Recent Searches' }}</span>
                <button @click="clearRecentSearches" class="clear-recent-button">
                    {{ t('clear') || 'Clear' }}
                </button>
            </div>
            <div
                v-for="(recent, index) in recentSearches"
                :key="index"
                class="recent-item"
                @click="selectRecentSearch(recent)"
            >
                <i class="bi bi-clock-history"></i>
                <span>{{ recent.display_name }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { BaseFormField, BaseLoadingIndicator } from '@/components/ui';

const props = defineProps({
    label: {
        type: String,
        default: ''
    },
    placeholder: {
        type: String,
        default: 'Search for a location...'
    },
    showRecentSearches: {
        type: Boolean,
        default: true
    },
    maxResults: {
        type: Number,
        default: 5
    }
});

const emit = defineEmits(['select', 'search']);

const { t } = useI18n();

const searchQuery = ref('');
const results = ref([]);
const loading = ref(false);
const showResults = ref(false);
const selectedIndex = ref(0);
const recentSearches = ref([]);
const resultsRef = ref(null);
const debounceTimer = ref(null);

// Load recent searches from localStorage
onMounted(() => {
    const stored = localStorage.getItem('recentLocationSearches');
    if (stored) {
        recentSearches.value = JSON.parse(stored);
    }

    // Add click outside listener
    document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
    if (debounceTimer.value) {
        clearTimeout(debounceTimer.value);
    }
});

const handleInput = () => {
    // Debounce search
    if (debounceTimer.value) {
        clearTimeout(debounceTimer.value);
    }

    debounceTimer.value = setTimeout(() => {
        if (searchQuery.value.length >= 3) {
            handleSearch();
        }
    }, 500);
};

const handleSearch = async () => {
    if (!searchQuery.value || searchQuery.value.length < 3) {
        return;
    }

    loading.value = true;
    showResults.value = false;

    try {
        // Search using OpenStreetMap Nominatim API
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?` +
            `format=json&q=${encodeURIComponent(searchQuery.value)}&limit=${props.maxResults}`
        );

        const data = await response.json();
        results.value = data.map(item => ({
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            display_name: item.display_name,
            type: item.type,
            class: item.class,
            address: item.address
        }));

        showResults.value = true;
        selectedIndex.value = 0;

        emit('search', results.value);
    } catch (error) {
        console.error('Location search error:', error);
        results.value = [];
    } finally {
        loading.value = false;
    }
};

const selectResult = (result) => {
    emit('select', result);
    
    // Add to recent searches
    addToRecentSearches(result);
    
    // Update search query with selected result
    searchQuery.value = result.display_name;
    showResults.value = false;
};

const selectRecentSearch = (recent) => {
    searchQuery.value = recent.display_name;
    emit('select', recent);
    showResults.value = false;
};

const addToRecentSearches = (result) => {
    // Remove if already exists
    recentSearches.value = recentSearches.value.filter(
        item => item.display_name !== result.display_name
    );
    
    // Add to beginning
    recentSearches.value.unshift(result);
    
    // Keep only last 5
    recentSearches.value = recentSearches.value.slice(0, 5);
    
    // Save to localStorage
    localStorage.setItem('recentLocationSearches', JSON.stringify(recentSearches.value));
};

const clearRecentSearches = () => {
    recentSearches.value = [];
    localStorage.removeItem('recentLocationSearches');
};

const clearSearch = () => {
    searchQuery.value = '';
    results.value = [];
    showResults.value = false;
};

const formatResultType = (type) => {
    if (!type) return '';
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
};

const handleClickOutside = (event) => {
    const searchContainer = event.target.closest('.location-search');
    if (!searchContainer) {
        showResults.value = false;
    }
};
</script>

<style scoped>
.location-search {
    position: relative;
}

.search-input-wrapper {
    position: relative;
}

.clear-button,
.search-button {
    background: none;
    border: none;
    padding: 0;
    margin-left: var(--spacing-xs);
    cursor: pointer;
    color: var(--text-secondary);
    transition: color var(--transition-fast);
    font-size: 1.2em;
}

.clear-button:hover {
    color: var(--error);
}

.search-button:hover:not(:disabled) {
    color: var(--accent);
}

.search-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.loading-spinner {
    margin-left: var(--spacing-xs);
}

.search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    margin-top: var(--spacing-xs);
    max-height: 300px;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
    z-index: 1000;
}

.search-result-item {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    cursor: pointer;
    transition: background-color var(--transition-fast);
    border-bottom: 1px solid var(--border);
}

.search-result-item:last-child {
    border-bottom: none;
}

.search-result-item:hover,
.search-result-item.selected {
    background-color: var(--bg-elevated);
}

.result-icon {
    color: var(--accent);
    margin-top: 2px;
    flex-shrink: 0;
}

.result-content {
    flex: 1;
    min-width: 0;
}

.result-name {
    font-size: var(--font-size-sm);
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.result-type {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    margin-top: 2px;
}

.no-results {
    padding: var(--spacing-md);
    text-align: center;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs);
}

.recent-searches {
    margin-top: var(--spacing-md);
    padding: var(--spacing-sm);
    background: var(--bg-elevated);
    border-radius: var(--radius-md);
}

.recent-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-sm);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--text-secondary);
}

.clear-recent-button {
    background: none;
    border: none;
    padding: 0;
    color: var(--accent);
    cursor: pointer;
    font-size: var(--font-size-xs);
    transition: opacity var(--transition-fast);
}

.clear-recent-button:hover {
    opacity: 0.7;
}

.recent-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: background-color var(--transition-fast);
    font-size: var(--font-size-sm);
}

.recent-item:hover {
    background-color: var(--bg-surface);
}

.recent-item i {
    color: var(--text-secondary);
    font-size: 0.9em;
}
</style>
