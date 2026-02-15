<template>
    <div class="admin-tools-page">
        <BasePanel title="Admin Tools" subtitle="Manage system tools and utilities" elevation="level2">
            <div class="tools-grid">
                <!-- KML Import Tool -->
                <BaseCard :interactive="false" class="tool-card">
                    <template #header>
                        <div class="tool-card-header">
                            <div class="tool-icon">
                                <i class="bi bi-file-earmark-map"></i>
                            </div>
                            <div class="tool-info">
                                <h4>KML Import</h4>
                                <p>Import routes from KML files directly into the system.</p>
                            </div>
                        </div>
                    </template>
                    <template #footer>
                        <BaseButton variant="primary" class="btn-block" @click="showImportModal = true">
                            <i class="bi bi-upload"></i> Import KML
                        </BaseButton>
                    </template>
                </BaseCard>
            </div>
        </BasePanel>

        <!-- KML Import Modal -->
        <KMLImportModal :show="showImportModal" @close="showImportModal = false" @imported="handleRouteImported" />
    </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { BasePanel, BaseCard, BaseButton } from '@/components/ui';
import KMLImportModal from '@/components/routes/KMLImportModal.vue';

const showMessage = inject('showMessage');
const showImportModal = ref(false);

const handleRouteImported = (importedRoute) => {
    showMessage({ status: 'success', message: 'Route imported successfully' });
    // Option: Navigate to the route or just stay here.
    // For now, staying here is fine.
};
</script>

<style scoped>
.admin-tools-page {
    height: 100%;
    padding: var(--spacer-base);
}

.tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--spacer-base);
    padding: var(--spacer-base) 0;
}

.tool-card-header {
    display: flex;
    align-items: center;
    gap: var(--spacer-base);
}

.tool-icon {
    width: 48px;
    height: 48px;
    background-color: var(--primary-50);
    color: var(--primary);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
}

.tool-info h4 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
}

.tool-info p {
    margin: 4px 0 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
}
</style>
