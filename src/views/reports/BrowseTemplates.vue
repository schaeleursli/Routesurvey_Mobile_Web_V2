<template>
    <div class="browse-templates" v-if="checkFeatureAccess('template_library')">
        <!-- Main Templates Panel -->
        <BasePanel :title="$t('browseTemplates')" elevation="level1" class="templates-main-panel" scrollable>
            <template #actions-view>
                <div class="view-controls d-flex gap-2 align-items-center">

                    <div class="view-toggle btn-group">
                        <BaseButton :variant="viewMode === 'list' ? 'primary' : 'ghost'" size="small"
                            @click="viewMode = 'list'" :title="$t('listView')">
                            <i class="bi bi-list-ul"></i>
                        </BaseButton>
                        <BaseButton :variant="viewMode === 'grid' ? 'primary' : 'ghost'" size="small"
                            @click="viewMode = 'grid'" :title="$t('gridView')">
                            <i class="bi bi-grid-3x3-gap"></i>
                        </BaseButton>
                    </div>
                </div>
            </template>

            <div class="templates-content">
                <!-- TABS -->
                <BaseTabGroup v-model="activeTab" :tabs="tabs" :scrollable="true">
                    
                    <div class="tab-content-wrapper mt-3" v-if="!loading">
                         <template v-if="displayTemplates.length > 0">
                            <div class="templates-container">
                                <!-- Grid View -->
                                <template v-if="viewMode === 'grid'">
                                    <div class="templates-grid">
                                        <BaseCard v-for="template in displayTemplates" :key="template.id"
                                            :variant="activeTab === 'paid' ? 'default' : 'success'" hover class="template-card">
                                            <template #header>
                                                <div class="template-media" @click="openPreviewModal(template)">
                                                    <img v-if="template.media && template.media.length > 0" :src="template.media[0]"
                                                        :alt="template.name" />
                                                    <div v-else class="template-placeholder">
                                                        <i class="bi bi-file-earmark-text"></i>
                                                    </div>
                                                    <div class="media-overlay">
                                                        <i class="bi bi-eye"></i> {{ $t('preview') }}
                                                    </div>
                                                </div>
                                            </template>

                                            <div class="template-info">
                                                <h6 class="template-name">{{ template.name }}</h6>
                                                <p class="template-description">{{ template.description }}</p>
                                                <div class="template-meta">
                                                    <span class="template-tag" v-if="template.isDefault && activeTab !== 'paid'">
                                                        <i class="bi bi-star-fill"></i> Default
                                                    </span>
                                                    <span class="template-price" v-if="template.price && activeTab === 'paid'">
                                                        <i class="bi bi-currency-dollar"></i> {{ template.price }}
                                                    </span>
                                                    <span class="template-date">
                                                        <i class="bi bi-calendar3"></i>
                                                        {{ formatDate(template.dateAdded) }}
                                                    </span>
                                                </div>
                                            </div>

                                            <template #footer>
                                                <div class="card-actions">
                                                    <BaseButton variant="ghost" size="medium" @click="openPreviewModal(template)">
                                                        {{ $t('preview') }}
                                                    </BaseButton>
                                                    
                                                    <!-- Action depends on context -->
                                                    <BaseButton v-if="activeTab === 'paid' && !template.owned" 
                                                        variant="primary" size="medium" left-icon="bi bi-plus-lg"
                                                        @click="initiateTemplatePurchase(template)">
                                                        {{ $t('buyTemplate') }}
                                                    </BaseButton>
                                                    <BaseButton v-else-if="activeTab === 'custom'" 
                                                        variant="secondary" size="medium" left-icon="bi bi-trash"
                                                        @click="removeUserTemplate(template)">
                                                        {{ $t('removeTemplate') }}
                                                    </BaseButton>
                                                    <BaseButton v-else-if="!template.isDefault"
                                                        variant="primary" size="medium" left-icon="bi bi-download"
                                                        @click="initiateTemplatePurchase(template)">
                                                        {{ $t('addToLibrary') }}
                                                    </BaseButton>
                                                </div>
                                            </template>
                                        </BaseCard>
                                    </div>
                                </template>

                                <!-- List View -->
                                <template v-else>
                                    <div class="templates-list">
                                        <BaseCard v-for="template in displayTemplates" :key="template.id"
                                            :variant="activeTab === 'paid' ? 'default' : 'success'" hover class="template-list-item">
                                            <div class="template-list-content">
                                                <div class="template-media-small" @click="openPreviewModal(template)">
                                                    <img v-if="template.media && template.media.length > 0" :src="template.media[0]"
                                                        :alt="template.name" />
                                                    <div v-else class="template-placeholder-small">
                                                        <i class="bi bi-file-earmark-text"></i>
                                                    </div>
                                                </div>

                                                <div class="template-info">
                                                    <h6 class="template-name">{{ template.name }}</h6>
                                                    <p class="template-description">{{ template.description }}</p>
                                                    <div class="template-meta">
                                                        <span class="template-tag" v-if="template.isDefault && activeTab !== 'paid'">
                                                            <i class="bi bi-star-fill"></i> Default
                                                        </span>
                                                         <span class="template-price" v-if="template.price && activeTab === 'paid'">
                                                            <i class="bi bi-currency-dollar"></i> {{ template.price }}
                                                        </span>
                                                        <span class="template-date">
                                                            <i class="bi bi-calendar3"></i>
                                                            {{ formatDate(template.dateAdded) }}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div class="template-actions">
                                                    <BaseButton variant="ghost" size="medium" @click="openPreviewModal(template)">
                                                        {{ $t('preview') }}
                                                    </BaseButton>
                                                    
                                                     <!-- Action depends on context -->
                                                    <BaseButton v-if="activeTab === 'paid' && !template.owned" 
                                                        variant="primary" size="medium" left-icon="bi bi-plus-lg"
                                                        @click="initiateTemplatePurchase(template)">
                                                        {{ $t('buyTemplate') }}
                                                    </BaseButton>
                                                    <BaseButton v-else-if="activeTab === 'custom'" 
                                                        variant="secondary" size="medium" left-icon="bi bi-trash"
                                                        @click="removeUserTemplate(template)">
                                                        {{ $t('removeTemplate') }}
                                                    </BaseButton>
                                                </div>
                                            </div>
                                        </BaseCard>
                                    </div>
                                </template>
                            </div>
                        </template>

                        <template v-else>
                            <BaseEmptyState 
                                icon="bi bi-inbox" 
                                :message="$t('noTemplatesInThisCategory')" 
                            />
                        </template>
                    </div>

                </BaseTabGroup>

                <!-- Loading State -->
                <div v-if="loading" class="d-flex justify-content-center align-items-center flex-grow-1">
                    <BaseLoadingIndicator size="large" :message="$t('loadingTemplates')" />
                </div>


            </div>

        </BasePanel>

        <!-- Payment Modal -->
        <TemplatePaymentModal 
            :visible="showPaymentModal" 
            :template="selectedTemplate"
            @close="closePaymentModal"
            @payment-success="handlePaymentSuccess"
        />

        <!-- Preview Modal -->
        <TemplatePreviewModal
            :visible="previewModalVisible"
            :template="previewTemplateData"
            :show-purchase-action="activeTab === 'marketplace'"
            @close="closePreviewModal"
            @purchase="handlePreviewPurchase"
        />
    </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import TemplatesController from '@/controllers/templates/templates_controller';
import BaseCard from '@/components/ui/BaseCard.vue';
import BasePanel from '@/components/ui/BasePanel.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { BaseLoadingIndicator, BaseTabGroup, BaseEmptyState } from '@/components/ui';
import TemplatePaymentModal from '@/components/reports/TemplatePaymentModal.vue';
import TemplatePreviewModal from '@/components/reports/TemplatePreviewModal.vue';
import { useSearchContext } from "@/composables/useSearchContext";
import { useSubscription } from "@/composables/subscription/useSubscription";

const { checkFeatureAccess, getData: getSubscriptionData } = useSubscription();

const { t } = useI18n();
const showMessage = inject('showMessage');
const setGlobalLoading = inject('setGlobalLoading');
const { registerSearchContext, clearSearchContext } = useSearchContext();

const templates = ref([]);
const myTemplates = ref([]);
const searchQuery = ref('');
const loading = ref(true);
const viewMode = ref('list'); // 'grid' or 'list'
const tabs = computed(() => [
    {
        id: 'standard',
        label: t('standardTemplates'),
        icon: 'bi bi-grid'
    },
    {
        id: 'custom',
        label: t('customTemplates'),
        icon: 'bi bi-pencil-square'
    },
    {
        id: 'special',
        label: t('specialTemplates'),
        icon: 'bi bi-star'
    },
    {
        id: 'paid',
        label: t('paidTemplates'),
        icon: 'bi bi-currency-dollar'
    }
]);

// ... (other refs)
const activeTab = ref('standard'); // Default to Standard (closest to "Last Project" intent for now)


// Payment related state
const showPaymentModal = ref(false);
const selectedTemplate = ref(null);

// Preview related state
const previewModalVisible = ref(false);
const previewTemplateData = ref(null);
const openPreviewModal = (template) => {
    previewTemplateData.value = template;
    previewModalVisible.value = true;
};

const closePreviewModal = () => {
    previewModalVisible.value = false;
    previewTemplateData.value = null;
};

const handlePreviewPurchase = (template) => {
    closePreviewModal();
    initiateTemplatePurchase(template);
};

const displayTemplates = computed(() => {
    let list = [];
    
    // 1. Select source based on tab
    switch (activeTab.value) {
        case 'standard':
            // Standard templates are default ones in myTemplates or available globally
            list = templates.value.filter(t => t.isDefault) 
                   .concat(myTemplates.value.filter(t => t.isDefault));
            // De-duplicate by ID
            list = [...new Map(list.map(item => [item.id, item])).values()];
            break;
            
        case 'custom':
            // Custom templates are user's own templates (not default)
            list = myTemplates.value.filter(t => !t.isDefault);
            break;
            
        case 'special':
            // Placeholder logic for "Special"
            list = templates.value.filter(t => t.tags && t.tags.includes('special'));
            break;
            
        case 'paid':
            // Paid templates from marketplace
            list = templates.value.filter(t => t.price && t.price > 0);
            break;
            
        default:
            list = templates.value;
    }
    
    // 2. Apply Search
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        list = list.filter(template =>
            template.name.toLowerCase().includes(query) ||
            template.description.toLowerCase().includes(query)
        );
    }
    
    return list;
});

const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
};

const parseMedia = (mediaStr) => {
    try {
        const parsed = JSON.parse(mediaStr);
        if (Array.isArray(parsed)) {
            return parsed.map(m => m.url ? m.url.replaceAll('http://10.0.2.2', 'http://localhost') : null).filter(url => url);
        }
        return [];
    } catch (e) {
        return [];
    }
};

const loadTemplates = async () => {
    loading.value = true;
    try {
        const myTemplatesRes = await TemplatesController.getCurrentUserTemplates();
        if (myTemplatesRes.result) {
            myTemplates.value = myTemplatesRes.data.map(t => ({
                ...t,
                media: t.media ? parseMedia(t.media) : []
            }));
        }
        const res = await TemplatesController.getTemplates();
        if (res.result) {
            // Get all default templates that user doesn't have yet
            const defaultTemplates = res.data.filter(template => {
                const isDefault = template.isDefault === true;
                const isUserTemplate = myTemplates.value.some(myTemplate => myTemplate.templateId === template.id);
                return isDefault && !isUserTemplate;
            });

            // Add default templates to myTemplates (they should appear in "My Library")
            defaultTemplates.forEach(defaultTemplate => {
                myTemplates.value.push({
                    templateId: defaultTemplate.id,
                    id: defaultTemplate.id,
                    name: defaultTemplate.name,
                    description: defaultTemplate.description,
                    price: defaultTemplate.price,
                    dateAdded: defaultTemplate.dateAdded,
                    media: defaultTemplate.media ? parseMedia(defaultTemplate.media) : [],
                    isDefault: true
                });
            });

            // Update myTemplates with full template data
            myTemplates.value = myTemplates.value.map(element => {
                const templateData = res.data.filter(e => e.id === element.templateId)[0];
                if (templateData) {
                    return {
                        ...element,
                        ...templateData,
                        id: element.id,
                        media: templateData.media ? parseMedia(templateData.media) : []
                    };
                }
                return element;
            });

            // Filter marketplace templates: show templates that are not in user's library
            templates.value = res.data
                .filter(template => {
                    const isUserTemplate = myTemplates.value.some(myTemplate => myTemplate.templateId === template.id);
                    // Only show in marketplace if user doesn't have it
                    return !isUserTemplate;
                })
                .map(template => ({
                    ...template,
                    ...template,
                    media: template.media ? parseMedia(template.media) : []
                }));

        }
    } catch (error) {
        console.error('Error loading templates:', error);
        showMessage({ status: 'error', message: t('errorLoadingTemplates') });
    } finally {
        loading.value = false;
    }
};

const initiateTemplatePurchase = async (template) => {
    // Check if template has a price
    if (!template.price || template.price <= 0) {
        // If template is free, add it directly without payment
        await addTemplate({
            TemplateId: template.id,
            PurchasedData: JSON.stringify(template),
            PaymentIntentId: "",
            PaymentMethodId: "",
        });
        return;
    }

    selectedTemplate.value = template;
    showPaymentModal.value = true;
};

const closePaymentModal = () => {
    showPaymentModal.value = false;
    selectedTemplate.value = null;
};

const handlePaymentSuccess = async ({ template, paymentIntentId, paymentMethodId }) => {
    await addTemplate({
        TemplateId: template.id,
        PurchasedData: JSON.stringify(template),
        PaymentIntentId: paymentIntentId,
        PaymentMethodId: paymentMethodId,
    });
    closePaymentModal();
};

const addTemplate = async (data) => {
    setGlobalLoading(true);
    try {
        const res = await TemplatesController.addUserTemplate(data);
        if (res.result) {
            showMessage({ status: 'success', message: t('templateAdded') });
            // Remove the template from the list
            templates.value = templates.value.filter(t => t.id !== data.TemplateId);
            await loadTemplates();
        } else {
            showMessage({ status: 'error', message: t('errorAddingTemplate') });
        }
    } catch (error) {
        console.error('Error adding template:', error);
        showMessage({ status: 'error', message: t('errorAddingTemplate') });
    } finally {
        setGlobalLoading(false);
    }
};

const removeUserTemplate = async (template) => {
    if (!confirm(t('confirmRemoveTemplate'))) {
        return;
    }
    setGlobalLoading(true);
    try {
        const res = await TemplatesController.removeUserTemplate(template.templateId || template.id);
        if (res.result) {
            showMessage({ status: 'success', message: t('templateRemoved') });
            myTemplates.value = myTemplates.value.filter(t => t.templateId !== template.templateId);
            await loadTemplates();
        } else {
            showMessage({ status: 'error', message: t('errorRemovingTemplate') });
        }
    } catch (error) {
        console.error('Error removing template:', error);
        showMessage({ status: 'error', message: t('errorRemovingTemplate') });
    } finally {
        setGlobalLoading(false);
    }
};

onMounted(() => {
    Promise.all([loadTemplates(), getSubscriptionData()]);

    registerSearchContext(t('templates'), (query) => {
        searchQuery.value = query;
        return displayTemplates.value.slice(0, 5).map(template => ({
             title: template.name,
             description: template.description || t('noDescription'),
             action: () => openPreviewModal(template)
        }));
    }, 'bi-file-earmark-richtext');
});

// Clean up Stripe elements when component is unmounted
onUnmounted(() => {
    clearSearchContext();
});
</script>

<style scoped>
.browse-templates {
    padding: 1rem;
    height: calc(100vh - 2rem);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    overflow: hidden;
    box-sizing: border-box;
}

.templates-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.tab-content-wrapper {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-md) 0;
    min-height: 0;
    max-height: 100%;
}

.templates-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

/* Empty state handled by BaseEmptyState */

/* Enhancements for Media Overlay */
.template-media {
    position: relative;
    cursor: pointer;
    overflow: hidden;
}

.template-media .media-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgb(0 0 0 / 40%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
    font-weight: 500;
}

.template-media:hover .media-overlay {
    opacity: 1;
}

.template-media-small {
    cursor: pointer;
}

/* Preview Modal Styles */
.preview-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgb(0 0 0 / 50%);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.preview-modal-content {
    background: var(--surface-card);
    width: 90%;
    max-width: 800px;
    height: 80%;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.preview-header {
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.preview-header h4 {
    margin: 0;
}

.preview-body {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.preview-image-container {
    background: var(--surface-ground);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
}

.preview-image-container img {
    max-width: 100%;
    max-height: 500px;
    box-shadow: var(--shadow-md);
}

.preview-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--text-secondary);
}

.preview-placeholder i {
    font-size: 3rem;
    margin-bottom: var(--spacing-sm);
}

.preview-footer {
    padding: var(--spacing-md) var(--spacing-lg);
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-md);
}

.card-actions {
    display: flex;
    gap: var(--spacing-xs);
    width: 100%;
    justify-content: flex-end;
}


.empty-state p {
    margin: 0;
    font-size: var(--font-size-base);
}

.templates-main-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.view-controls {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    flex-wrap: wrap;
}

.search-box {
    position: relative;
    flex: 1;
    min-width: 200px;
    max-width: 300px;
}

.view-toggle {
    display: flex;
    gap: var(--spacing-xs);
    background: var(--bg-elevated);
    border-radius: var(--radius-md);
    padding: var(--spacing-2xs);
}

.search-box i {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
}

.search-box input {
    width: 100%;
    padding: var(--spacing-xs) var(--spacing-sm) var(--spacing-xs) 2.25rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: var(--font-size-sm);
    transition: all var(--transition-normal);
    height: 32px;
    box-sizing: border-box;
}

.search-box input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px rgb(0 167 225 / 10%);
}

.templates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--spacing-md);
}

.templates-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.template-list-item {
    margin-bottom: 0;
}

.template-list-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-sm) var(--spacing-md);
}

.template-media-small {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    overflow: hidden;
    flex-shrink: 0;
    background: var(--bg-elevated);
    display: flex;
    align-items: center;
    justify-content: center;
}

.template-media-small img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.template-placeholder-small {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-elevated);
    color: var(--text-secondary);
}

.template-placeholder-small i {
    font-size: 1.5rem;
}

.template-actions {
    flex-shrink: 0;
}



.template-media {
    height: 140px;
    background: var(--bg-elevated);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.template-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.template-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-elevated);
    color: var(--text-secondary);
}

.template-placeholder i {
    font-size: 3rem;
}

.template-info {
    flex: 1;
}

.template-name {
    margin: 0 0 var(--spacing-xs);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    line-height: 1.3;
}

.template-description {
    margin: 0 0 var(--spacing-sm);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.4;
}

.template-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    gap: var(--spacing-sm);
}

.template-price {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--accent);
    font-weight: 500;
}

.template-date {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.loading-state,
.no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
    text-align: center;
    color: var(--text-secondary);
}

.no-results i {
    font-size: 2rem;
}

.loading-state-panel,
.no-results-panel {
    margin-bottom: 2rem;
}

/* Payment Modal Styles */
.payment-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 50%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
    backdrop-filter: blur(5px);
}

.payment-modal {
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow: hidden;
}

.payment-modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
}

.template-summary {
    margin-bottom: 1.5rem;
}

.template-preview {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
}

.template-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.template-preview .template-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-elevated);
    color: var(--text-secondary);
}

.template-preview .template-placeholder i {
    font-size: 2rem;
}

.template-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.template-details h5 {
    margin: 0 0 0.5rem;
    font-weight: 600;
    color: var(--text-primary);
}

.template-details p {
    margin: 0 0 0.5rem;
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.template-price-display {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.template-price-display .price {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--accent);
}

.payment-form-panel {
    margin-top: 1rem;
}

.secure-payment {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.secure-payment i {
    color: var(--accent);
}

.stripe-card-element {
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg-surface);
    min-height: 40px;
    transition: all 0.2s;
}

.stripe-card-element:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px rgb(0 167 225 / 10%);
}

.payment-status {
    text-align: center;
    margin-bottom: 1rem;
    padding: 0.5rem;
    border-radius: 8px;
    background: rgb(255 255 255 / 10%);
}

.payment-status i {
    font-size: 1.5rem;
    margin-right: 0.5rem;
}

.payment-status .text-success {
    font-size: 1rem;
    font-weight: 600;
    color: var(--success);
}

.payment-status .text-info {
    font-size: 1rem;
    font-weight: 500;
    color: var(--accent);
}

.payment-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1rem;
}

.alert {
    border-radius: 8px;
    margin-bottom: 1rem;
}

/* Responsive adjustments */
@media (width <= 768px) {
    .browse-templates {
        padding: 1rem;
    }

    .view-controls {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .search-box {
        width: 100%;
    }

    .view-toggle {
        justify-content: center;
    }

    .templates-content {
        padding: 0.5rem;
    }

    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
    }

    .section-title {
        width: 100%;
        justify-content: flex-start;
    }

    .section-count {
        align-self: flex-end;
    }

    .template-list-content {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .template-actions {
        align-self: stretch;
    }

    .template-actions .base-button {
        width: 100%;
    }

    .templates-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .payment-modal {
        width: 95%;
        margin: 1rem;
    }

    .payment-modal-body {
        padding: 1rem;
    }

    .template-summary {
        flex-direction: column;
        text-align: center;
    }

    .template-preview {
        width: 100px;
        height: 100px;
        margin: 0 auto;
    }

    .payment-actions {
        flex-direction: column;
    }
}

/* Carousel Styles */
.preview-image-container.has-multiple {
    padding: var(--spacing-sm);
    flex-direction: column;
    gap: var(--spacing-md);
    background: #f8f9fa; /* Light grey background for document feel */
}

/* Dark mode adjustment */
[data-bs-theme="dark"] .preview-image-container.has-multiple {
    background: #1a1d20;
}

.carousel-main {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    flex: 1;
}

.image-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.image-wrapper img {
    max-height: 500px;
    max-width: 100%;
    object-fit: contain;
    box-shadow: var(--shadow-lg); /* Elevate the "page" */
    border-radius: var(--radius-sm);
}

.carousel-nav {
    background: var(--bg-elevated);
    border: 1px solid var(--border-color);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    z-index: 2;
    color: var(--text-primary);
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    backdrop-filter: blur(4px);
    box-shadow: var(--shadow-md);
}

.carousel-nav:hover {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
    transform: translateY(-50%) scale(1.1);
}

.carousel-nav.prev {
    left: var(--spacing-sm);
}

.carousel-nav.next {
    right: var(--spacing-sm);
}

.carousel-thumbnails {
    display: flex;
    gap: var(--spacing-sm);
    overflow-x: auto;
    padding: var(--spacing-xs);
    max-width: 100%;
    scrollbar-width: thin;
}

.thumbnail-item {
    width: 60px;
    height: 80px; /* Document aspect ratio */
    border-radius: var(--radius-sm);
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s;
    flex-shrink: 0;
    opacity: 0.7;
}

.thumbnail-item:hover {
    opacity: 1;
    transform: translateY(-2px);
}

.thumbnail-item.active {
    border-color: var(--accent);
    opacity: 1;
    box-shadow: var(--shadow-md);
}

.thumbnail-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>
