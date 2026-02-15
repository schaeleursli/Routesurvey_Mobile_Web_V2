/**
 * Equipment Catalog Service
 * 
 * Provides access to the equipment catalog via FastAPI backend.
 * Catalog includes tractors, trailers, modules, SPMTs, and assembly presets.
 */

// FastAPI backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002';
const CATALOG_ENDPOINT = `${API_BASE_URL}/api/v1/catalog/items`;

/**
 * Fetch all catalog items
 * @param {Object} filters - Optional filters {category, region, published}
 * @returns {Promise<Array>} Array of catalog items
 */
export async function getCatalogItems(filters = {}) {
    const params = new URLSearchParams();

    // Apply filters
    if (filters.category) {
        params.append('category', filters.category);
    }

    // Published filter (default to published items only)
    const publishedOnly = filters.published !== false;
    params.append('published_only', publishedOnly);

    const url = params.toString() ? `${CATALOG_ENDPOINT}?${params}` : CATALOG_ENDPOINT;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        let data = await response.json();

        // Filter by region if specified (client-side filter)
        if (filters.region) {
            data = data.filter(item =>
                item.tags?.region === filters.region ||
                item.tags?.source_tags?.includes(filters.region)
            );
        }

        return data;
    } catch (error) {
        console.error('Error fetching catalog items:', error);
        throw error;
    }
}

/**
 * Fetch catalog items by category
 * @param {string} category - Category to filter (e.g., 'tractor', 'module', 'spmt', 'assembly_preset')
 * @returns {Promise<Array>} Array of catalog items in that category
 */
export async function getCatalogItemsByCategory(category) {
    return getCatalogItems({ category });
}

/**
 * Fetch a single catalog item by ID
 * @param {string} id - Catalog item UUID
 * @returns {Promise<Object>} Catalog item
 */
export async function getCatalogItemById(id) {
    try {
        const response = await fetch(`${CATALOG_ENDPOINT}/${id}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Catalog item not found');
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching catalog item:', error);
        throw error;
    }
}

/**
 * Get all tractors (prime movers)
 * @returns {Promise<Array>} Array of tractor catalog items
 */
export async function getTractors() {
    return getCatalogItemsByCategory('tractor');
}

/**
 * Get all trailer modules
 * @returns {Promise<Array>} Array of module catalog items
 */
export async function getModules() {
    return getCatalogItemsByCategory('module');
}

/**
 * Get all SPMTs
 * @returns {Promise<Array>} Array of SPMT catalog items
 */
export async function getSPMTs() {
    return getCatalogItemsByCategory('spmt');
}

/**
 * Get all assembly presets
 * @returns {Promise<Array>} Array of assembly preset catalog items
 */
export async function getAssemblyPresets() {
    return getCatalogItemsByCategory('assembly_preset');
}

/**
 * Search catalog items by name
 * @param {string} searchTerm - Text to search for in item names
 * @returns {Promise<Array>} Array of matching catalog items
 */
export async function searchCatalog(searchTerm) {
    try {
        // Fetch all items and filter client-side
        // (Could be optimized with backend search endpoint)
        const allItems = await getCatalogItems({ published: true });
        const lowerSearch = searchTerm.toLowerCase();

        return allItems.filter(item =>
            item.name.toLowerCase().includes(lowerSearch) ||
            item.manufacturer?.toLowerCase().includes(lowerSearch) ||
            item.model?.toLowerCase().includes(lowerSearch)
        );
    } catch (error) {
        console.error('Error searching catalog:', error);
        throw error;
    }
}

export default {
    getCatalogItems,
    getCatalogItemsByCategory,
    getCatalogItemById,
    getTractors,
    getModules,
    getSPMTs,
    getAssemblyPresets,
    searchCatalog,
};
