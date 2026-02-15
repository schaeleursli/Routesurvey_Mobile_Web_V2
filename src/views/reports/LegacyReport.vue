<template>
    <div class="reporting">
        <div class="alert alert-warning m-2 text-center" role="alert">
            <strong>DEPRECATED:</strong> This legacy editor is scheduled for removal. Please use the new Route Report builder.
        </div>
        <div class="editor-layout">
            <!-- Sidebar -->
            <BasePanel class="editor-sidebar" elevation="level1" :scrollable="true">
                <div class="sidebar-tabs">
                    <BaseButton :variant="sidebarTab === 'blocks' ? 'primary' : 'ghost'" size="medium"
                        leftIcon="bi bi-puzzle" @click="sidebarTab = 'blocks'">
                        {{ t('blocks') }}
                    </BaseButton>
                    <BaseButton :variant="sidebarTab === 'templates' ? 'primary' : 'ghost'" size="medium"
                        leftIcon="bi bi-file-earmark-text" @click="sidebarTab = 'templates'">
                        {{ $t('templates') }}
                    </BaseButton>
                </div>
                <div v-if="sidebarTab === 'blocks'" class="sidebar-content blocks-tab">
                    <div class="sidebar-group">
                        <div class="sidebar-group-title">{{ t('routeInfo') }}</div>
                        <BaseButton v-for="block in routeVariables" :key="block.title" variant="ghost" size="medium"
                            class="sidebar-block" @click="insertVariableText(block.value)">
                            <template #leftIcon>
                                <i class="bi bi-plus-circle"></i>
                            </template>
                            <div class="block-content">
                                <div class="block-title">{{ block.title }}</div>
                                <div class="block-description">{{ block.description }}</div>
                            </div>
                        </BaseButton>
                    </div>
                    <div class="sidebar-group">
                        <div class="sidebar-group-title">{{ t('pointInfo') }}</div>
                        <BaseButton v-for="block in pointVariables" :key="block.title" variant="ghost" size="medium"
                            class="sidebar-block" @click="insertVariableText(block.value)">
                            <template #leftIcon>
                                <i class="bi bi-plus-circle"></i>
                            </template>
                            <div class="block-content">
                                <div class="block-title">{{ block.title }}</div>
                                <div class="block-description">{{ block.description }}</div>
                            </div>
                        </BaseButton>
                    </div>
                    <div class="sidebar-group">
                        <div class="sidebar-group-title">{{ t('userCompanyInfo') }}</div>
                        <BaseButton v-for="block in userVariables" :key="block.title" variant="ghost" size="medium"
                            class="sidebar-block" @click="insertVariableText(block.value)">
                            <template #leftIcon>
                                <i class="bi bi-plus-circle"></i>
                            </template>
                            <div class="block-content">
                                <div class="block-title">{{ block.title }}</div>
                                <div class="block-description">{{ block.description }}</div>
                            </div>
                        </BaseButton>
                    </div>
                    <div class="sidebar-group">
                        <div class="sidebar-group-title">{{ t('dateTime') }}</div>
                        <BaseButton v-for="block in dateVariables" :key="block.title" variant="ghost" size="medium"
                            class="sidebar-block" @click="insertVariableText(block.value)">
                            <template #leftIcon>
                                <i class="bi bi-plus-circle"></i>
                            </template>
                            <div class="block-content">
                                <div class="block-title">{{ block.title }}</div>
                                <div class="block-description">{{ block.description }}</div>
                            </div>
                        </BaseButton>
                    </div>
                    <div class="sidebar-group">
                        <div class="sidebar-group-title">{{ t('formattingLayout') }}</div>
                        <BaseButton v-for="block in formattingVariables" :key="block.title" variant="ghost"
                            size="medium" class="sidebar-block" @click="insertVariableText(block.value)">
                            <template #leftIcon>
                                <i class="bi bi-plus-circle"></i>
                            </template>
                            <div class="block-content">
                                <div class="block-title">{{ block.title }}</div>
                                <div class="block-description">{{ block.description }}</div>
                            </div>
                        </BaseButton>
                    </div>
                </div>
                <div v-else class="sidebar-content templates-tab">
                    <!-- <div class="sidebar-group-title">{{ $t('templates') }}</div> -->
                    <div v-if="templates.length === 0" class="sidebar-placeholder">{{ t('noTemplatesFound') }}</div>
                    <div v-else class="templates-list">
                        <BaseCard v-for="template in templates" :key="template.id" variant="default" interactive hover
                            class="template-card-sidebar" @click="insertTemplate(template)">
                            <div class="template-card-title">{{ template.name }}</div>
                            <div class="template-card-desc">{{ template.description }}</div>
                        </BaseCard>
                    </div>
                </div>
            </BasePanel>
            <!-- Editor Area -->
            <BasePanel class="editor-main" elevation="level1">
                <div class="editor-header">
                    <input v-model="reportTitle" class="editor-title-input" :placeholder="t('reportTitle')" disabled />
                    <div class="editor-actions">
                        <BaseButton variant="secondary" leftIcon="bi bi-arrow-left" @click="goBack">
                            {{ $t('back') }}
                        </BaseButton>
                        <BaseButton variant="primary" leftIcon="bi bi-save" @click="handleSave" :disabled="!hasChanges">
                            {{ $t('save') }}
                        </BaseButton>
                        <BaseButton variant="ghost" leftIcon="bi bi-eye" @click="previewReport(selectedRoute.id)">
                            {{ $t('preview') }}
                        </BaseButton>
                        <BaseButton variant="primary" leftIcon="bi bi-file-earmark-arrow-down" @click="handleGenerate">
                            {{ t('generate') }}
                        </BaseButton>
                    </div>
                </div>
                <div class="editor-container">
                    <div class="editor-toolbar">
                        <div class="toolbar-group">
                            <BaseButton @click="undo" :disabled="!canUndo" variant="ghost" size="small"
                                :title="t('undo') + ' (Ctrl+Z)'">
                                <i class="bi bi-arrow-counterclockwise"></i>
                            </BaseButton>
                            <BaseButton @click="redo" :disabled="!canRedo" variant="ghost" size="small"
                                :title="t('redo') + ' (Ctrl+Y)'">
                                <i class="bi bi-arrow-clockwise"></i>
                            </BaseButton>
                        </div>
                        <div class="toolbar-group">
                            <BaseButton @click="insertHeader(1)" variant="ghost" size="small" title="H1">
                                <i class="bi bi-type-h1"></i>
                            </BaseButton>
                            <BaseButton @click="insertHeader(2)" variant="ghost" size="small" title="H2">
                                <i class="bi bi-type-h2"></i>
                            </BaseButton>
                            <BaseButton @click="insertHeader(3)" variant="ghost" size="small" title="H3">
                                <i class="bi bi-type-h3"></i>
                            </BaseButton>
                            <BaseButton @click="insertHeader(4)" variant="ghost" size="small" title="H4">
                                <i class="bi bi-type-h4"></i>
                            </BaseButton>
                        </div>
                        <div class="toolbar-group">
                            <BaseButton @click="insertBold" variant="ghost" size="small"
                                :title="t('bold') + ' (Ctrl+B)'">
                                <i class="bi bi-type-bold"></i>
                            </BaseButton>
                            <BaseButton @click="insertItalic" variant="ghost" size="small"
                                :title="t('italic') + ' (Ctrl+I)'">
                                <i class="bi bi-type-italic"></i>
                            </BaseButton>
                            <BaseButton @click="insertStrikethrough" variant="ghost" size="small"
                                :title="t('strikethrough')">
                                <i class="bi bi-type-strikethrough"></i>
                            </BaseButton>
                            <BaseButton @click="insertUnderline" variant="ghost" size="small"
                                :title="t('underline') + ' (Ctrl+U)'">
                                <i class="bi bi-type-underline"></i>
                            </BaseButton>
                            <BaseButton @click="insertSubscript" variant="ghost" size="small" :title="t('subscript')">
                                <i class="bi bi-subscript"></i>
                            </BaseButton>
                            <BaseButton @click="insertSuperscript" variant="ghost" size="small"
                                :title="t('superscript')">
                                <i class="bi bi-superscript"></i>
                            </BaseButton>
                        </div>
                        <div class="toolbar-group">
                            <BaseButton @click="insertList('unordered')" variant="ghost" size="small"
                                :title="t('bulletList')">
                                <i class="bi bi-list-ul"></i>
                            </BaseButton>
                            <BaseButton @click="insertList('ordered')" variant="ghost" size="small"
                                :title="t('numberedList')">
                                <i class="bi bi-list-ol"></i>
                            </BaseButton>
                            <BaseButton @click="insertChecklist" variant="ghost" size="small" :title="t('checklist')">
                                <i class="bi bi-check2-square"></i>
                            </BaseButton>
                            <BaseButton @click="insertTaskList" variant="ghost" size="small" :title="t('taskList')">
                                <i class="bi bi-list-task"></i>
                            </BaseButton>
                            <BaseButton @click="indentList" variant="ghost" size="small" :title="t('indentList')">
                                <i class="bi bi-indent"></i>
                            </BaseButton>
                            <BaseButton @click="outdentList" variant="ghost" size="small" :title="t('outdentList')">
                                <i class="bi bi-outdent"></i>
                            </BaseButton>
                        </div>
                        <div class="toolbar-group">
                            <BaseButton @click="insertTable" variant="ghost" size="small" :title="t('table')">
                                <i class="bi bi-table"></i>
                            </BaseButton>
                            <BaseButton @click="insertImage" variant="ghost" size="small" :title="t('image')">
                                <i class="bi bi-image"></i>
                            </BaseButton>
                            <BaseButton @click="insertLink" variant="ghost" size="small"
                                :title="t('link') + ' (Ctrl+K)'">
                                <i class="bi bi-link-45deg"></i>
                            </BaseButton>
                            <BaseButton @click="insertHorizontalRule" variant="ghost" size="small"
                                :title="t('horizontalRule')">
                                <i class="bi bi-dash-lg"></i>
                            </BaseButton>
                        </div>
                        <div class="toolbar-group">
                            <BaseButton @click="insertCode" variant="ghost" size="small" :title="t('codeBlock')">
                                <i class="bi bi-code-square"></i>
                            </BaseButton>
                            <BaseButton @click="insertInlineCode" variant="ghost" size="small" :title="t('inlineCode')">
                                <i class="bi bi-code"></i>
                            </BaseButton>
                            <BaseButton @click="insertQuote" variant="ghost" size="small" :title="t('quote')">
                                <i class="bi bi-quote"></i>
                            </BaseButton>
                            <BaseButton @click="insertDivider" variant="ghost" size="small" :title="t('divider')">
                                <i class="bi bi-dash"></i>
                            </BaseButton>
                        </div>
                        <div class="toolbar-group">
                            <BaseButton @click="alignText('left')" variant="ghost" size="small" :title="t('alignLeft')">
                                <i class="bi bi-text-left"></i>
                            </BaseButton>
                            <BaseButton @click="alignText('center')" variant="ghost" size="small"
                                :title="t('alignCenter')">
                                <i class="bi bi-text-center"></i>
                            </BaseButton>
                            <BaseButton @click="alignText('right')" variant="ghost" size="small"
                                :title="t('alignRight')">
                                <i class="bi bi-text-right"></i>
                            </BaseButton>
                            <BaseButton @click="alignText('justify')" variant="ghost" size="small"
                                :title="t('justify')">
                                <i class="bi bi-justify"></i>
                            </BaseButton>
                        </div>
                        <div class="toolbar-group">
                            <BaseButton @click="insertTextColor" variant="ghost" size="small" :title="t('textColor')">
                                <i class="bi bi-palette"></i>
                            </BaseButton>
                            <BaseButton @click="insertBackgroundColor" variant="ghost" size="small"
                                :title="t('backgroundColor')">
                                <i class="bi bi-palette-fill"></i>
                            </BaseButton>
                            <BaseButton @click="insertHighlight" variant="ghost" size="small" :title="t('highlight')">
                                <i class="bi bi-marker"></i>
                            </BaseButton>
                            <BaseButton @click="insertFontSize" variant="ghost" size="small" :title="t('fontSize')">
                                <i class="bi bi-type"></i>
                            </BaseButton>
                        </div>
                    </div>
                    <div class="editor-content">
                        <div class="editor-wrapper">
                            <textarea v-model="content" class="markdown-editor" :placeholder="t('startYourReportHere')"
                                @input="handleInput" @keydown.tab.prevent="handleTab"
                                @keydown="handleKeyDown"></textarea>
                            <div class="editor-status" v-if="lastSaved">
                                {{ t('lastSaved') }}: {{ formatDate(lastSaved) }}
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Preview Modal -->
                <div v-if="showPreview" class="modal-backdrop preview-fullscreen" @click="showPreview = false">
                    <div class="modal-content preview-modal-fullscreen" @click.stop>
                        <div class="modal-header">
                            <h5 class="modal-title">{{ t('reportPreview') }}</h5>
                            <div class="preview-actions">
                                <BaseButton variant="ghost" size="small" @click="showPreview = false">
                                    <i class="bi bi-x-lg"></i>
                                </BaseButton>
                            </div>
                        </div>
                        <div class="modal-body">
                            <div class="preview-content" v-html="previewContent"></div>
                        </div>
                        <div class="modal-footer">
                            <BaseButton variant="secondary" leftIcon="bi bi-x-lg" @click="showPreview = false">
                                {{ $t('close') }}
                            </BaseButton>
                        </div>
                    </div>
                </div>
            </BasePanel>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import { useReportEditor } from '@/composables/useReportEditor';
import RoutesController from '@/controllers/routes/routes_controller';
import { useRoute, useRouter } from 'vue-router';
import { BasePanel, BaseCard, BaseButton } from '@/components/ui';

// Inject global functions
const showMessage = inject('showMessage');
const setGlobalLoading = inject('setGlobalLoading');
const router = useRouter();
const route = useRoute();

// Editor logic from composable
const {
    routeVariables,
    pointVariables,
    userVariables,
    dateVariables,
    formattingVariables,
    content,
    lastSaved,
    showPreview,
    previewContent,
    hasChanges,
    canUndo,
    canRedo,
    undo,
    redo,
    insertHeader,
    insertBold,
    insertItalic,
    insertStrikethrough,
    insertUnderline,
    insertSubscript,
    insertSuperscript,
    insertList,
    insertChecklist,
    insertTaskList,
    indentList,
    outdentList,
    insertTable,
    insertImage,
    insertLink,
    insertHorizontalRule,
    insertCode,
    insertInlineCode,
    insertQuote,
    insertDivider,
    alignText,
    insertTextColor,
    insertBackgroundColor,
    insertHighlight,
    insertFontSize,
    insertVariableText,
    previewReport,
    saveReport,
    generateReport,
    loadSavedReport,
    handleInput,
    handleTab,
    handleKeyDown,
    // Template functionality
    templates,
    loadTemplates,
    insertTemplate,
} = useReportEditor();

const selectedRoute = ref(null);
const reportTitle = ref('');
const sidebarTab = ref('templates');

// Fallback translations for missing keys
const t = (key) => {
    const translations = {
        blocks: 'Blocks',
        routeInfo: 'Route Info',
        pointInfo: 'Point Info',
        userCompanyInfo: 'User/Company Info',
        dateTime: 'Date/Time',
        formattingLayout: 'Formatting/Layout',
        noTemplatesFound: 'No templates found.',
        reportTitle: 'Report Title',
        back: 'Back',
        save: 'Save',
        preview: 'Preview',
        generate: 'Generate',
        undo: 'Undo',
        redo: 'Redo',
        bold: 'Bold',
        italic: 'Italic',
        strikethrough: 'Strikethrough',
        underline: 'Underline',
        subscript: 'Subscript',
        superscript: 'Superscript',
        bulletList: 'Bullet List',
        numberedList: 'Numbered List',
        checklist: 'Checklist',
        taskList: 'Task List',
        indentList: 'Indent List',
        outdentList: 'Outdent List',
        table: 'Table',
        image: 'Image',
        link: 'Link',
        horizontalRule: 'Horizontal Rule',
        codeBlock: 'Code Block',
        inlineCode: 'Inline Code',
        quote: 'Quote',
        divider: 'Divider',
        alignLeft: 'Align Left',
        alignCenter: 'Align Center',
        alignRight: 'Align Right',
        justify: 'Justify',
        textColor: 'Text Color',
        backgroundColor: 'Background Color',
        highlight: 'Highlight',
        fontSize: 'Font Size',
        startYourReportHere: 'Start your report here...',
        lastSaved: 'Last saved',
        reportPreview: 'Report Preview',
        close: 'Close',
        previous: 'Previous',
        next: 'Next',
    };

    // Try to use existing i18n translation first, fallback to our translations
    try {
        return $t(key) || translations[key] || key;
    } catch {
        return translations[key] || key;
    }
};

onMounted(async () => {
    const routeId = route.params.id;
    if (routeId) {
        setGlobalLoading(true);
        try {
            // Fetch route details
            const routeRes = await RoutesController.getRoute(routeId);
            if (routeRes.result) {
                selectedRoute.value = routeRes.data;
                reportTitle.value = routeRes.data.title + ' Report';
                
                // Load saved report content
                const result = await loadSavedReport(routeId);
                if (result.success) {
                    if (result.message === 'Report loaded successfully') {
                        showMessage({ status: 'success', message: result.message });
                    }
                } else {
                    showMessage({ status: 'error', message: result.message });
                }
            }
            
            // Load user templates
            await loadTemplates();
        } catch (error) {
            console.error('Error loading report data:', error);
            showMessage({ status: 'error', message: 'Error loading report' });
        } finally {
            setGlobalLoading(false);
        }
    }
});

function goBack() {
    router.push('/reporting');
}

function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

// Save and generate handlers
async function handleSave() {
    if (!selectedRoute.value) return;

    setGlobalLoading(true);
    try {
        const result = await saveReport(selectedRoute.value.id);
        if (result.success) {
            showMessage({ status: 'success', message: result.message });
        } else {
            showMessage({ status: 'error', message: result.message });
        }
    } catch (error) {
        showMessage({ status: 'error', message: 'Error saving report' });
    } finally {
        setGlobalLoading(false);
    }
}

async function handleGenerate() {
    if (!selectedRoute.value) return;

    setGlobalLoading(true);
    try {
        const result = await generateReport(selectedRoute.value.id);
        if (result.success) {
            showMessage({ status: 'success', message: result.message });
            // Close preview if open
            showPreview.value = false;
            // Redirect to report generations page
            router.push(`/routes/${selectedRoute.value.id}/reports`);
        } else {
            showMessage({ status: 'error', message: result.message });
        }
    } catch (error) {
        showMessage({ status: 'error', message: 'Error generating report' });
    } finally {
        setGlobalLoading(false);
    }
}
</script>

<style scoped>
.reporting {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    color: var(--text-primary);
}
</style>
