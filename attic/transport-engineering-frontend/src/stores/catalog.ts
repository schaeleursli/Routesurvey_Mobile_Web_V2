/**
 * Catalog Store - Equipment library management
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/api/client'
import type { CatalogItem } from '@/types/catalog'
import { useAppStore } from './app'

export const useCatalogStore = defineStore('catalog', () => {
    const appStore = useAppStore()

    // State
    const items = ref<CatalogItem[]>([])
    const selectedItem = ref<CatalogItem | null>(null)
    const loading = ref(false)

    // Filters
    const categoryFilter = ref<string>('')
    const searchQuery = ref('')
    const publishedOnlyFilter = ref(false)

    // Computed
    const filteredItems = computed(() => {
        let result = items.value

        if (categoryFilter.value) {
            result = result.filter(item => item.category === categoryFilter.value)
        }

        if (publishedOnlyFilter.value) {
            result = result.filter(item => item.published)
        }

        if (searchQuery.value) {
            const query = searchQuery.value.toLowerCase()
            result = result.filter(item =>
                item.name.toLowerCase().includes(query) ||
                item.manufacturer?.toLowerCase().includes(query) ||
                item.model?.toLowerCase().includes(query)
            )
        }

        return result
    })

    const categories = computed(() => {
        const cats = new Set(items.value.map(item => item.category))
        return Array.from(cats).sort()
    })

    // Actions
    async function fetchItems() {
        loading.value = true
        try {
            items.value = await api.getCatalogItems({
                category: categoryFilter.value || undefined,
                published_only: publishedOnlyFilter.value || undefined,
            })
        } catch (error) {
            appStore.setError(error instanceof Error ? error.message : 'Failed to load catalog')
        } finally {
            loading.value = false
        }
    }

    async function selectItem(itemId: string) {
        if (selectedItem.value?.id === itemId) return

        loading.value = true
        try {
            selectedItem.value = await api.getCatalogItem(itemId)
        } catch (error) {
            appStore.setError(error instanceof Error ? error.message : 'Failed to load item')
        } finally {
            loading.value = false
        }
    }

    function clearSelection() {
        selectedItem.value = null
    }

    function setFilters(filters: {
        category?: string
        published_only?: boolean
        search?: string
    }) {
        if (filters.category !== undefined) categoryFilter.value = filters.category
        if (filters.published_only !== undefined) publishedOnlyFilter.value = filters.published_only
        if (filters.search !== undefined) searchQuery.value = filters.search
    }

    function resetFilters() {
        categoryFilter.value = ''
        searchQuery.value = ''
        publishedOnlyFilter.value = false
    }

    return {
        // State
        items,
        selectedItem,
        loading,
        // Filters
        categoryFilter,
        searchQuery,
        publishedOnlyFilter,
        // Computed
        filteredItems,
        categories,
        // Actions
        fetchItems,
        selectItem,
        clearSelection,
        setFilters,
        resetFilters,
    }
})
