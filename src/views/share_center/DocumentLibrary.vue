<template>
    <div class="document-library">
        <!-- Header / Toolbar -->
        <div class="library-toolbar">
            <div class="toolbar-left">
                <div class="search-wrapper">
                    <i class="bi bi-search search-icon"></i>
                    <input 
                        type="text" 
                        v-model="searchQuery" 
                        @input="handleSearchInput"
                        placeholder="Search documents by name, route, or client..."
                        class="search-input"
                    />
                </div>
            </div>
            <div class="toolbar-right">
                <BaseDropdown 
                    label="Filter by Status" 
                    :options="filterOptions" 
                    v-model="selectedFilter" 
                    class="filter-dropdown"
                />
            </div>
        </div>

        <!-- Documents List -->
        <div class="documents-container">
            <div v-if="loading" class="loading-state">
                <BaseLoadingIndicator message="Loading documents..." />
            </div>

            <div v-else-if="documents.length === 0" class="empty-state">
                <BaseEmptyState 
                    icon="bi bi-folder2-open" 
                    title="No Documents Found"
                    message="Generate a report from a route to see it appear here as a Document."
                    action-label="Go to Routes"
                    @action="navigateToRoutes"
                />
            </div>

            <div v-else class="documents-table">
                <div class="table-header">
                    <div class="col-name">Document Name</div>
                    <div class="col-version">Version</div>
                    <div class="col-updated">Last Updated</div>
                    <div class="col-status">Share Status</div>
                    <div class="col-action"></div>
                </div>

                <div 
                    v-for="doc in documents" 
                    :key="doc.id" 
                    class="table-row"
                    @click="$emit('select-document', doc)"
                >
                    <div class="col-name">
                        <div class="doc-icon">
                            <i class="bi bi-file-earmark-text-fill"></i>
                        </div>
                        <div class="doc-info">
                            <span class="doc-title">{{ doc.name }}</span>
                            <span class="doc-subtitle">{{ doc.routeTitle }}</span>
                        </div>
                    </div>
                    <div class="col-version">
                        <span class="version-badge" :class="getVersionClass(doc.latestVersion)">
                           {{ doc.latestVersion || 'Draft' }}
                        </span>
                    </div>
                    <div class="col-updated">
                        {{ formatDate(doc.updatedAt) }}
                    </div>
                    <div class="col-status">
                         <span class="status-indicator" :class="{ 'active': doc.isShared }">
                            <i :class="doc.isShared ? 'bi bi-check-circle-fill' : 'bi bi-dash-circle'"></i>
                            {{ doc.isShared ? 'Active' : 'Not Shared' }}
                        </span>
                    </div>
                    <div class="col-action">
                        <BaseButton 
                            variant="ghost" 
                            size="small" 
                            icon="bi bi-chevron-right"
                        />
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Pagination (if needed, reusing existing pattern) -->
        <div v-if="totalPages > 1" class="pagination-footer">
             <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">Previous</button>
            <span>{{ currentPage }} / {{ totalPages }}</span>
            <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">Next</button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import RoutesController from '@/controllers/routes/routes_controller'
import { BaseButton, BaseDropdown, BaseEmptyState, BaseLoadingIndicator } from '@/components/ui'

const router = useRouter()
const emit = defineEmits(['select-document'])

// State
const loading = ref(true)
const searchQuery = ref('')
const documents = ref([])
const selectedFilter = ref('all')
const currentPage = ref(1)
const totalPages = ref(1)
let searchTimeout = null

const filterOptions = [
    { label: 'All Documents', value: 'all' },
    { label: 'Shared', value: 'shared' },
    { label: 'Drafts', value: 'draft' }
]

// In a real backend, we'd have a specific endpoint.
// Here we fetch routes and assume they are documents.
const fetchDocuments = async (page = 1) => {
    loading.value = true
    try {
        // Reusing existing route fetch logic
        const res = await RoutesController.getCurrentUserRoutesPaginated(page, 10)
        
        if (res && res.result && Array.isArray(res.data)) {
            documents.value = res.data.map(route => transformRouteToDocument(route))
            
            // Handle Pagination
             if (res.pagination) {
                totalPages.value = res.pagination.TotalPages || 1
                currentPage.value = res.pagination.CurrentPage || page
            }
        } else {
            documents.value = []
        }
    } catch (error) {
        console.error("Error fetching documents:", error)
        documents.value = []
    } finally {
        loading.value = false
    }
}

const transformRouteToDocument = (route) => {
    // This is a transformation layer to adapt Routes to the Document Mental Model
    return {
        id: route.id,
        name: route.title || 'Untitled Document', // In future, Document Name could differ from Route Title
        routeTitle: route.title, 
        latestVersion: route.latestVersion || null,
        updatedAt: route.dateUpdated || route.dateAdded,
        isShared: Boolean(route.isShared),
    }
}

const handleSearchInput = () => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        // Implement search logic here (call API)
        console.log("Searching for:", searchQuery.value)
         // For prototype, we just reload the main list
         fetchDocuments(1) 
    }, 300)
}

const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        fetchDocuments(page)
    }
}

const navigateToRoutes = () => {
    router.push({ name: 'Routes' })
}

const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString(undefined, { 
        year: 'numeric', month: 'short', day: 'numeric' 
    })
}

const getVersionClass = (version) => {
    return 'version-default' // Add specific logic if needed
}

onMounted(() => {
    fetchDocuments()
})

onUnmounted(() => {
    if (searchTimeout) clearTimeout(searchTimeout)
})
</script>

<style scoped>
.document-library {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 1.5rem;
}

.library-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border);
}

.search-wrapper {
    position: relative;
    width: 300px;
}

.search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
}

.search-input {
    width: 100%;
    padding: 0.6rem 1rem 0.6rem 2.5rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: 0.95rem;
    transition: border-color 0.2s;
}

.search-input:focus {
    outline: none;
    border-color: var(--primary);
}

.documents-container {
    flex: 1;
    overflow-y: auto;
    min-height: 400px;
}

.documents-table {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--bg-surface);
    overflow: hidden;
}

.table-header {
    display: grid;
    grid-template-columns: 3fr 1fr 1.5fr 1.5fr 0.5fr;
    padding: 1rem 1.5rem;
    background: var(--bg-elevated);
    border-bottom: 1px solid var(--border);
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.table-row {
    display: grid;
    grid-template-columns: 3fr 1fr 1.5fr 1.5fr 0.5fr;
    padding: 1.25rem 1.5rem;
    align-items: center;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    transition: background-color 0.2s;
}

.table-row:last-child {
    border-bottom: none;
}

.table-row:hover {
    background-color: var(--bg-elevated);
}

.col-name {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.doc-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: rgba(var(--primary-rgb), 0.1);
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
}

.doc-info {
    display: flex;
    flex-direction: column;
}

.doc-title {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 1rem;
}

.doc-subtitle {
    font-size: 0.85rem;
    color: var(--text-secondary);
}

.version-badge {
    display: inline-flex;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    background: var(--bg-elevated);
    color: var(--text-primary);
    font-size: 0.85rem;
    font-weight: 500;
    border: 1px solid var(--border);
}

.status-indicator {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.status-indicator.active {
    color: var(--success);
}

.pagination-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding-top: 1rem;
}

.pagination-footer button {
    padding: 0.5rem 1rem;
    border: 1px solid var(--border);
    background: var(--bg-surface);
    border-radius: 6px;
    cursor: pointer;
}

.pagination-footer button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.loading-state, .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    min-height: 300px;
}
</style>
