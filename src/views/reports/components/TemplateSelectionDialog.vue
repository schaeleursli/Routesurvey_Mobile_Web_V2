<template>
    <div v-if="show" class="modal-backdrop" @click="onClose">
        <div class="modal-content template-dialog" @click.stop>
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="bi bi-file-earmark-text me-2"></i>
                    {{ $t('chooseTemplate') }}
                </h5>
                <div class="header-actions">
                    <div class="search-box">
                        <BaseFormField v-model="searchQuery" :placeholder="$t('searchTemplates')" startIcon="bi bi-search" />
                    </div>
                    <BaseButton variant="ghost" size="small" @click="onClose">
                        <i class="bi bi-x-lg"></i>
                    </BaseButton>
                </div>
            </div>
            <div class="modal-body">
                <div class="templates-grid" v-if="filteredTemplates.length > 0">
                    <div v-for="template in filteredTemplates" :key="template.id" class="template-card"
                        :class="{ 'selected': selectedTemplate?.id === template.id }" @click="selectTemplate(template)">
                        <div class="template-media">
                            <img v-if="template.media" :src="template.media" :alt="template.name" />
                            <div v-else class="template-placeholder">
                                <i class="bi bi-file-earmark-text"></i>
                            </div>
                        </div>
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
                        <div class="template-actions">
                            <!-- <button class="btn btn-primary btn-sm me-2" @click.stop="selectTemplate(template)">
                                <i class="bi bi-check-lg"></i>
                                {{ $t('select') }}
                            </button> -->
                            <BaseButton variant="danger" size="small" @click.stop="removeTemplate(template)">
                                <i class="bi bi-trash"></i>
                                {{ $t('remove') }}
                            </BaseButton>
                        </div>
                    </div>
                </div>
                <div class="no-templates" v-else
                    style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                    <p class="text-center">{{ $t('noTemplates') }} <i class="bi bi-emoji-frown"></i></p>
                    <BaseButton variant="primary" @click="$router.push('/browse-templates')">
                        {{ $t('browseTemplates') }}
                    </BaseButton>
                </div>
            </div>
            <div class="modal-footer">
                <div class="d-flex justify-content-between align-items-center w-100">
                    <div>
                        <BaseButton variant="secondary" class="me-2" @click="onClose">
                            {{ $t('cancel') }}
                        </BaseButton>
                        &nbsp;
                        <BaseButton variant="primary" :disabled="!selectedTemplate" @click="onSelect">
                            <i class="bi bi-check-lg"></i>
                            {{ $t('select') }}
                        </BaseButton>
                    </div>
                    <div>
                        <BaseButton variant="primary" @click="$router.push('/browse-templates')">
                            {{ $t('browseTemplates') }}
                        </BaseButton>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Remove Template Confirmation Dialog -->
    <div v-if="showRemoveConfirm" class="modal-backdrop" @click="cancelRemove">
        <div class="modal-content confirm-dialog" @click.stop>
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    {{ $t('confirmRemoveTemplate') }}
                </h5>
                <BaseButton variant="ghost" size="small" @click="cancelRemove">
                    <i class="bi bi-x-lg"></i>
                </BaseButton>
            </div>
            <div class="modal-body">
                <p class="confirm-message">
                    {{ $t('removeTemplateConfirmMessage') }}
                </p>
                <div class="template-preview">
                    <div class="template-media">
                        <img v-if="templateToRemove?.media" :src="templateToRemove.media"
                            :alt="templateToRemove.name" />
                        <div v-else class="template-placeholder">
                            <i class="bi bi-file-earmark-text"></i>
                        </div>
                    </div>
                    <div class="template-info">
                        <h6 class="template-name">{{ templateToRemove?.name }}</h6>
                        <p class="template-description">{{ templateToRemove?.description }}</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <BaseButton variant="secondary" @click="cancelRemove">
                    {{ $t('cancel') }}
                </BaseButton>
                <BaseButton variant="danger" @click="confirmRemove">
                    <i class="bi bi-trash"></i>
                    {{ $t('remove') }}
                </BaseButton>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import TemplatesController from '@/controllers/templates/templates_controller';

const showMessage = inject('showMessage');
const setGlobalLoading = inject('setGlobalLoading');
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseFormField from '@/components/ui/BaseFormField.vue';

const { t } = useI18n();

const props = defineProps({
    show: {
        type: Boolean,
        required: true
    },
    templates: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['close', 'select']);

const searchQuery = ref('');
const selectedTemplate = ref(null);
const showRemoveConfirm = ref(false);
const templateToRemove = ref(null);

const filteredTemplates = computed(() => {
    if (!searchQuery.value) return props.templates;

    const query = searchQuery.value.toLowerCase();
    return props.templates.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query)
    );
});

const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
};

const selectTemplate = (template) => {
    selectedTemplate.value = template;
};

const removeTemplate = (template) => {
    templateToRemove.value = template;
    showRemoveConfirm.value = true;
};

const cancelRemove = () => {
    showRemoveConfirm.value = false;
    templateToRemove.value = null;
};

const confirmRemove = async () => {
    setGlobalLoading(true);

    if (!templateToRemove.value) return;

    try {
        // console.log(templateToRemove.value);
        const res = await TemplatesController.removeUserTemplate(templateToRemove.value.id);
        // console.log(res);
        if (res.result) {
            // Remove the template from the local list
            const index = props.templates.findIndex(t => t.id === templateToRemove.value.id);
            if (index !== -1) {
                const newTemplates = [...props.templates];
                newTemplates.splice(index, 1);
                emit('close', newTemplates);
            }
            showMessage({ status: 'success', message: t('templateRemoved') });
        } else {
            showMessage({ status: 'error', message: t('templateRemoveFailed') });
        }
    } catch (error) {
        console.error('Error removing template:', error);
        showMessage({ status: 'error', message: t('templateRemoveFailed') });
    }

    cancelRemove();

    setGlobalLoading(false);
};

const onClose = () => {
    selectedTemplate.value = null;
    searchQuery.value = '';
    emit('close');
};

const onSelect = () => {
    if (selectedTemplate.value) {
        emit('select', selectedTemplate.value);
        onClose();
    }
};
</script>

<style scoped>
.template-dialog {
    max-width: 1200px;
    width: 95%;
    height: 90vh;
    max-height: 90vh;
    background: var(--bs-body-bg);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgb(0 0 0 / 15%);
    border: 1px solid var(--bs-border-color);
    display: flex;
    flex-direction: column;
    margin: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    overflow: hidden;
}

.modal-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--bs-border-color);
    background: var(--bs-tertiary-bg);
    border-radius: 16px 16px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--bs-body-color);
    display: flex;
    align-items: center;
}

.modal-title i {
    color: var(--accent);
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.search-box {
    position: relative;
    width: 300px;
}

.modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
}

.templates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    padding: 0.5rem;
    flex: 1;
}

.template-card {
    background: var(--bs-tertiary-bg);
    border: 1px solid var(--bs-border-color);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s;
    cursor: pointer;
    display: flex;
    flex-direction: column;
}

.template-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
}

.template-card.selected {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px rgb(0 174 239 / 20%);
}

.template-media {
    height: 160px;
    background: var(--bs-secondary-bg);
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
    background: var(--bs-secondary-bg);
    color: var(--bs-secondary-color);
}

.template-placeholder i {
    font-size: 3rem;
}

.template-info {
    padding: 1rem;
    flex: 1;
}

.template-name {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--bs-body-color);
}

.template-description {
    margin: 0 0 1rem;
    font-size: 0.9rem;
    color: var(--bs-secondary-color);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.template-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    color: var(--bs-secondary-color);
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

.template-actions {
    padding: 1rem;
    border-top: 1px solid var(--bs-border-color);
    display: flex;
    justify-content: flex-end;
}

.modal-footer {
    padding: 1.25rem 1.5rem;
    border-top: 1px solid var(--bs-border-color);
    background: var(--bs-tertiary-bg);
    border-radius: 0 0 16px 16px;
    display: flex;
    justify-content: center;
    gap: 1rem;
}

.confirm-dialog {
    max-width: 500px;
    width: 95%;
    background: var(--bs-body-bg);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgb(0 0 0 / 15%);
    border: 1px solid var(--bs-border-color);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.modal-header {
    text-align: center;
    justify-content: center;
    position: relative;
}

.modal-header .btn-close {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
}

.modal-title {
    text-align: center;
    width: 100%;
}

.modal-title i {
    color: var(--error);
}

.confirm-message {
    margin-bottom: 1.5rem;
    color: var(--bs-body-color);
    font-size: 1.1rem;
    line-height: 1.5;
    text-align: center;
}

.template-preview {
    background: var(--bs-tertiary-bg);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;
}

.template-preview .template-media {
    width: 120px;
    height: 120px;
    border-radius: 8px;
    overflow: hidden;
}

.template-preview .template-info {
    flex: 1;
    padding: 0;
    text-align: center;
}

.template-preview .template-name {
    margin-bottom: 0.5rem;
    font-size: 1.2rem;
}

.template-preview .template-description {
    margin-bottom: 0;
    -webkit-line-clamp: 2;
    color: var(--bs-secondary-color);
}

.modal-footer {
    justify-content: center;
    gap: 1rem;
}

@media (width <= 768px) {
    .template-dialog {
        width: 100%;
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
        margin: 0;
    }

    .modal-header {
        border-radius: 0;
        padding: 1rem;
    }

    .search-box {
        width: 200px;
    }

    .templates-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .modal-footer {
        border-radius: 0;
        padding: 1rem;
        flex-direction: column;
    }

    .btn {
        width: 100%;
    }

    .no-templates {
        padding: 1rem;
    }

    .no-templates .btn {
        width: 100%;
    }
}
</style>