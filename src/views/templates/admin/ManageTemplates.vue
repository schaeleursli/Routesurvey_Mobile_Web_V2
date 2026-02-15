<template>
    <div class="manage-templates">
        <!-- Summary Cards -->
        <div class="summary-cards">
            <BaseCard>
                <template #header>
                    <h4>Total Templates</h4>
                </template>
                <div class="card-value">{{ templates.length }}</div>
                <div class="card-description">All templates in the system</div>
            </BaseCard>

            <BaseCard>
                <template #header>
                    <h4>Visible Templates</h4>
                </template>
                <div class="card-value">{{templates.filter(t => t.isVisible).length}}</div>
                <div class="card-description">Templates visible to users</div>
            </BaseCard>

            <BaseCard>
                <template #header>
                    <h4>Hidden Templates</h4>
                </template>
                <div class="card-value">{{templates.filter(t => !t.isVisible).length}}</div>
                <div class="card-description">Templates not visible to users</div>
            </BaseCard>

            <BaseCard>
                <template #header>
                    <h4>Paid Templates</h4>
                </template>
                <div class="card-value">{{templates.filter(t => t.price && t.price > 0).length}}</div>
                <div class="card-description">Templates with pricing</div>
            </BaseCard>
        </div>

        <!-- Main Panel -->
        <BasePanel title="Manage Templates" :subtitle="$t('manageTemplatesSubtitle')" elevation="level2">
            <template #actions-view>
                <div class="panel-actions">
                    <div class="view-toggle">
                        <BaseButton variant="ghost" size="small" :class="{ 'active': viewMode === 'list' }"
                            @click="viewMode = 'list'">
                            <i class="bi bi-list-ul"></i>
                        </BaseButton>
                        <BaseButton variant="ghost" size="small" :class="{ 'active': viewMode === 'grid' }"
                            @click="viewMode = 'grid'" title="Grid View">
                            <i class="bi bi-grid-3x3-gap"></i>
                        </BaseButton>
                    </div>
                    <BaseButton variant="primary" size="small" left-icon="bi bi-plus-lg" @click="showAddModal = true">
                        {{ $t('addTemplate') }}
                    </BaseButton>
                </div>
            </template>

            <!-- Search and Filter Section -->
            <div class="search-filter-section">

                <div class="filter-options">
                    <BaseFormField type="select" :model-value="visibilityFilter"
                        @update:model-value="visibilityFilter = $event; filterTemplates()" :options="[
                            { value: 'all', label: $t('allTemplates') },
                            { value: 'visible', label: $t('visibleTemplates') },
                            { value: 'hidden', label: $t('hiddenTemplates') }
                        ]" />
                </div>
            </div>

            <!-- Templates Grid View -->
            <div class="templates-grid" v-if="filteredTemplates.length > 0 && viewMode === 'grid'">
                <BaseCard v-for="template in filteredTemplates" :key="template.id" :interactive="true" :hover="true"
                    :class="{ 'selected': selectedId === template.id }" @click="setSelectedTemplateId(template.id)"
                    class="template-card">
                    <template #header>
                        <div class="template-media">
                            <img v-if="template.media" :src="getMediaUrl(template.media)" :alt="template.name" />
                            <div v-else class="template-placeholder">
                                <i class="bi bi-file-earmark-text"></i>
                            </div>
                            <div class="template-status" :class="template.isVisible ? 'visible' : 'hidden'">
                                <i :class="template.isVisible ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
                            </div>
                        </div>
                    </template>

                    <div class="template-info">
                        <h6 class="template-name">{{ template.name }}</h6>
                        <p class="template-description">{{ template.description }}</p>
                        <div class="template-meta">
                            <span class="template-price" v-if="template.price">
                                <i class="bi bi-currency-dollar"></i>
                                {{ template.price }}
                            </span>
                            <span class="template-date">
                                <i class="bi bi-calendar3"></i>
                                {{ formatDate(template.dateAdded) }}
                            </span>
                        </div>
                    </div>

                    <template #footer>
                        <div class="template-actions">
                            <BaseButton variant="secondary" size="small" left-icon="bi bi-pencil"
                                @click.stop="editTemplate(template)">
                                {{ $t('edit') }}
                            </BaseButton>
                            <BaseButton variant="danger" size="small" left-icon="bi bi-trash"
                                @click.stop="removeTemplate(template.id)">
                                {{ $t('remove') }}
                            </BaseButton>
                        </div>
                    </template>
                </BaseCard>
            </div>

            <!-- Templates List View -->
            <div class="templates-list mt-3" v-if="filteredTemplates.length > 0 && viewMode === 'list'">
                <div class="list-header">
                    <div class="list-column">Name</div>
                    <div class="list-column">Description</div>
                    <div class="list-column">Price</div>
                    <div class="list-column">Status</div>
                    <div class="list-column">Date Added</div>
                    <div class="list-column">Actions</div>
                </div>
                <div class="list-items">
                    <div v-for="template in filteredTemplates" :key="template.id" class="list-item"
                        :class="{ 'selected': selectedId === template.id }" @click="setSelectedTemplateId(template.id)">
                        <div class="list-cell template-name-cell">
                            <div class="template-media-small">
                                <img v-if="template.media" :src="getMediaUrl(template.media)" :alt="template.name" />
                                <div v-else class="template-placeholder-small">
                                    <i class="bi bi-file-earmark-text"></i>
                                </div>
                            </div>
                            <div class="template-name">{{ template.name }}</div>
                        </div>
                        <div class="list-cell template-description-cell">
                            <span class="template-description">{{ template.description }}</span>
                        </div>
                        <div class="list-cell template-price-cell">
                            <span class="template-price" v-if="template.price">
                                <i class="bi bi-currency-dollar"></i>
                                {{ template.price }}
                            </span>
                            <span v-else class="no-price">-</span>
                        </div>
                        <div class="list-cell template-status-cell">
                            <div class="template-status-badge" :class="template.isVisible ? 'visible' : 'hidden'">
                                <i :class="template.isVisible ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
                                {{ template.isVisible ? 'Visible' : 'Hidden' }}
                            </div>
                        </div>
                        <div class="list-cell template-date-cell">
                            <span class="template-date">{{ formatDate(template.dateAdded) }}</span>
                        </div>
                        <div class="list-cell template-actions-cell">
                            <div class="template-actions">
                                <BaseButton variant="secondary" size="small" left-icon="bi bi-pencil"
                                    @click.stop="editTemplate(template)">
                                    {{ $t('edit') }}
                                </BaseButton>
                                <BaseButton variant="danger" size="small" left-icon="bi bi-trash"
                                    @click.stop="removeTemplate(template.id)">
                                    {{ $t('remove') }}
                                </BaseButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
                <BaseLoadingIndicator size="large" variant="primary" :message="$t('loadingTemplates')" />
            </div>

            <!-- No Results State -->
            <div v-else-if="filteredTemplates.length === 0" class="no-results">
                <i class="bi bi-search no-results-icon"></i>
                <p class="no-results-text">{{ $t('noTemplatesFound') }}</p>
            </div>
        </BasePanel>

        <!-- Add Template Modal -->
        <div class="modal fade" :class="{ show: showAddModal }" v-if="showAddModal" style="display: block;">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ $t('addTemplate') }}</h5>
                        <button type="button" class="btn-close" @click="closeAddModal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="onAddTemplate">
                            <div class="form-row">
                                <div class="form-col">
                                    <BaseFormField type="text" :label="$t('templateName')" v-model="addName"
                                        :placeholder="$t('enterTemplateName')" />
                                </div>
                                <div class="form-col">
                                    <BaseFormField type="number" :label="$t('price')" v-model="addPrice" :min="0"
                                        :step="0.01" />
                                </div>
                            </div>

                            <BaseFormField type="textarea" :label="$t('description')" v-model="addDescription"
                                :placeholder="$t('enterTemplateDescription')" :rows="3" />

                            <BaseFormField type="textarea" :label="$t('content')" v-model="addContent"
                                :placeholder="$t('enterTemplateContent')" :rows="6" />

                            <div class="media-upload-section">
                                <label class="form-label">{{ $t('media') }}</label>
                                <div class="media-upload-area">
                                    <input type="file" ref="addMediaInput" @change="onAddAddTemplateMedia"
                                        accept="image/*" multiple style="display: none;" />
                                    <button type="button" class="btn btn-secondary btn-sm"
                                        @click="$refs.addMediaInput.click()">
                                        <i class="bi bi-upload"></i>
                                        {{ $t('uploadMedia') }}
                                    </button>
                                </div>
                                <div class="media-preview" v-if="addMedia.length > 0">
                                    <div v-for="(media, index) in addMedia" :key="index" class="media-item">
                                        <img :src="media.url" :alt="media.name" />
                                        <button type="button" class="remove-media"
                                            @click="removeAddTemplateMedia(index)">
                                            <i class="bi bi-x"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <BaseFormField type="checkbox" :label="$t('makeVisible')" v-model="addIsVisible" />
                        </form>
                    </div>
                    <div class="modal-footer">
                        <BaseButton variant="secondary" size="small" @click="closeAddModal">
                            {{ $t('cancel') }}
                        </BaseButton>
                        <BaseButton variant="primary" size="small" @click="handleAddTemplate">
                            {{ $t('addTemplate') }}
                        </BaseButton>
                    </div>
                </div>
            </div>
        </div>

        <!-- Edit Template Modal -->
        <div class="modal fade" :class="{ show: showEditModal }" v-if="showEditModal" style="display: block;">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ $t('editTemplate') }}</h5>
                        <button type="button" class="btn-close" @click="closeEditModal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="onEditTemplate">
                            <div class="form-row">
                                <div class="form-col">
                                    <BaseFormField type="text" :label="$t('templateName')" v-model="editName"
                                        :placeholder="$t('enterTemplateName')" />
                                </div>
                                <div class="form-col">
                                    <BaseFormField type="number" :label="$t('price')" v-model="editPrice" :min="0"
                                        :step="0.01" />
                                </div>
                            </div>

                            <BaseFormField type="textarea" :label="$t('description')" v-model="editDescription"
                                :placeholder="$t('enterTemplateDescription')" :rows="3" />

                            <BaseFormField type="textarea" :label="$t('content')" v-model="editContent"
                                :placeholder="$t('enterTemplateContent')" :rows="6" />

                            <div class="media-upload-section">
                                <label class="form-label">{{ $t('media') }}</label>
                                <div class="media-upload-area">
                                    <input type="file" ref="editMediaInput" @change="onAddEditTemplateMedia"
                                        accept="image/*" multiple style="display: none;" />
                                    <BaseButton variant="secondary" size="small" left-icon="bi bi-upload"
                                        @click="$refs.editMediaInput.click()">
                                        {{ $t('uploadMedia') }}
                                    </BaseButton>
                                </div>
                                <div class="media-preview" v-if="editMedia.length > 0">
                                    <div v-for="(media, index) in editMedia" :key="index" class="media-item">
                                        <img :src="media.url" :alt="media.name" />
                                        <button type="button" class="remove-media"
                                            @click="removeEditTemplateMedia(index)">
                                            <i class="bi bi-x"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <BaseFormField type="checkbox" :label="$t('makeVisible')" v-model="editIsVisible" />
                        </form>
                    </div>
                    <div class="modal-footer">
                        <BaseButton variant="secondary" size="small" @click="closeEditModal">
                            {{ $t('cancel') }}
                        </BaseButton>
                        <BaseButton variant="primary" size="small" @click="handleEditTemplate">
                            {{ $t('saveChanges') }}
                        </BaseButton>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Backdrop -->
        <div class="modal-backdrop fade show" v-if="showAddModal || showEditModal"></div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useSearchContext } from "@/composables/useSearchContext";
import { useI18n } from 'vue-i18n';
import { useManageTemplates } from '@/composables/templates/useManageTemplates';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BasePanel from '@/components/ui/BasePanel.vue';
import BaseFormField from '@/components/ui/BaseFormField.vue';
import BaseLoadingIndicator from '@/components/ui/BaseLoadingIndicator.vue';

const { t } = useI18n();

// Use the composable
const {
    templates,
    filteredTemplates,
    selectedId,
    selectedTemplate,
    addName,
    addDescription,
    addPrice,
    addContent,
    addMedia,
    addIsVisible,
    editName,
    editDescription,
    editPrice,
    editContent,
    editMedia,
    editIsVisible,
    setSelectedTemplateId,
    setAvailableTemplates,
    onAddTemplate,
    onEditTemplate,
    onRemoveTemplate,
    onAddAddTemplateMedia,
    removeAddTemplateMedia,
    onAddEditTemplateMedia,
    removeEditTemplateMedia,
    clearAddTemplateFields,
    clearEditTemplateFields,
    loadTemplates,
    getData
} = useManageTemplates();

const { registerSearchContext, clearSearchContext } = useSearchContext();

// Local state
const showAddModal = ref(false);
const showEditModal = ref(false);
const searchQuery = ref('');
const visibilityFilter = ref('all');
const loading = ref(false);
const viewMode = ref('list'); // Default to list view

// Methods
const filterTemplates = () => {
    let filtered = templates.value;

    // Apply search filter
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(template =>
            template.name.toLowerCase().includes(query) ||
            template.description.toLowerCase().includes(query)
        );
    }

    // Apply visibility filter
    if (visibilityFilter.value === 'visible') {
        filtered = filtered.filter(template => template.isVisible);
    } else if (visibilityFilter.value === 'hidden') {
        filtered = filtered.filter(template => !template.isVisible);
    }

    filteredTemplates.value = filtered;
};

const getMediaUrl = (mediaString) => {
    try {
        const media = JSON.parse(mediaString);
        if (media && media.length > 0) {
            return media[0].url
                .replaceAll('http://10.0.2.2', 'http://localhost')
                .replaceAll("https://localhost", "http://localhost");
        }
    } catch (error) {
        console.error('Error parsing media:', error);
    }
    return '';
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
};

const editTemplate = (template) => {
    setSelectedTemplateId(template.id);
    showEditModal.value = true;
};

const removeTemplate = async (templateId) => {
    if (confirm(t('confirmRemoveTemplate'))) {
        setSelectedTemplateId(templateId);
        await onRemoveTemplate();
    }
};

const closeAddModal = () => {
    showAddModal.value = false;
    clearAddTemplateFields();
};

const closeEditModal = () => {
    showEditModal.value = false;
    clearEditTemplateFields();
    setSelectedTemplateId(-1);
};

const handleAddTemplate = async () => {
    const result = await onAddTemplate();
    if (result) {
        closeAddModal();
    }
};

const handleEditTemplate = async () => {
    const result = await onEditTemplate();
    if (result) {
        closeEditModal();
    }
};

// Lifecycle
onMounted(async () => {
    loading.value = true;
    try {
        await getData();
        filterTemplates();
        
        registerSearchContext(t('manageTemplates'), (query) => {
            searchQuery.value = query;
            filterTemplates();
            
            return filteredTemplates.value.slice(0, 5).map(template => ({
                 title: template.name,
                 description: template.description || t('noDescription'),
                 action: () => editTemplate(template)
            }));
        }, 'bi-kanban');
    } catch (error) {
        console.error('Error loading data:', error);
    } finally {
        loading.value = false;
    }
});

onUnmounted(() => {
    clearSearchContext();
});

watch([templates, searchQuery, visibilityFilter], filterTemplates);
</script>

<style scoped>
.manage-templates {
    padding: 1rem;
    min-height: 100vh;
    color: var(--text-primary);
    max-width: 1700px;
    margin: 0 auto;
}

/* Summary Cards - Dashboard Style */
.summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
}

.card-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
}

.card-description {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.3;
    font-weight: 400;
}

/* Panel Actions */
.panel-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

.search-filter-section {
    display: flex;
    gap: var(--spacing-sm);
    align-items: center;
    margin-top: var(--spacing-sm);
}

.search-box {
    position: relative;
    flex: 1;
    max-width: 300px;
}

.search-icon {
    position: absolute;
    left: var(--spacing-sm);
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
    z-index: 1;
    font-size: var(--font-size-sm);
}

.search-input {
    width: 100%;
    padding: var(--spacing-xs) var(--spacing-sm) var(--spacing-xs) 2rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: var(--font-size-sm);
    transition: all var(--transition-normal);
    height: 32px;
}

.search-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-focus-ring);
}

.filter-options {
    min-width: 150px;
}

.filter-options :deep(.base-form-field__select) {
    height: 32px;
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-sm);
}

.view-toggle {
    display: flex;
    gap: var(--spacing-2xs);
    background: var(--bg-elevated);
    border-radius: 6px;
    padding: var(--spacing-2xs);
}

.view-toggle .base-button {
    border: none;
    background: transparent;
    color: var(--text-secondary);
    transition: all var(--transition-normal);
}

.view-toggle .base-button.active {
    background: var(--accent);
    color: white;
}

.view-toggle .base-button:hover:not(.active) {
    background: var(--bg-surface);
    color: var(--text-primary);
}

.templates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--spacing-lg);
    padding: var(--spacing-sm);
}

/* List View Styles */
.templates-list {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
}

.list-header {
    display: grid;
    grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1.5fr;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--bg-elevated);
    border-bottom: 1px solid var(--border);
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
}

.list-items {
    max-height: 60vh;
    overflow-y: auto;
}

.list-item {
    display: grid;
    grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1.5fr;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    transition: all var(--transition-normal);
    align-items: center;
}

.list-item:hover {
    background: var(--bg-elevated);
}

.list-item.selected {
    background: var(--accent-surface);
    border-left: 3px solid var(--accent);
}

.list-cell {
    display: flex;
    align-items: center;
    min-height: 40px;
}

.template-name-cell {
    gap: var(--spacing-sm);
}

.template-media-small {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    overflow: hidden;
    flex-shrink: 0;
}

.template-media-small img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.template-placeholder-small {
    width: 100%;
    height: 100%;
    background: var(--bg-elevated);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
}

.template-name {
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    font-size: var(--font-size-base);
}

.template-description {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.template-price {
    color: var(--success);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-sm);
}

.no-price {
    color: var(--text-secondary);
    font-style: italic;
}

.template-status-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-full);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
}

.template-status-badge.visible {
    background: rgb(0 179 134 / 10%);
    color: var(--success);
}

.template-status-badge.hidden {
    background: rgb(243 145 18 / 10%);
    color: var(--warning);
}

.template-date {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
}

.template-actions {
    display: flex;
    gap: var(--spacing-xs);
}

.template-card {
    transition: all var(--transition-normal);
}

.template-card.selected {
    border-color: var(--accent);
    background: var(--accent-surface);
}

.template-media {
    position: relative;
    margin-bottom: var(--spacing-xs);
}

.template-media img {
    width: 100%;
    height: 140px;
    object-fit: cover;
    border-radius: var(--radius-lg);
}

.template-placeholder {
    width: 100%;
    height: 140px;
    background: var(--bg-elevated);
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    color: var(--text-secondary);
}

.template-status {
    position: absolute;
    top: var(--spacing-sm);
    right: var(--spacing-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
}

.template-status.visible {
    background: var(--success);
    color: white;
}

.template-status.hidden {
    background: var(--warning);
    color: white;
}

.template-info {
    margin-bottom: var(--spacing-xs);
}

.template-name {
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--spacing-2xs);
    color: var(--text-primary);
    font-size: var(--font-size-lg);
    line-height: 1.1;
}

.template-description {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    margin-bottom: var(--spacing-xs);
    line-height: 1.2;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.template-meta {
    display: flex;
    gap: var(--spacing-sm);
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-xs);
}

.template-price {
    color: var(--success);
    font-weight: var(--font-weight-medium);
}

.template-actions {
    display: flex;
    gap: var(--spacing-xs);
    margin-top: var(--spacing-2xs);
}

/* Compact button styles */
.template-actions .base-button {
    font-size: var(--font-size-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
}

/* Modal footer button spacing */
.modal-footer {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: flex-end;
}

/* Panel content styling */
.manage-templates :deep(.base-panel__content) {
    padding: var(--spacing-md);
}

.loading-state,
.no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    color: var(--text-secondary);
}

.no-results-icon {
    font-size: 3rem;
    margin-bottom: var(--spacing-md);
    color: var(--text-secondary);
}

.no-results-text {
    font-size: var(--font-size-lg);
    color: var(--text-secondary);
    margin: 0;
}

.media-upload-section {
    margin-bottom: var(--spacing-md);
}

.media-upload-area {
    border: 2px dashed var(--border);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    text-align: center;
    margin-bottom: var(--spacing-md);
    background: var(--bg-elevated);
    transition: all var(--transition-normal);
}

.media-upload-area:hover {
    border-color: var(--accent);
    background: rgb(0 167 225 / 5%);
}

.media-preview {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: var(--spacing-sm);
}

.media-item {
    position: relative;
    border-radius: var(--radius-lg);
    overflow: hidden;
}

.media-item img {
    width: 100%;
    height: 100px;
    object-fit: cover;
}

.remove-media {
    position: absolute;
    top: var(--spacing-xs);
    right: var(--spacing-xs);
    background: rgb(0 0 0 / 70%);
    color: white;
    border: none;
    border-radius: var(--radius-full);
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-xs);
    cursor: pointer;
    transition: all var(--transition-normal);
}

.remove-media:hover {
    background: var(--error);
    transform: scale(1.1);
}

/* Form Layout */
.form-row {
    display: flex;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
}

.form-col {
    flex: 1;
}

/* Modal Styles */
.modal {
    z-index: 1050;
}

.modal-backdrop {
    z-index: 1040;
}

/* Responsive Design */
@media (width <= 768px) {
    .manage-templates {
        padding: var(--spacing-sm);
    }

    .summary-cards {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: var(--spacing-sm);
    }

    .panel-actions {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-sm);
    }

    .search-filter-section {
        flex-direction: column;
        align-items: stretch;
    }

    .templates-grid {
        grid-template-columns: 1fr;
    }

    .form-row {
        flex-direction: column;
    }

    /* List view responsive */
    .list-header,
    .list-item {
        grid-template-columns: 1fr;
        gap: var(--spacing-sm);
    }

    .list-header {
        display: none;

        /* Hide header on mobile */
    }

    .list-item {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: var(--spacing-md);
        gap: var(--spacing-sm);
    }

    .list-cell {
        width: 100%;
        min-height: auto;
    }

    .template-name-cell {
        flex-direction: row;
        align-items: center;
        gap: var(--spacing-sm);
    }

    .template-actions {
        width: 100%;
        justify-content: flex-end;
    }
}
</style>
