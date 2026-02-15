<template>
    <div class="templates-list-page p-4">
        <div class="header d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 class="mb-1">Report Templates</h2>
                <p class="text-muted mb-0">Manage global and client-specific report templates.</p>
            </div>
            <BaseButton variant="primary" leftIcon="bi bi-plus-lg" @click="createNew">
                New Template
            </BaseButton>
        </div>

        <!-- Filters (Mock) -->
        <div class="filters mb-4 d-flex gap-3">
            <input type="text" class="form-control w-auto" placeholder="Search templates..." v-model="searchQuery" />
            <select class="form-select w-auto" v-model="filterStatus">
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
            </select>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Loading templates...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="templates.length === 0" class="text-center py-5 bg-light rounded border border-dashed">
            <i class="bi bi-file-earmark-richtext display-4 text-muted"></i>
            <h5 class="mt-3">No templates found</h5>
            <p class="text-muted">Get started by creating your first report template.</p>
            <BaseButton variant="primary" size="small" @click="createNew">Create Template</BaseButton>
        </div>

        <!-- Grid -->
        <div v-else class="row g-4">
            <div class="col-md-4 col-lg-3" v-for="tpl in templates" :key="tpl.id">
                <div class="card h-100 shadow-sm template-card" @click="openBuilder(tpl.id)">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                             <span class="badge" :class="statusBadgeClass(tpl.status)">
                                {{ tpl.status }}
                             </span>
                             <span class="small text-muted">v{{ tpl.version }}</span>
                        </div>
                        <h5 class="card-title text-truncate" :title="tpl.name">{{ tpl.name }}</h5>
                        <p class="card-text small text-muted text-truncate-2">{{ tpl.description || 'No description' }}</p>
                    </div>
                    <div class="card-footer bg-white border-top-0 pt-0 text-muted small">
                        Updated {{ new Date(tpl.updatedAt).toLocaleDateString() }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { BaseButton } from '@/components/ui'; // Assuming these exist
import templateService from '@/services/templateService';

const router = useRouter();
const templates = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const filterStatus = ref('');

onMounted(async () => {
    loadTemplates();
});

async function loadTemplates() {
    loading.value = true;
    try {
        const res = await templateService.getTemplates({ 
            search: searchQuery.value, 
            status: filterStatus.value 
        });
        if (res.success) {
            templates.value = res.data;
        }
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
}

function createNew() {
    // Navigate to a "new" route or directly create stub and redirect
    router.push('/admin/templates/new');
}

function openBuilder(id) {
    router.push(`/admin/templates/${id}`);
}

function statusBadgeClass(status) {
    switch(status) {
        case 'published': return 'bg-success text-white';
        case 'draft': return 'bg-warning text-dark';
        case 'archived': return 'bg-secondary text-white';
        default: return 'bg-light text-dark border';
    }
}
</script>

<style scoped>
.template-card {
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}
.template-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 .5rem 1rem rgb(0 0 0 / 15%)!important;
    border-color: var(--primary-color);
}
.text-truncate-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
