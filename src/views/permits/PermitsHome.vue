<template>
    <div class="permits-home">
        <div class="page-header">
            <div>
                <h1>{{ $t('permits') || 'Permits' }}</h1>
                <p class="text-secondary">Manage permit applications for your routes</p>
            </div>
            <button class="btn btn-primary" @click="showCreateModal = true">
                <i class="bi bi-plus-circle"></i>
                {{ $t('createPermitCase') || 'Create Permit Case' }}
            </button>
        </div>

        <!-- Permit cases list -->
        <div class="permits-list" v-if="!loading && cases.length > 0">
            <div class="card" v-for="permitCase in cases" :key="permitCase.id">
                <div class="card-body">
                    <div class="permit-card-header">
                        <div>
                            <h3 class="permit-title">{{ permitCase.title }}</h3>
                            <div class="permit-meta">
                                <span class="meta-item">
                                    <i class="bi bi-geo-alt"></i>
                                    States: {{ (permitCase.payload?.route?.statesInRoute || []).join(', ') || 'Unknown' }}
                                </span>
                                <span class="meta-item">
                                    <i class="bi bi-calendar"></i>
                                    {{ formatDate(permitCase.created_at) }}
                                </span>
                            </div>
                        </div>
                        <span class="status-badge" :class="`status-${permitCase.status}`">
                            {{ permitCase.status.toUpperCase() }}
                        </span>
                    </div>
                    <div class="permit-actions">
                        <router-link 
                            :to="{ name: 'USPermitCase', params: { projectId: permitCase.project_id, caseId: permitCase.id } }"
                            class="btn btn-sm btn-outline-primary"
                        >
                            <i class="bi bi-folder-open"></i>
                            Open Case
                        </router-link>
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty state -->
        <div class="empty-state" v-if="!loading && cases.length === 0">
            <i class="bi bi-file-earmark-text empty-icon"></i>
            <h3>No permit cases yet</h3>
            <p>Create your first permit case to get started</p>
            <button class="btn btn-primary" @click="showCreateModal = true">
                <i class="bi bi-plus-circle"></i>
                Create Permit Case
            </button>
        </div>

        <!-- Loading state -->
        <div class="loading-state" v-if="loading">
            <div class="spinner-border text-primary"></div>
            <p>Loading permit cases...</p>
        </div>

        <!-- Create Modal -->
        <div class="modal" :class="{ show: showCreateModal }" v-if="showCreateModal" @click.self="showCreateModal = false">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Create US Permit Case</h5>
                        <button type="button" class="btn-close" @click="showCreateModal = false"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Title</label>
                            <input 
                                type="text" 
                                class="form-control" 
                                v-model="newCase.title"
                                placeholder="e.g., TX-CA Oversize Load Permit"
                            />
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Select Route</label>
                            <select class="form-select" v-model="newCase.routeId">
                                <option value="">Choose a route...</option>
                                <option v-for="route in availableRoutes" :key="route.id" :value="route.id">
                                    {{ route.name || route.Name || `Route ${route.id}` }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="showCreateModal = false">Cancel</button>
                        <button type="button" class="btn btn-primary" @click="createNewCase" :disabled="!canCreate">
                            Create Case
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePermitCaseStore } from '@/stores/permits/usPermitCaseStore';
import RoutesController from '@/controllers/routes/routes_controller';

const router = useRouter();
const permitStore = usePermitCaseStore();

const showCreateModal = ref(false);
const availableRoutes = ref([]);
const loading = ref(false);

const newCase = ref({
    title: '',
    routeId: ''
});

const cases = computed(() => permitStore.cases);

const canCreate = computed(() => {
    return newCase.value.title.trim() !== '' && newCase.value.routeId !== '';
});

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
};

const loadRoutes = async () => {
    try {
        // Load available routes from the existing routes controller
        const response = await RoutesController.getRoutes();
        if (response && response.result) {
            availableRoutes.value = response.data || [];
        }
    } catch (error) {
        console.error('Error loading routes:', error);
    }
};

const loadCases = async () => {
    loading.value = true;
    try {
        // For now, load all cases (in production, filter by project)
        // Using a default project ID for demo
        const projectId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
        await permitStore.loadProjectCases(projectId);
    } catch (error) {
        console.error('Error loading permit cases:', error);
    } finally {
        loading.value = false;
    }
};

const createNewCase = async () => {
    try {
        // Use a default project ID for demo
        const projectId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
        
        const createdCase = await permitStore.createCase(
            projectId,
            newCase.value.routeId,
            newCase.value.title
        );
        
        showCreateModal.value = false;
        newCase.value = { title: '', routeId: '' };
        
        // Navigate to the new case
        router.push({ 
            name: 'USPermitCase', 
            params: { 
                projectId: createdCase.project_id, 
                caseId: createdCase.id 
            } 
        });
    } catch (error) {
        console.error('Error creating permit case:', error);
        alert('Failed to create permit case: ' + error.message);
    }
};

onMounted(() => {
    loadRoutes();
    loadCases();
});
</script>

<style scoped>
.permits-home {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
}

.page-header h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.permits-list {
    display: grid;
    gap: 1rem;
}

.permit-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
}

.permit-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.permit-meta {
    display: flex;
    gap: 1.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
}

.status-ready {
    background-color: var(--success-bg);
    color: var(--success);
}

.status-blocked {
    background-color: var(--danger-bg);
    color: var(--danger);
}

.status-draft {
    background-color: var(--secondary-bg);
    color: var(--text-secondary);
}

.permit-actions {
    display: flex;
    gap: 0.5rem;
}

.empty-state {
    text-align: center;
    padding: 4rem 2rem;
}

.empty-icon {
    font-size: 4rem;
    color: var(--text-tertiary);
    margin-bottom: 1rem;
}

.empty-state h3 {
    color: var(--text-primary);
    margin-bottom: 0.5rem;
}

.empty-state p {
    color: var(--text-secondary);
    margin-bottom: 2rem;
}

.loading-state {
    text-align: center;
    padding: 4rem 2rem;
}

.loading-state p {
    margin-top: 1rem;
    color: var(--text-secondary);
}

/* Modal styles */
.modal.show {
    display: block;
    background-color: rgb(0 0 0 / 50%);
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1050;
    overflow: auto;
}
</style>
