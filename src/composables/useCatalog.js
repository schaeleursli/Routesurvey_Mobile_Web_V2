/**
 * useCatalog Composable
 * 
 * Provides reactive catalog state and operations for equipment selection.
 * Manages loading, filtering, and searching catalog items.
 */

import { ref, computed } from 'vue';
import {
    getCatalogItems,
    getCatalogItemsByCategory,
    getCatalogItemById,
    searchCatalog,
    getTractors,
    getModules,
    getSPMTs,
    getAssemblyPresets
} from '@/services/catalogService';

export function useCatalog() {
    // Reactive state
    const tractors = ref([]);
    const modules = ref([]);
    const spmts = ref([]);
    const presets = ref([]);
    const allItems = ref([]);

    const loading = ref(false);
    const error = ref(null);

    // Computed - Group by region
    const tractorsByRegion = computed(() => {
        const grouped = { US: [], EU: [], Global: [] };
        tractors.value.forEach(item => {
            const region = item.tags?.region || 'Global';
            if (grouped[region]) {
                grouped[region].push(item);
            }
        });
        return grouped;
    });

    const modulesByRegion = computed(() => {
        const grouped = { US: [], EU: [], Global: [] };
        modules.value.forEach(item => {
            const region = item.tags?.region || 'Global';
            if (grouped[region]) {
                grouped[region].push(item);
            }
        });
        return grouped;
    });

    // Computed - Group modules by type
    const modulesByType = computed(() => {
        const grouped = {};
        modules.value.forEach(item => {
            const kind = item.spec?.kind || 'other';
            if (!grouped[kind]) {
                grouped[kind] = [];
            }
            grouped[kind].push(item);
        });
        return grouped;
    });

    // Computed - Assembly presets by region
    const presetsByRegion = computed(() => {
        const grouped = { US: [], EU: [], Global: [] };
        presets.value.forEach(item => {
            const region = item.tags?.region || 'Global';
            if (grouped[region]) {
                grouped[region].push(item);
            }
        });
        return grouped;
    });

    /**
     * Load all catalog items across all categories
     */
    const loadAll = async () => {
        loading.value = true;
        error.value = null;

        try {
            const [tractorsData, modulesData, spmtsData, presetsData] = await Promise.all([
                getTractors(),
                getModules(),
                getSPMTs(),
                getAssemblyPresets()
            ]);

            tractors.value = tractorsData;
            modules.value = modulesData;
            spmts.value = spmtsData;
            presets.value = presetsData;
            allItems.value = [...tractorsData, ...modulesData, ...spmtsData, ...presetsData];

            return { tractors: tractorsData, modules: modulesData, spmts: spmtsData, presets: presetsData };
        } catch (err) {
            error.value = err.message || 'Failed to load catalog';
            console.error('Catalog load error:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Load items by specific category
     */
    const loadByCategory = async (category) => {
        loading.value = true;
        error.value = null;

        try {
            const data = await getCatalogItemsByCategory(category);

            switch (category) {
                case 'tractor':
                    tractors.value = data;
                    break;
                case 'module':
                    modules.value = data;
                    break;
                case 'spmt':
                    spmts.value = data;
                    break;
                case 'assembly_preset':
                    presets.value = data;
                    break;
            }

            return data;
        } catch (err) {
            error.value = err.message || `Failed to load ${category}`;
            console.error(`Category load error (${category}):`, err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Search catalog items by term
     */
    const searchItems = async (term) => {
        if (!term || term.trim().length < 2) {
            return allItems.value;
        }

        loading.value = true;
        error.value = null;

        try {
            const results = await searchCatalog(term);
            return results;
        } catch (err) {
            error.value = err.message || 'Search failed';
            console.error('Search error:', err);
            return [];
        } finally {
            loading.value = false;
        }
    };

    /**
     * Get single catalog item by ID
     */
    const getItemById = async (id) => {
        loading.value = true;
        error.value = null;

        try {
            const item = await getCatalogItemById(id);
            return item;
        } catch (err) {
            error.value = err.message || 'Item not found';
            console.error('Item fetch error:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Find item by name (exact match)
     */
    const findByName = (name) => {
        return allItems.value.find(item => item.name === name);
    };

    /**
     * Filter items by region
     */
    const filterByRegion = (items, region) => {
        if (!region || region === 'all') return items;
        return items.filter(item => item.tags?.region === region);
    };

    /**
     * Clear error state
     */
    const clearError = () => {
        error.value = null;
    };

    /**
     * Reset all catalog data
     */
    const reset = () => {
        tractors.value = [];
        modules.value = [];
        spmts.value = [];
        presets.value = [];
        allItems.value = [];
        error.value = null;
    };

    return {
        // State
        tractors,
        modules,
        spmts,
        presets,
        allItems,
        loading,
        error,

        // Computed
        tractorsByRegion,
        modulesByRegion,
        modulesByType,
        presetsByRegion,

        // Methods
        loadAll,
        loadByCategory,
        searchItems,
        getItemById,
        findByName,
        filterByRegion,
        clearError,
        reset
    };
}
