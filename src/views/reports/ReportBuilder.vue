<template>
    <div class="report-builder">
        <!-- Route Selection Screen -->
        <div v-if="!selectedRoute" class="route-selection">
            <BasePanel :title="t('selectRouteToCreateReport')" elevation="level2">
                <div v-if="loadingRoutes" class="d-flex justify-content-center align-items-center p-5">
                    <BaseLoadingIndicator size="large" message="Loading routes..." />
                </div>
                <div v-else-if="paginatedRoutes.length === 0" class="p-5">
                    <BaseEmptyState 
                        icon="bi bi-map" 
                        title="No routes found" 
                        message="Please create some routes first." 
                    />
                </div>
                <div v-else>
                    <BaseTable :items="paginatedRoutes" :columns="tableColumns" :clickable="true"
                        @row-click="selectRoute">
                        <template #cell-title="{ item }">
                            <div class="route-name text-left">{{ item.title || 'Untitled Route' }}</div>
                        </template>

                        <template #cell-location="{ item }">
                            <div class="location-info">
                                <div class="location-item">
                                    <i class="bi bi-geo-alt-fill start-location"></i>
                                    <span class="text-left">{{ routeUtils.getShortAddress(item.start)
                                        || 'Start Location'
                                        }}</span>
                                </div>
                                <div class="location-item">
                                    <i class="bi bi-geo-alt-fill end-location"></i>
                                    <span class="text-left">{{ routeUtils.getShortAddress(item.end)
                                        || 'End Location'
                                        }}</span>
                                </div>
                            </div>
                        </template>

                        <template #cell-distance="{ item }">
                            <div class="distance-info">
                                <i class="bi bi-sign-turn-left"></i>
                                <span>{{ getRouteDistance(item) }}</span>
                            </div>
                        </template>

                        <template #cell-status="{ item }">
                            <span class="status-badge" :class="getStatusClass(item.status)">
                                {{ getStatusText(item) }}
                            </span>
                        </template>

                        <template #cell-updated="{ item }">
                            <span class="update-time" v-html="routeUtils.formatDateTime(item.dateAdded)"></span>
                        </template>

                        <template #cell-actions="{ item }">
                            <div class="action-buttons">
                                <BaseButton variant="primary" size="small" @click.stop="selectRoute(item)">
                                    <i class="bi bi-file-text"></i>
                                    Create Report
                                </BaseButton>
                            </div>
                        </template>
                    </BaseTable>
                </div>
                <template #footer>
                    <BasePagination v-if="totalPages > 1 && paginatedRoutes.length > 0" :current-page="currentPage"
                        :total-pages="totalPages" :total-items="totalCount" :items-per-page="routesPerPage"
                        item-label="routes" @page-change="goToPage" />
                </template>
            </BasePanel>
        </div>

        <!-- Report Builder Interface -->
        <div v-else class="builder-layout">
            <!-- Left Panel: Report Outline -->
            <div class="outline-panel-wrapper" :class="{ 'collapsed': isOutlineCollapsed }">
                <BasePanel v-show="!isOutlineCollapsed" class="outline-panel" elevation="level1" :scrollable="true">
                    <div class="panel-header">
                        <h3>{{ t('reportOutline') }}</h3>
                        <!-- <div class="panel-header-actions">
                            <BaseButton variant="ghost" size="small" @click="selectedRoute = null"
                                title="Back to routes">
                                <i class="bi bi-arrow-left"></i>
                            </BaseButton>
                        </div> -->
                    </div>
                    <ReportOutline :sections="reportSections" :selected-block-id="selectedBlockId"
                        @select-block="selectedBlockId = $event" @toggle-visibility="toggleSectionVisibility"
                        @toggle-collapse="toggleSectionCollapse" @reorder-sections="handleReorderSections" />

                    <div class="appendices-panel mt-3 border-top pt-3 mx-2">
                        <div class="panel-header d-flex justify-content-between align-items-center mb-2">
                            <h4 class="mb-0 fs-6">Appendices (PDF)</h4>
                            <BaseButton variant="ghost" size="small" @click="triggerAppendixUpload">
                                <i class="bi bi-plus-lg"></i>
                            </BaseButton>
                        </div>
                        <input type="file" ref="appendixFileInput" style="display: none" accept=".pdf" multiple
                            @change="handleAppendixUpload" />

                        <draggable v-model="appendices" item-key="id" handle=".appendix-handle"
                            @change="handleAppendicesReorder">
                            <template #item="{ element: appendix }">
                                <div
                                    class="appendix-item d-flex align-items-center gap-2 p-2 border rounded mb-2 bg-white small">
                                    <i class="bi bi-grip-vertical appendix-handle text-muted cursor-move"></i>
                                    <i class="bi bi-file-earmark-pdf text-danger"></i>
                                    <div class="flex-grow-1 text-truncate" :title="appendix.fileName"
                                        style="max-width: 140px;">
                                        {{ appendix.fileName }}
                                    </div>
                                    <div class="form-check form-switch m-0" title="Include in ToC">
                                        <input class="form-check-input" type="checkbox"
                                            v-model="appendix.includeInToc"
                                            @change="updateAppendix(appendix.id, { includeInToc: appendix.includeInToc })">
                                    </div>
                                    <BaseButton variant="ghost" size="small" class="text-danger p-0"
                                        @click="removeAppendix(appendix.id)">
                                        <i class="bi bi-x"></i>
                                    </BaseButton>
                                </div>
                            </template>
                        </draggable>
                        <div v-if="appendices.length === 0" class="text-muted small text-center py-2">
                            No appendices attached.
                        </div>
                    </div>
                </BasePanel>
            </div>

            <!-- Main Canvas: Document Editor -->
            <BasePanel class="editor-panel" elevation="level1" :scrollable="true">
                <template #header>
                    <div class="header-actions-group">
                        <BaseFormField v-model="reportTitle" class="editor-title-input" :placeholder="t('reportTitle')" />
                        <BaseFormField v-if="selectedRoute" type="select" :model-value="selectedTemplateId"
                            @update:model-value="handleTemplateSelect" :options="templateOptions"
                            :placeholder="t('selectTemplate')" class="template-selector" />
                        <span v-if="selectedRoute" class="status-badge header-status-badge"
                            :class="[getStatusClass(selectedRoute.status), { 'clickable': String(selectedRoute.status).toLowerCase() === 'reported' }]"
                            @click.stop="String(selectedRoute.status).toLowerCase() === 'reported' && handleOpenLastReport(selectedRoute)"
                            :title="String(selectedRoute.status).toLowerCase() === 'reported' ? t('clickToOpenReport') : ''">
                            {{ getStatusText(selectedRoute) }}
                        </span>
                        <div class="header-buttons-group">
                            <BaseButton variant="ghost" size="small"
                                :leftIcon="editorsLocked ? 'bi bi-lock-fill' : 'bi bi-unlock-fill'"
                                @click="handleToggleEditorsLock"
                                :title="editorsLocked ? t('unlockEditors') : t('lockEditors')"
                                :class="{ 'active': editorsLocked }">
                            </BaseButton>
                            <BaseButton variant="ghost" size="small" leftIcon="bi bi-arrow-counterclockwise"
                                @click="handleResetSections" :title="t('resetSectionsToDefault')"
                                class="reset-button-toggle">
                                Reset
                            </BaseButton>
                            <!-- <BaseButton variant="secondary" size="small" leftIcon="bi bi-arrow-left-right"
                                @click="handleBack">
                                {{ t('switch') }}
                            </BaseButton> -->
                            <!-- <BaseButton v-if="selectedRoute" variant="secondary" size="small"
                                leftIcon="bi bi-file-earmark-text" @click="navigateToGeneratedReports">
                                {{ t('viewGeneratedReports') }}
                            </BaseButton> -->
                        </div>
                    </div>
                </template>
                <template #actions-view>
                    <div class="actions-container">
                        <div class="action-row">
                            <div class="action-group">
                                <BaseButton variant="ghost" size="small" @click="undo" :disabled="!canUndo"
                                    :title="t('undo')">
                                    <i class="bi bi-arrow-counterclockwise"></i>
                                </BaseButton>
                                <BaseButton variant="ghost" size="small" @click="redo" :disabled="!canRedo"
                                    :title="t('redo')">
                                    <i class="bi bi-arrow-clockwise"></i>
                                </BaseButton>
                                <BaseButton variant="primary" size="small" leftIcon="bi bi-save" @click="handleSave"
                                    :disabled="!hasChanges">
                                    {{ t('save') }}
                                </BaseButton>
                                <BaseButton variant="ghost" size="small" leftIcon="bi bi-eye" @click="handlePreview">
                                    {{ t('preview') }}
                                </BaseButton>
                                <BaseButton variant="primary" size="small" leftIcon="bi bi-file-earmark-arrow-down"
                                    @click="handleGenerate">
                                    {{ t('generate') }}
                                </BaseButton>
                                <BaseButton v-if="selectedRoute" variant="secondary" size="small"
                                    leftIcon="bi bi-file-earmark-text" @click="navigateToGeneratedReports"
                                    :title="t('viewGeneratedReports')">
                                    {{ t('viewGeneratedReports') }}
                                </BaseButton>
                                <BaseButton variant="ghost" size="small" @click="openLayoutSettings"
                                    :title="t('layoutSettings')">
                                    <i class="bi bi-sliders"></i>
                                </BaseButton>
                            </div>
                            <div class="action-group">
                                <BaseButton variant="ghost" size="small" @click="toggleOutlinePanel"
                                    :class="{ 'active': !isOutlineCollapsed }">
                                    <i class="bi bi-list-ul"></i>
                                    <span>{{ t('outline') }}</span>
                                </BaseButton>
                                <BaseButton variant="ghost" size="small" @click="toggleLibraryPanel"
                                    :class="{ 'active': !isLibraryCollapsed }">
                                    <i class="bi bi-puzzle"></i>
                                    <span>{{ t('library') }}</span>
                                </BaseButton>
                            </div>
                        </div>
                    </div>
                </template>
                <div class="editor-content" @drop="handleDrop" @dragover="handleContentDragOver">
                    <draggable :list="reportSections" :item-key="(item) => item.id" ghost-class="ghost-section"
                        chosen-class="chosen-section" drag-class="drag-section" @change="handleSectionsReorder"
                        handle=".section-drag-handle" class="sections-container">
                        <template #item="{ element: section }">
                            <BasePanel v-show="section.visible" elevation="level1" class="editor-section"
                                :data-section-id="section.id">
                                <template #header>
                                    <div class="section-header-content" @click.stop="toggleSectionCollapse(section.id)">
                                        <div class="section-header-left">
                                            <i class="bi section-collapse-icon"
                                                :class="section.collapsed ? 'bi-chevron-right' : 'bi-chevron-down'"></i>
                                            <i class="bi bi-grip-vertical section-drag-handle"></i>
                                            <span v-if="editingSectionId !== section.id" class="section-title-text"
                                                @dblclick.stop="startEditingSection(section.id, section.title)">
                                                {{ section.title }}
                                            </span>
                                            <input v-else v-model="editingSectionTitle"
                                                @blur="finishEditingSection(section.id)"
                                                @keyup.enter="finishEditingSection(section.id)"
                                                @keyup.esc="cancelEditingSection" class="section-title-input"
                                                @click.stop ref="sectionTitleInputRef" />
                                        </div>
                                        <div class="section-header-actions">
                                            <BaseButton v-if="editingSectionId !== section.id" variant="ghost"
                                                size="small"
                                                @click.stop="startEditingSection(section.id, section.title)"
                                                :title="t('renameSection')">
                                                <i class="bi bi-pencil"></i>
                                            </BaseButton>
                                            <BaseButton variant="ghost" size="small"
                                                @click.stop="handleRemoveSection(section.id)"
                                                :title="t('removeSection')" v-if="section.id !== 'section-cover'">
                                                <i class="bi bi-trash"></i>
                                            </BaseButton>
                                        </div>
                                    </div>
                                </template>
                                <div v-if="!section.collapsed">
                                    <draggable :list="section.blocks" :item-key="(item) => item.id"
                                        ghost-class="ghost-block" chosen-class="chosen-block" drag-class="drag-block"
                                        @change="(event) => handleSectionBlocksReorder(section.id, event)"
                                        @start="handleDragStart" @end="handleDragEnd" class="section-blocks-container"
                                        @drop="handleDrop" @dragover.prevent>
                                        <template #item="{ element: block }">
                                            <div class="report-block-wrapper" :data-block-id="block.id" :class="{
                                                'selected': selectedBlockId === block.id
                                            }" @click="selectedBlockId = block.id">
                                                <ReportBlock :block="block" :route-data="routeData"
                                                    :route-id="selectedRoute?.id || null"
                                                    :table-config="tableConfigs[block.id]"
                                                    :editors-locked="isSectionLocked(section.id)"
                                                    @update-content="updateBlockContent(block.id, $event)"
                                                    @update-table-config="updateTableConfig(block.id, $event)"
                                                    @remove="removeBlock(block.id)"
                                                    @loop-drop="handleLoopDropFromEditor" />
                                            </div>
                                        </template>
                                    </draggable>
                                    <div v-if="section.blocks.length === 0" class="empty-section-placeholder"
                                        @drop="handleDrop" @dragover.prevent>
                                        <p class="empty-section-text">{{ t('dragBlocksHere') }}</p>
                                    </div>
                                </div>
                            </BasePanel>
                        </template>
                    </draggable>
                    <div v-if="reportBlocks.length === 0" class="empty-canvas" @drop="handleDrop" @dragover.prevent>
                        <p>{{ t('dragBlocksHere') }}</p>
                    </div>
                    <div class="add-section-container">
                        <BaseButton variant="ghost" size="small" @click="showAddSectionModal = true"
                            leftIcon="bi bi-plus-circle">
                            {{ t('addSection') }}
                        </BaseButton>
                    </div>

                    <!-- Header Section -->
                    <BasePanel elevation="level1" class="header-footer-section" v-if="reportHeader || true">
                        <template #header>
                            <div class="section-header-content">
                                <i class="bi bi-layout-top"></i>
                                <span class="section-title-text">Header</span>
                                <div class="section-header-actions">
                                    <BaseButton variant="ghost" size="small" @click.stop="handleClearHeader"
                                        :title="t('removeHeader')">
                                        <i class="bi bi-trash"></i>
                                    </BaseButton>
                                </div>
                            </div>
                        </template>
                        <div class="header-footer-content">
                            <RichTextEditorCustom v-model="reportHeader" @update:modelValue="updateHeader"
                                :route-id="selectedRoute?.id || null" :locked="editorsLocked"
                                placeholder="Enter header content (appears on all pages)..." />
                        </div>
                    </BasePanel>

                    <!-- Footer Section -->
                    <BasePanel elevation="level1" class="header-footer-section" v-if="reportFooter || true">
                        <template #header>
                            <div class="section-header-content">
                                <i class="bi bi-layout-bottom"></i>
                                <span class="section-title-text">Footer</span>
                                <div class="section-header-actions">
                                    <BaseButton variant="ghost" size="small" @click.stop="handleClearFooter"
                                        :title="t('removeFooter')">
                                        <i class="bi bi-trash"></i>
                                    </BaseButton>
                                </div>
                            </div>
                        </template>
                        <div class="header-footer-content">
                            <RichTextEditorCustom v-model="reportFooter" @update:modelValue="updateFooter"
                                :route-id="selectedRoute?.id || null" :locked="editorsLocked"
                                placeholder="Enter footer content (appears on all pages)..." />
                        </div>
                    </BasePanel>
                </div>
                <div class="editor-status" v-if="lastSaved">
                    {{ t('lastSaved') }}: {{ formatDate(lastSaved) }}
                </div>
            </BasePanel>

            <!-- Right Panel: Block Library -->
            <div class="library-panel-wrapper" :class="{ 'collapsed': isLibraryCollapsed }">
                <BasePanel v-show="!isLibraryCollapsed" class="library-panel" elevation="level1" :scrollable="true">
                    <div class="panel-header">
                        <h3>{{ t('blockLibrary') }}</h3>
                    </div>
                    <BlockLibrary @insert-block="handleInsertBlock" @edit-loop="handleEditLoop"
                        @edit-row="handleEditRow" />
                </BasePanel>
            </div>
        </div>

        <!-- Loop Body Editor Modal -->
        <LoopBodyEditor :show="showLoopEditor" :loop-type="loopEditorType" :route-id="selectedRoute?.id || null"
            @confirm="handleLoopConfirm" @cancel="handleLoopCancel" />

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
                        {{ t('close') }}
                    </BaseButton>
                </div>
            </div>
        </div>

        <!-- Reset Sections Confirmation Modal -->
        <BaseConfirmationModal :visible="showResetModal" :title="t('resetSectionsToDefault')"
            :message="t('confirmResetSections')" icon="bi bi-exclamation-triangle" icon-color="var(--error)"
            :show-danger-button="true" :show-primary-button="false" :danger-text="t('reset')"
            danger-icon="bi bi-arrow-counterclockwise" @close="showResetModal = false" @cancel="showResetModal = false"
            @confirm="confirmResetSections" />

        <!-- Unsaved Changes Warning Modal -->
        <BaseConfirmationModal :visible="showUnsavedChangesModal" :title="t('unsavedChanges')"
            :message="t('unsavedChangesWarning') || t('unsavedChangesWarningMessage') || 'You have unsaved changes. Do you want to save before leaving?'"
            icon="bi bi-exclamation-triangle" icon-color="var(--warning)" :show-danger-button="true"
            :show-primary-button="true" :danger-text="t('leaveWithoutSaving') || 'Leave Without Saving'"
            :primary-text="t('save')" :loading="isSaving" :primary-loading="isSaving" :primary-disabled="isSaving"
            @close="cancelLeave" @cancel="cancelLeave" @confirm="confirmLeaveWithoutSaving"
            @primary="handleSaveAndLeave" />

        <!-- Add Section Modal -->
        <div v-if="showAddSectionModal" class="modal-backdrop" @click="showAddSectionModal = false">
            <div class="modal-content add-section-modal" @click.stop>
                <div class="modal-header">
                    <h5 class="modal-title">{{ t('addSection') }}</h5>
                    <BaseButton variant="ghost" size="small" @click="showAddSectionModal = false">
                        <i class="bi bi-x-lg"></i>
                    </BaseButton>
                </div>
                <div class="modal-body">
                    <div class="section-type-selection">
                        <div class="section-type-option">
                            <h6>{{ t('defaultSections') }}</h6>
                            <div class="section-templates">
                                <BaseButton variant="ghost" v-for="template in availableSectionTemplates" :key="template.id"
                                    class="section-template-btn" @click="handleAddDefaultSection(template.id)">
                                    <template #default>
                                        <div class="d-flex flex-column align-items-center gap-2">
                                            <i class="bi bi-file-text"></i>
                                            <span>{{ template.title }}</span>
                                        </div>
                                    </template>
                                </BaseButton>
                            </div>
                        </div>
                        <div class="section-type-divider">
                            <span>{{ t('or') }}</span>
                        </div>
                        <div class="section-type-option">
                            <h6>{{ t('customSection') }}</h6>
                            <div class="custom-section-input">
                                <BaseFormField v-model="newSectionTitle" :placeholder="t('sectionTitle')"
                                    @keyup.enter="handleAddCustomSection" />
                                <BaseButton variant="primary" size="small" @click="handleAddCustomSection"
                                    :disabled="!newSectionTitle || newSectionTitle.trim() === ''">
                                    {{ t('add') }}
                                </BaseButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Layout Settings Modal -->
        <div v-if="showLayoutSettingsModal" class="modal-backdrop" @click="showLayoutSettingsModal = false">
            <div class="modal-content layout-settings-modal" @click.stop>
                <div class="modal-header">
                    <h5 class="modal-title">{{ t('layoutSettings') }}</h5>
                    <BaseButton variant="ghost" size="small" @click="showLayoutSettingsModal = false">
                        <i class="bi bi-x-lg"></i>
                    </BaseButton>
                </div>
                <div class="modal-body">
                    <BaseTabGroup v-model="activeLayoutTab" :tabs="layoutTabs">
                        <!-- Page Tab -->
                        <div v-if="activeLayoutTab === 'page'" class="layout-tab-content">
                            <div class="layout-section">
                                <h6 class="section-title">{{ t('pageMargins') }}</h6>
                                <p class="section-description">{{ t('pageMarginsDescription') }}</p>

                                <!-- Box Model Visualization -->
                                <div class="box-model-visualization">
                                    <div class="box-model-lock-controls">
                                        <BaseButton variant="ghost" class="lock-button"
                                            :class="{ 'locked': isLocked('page', 'topBottom') }"
                                            @click="toggleLock('page', 'topBottom')"
                                            :title="isLocked('page', 'topBottom') ? t('unlockTopBottom') : t('lockTopBottom')">
                                            <i
                                                :class="isLocked('page', 'topBottom') ? 'bi bi-lock-fill' : 'bi bi-unlock'"></i>
                                            <span>{{ t('topBottom') }}</span>
                                        </BaseButton>
                                        <BaseButton variant="ghost" class="lock-button"
                                            :class="{ 'locked': isLocked('page', 'leftRight') }"
                                            @click="toggleLock('page', 'leftRight')"
                                            :title="isLocked('page', 'leftRight') ? t('unlockLeftRight') : t('lockLeftRight')">
                                            <i
                                                :class="isLocked('page', 'leftRight') ? 'bi bi-lock-fill' : 'bi bi-unlock'"></i>
                                            <span>{{ t('leftRight') }}</span>
                                        </BaseButton>
                                    </div>
                                    <div class="box-model-container" :style="{
                                        paddingTop: pageMarginVisualization.margin.top + 'px',
                                        paddingRight: pageMarginVisualization.margin.right + 'px',
                                        paddingBottom: pageMarginVisualization.margin.bottom + 'px',
                                        paddingLeft: pageMarginVisualization.margin.left + 'px'
                                    }">
                                        <div class="box-model-content">
                                            <div v-if="editingField !== 'page-margin-top'"
                                                class="box-model-label box-model-label-top editable-label"
                                                @click="startEditing('page-margin-top')">
                                                {{ layoutMargin.top }}
                                            </div>
                                            <input v-else v-model="layoutMargin.top"
                                                @blur="finishEditing('page-margin-top', layoutMargin.top)"
                                                @keyup.enter="finishEditing('page-margin-top', layoutMargin.top)"
                                                @keyup.esc="cancelEditing"
                                                class="box-model-label box-model-label-top editable-input" @click.stop
                                                ref="editingInputRef" autofocus />
                                            <div v-if="editingField !== 'page-margin-right'"
                                                class="box-model-label box-model-label-right editable-label"
                                                @click="startEditing('page-margin-right')">
                                                {{ layoutMargin.right }}
                                            </div>
                                            <input v-else v-model="layoutMargin.right"
                                                @blur="finishEditing('page-margin-right', layoutMargin.right)"
                                                @keyup.enter="finishEditing('page-margin-right', layoutMargin.right)"
                                                @keyup.esc="cancelEditing"
                                                class="box-model-label box-model-label-right editable-input" @click.stop
                                                autofocus />
                                            <div v-if="editingField !== 'page-margin-bottom'"
                                                class="box-model-label box-model-label-bottom editable-label"
                                                @click="startEditing('page-margin-bottom')">
                                                {{ layoutMargin.bottom }}
                                            </div>
                                            <input v-else v-model="layoutMargin.bottom"
                                                @blur="finishEditing('page-margin-bottom', layoutMargin.bottom)"
                                                @keyup.enter="finishEditing('page-margin-bottom', layoutMargin.bottom)"
                                                @keyup.esc="cancelEditing"
                                                class="box-model-label box-model-label-bottom editable-input"
                                                @click.stop autofocus />
                                            <div v-if="editingField !== 'page-margin-left'"
                                                class="box-model-label box-model-label-left editable-label"
                                                @click="startEditing('page-margin-left')">
                                                {{ layoutMargin.left }}
                                            </div>
                                            <input v-else v-model="layoutMargin.left"
                                                @blur="finishEditing('page-margin-left', layoutMargin.left)"
                                                @keyup.enter="finishEditing('page-margin-left', layoutMargin.left)"
                                                @keyup.esc="cancelEditing"
                                                class="box-model-label box-model-label-left editable-input" @click.stop
                                                autofocus />
                                            <div class="box-model-content-area">
                                                <span class="box-model-content-text">{{ t('pageContent') }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Header Tab -->
                        <div v-if="activeLayoutTab === 'header'" class="layout-tab-content">
                            <!-- Box Model Visualization -->
                            <div class="layout-section">
                                <h6 class="section-title">{{ t('boxModelVisualization') }}</h6>
                                <p class="section-description">{{ t('boxModelDescription') }}</p>

                                <div class="box-model-visualization">
                                    <div class="box-model-lock-controls">
                                        <BaseButton variant="ghost" class="lock-button"
                                            :class="{ 'locked': isLocked('header', 'paddingTopBottom') }"
                                            @click="toggleLock('header', 'paddingTopBottom')"
                                            :title="isLocked('header', 'paddingTopBottom') ? t('unlockTopBottom') : t('lockTopBottom')">
                                            <i
                                                :class="isLocked('header', 'paddingTopBottom') ? 'bi bi-lock-fill' : 'bi bi-unlock'"></i>
                                            <span>P {{ t('topBottom') }}</span>
                                        </BaseButton>
                                        <BaseButton variant="ghost" class="lock-button"
                                            :class="{ 'locked': isLocked('header', 'paddingLeftRight') }"
                                            @click="toggleLock('header', 'paddingLeftRight')"
                                            :title="isLocked('header', 'paddingLeftRight') ? t('unlockLeftRight') : t('lockLeftRight')">
                                            <i
                                                :class="isLocked('header', 'paddingLeftRight') ? 'bi bi-lock-fill' : 'bi bi-unlock'"></i>
                                            <span>P {{ t('leftRight') }}</span>
                                        </BaseButton>
                                        <BaseButton variant="ghost" class="lock-button"
                                            :class="{ 'locked': isLocked('header', 'marginTopBottom') }"
                                            @click="toggleLock('header', 'marginTopBottom')"
                                            :title="isLocked('header', 'marginTopBottom') ? t('unlockTopBottom') : t('lockTopBottom')">
                                            <i
                                                :class="isLocked('header', 'marginTopBottom') ? 'bi bi-lock-fill' : 'bi bi-unlock'"></i>
                                            <span>M {{ t('topBottom') }}</span>
                                        </BaseButton>
                                        <BaseButton variant="ghost" class="lock-button"
                                            :class="{ 'locked': isLocked('header', 'marginLeftRight') }"
                                            @click="toggleLock('header', 'marginLeftRight')"
                                            :title="isLocked('header', 'marginLeftRight') ? t('unlockLeftRight') : t('lockLeftRight')">
                                            <i
                                                :class="isLocked('header', 'marginLeftRight') ? 'bi bi-lock-fill' : 'bi bi-unlock'"></i>
                                            <span>M {{ t('leftRight') }}</span>
                                        </BaseButton>
                                    </div>
                                    <div class="box-model-container" :style="{
                                        paddingTop: headerVisualization.margin.top + 'px',
                                        paddingRight: headerVisualization.margin.right + 'px',
                                        paddingBottom: headerVisualization.margin.bottom + 'px',
                                        paddingLeft: headerVisualization.margin.left + 'px'
                                    }">
                                        <div class="box-model-content" :style="{
                                            minHeight: headerVisualization.height + 'px',
                                            paddingTop: headerVisualization.padding.top + 'px',
                                            paddingRight: headerVisualization.padding.right + 'px',
                                            paddingBottom: headerVisualization.padding.bottom + 'px',
                                            paddingLeft: headerVisualization.padding.left + 'px'
                                        }">
                                            <!-- Margin Labels -->
                                            <div v-if="headerVisualization.margin.top > 0 && editingField !== 'header-margin-top'"
                                                class="box-model-label box-model-label-margin-top editable-label"
                                                @click="startEditing('header-margin-top')">
                                                M: {{ layoutHeader.margin.top }}
                                            </div>
                                            <input v-else-if="editingField === 'header-margin-top'"
                                                v-model="layoutHeader.margin.top"
                                                @blur="finishEditing('header-margin-top', layoutHeader.margin.top)"
                                                @keyup.enter="finishEditing('header-margin-top', layoutHeader.margin.top)"
                                                @keyup.esc="cancelEditing"
                                                class="box-model-label box-model-label-margin-top editable-input"
                                                @click.stop autofocus />
                                            <div v-if="headerVisualization.margin.right > 0 && editingField !== 'header-margin-right'"
                                                class="box-model-label box-model-label-margin-right editable-label"
                                                @click="startEditing('header-margin-right')">
                                                M: {{ layoutHeader.margin.right }}
                                            </div>
                                            <input v-else-if="editingField === 'header-margin-right'"
                                                v-model="layoutHeader.margin.right"
                                                @blur="finishEditing('header-margin-right', layoutHeader.margin.right)"
                                                @keyup.enter="finishEditing('header-margin-right', layoutHeader.margin.right)"
                                                @keyup.esc="cancelEditing"
                                                class="box-model-label box-model-label-margin-right editable-input"
                                                @click.stop autofocus />
                                            <div v-if="headerVisualization.margin.bottom > 0 && editingField !== 'header-margin-bottom'"
                                                class="box-model-label box-model-label-margin-bottom editable-label"
                                                @click="startEditing('header-margin-bottom')">
                                                M: {{ layoutHeader.margin.bottom }}
                                            </div>
                                            <input v-else-if="editingField === 'header-margin-bottom'"
                                                v-model="layoutHeader.margin.bottom"
                                                @blur="finishEditing('header-margin-bottom', layoutHeader.margin.bottom)"
                                                @keyup.enter="finishEditing('header-margin-bottom', layoutHeader.margin.bottom)"
                                                @keyup.esc="cancelEditing"
                                                class="box-model-label box-model-label-margin-bottom editable-input"
                                                @click.stop autofocus />
                                            <div v-if="headerVisualization.margin.left > 0 && editingField !== 'header-margin-left'"
                                                class="box-model-label box-model-label-margin-left editable-label"
                                                @click="startEditing('header-margin-left')">
                                                M: {{ layoutHeader.margin.left }}
                                            </div>
                                            <input v-else-if="editingField === 'header-margin-left'"
                                                v-model="layoutHeader.margin.left"
                                                @blur="finishEditing('header-margin-left', layoutHeader.margin.left)"
                                                @keyup.enter="finishEditing('header-margin-left', layoutHeader.margin.left)"
                                                @keyup.esc="cancelEditing"
                                                class="box-model-label box-model-label-margin-left editable-input"
                                                @click.stop autofocus />

                                            <!-- Padding Labels -->
                                            <div v-if="headerVisualization.padding.top > 0 && editingField !== 'header-padding-top'"
                                                class="box-model-label box-model-label-padding-top editable-label"
                                                @click="startEditing('header-padding-top')">
                                                P: {{ layoutHeader.padding.top }}
                                            </div>
                                            <input v-else-if="editingField === 'header-padding-top'"
                                                v-model="layoutHeader.padding.top"
                                                @blur="finishEditing('header-padding-top', layoutHeader.padding.top)"
                                                @keyup.enter="finishEditing('header-padding-top', layoutHeader.padding.top)"
                                                @keyup.esc="cancelEditing"
                                                class="box-model-label box-model-label-padding-top editable-input"
                                                @click.stop autofocus />
                                            <div v-if="headerVisualization.padding.right > 0 && editingField !== 'header-padding-right'"
                                                class="box-model-label box-model-label-padding-right editable-label"
                                                @click="startEditing('header-padding-right')">
                                                P: {{ layoutHeader.padding.right }}
                                            </div>
                                            <input v-else-if="editingField === 'header-padding-right'"
                                                v-model="layoutHeader.padding.right"
                                                @blur="finishEditing('header-padding-right', layoutHeader.padding.right)"
                                                @keyup.enter="finishEditing('header-padding-right', layoutHeader.padding.right)"
                                                @keyup.esc="cancelEditing"
                                                class="box-model-label box-model-label-padding-right editable-input"
                                                @click.stop autofocus />
                                            <div v-if="headerVisualization.padding.bottom > 0 && editingField !== 'header-padding-bottom'"
                                                class="box-model-label box-model-label-padding-bottom editable-label"
                                                @click="startEditing('header-padding-bottom')">
                                                P: {{ layoutHeader.padding.bottom }}
                                            </div>
                                            <input v-else-if="editingField === 'header-padding-bottom'"
                                                v-model="layoutHeader.padding.bottom"
                                                @blur="finishEditing('header-padding-bottom', layoutHeader.padding.bottom)"
                                                @keyup.enter="finishEditing('header-padding-bottom', layoutHeader.padding.bottom)"
                                                @keyup.esc="cancelEditing"
                                                class="box-model-label box-model-label-padding-bottom editable-input"
                                                @click.stop autofocus />
                                            <div v-if="headerVisualization.padding.left > 0 && editingField !== 'header-padding-left'"
                                                class="box-model-label box-model-label-padding-left editable-label"
                                                @click="startEditing('header-padding-left')">
                                                P: {{ layoutHeader.padding.left }}
                                            </div>
                                            <input v-else-if="editingField === 'header-padding-left'"
                                                v-model="layoutHeader.padding.left"
                                                @blur="finishEditing('header-padding-left', layoutHeader.padding.left)"
                                                @keyup.enter="finishEditing('header-padding-left', layoutHeader.padding.left)"
                                                @keyup.esc="cancelEditing"
                                                class="box-model-label box-model-label-padding-left editable-input"
                                                @click.stop autofocus />

                                            <div v-if="editingField !== 'header-height'"
                                                class="box-model-content-area editable-label"
                                                @click="startEditing('header-height')">
                                                <span class="box-model-content-text">{{ t('header') }} (H: {{
                                                    layoutHeader.height }})</span>
                                            </div>
                                            <input v-else v-model="layoutHeader.height"
                                                @blur="finishEditing('header-height', layoutHeader.height)"
                                                @keyup.enter="finishEditing('header-height', layoutHeader.height)"
                                                @keyup.esc="cancelEditing" class="box-model-content-area editable-input"
                                                @click.stop autofocus />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Footer Tab -->
                        <div v-if="activeLayoutTab === 'footer'" class="layout-tab-content">
                            <!-- Box Model Visualization -->
                            <div class="layout-section">
                                <h6 class="section-title">{{ t('boxModelVisualization') }}</h6>
                                <p class="section-description">{{ t('boxModelDescription') }}</p>

                                <div class="box-model-visualization">
                                    <div class="box-model-lock-controls">
                                        <BaseButton variant="ghost" class="lock-button"
                                            :class="{ 'locked': isLocked('footer', 'paddingTopBottom') }"
                                            @click="toggleLock('footer', 'paddingTopBottom')"
                                            :title="isLocked('footer', 'paddingTopBottom') ? t('unlockTopBottom') : t('lockTopBottom')">
                                            <i
                                                :class="isLocked('footer', 'paddingTopBottom') ? 'bi bi-lock-fill' : 'bi bi-unlock'"></i>
                                            <span>P {{ t('topBottom') }}</span>
                                        </BaseButton>
                                        <BaseButton variant="ghost" class="lock-button"
                                            :class="{ 'locked': isLocked('footer', 'paddingLeftRight') }"
                                            @click="toggleLock('footer', 'paddingLeftRight')"
                                            :title="isLocked('footer', 'paddingLeftRight') ? t('unlockLeftRight') : t('lockLeftRight')">
                                            <i
                                                :class="isLocked('footer', 'paddingLeftRight') ? 'bi bi-lock-fill' : 'bi bi-unlock'"></i>
                                            <span>P {{ t('leftRight') }}</span>
                                        </BaseButton>
                                        <BaseButton variant="ghost" class="lock-button"
                                            :class="{ 'locked': isLocked('footer', 'marginTopBottom') }"
                                            @click="toggleLock('footer', 'marginTopBottom')"
                                            :title="isLocked('footer', 'marginTopBottom') ? t('unlockTopBottom') : t('lockTopBottom')">
                                            <i
                                                :class="isLocked('footer', 'marginTopBottom') ? 'bi bi-lock-fill' : 'bi bi-unlock'"></i>
                                            <span>M {{ t('topBottom') }}</span>
                                        </BaseButton>
                                        <BaseButton variant="ghost" class="lock-button"
                                            :class="{ 'locked': isLocked('footer', 'marginLeftRight') }"
                                            @click="toggleLock('footer', 'marginLeftRight')"
                                            :title="isLocked('footer', 'marginLeftRight') ? t('unlockLeftRight') : t('lockLeftRight')">
                                            <i
                                                :class="isLocked('footer', 'marginLeftRight') ? 'bi bi-lock-fill' : 'bi bi-unlock'"></i>
                                            <span>M {{ t('leftRight') }}</span>
                                        </BaseButton>
                                    </div>
                                    <div class="box-model-container" :style="{
                                        paddingTop: footerVisualization.margin.top + 'px',
                                        paddingRight: footerVisualization.margin.right + 'px',
                                        paddingBottom: footerVisualization.margin.bottom + 'px',
                                        paddingLeft: footerVisualization.margin.left + 'px'
                                    }">
                                        <div class="box-model-content" :style="{
                                            minHeight: footerVisualization.height + 'px',
                                            paddingTop: footerVisualization.padding.top + 'px',
                                            paddingRight: footerVisualization.padding.right + 'px',
                                            paddingBottom: footerVisualization.padding.bottom + 'px',
                                            paddingLeft: footerVisualization.padding.left + 'px'
                                        }">
                                            <!-- Margin Labels -->
                                            <div v-if="footerVisualization.margin.top > 0 && editingField !== 'footer-margin-top'"
                                                class="box-model-label box-model-label-margin-top editable-label"
                                                @click="startEditing('footer-margin-top')">
                                                M: {{ layoutFooter.margin.top }}
                                            </div>
                                            <input v-else-if="editingField === 'footer-margin-top'"
                                                v-model="layoutFooter.margin.top"
                                                @blur="finishEditing('footer-margin-top', layoutFooter.margin.top)"
                                                @keyup.enter="finishEditing('footer-margin-top', layoutFooter.margin.top)"
                                                @keyup.esc="cancelEditing"
                                                class="box-model-label box-model-label-margin-top editable-input"
                                                @click.stop autofocus />
                                            <div v-if="footerVisualization.margin.right > 0 && editingField !== 'footer-margin-right'"
                                                class="box-model-label box-model-label-margin-right editable-label"
                                                @click="startEditing('footer-margin-right')">
                                                M: {{ layoutFooter.margin.right }}
                                            </div>
                                            <input v-else-if="editingField === 'footer-margin-right'"
                                                v-model="layoutFooter.margin.right"
                                                @blur="finishEditing('footer-margin-right', layoutFooter.margin.right)"
                                                @keyup.enter="finishEditing('footer-margin-right', layoutFooter.margin.right)"
                                                @keyup.esc="cancelEditing"
                                                class="box-model-label box-model-label-margin-right editable-input"
                                                @click.stop autofocus />
                                            <div v-if="footerVisualization.margin.bottom > 0 && editingField !== 'footer-margin-bottom'"
                                                class="box-model-label box-model-label-margin-bottom editable-label"
                                                @click="startEditing('footer-margin-bottom')">
                                                M: {{ layoutFooter.margin.bottom }}
                                            </div>
                                            <input v-else-if="editingField === 'footer-margin-bottom'"
                                                v-model="layoutFooter.margin.bottom"
                                                @blur="finishEditing('footer-margin-bottom', layoutFooter.margin.bottom)"
                                                @keyup.enter="finishEditing('footer-margin-bottom', layoutFooter.margin.bottom)"
                                                @keyup.esc="cancelEditing"
                                                class="box-model-label box-model-label-margin-bottom editable-input"
                                                @click.stop autofocus />
                                            <div v-if="footerVisualization.margin.left > 0 && editingField !== 'footer-margin-left'"
                                                class="box-model-label box-model-label-margin-left editable-label"
                                                @click="startEditing('footer-margin-left')">
                                                M: {{ layoutFooter.margin.left }}
                                            </div>
                                            <input v-else-if="editingField === 'footer-margin-left'"
                                                v-model="layoutFooter.margin.left"
                                                @blur="finishEditing('footer-margin-left', layoutFooter.margin.left)"
                                                @keyup.enter="finishEditing('footer-margin-left', layoutFooter.margin.left)"
                                                @keyup.esc="cancelEditing"
                                                class="box-model-label box-model-label-margin-left editable-input"
                                                @click.stop autofocus />

                                            <!-- Padding Labels -->
                                            <div v-if="footerVisualization.padding.top > 0 && editingField !== 'footer-padding-top'"
                                                class="box-model-label box-model-label-padding-top editable-label"
                                                @click="startEditing('footer-padding-top')">
                                                P: {{ layoutFooter.padding.top }}
                                            </div>
                                            <input v-else-if="editingField === 'footer-padding-top'"
                                                v-model="layoutFooter.padding.top"
                                                @blur="finishEditing('footer-padding-top', layoutFooter.padding.top)"
                                                @keyup.enter="finishEditing('footer-padding-top', layoutFooter.padding.top)"
                                                @keyup.esc="cancelEditing"
                                                class="box-model-label box-model-label-padding-top editable-input"
                                                @click.stop autofocus />
                                            <div v-if="footerVisualization.padding.right > 0 && editingField !== 'footer-padding-right'"
                                                class="box-model-label box-model-label-padding-right editable-label"
                                                @click="startEditing('footer-padding-right')">
                                                P: {{ layoutFooter.padding.right }}
                                            </div>
                                            <input v-else-if="editingField === 'footer-padding-right'"
                                                v-model="layoutFooter.padding.right"
                                                @blur="finishEditing('footer-padding-right', layoutFooter.padding.right)"
                                                @keyup.enter="finishEditing('footer-padding-right', layoutFooter.padding.right)"
                                                @keyup.esc="cancelEditing"
                                                class="box-model-label box-model-label-padding-right editable-input"
                                                @click.stop autofocus />
                                            <div v-if="footerVisualization.padding.bottom > 0 && editingField !== 'footer-padding-bottom'"
                                                class="box-model-label box-model-label-padding-bottom editable-label"
                                                @click="startEditing('footer-padding-bottom')">
                                                P: {{ layoutFooter.padding.bottom }}
                                            </div>
                                            <input v-else-if="editingField === 'footer-padding-bottom'"
                                                v-model="layoutFooter.padding.bottom"
                                                @blur="finishEditing('footer-padding-bottom', layoutFooter.padding.bottom)"
                                                @keyup.enter="finishEditing('footer-padding-bottom', layoutFooter.padding.bottom)"
                                                @keyup.esc="cancelEditing"
                                                class="box-model-label box-model-label-padding-bottom editable-input"
                                                @click.stop autofocus />
                                            <div v-if="footerVisualization.padding.left > 0 && editingField !== 'footer-padding-left'"
                                                class="box-model-label box-model-label-padding-left editable-label"
                                                @click="startEditing('footer-padding-left')">
                                                P: {{ layoutFooter.padding.left }}
                                            </div>
                                            <input v-else-if="editingField === 'footer-padding-left'"
                                                v-model="layoutFooter.padding.left"
                                                @blur="finishEditing('footer-padding-left', layoutFooter.padding.left)"
                                                @keyup.enter="finishEditing('footer-padding-left', layoutFooter.padding.left)"
                                                @keyup.esc="cancelEditing"
                                                class="box-model-label box-model-label-padding-left editable-input"
                                                @click.stop autofocus />

                                            <div v-if="editingField !== 'footer-height'"
                                                class="box-model-content-area editable-label"
                                                @click="startEditing('footer-height')">
                                                <span class="box-model-content-text">{{ t('footer') }} (H: {{
                                                    layoutFooter.height }})</span>
                                            </div>
                                            <input v-else v-model="layoutFooter.height"
                                                @blur="finishEditing('footer-height', layoutFooter.height)"
                                                @keyup.enter="finishEditing('footer-height', layoutFooter.height)"
                                                @keyup.esc="cancelEditing" class="box-model-content-area editable-input"
                                                @click.stop autofocus />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </BaseTabGroup>
                </div>
                <div class="modal-footer">
                    <BaseButton variant="ghost" size="small" @click="handleResetLayoutSettings">
                        {{ t('resetToDefaults') }}
                    </BaseButton>
                    <div class="modal-footer-actions">
                        <BaseButton variant="secondary" size="small" @click="showLayoutSettingsModal = false">
                            {{ t('cancel') }}
                        </BaseButton>
                        <BaseButton variant="primary" size="small" @click="handleSaveLayoutSettings">
                            {{ t('save') }}
                        </BaseButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onBeforeUnmount, inject, nextTick, watch } from 'vue';
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router';
import { useReportBuilder, BLOCK_TYPES, DATA_BLOCK_TYPES, TABLE_TYPES } from '@/composables/useReportBuilder';
import RoutesController from '@/controllers/routes/routes_controller';
import { BasePanel, BaseButton, BasePagination, BaseTable, BaseLoadingIndicator, BaseConfirmationModal, BaseFormField, BaseTabGroup, BaseEmptyState } from '@/components/ui';
import routeUtils from '@/utils/route_utils';
import ReportOutline from '@/components/reports/ReportOutline.vue';
import ReportBlock from '@/components/reports/ReportBlock.vue';
import BlockLibrary from '@/components/reports/BlockLibrary.vue';
import LoopBodyEditor from '@/components/reports/LoopBodyEditor.vue';
import RichTextEditorCustom from '@/components/reports/RichTextEditorCustom.vue';
import draggable from 'vuedraggable';
import { MASLUtility } from '@/utils/masl_utility';
import TemplatesController from '@/controllers/templates/templates_controller';
import ReportGenerationsController from '@/controllers/report_generations/report_generations_controller';

// Inject global functions
const showMessage = inject('showMessage');
const setGlobalLoading = inject('setGlobalLoading');
const router = useRouter();
const route = useRoute();

// Use report builder composable
const {
    reportSections,
    reportBlocks,
    selectedRoute: builderSelectedRoute,
    routeData,
    reportTitle,
    selectedBlockId,
    draggedBlockId,
    draggedOverBlockId,
    showPreview,
    previewContent,
    hasChanges,
    lastSaved,
    tableConfigs,
    reportHeader,
    reportFooter,
    reportLayout,
    editorsLocked,
    canUndo,
    canRedo,
    appendices,
    addAppendix,
    removeAppendix,
    updateAppendix,
    reorderAppendices,
    initializeReportStructure,
    createBlock,
    addBlockToSection,
    removeBlock,
    moveBlock,
    reorderBlocks,
    flattenBlocks,
    toggleSectionVisibility,
    toggleSectionCollapse,
    updateSectionTitle,
    removeSection,
    addSection,
    getDefaultSectionTemplates,
    updateBlockContent,
    updateTableConfig,
    updateHeader,
    updateFooter,
    clearHeader,
    clearFooter,
    updateLayout,
    resetSectionsToDefault,
    toggleEditorsLock,
    undo,
    redo,
    loadRouteData,
    loadSavedReport,
    saveReport,
    previewReport,
    generateReport,
} = useReportBuilder();

// Route selection state
const selectedRoute = ref(null);
const loadingRoutes = ref(true);
const routesPerPage = 5;
const currentPage = ref(1);
const totalPages = ref(1);
const totalCount = ref(0);
const paginatedRoutes = ref([]);

// Panel collapse state
const isOutlineCollapsed = ref(true); // Initially collapsed
const isLibraryCollapsed = ref(true); // Initially collapsed

// Unsaved changes warning modal state
const showUnsavedChangesModal = ref(false);
const pendingNavigation = ref(null);
const shouldBlockNavigation = ref(null); // null = not checked, false = allow, true = block
const isSaving = ref(false);

// Section management state
const showAddSectionModal = ref(false);
const showResetModal = ref(false);
const newSectionTitle = ref('');
const editingSectionId = ref(null); // Track which section is being edited
const editingSectionTitle = ref(''); // Store the title being edited
const showLoopEditor = ref(false);
const loopEditorType = ref('point'); // 'point' or 'note'
const pendingLoopDrop = ref(null); // Store drop event info for loop blocks
const targetEditorElement = ref(null); // Store the target editor element where loop was dropped

// Layout settings state
const showLayoutSettingsModal = ref(false);
const activeLayoutTab = ref('page');
const layoutMargin = ref({
    top: '25mm',
    right: '8mm',
    bottom: '24mm',
    left: '8mm'
});
const layoutHeader = ref({
    height: '30px',
    padding: { top: '5px', right: '10px', bottom: '5px', left: '10px' },
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
});
const layoutFooter = ref({
    height: '40px',
    padding: { top: '15px', right: '30px', bottom: '15px', left: '30px' },
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
});

// Lock state for symmetric fields - all enabled by default
const lockedPairs = ref({
    page: { topBottom: true, leftRight: true },
    header: { topBottom: false, leftRight: false, paddingTopBottom: true, paddingLeftRight: true, marginTopBottom: true, marginLeftRight: true },
    footer: { topBottom: false, leftRight: false, paddingTopBottom: true, paddingLeftRight: true, marginTopBottom: true, marginLeftRight: true }
});

// Editing state for inline editing
const editingField = ref(null); // Format: 'page-top', 'header-padding-left', etc.
const editingInputRef = ref(null);

// Watch for editing field changes to focus input
watch(editingField, (newVal) => {
    if (newVal) {
        nextTick(() => {
            if (editingInputRef.value) {
                editingInputRef.value.focus();
                editingInputRef.value.select();
            }
        });
    }
});

// Layout tabs configuration
const layoutTabs = [
    { id: 'page', label: 'Page', icon: 'bi bi-file-earmark' },
    { id: 'header', label: 'Header', icon: 'bi bi-layout-top' },
    { id: 'footer', label: 'Footer', icon: 'bi bi-layout-bottom' }
];

// Helper function to parse CSS value to pixels for visualization
function parseValueToPixels(value, defaultPixels = 20) {
    if (!value) return defaultPixels;
    const str = String(value).trim();
    const num = parseFloat(str);
    if (isNaN(num)) return defaultPixels;

    if (str.includes('mm')) {
        return num * 3.779527559; // 1mm ≈ 3.78px
    } else if (str.includes('cm')) {
        return num * 37.795275591; // 1cm ≈ 37.8px
    } else if (str.includes('px')) {
        return num;
    } else if (str.includes('em')) {
        return num * 16; // Assuming 16px base font size
    } else if (str.includes('rem')) {
        return num * 16; // Assuming 16px root font size
    } else {
        return num; // Assume pixels if no unit
    }
}

// Computed properties for box model visualization
const pageMarginVisualization = computed(() => ({
    margin: {
        top: parseValueToPixels(layoutMargin.value.top, 25),
        right: parseValueToPixels(layoutMargin.value.right, 8),
        bottom: parseValueToPixels(layoutMargin.value.bottom, 24),
        left: parseValueToPixels(layoutMargin.value.left, 8)
    }
}));

const headerVisualization = computed(() => ({
    height: parseValueToPixels(layoutHeader.value.height, 30),
    padding: {
        top: parseValueToPixels(layoutHeader.value.padding.top, 5),
        right: parseValueToPixels(layoutHeader.value.padding.right, 10),
        bottom: parseValueToPixels(layoutHeader.value.padding.bottom, 5),
        left: parseValueToPixels(layoutHeader.value.padding.left, 10)
    },
    margin: {
        top: parseValueToPixels(layoutHeader.value.margin.top, 0),
        right: parseValueToPixels(layoutHeader.value.margin.right, 0),
        bottom: parseValueToPixels(layoutHeader.value.margin.bottom, 0),
        left: parseValueToPixels(layoutHeader.value.margin.left, 0)
    }
}));

const footerVisualization = computed(() => ({
    height: parseValueToPixels(layoutFooter.value.height, 40),
    padding: {
        top: parseValueToPixels(layoutFooter.value.padding.top, 15),
        right: parseValueToPixels(layoutFooter.value.padding.right, 30),
        bottom: parseValueToPixels(layoutFooter.value.padding.bottom, 15),
        left: parseValueToPixels(layoutFooter.value.padding.left, 30)
    },
    margin: {
        top: parseValueToPixels(layoutFooter.value.margin.top, 0),
        right: parseValueToPixels(layoutFooter.value.margin.right, 0),
        bottom: parseValueToPixels(layoutFooter.value.margin.bottom, 0),
        left: parseValueToPixels(layoutFooter.value.margin.left, 0)
    }
}));

// Template selection state
const templates = ref([]);
const selectedTemplateId = ref('');
const loadingTemplates = ref(false);
const templateChanged = ref(false); // Track if template was changed to allow editing Route Summary and Route Data

// Table columns
const tableColumns = [
    { key: 'title', label: 'ROUTE NAME', sortable: true },
    { key: 'location', label: 'START / END', sortable: false },
    { key: 'distance', label: 'DISTANCE', sortable: true },
    { key: 'status', label: 'STATUS', sortable: false },
    { key: 'updated', label: 'UPDATED', sortable: true },
];

// Translations
const t = (key) => {
    const translations = {
        selectRouteToCreateReport: 'Select a Route to Create a Report',
        reportOutline: 'Report Outline',
        reportTitle: 'Report Title',
        back: 'Back',
        switch: 'Switch',
        save: 'Save',
        preview: 'Preview',
        generate: 'Generate',
        undo: 'Undo',
        redo: 'Redo',
        lastSaved: 'Last saved',
        reportPreview: 'Report Preview',
        close: 'Close',
        blockLibrary: 'Block Library',
        dragBlocksHere: 'Drag blocks here to build your report',
        outline: 'Outline',
        library: 'Library',
        removeSection: 'Remove Section',
        renameSection: 'Rename Section',
        addSection: 'Add Section',
        defaultSections: 'Default Sections',
        customSection: 'Custom Section',
        sectionTitle: 'Section Title',
        add: 'Add',
        or: 'OR',
        confirmRemoveSection: 'Are you sure you want to remove this section? All blocks in this section will be removed.',
        confirmRemoveHeader: 'Are you sure you want to remove the header?',
        confirmRemoveFooter: 'Are you sure you want to remove the footer?',
        headerRemoved: 'Header removed successfully',
        footerRemoved: 'Footer removed successfully',
        removeHeader: 'Remove Header',
        removeFooter: 'Remove Footer',
        sectionTitleRequired: 'Section title is required',
        layoutSettings: 'Layout Settings',
        margins: 'Margins',
        top: 'Top',
        right: 'Right',
        bottom: 'Bottom',
        left: 'Left',
        cancel: 'Cancel',
        layoutSettingsSaved: 'Layout settings saved successfully',
        header: 'Header',
        footer: 'Footer',
        height: 'Height',
        padding: 'Padding',
        headerSettings: 'Header Settings',
        footerSettings: 'Footer Settings',
        resetSectionsToDefault: 'Reset Sections to Default',
        confirmResetSections: 'Are you sure you want to reset all sections, header, and footer to default? This will remove all custom sections, blocks, header, and footer content. This action cannot be undone.',
        sectionsReset: 'Sections, header, and footer reset to default successfully',
        reset: 'Reset',
        lockEditors: 'Lock Editors',
        unlockEditors: 'Unlock Editors',
        editorsLocked: 'Editors locked',
        editorsUnlocked: 'Editors unlocked',
        resetToDefaults: 'Reset to Defaults',
        layoutSettingsReset: 'Layout settings reset to defaults',
        selectTemplate: 'Select Template',
        applyTemplate: 'Apply Template',
        templateApplied: 'Template applied successfully',
        errorLoadingTemplates: 'Error loading templates',
        pageMargins: 'Page Margins',
        pageMarginsDescription: 'Set the margins for the entire document page.',
        pageContent: 'Page Content',
        dimensions: 'Dimensions',
        headerDimensionsDescription: 'Set the height of the header section.',
        footerDimensionsDescription: 'Set the height of the footer section.',
        paddingDescription: 'Set the internal spacing inside the header/footer.',
        marginsDescription: 'Set the external spacing around the header/footer.',
        boxModelVisualization: 'Box Model Visualization',
        boxModelDescription: 'Visual representation of margin (M), padding (P), and content areas.',
        lockTopBottom: 'Lock Top & Bottom',
        unlockTopBottom: 'Unlock Top & Bottom',
        lockLeftRight: 'Lock Left & Right',
        unlockLeftRight: 'Unlock Left & Right',
        topBottom: 'Top/Bottom',
        leftRight: 'Left/Right',
        unsavedChanges: 'Unsaved changes',
        unsavedChangesWarning: 'You have unsaved changes. Do you want to save before leaving?',
        leaveWithoutSaving: 'Leave Without Saving',
        version: 'Version',
        viewGeneratedReports: 'View Generated Reports',
        clickToOpenReport: 'Click to open the last generated report',
        noReportAvailable: 'No report available for this route',
        errorOpeningReport: 'Error opening report',
    };
    return translations[key] || key;
};

// Template management
const templateOptions = computed(() => {
    return [
        { value: '', label: t('selectTemplate') },
        ...templates.value
            .filter(t => t.isVisible)
            .map(template => ({
                value: Number(template.id),
                label: template.name
            }))
    ];
});

async function loadTemplates() {
    loadingTemplates.value = true;
    try {
        // Get all templates
        const allRes = await TemplatesController.getTemplates();
        let allTemplates = [];
        if (allRes.result) {
            allTemplates = allRes.data;
        }

        // Get user's templates
        const userRes = await TemplatesController.getCurrentUserTemplates();
        const userTemplateIds = userRes.result ? userRes.data.map(t => t.templateId) : [];

        // Include templates that are either:
        // 1. In the user's templates (user has access)
        // 2. OR have isDefault: true
        templates.value = allTemplates.filter((template) => {
            const isUserTemplate = userTemplateIds.includes(template.id);
            const isDefaultTemplate = template.isDefault === true;
            return isUserTemplate || isDefaultTemplate;
        });
    } catch (error) {
        console.error('Error loading templates:', error);
        showMessage({ status: 'error', message: t('errorLoadingTemplates') });
    } finally {
        loadingTemplates.value = false;
    }
}

async function handleTemplateSelect(templateId) {
    // console.log('handleTemplateSelect called with:', templateId);

    if (!templateId || templateId === '') {
        selectedTemplateId.value = '';
        return;
    }

    selectedTemplateId.value = Number(templateId);
    // console.log('templates:', templates.value);
    const template = templates.value.filter(t => Number(t.id) === Number(templateId))[0];

    // console.log('template:', template);

    if (!template) {
        showMessage({ status: 'error', message: 'Template not found' });
        return;
    }

    setGlobalLoading(true);
    try {
        // Parse template content
        let templateStructure = null;

        if (template.content) {
            try {
                const parsed = JSON.parse(template.content);
                if (parsed.structure) {
                    templateStructure = parsed;
                }
            } catch (e) {
                console.log('Template content is not JSON format');
                showMessage({ status: 'error', message: 'Template format is not supported' });
                setGlobalLoading(false);
                return;
            }
        }

        if (templateStructure && templateStructure.structure) {
            // Apply template structure
            reportSections.value = JSON.parse(JSON.stringify(templateStructure.structure.sections || []));
            tableConfigs.value = { ...(templateStructure.structure.tableConfigs || {}) };
            reportHeader.value = templateStructure.structure.header || '';
            reportFooter.value = templateStructure.structure.footer || '';

            if (templateStructure.structure.layout) {
                reportLayout.value = {
                    ...reportLayout.value,
                    ...templateStructure.structure.layout,
                };
            }

            // Template can modify Route Summary and Route Data sections, but users still cannot edit them manually
            templateChanged.value = true;

            flattenBlocks();
            showMessage({ status: 'success', message: t('templateApplied') });
        } else {
            showMessage({ status: 'error', message: 'Template structure is invalid' });
        }
    } catch (error) {
        console.error('Error applying template:', error);
        showMessage({ status: 'error', message: 'Error applying template' });
    } finally {
        setGlobalLoading(false);
    }
}

// Route selection
async function selectRoute(route) {
    if (!route || !route.id) {
        showMessage({ status: 'error', message: 'Invalid route selected' });
        return;
    }

    setGlobalLoading(true);
    try {
        // Fetch the latest route information from the backend
        const routeRes = await RoutesController.getRoute(route.id);
        if (!routeRes.result || !routeRes.data) {
            showMessage({ status: 'error', message: 'Failed to load route information' });
            setGlobalLoading(false);
            return;
        }

        // Use the fetched route data (most up-to-date)
        const fetchedRoute = routeRes.data;

        // Check if route has generated reports and update status to "Reported" if reports exist
        try {
            const reports = await ReportGenerationsController.getReportGenerations(fetchedRoute.id);
            if (reports && reports.length > 0) {
                // Check if there's at least one successful report
                const hasSuccessfulReport = reports.some(r => r.status === 'Success');
                if (hasSuccessfulReport) {
                    fetchedRoute.status = 'Reported';
                }
            }
        } catch (error) {
            // Silently fail for report check - route status will remain as from backend
            console.debug(`Error checking reports for route ${fetchedRoute.id}:`, error);
        }

        // Set the fetched route
        selectedRoute.value = fetchedRoute;
        builderSelectedRoute.value = fetchedRoute;
        reportTitle.value = fetchedRoute.title + ' Report';
        // Store initial title to track changes
        initialReportTitle.value = fetchedRoute.title + ' Report';
        // Store route ID in sessionStorage for persistence
        sessionStorage.setItem('reportBuilderSelectedRouteId', fetchedRoute.id);
        // Reset template changed flag when selecting a new route
        templateChanged.value = false;

        // Load templates when route is selected
        await loadTemplates();

        // Load route data
        const routeDataResult = await loadRouteData(fetchedRoute.id);
        if (!routeDataResult.success) {
            showMessage({ status: 'error', message: routeDataResult.message });
        }

        // Initialize or load report structure
        const savedResult = await loadSavedReport(fetchedRoute.id);
        if (savedResult.success && savedResult.message === 'No saved report found') {
            // Initialize default structure
            initializeReportStructure(fetchedRoute);
            // Editors are already locked by default in resetSectionsToDefault
        } else if (savedResult.success) {
            showMessage({ status: 'success', message: savedResult.message });
            // Update initial title after loading saved report
            initialReportTitle.value = reportTitle.value;
        } else {
            showMessage({ status: 'error', message: savedResult.message });
            // Initialize default structure as fallback
            initializeReportStructure(fetchedRoute);
        }
    } catch (error) {
        console.error('Error loading route:', error);
        showMessage({ status: 'error', message: 'Error loading route' });
        // Only initialize structure if we have a valid route
        if (selectedRoute.value) {
            initializeReportStructure(selectedRoute.value);
        }
    } finally {
        setGlobalLoading(false);
    }
}

function handleBack() {
    selectedRoute.value = null;
    builderSelectedRoute.value = null;
    selectedBlockId.value = null;
    selectedTemplateId.value = '';
    templateChanged.value = false; // Reset template changed flag
    MASLUtility.resetData();
    // Clear stored route ID when explicitly going back
    sessionStorage.removeItem('reportBuilderSelectedRouteId');
}

function navigateToGeneratedReports() {
    if (selectedRoute.value?.id) {
        // Store route ID in sessionStorage as backup
        sessionStorage.setItem('reportBuilderSelectedRouteId', selectedRoute.value.id);
        router.push({
            path: `/routes/${selectedRoute.value.id}/reports`,
            query: { returnRouteId: selectedRoute.value.id }
        });
    }
}

// Open last generated PDF for a route
// Open last generated PDF for a route
async function handleOpenLastReport(routeItem) {
    if (!routeItem || !routeItem.id) return;

    setGlobalLoading(true);
    try {
        const reports = await ReportGenerationsController.getReportGenerations(routeItem.id);
        if (reports && reports.length > 0) {
            // Get the last report (most recent)
            const lastReport = reports.reduce((latest, current) => {
                return new Date(latest.dateAdded) > new Date(current.dateAdded) ? latest : current;
            });

            if (lastReport && lastReport.filePath && lastReport.status === 'Success') {
                const fileUrl = import.meta.env.VITE_MASL_API_BASE_URL + "/" + lastReport.filePath;
                
                // Encode URL to safe base64 to pass in query
                // Using btoa(unescape(encodeURIComponent(str))) to handle special chars including non-Latin 1
                const encodedUrl = window.btoa(unescape(encodeURIComponent(fileUrl)));
                
                // Open internal PDF Viewer
                router.push({
                    name: 'PdfViewer',
                    query: { 
                        url: encodedUrl,
                        title: reportTitle.value || 'Route Report'
                    }
                });
            } else {
                showMessage({ status: 'warning', message: t('noReportAvailable') });
            }
        } else {
            showMessage({ status: 'warning', message: t('noReportAvailable') });
        }
    } catch (error) {
        console.error('Error opening report:', error);
        showMessage({ status: 'error', message: t('errorOpeningReport') });
    } finally {
        setGlobalLoading(false);
    }
}

function handleResetSections() {
    showResetModal.value = true;
}

function confirmResetSections() {
    const result = resetSectionsToDefault();
    if (result.success) {
        showMessage({ status: 'success', message: t('sectionsReset') });
        // Update all TOCs in all editors
        updateAllTableOfContents();
    } else {
        showMessage({ status: 'error', message: result.message });
    }
    showResetModal.value = false;
}

// Determine if a section should be locked
function isSectionLocked(sectionId) {
    // Route Summary and Route Data sections are always locked - users cannot edit them
    // Templates can modify them when applied, but users cannot manually edit them
    const alwaysLockedSections = ['section-route-summary', 'section-route-data'];

    if (alwaysLockedSections.includes(sectionId)) {
        // These sections are always locked - only templates can modify them
        return true;
    }

    // Other sections follow the global lock state
    return editorsLocked.value;
}

function handleToggleEditorsLock() {
    toggleEditorsLock();
    showMessage({
        status: 'success',
        message: editorsLocked ? t('editorsLocked') : t('editorsUnlocked')
    });
}

// Panel toggle functions
function toggleOutlinePanel() {
    isOutlineCollapsed.value = !isOutlineCollapsed.value;
}

function toggleLibraryPanel() {
    isLibraryCollapsed.value = !isLibraryCollapsed.value;
}

// Drag and drop handlers for Vue.Draggable
function handleDragStart(event) {
    draggedBlockId.value = event.item.dataset.blockId || null;
}

function handleDragEnd(event) {
    draggedBlockId.value = null;
    draggedOverBlockId.value = null;
}

// Handle sections reordering
function handleSectionsReorder(event) {
    if (!event.moved) return;

    // The sections array has already been reordered by Vue.Draggable
    // Just need to flatten blocks to reflect the new order
    flattenBlocks();
    hasChanges.value = true;

    // Update data attribute synchronously before updating TOC
    try {
        const reportBuilderElement = document.querySelector('.report-builder');
        if (reportBuilderElement) {
            reportBuilderElement.setAttribute('data-report-sections', JSON.stringify(reportSections.value));
        }
    } catch (e) {
        console.debug('Could not update reportSections data attribute:', e);
    }

    // Update all TOCs in all editors
    updateAllTableOfContents();
}

// Handle blocks reordering within a section
function handleSectionBlocksReorder(sectionId, event) {
    if (!event.moved) return;

    const section = reportSections.value.find(s => s.id === sectionId);
    if (!section) return;

    // The blocks array has already been reordered by Vue.Draggable
    // Just need to update the sectionId on blocks and flatten
    section.blocks.forEach((block, index) => {
        block.sectionId = sectionId;
        block.order = index;
    });

    flattenBlocks();
    hasChanges.value = true;
}

// Handle blocks reordering when using Vue.Draggable (legacy - kept for compatibility)
function handleBlocksReorder(event) {
    if (!event.moved) return;

    // At this point, reportBlocks has already been reordered by Vue.Draggable
    // We need to rebuild sections to match the new order in reportBlocks
    const { element: movedBlock } = event.moved;

    // Clear all section blocks first
    reportSections.value.forEach(section => {
        section.blocks = [];
    });

    // Rebuild sections by iterating through reportBlocks in their new order
    // and grouping consecutive blocks that belong to the same section
    let currentSectionId = null;
    let currentSection = null;

    reportBlocks.value.forEach((block) => {
        // Determine which section this block should belong to
        // by checking the previous block's section
        if (currentSectionId && block.sectionId === currentSectionId) {
            // Continue with current section
            if (currentSection) {
                currentSection.blocks.push(block);
            }
        } else {
            // Start a new section group
            // Use the block's existing sectionId, or find the appropriate section
            let targetSectionId = block.sectionId;

            // If block doesn't have a sectionId or it's the moved block, 
            // determine section from context
            if (!targetSectionId || block.id === movedBlock.id) {
                // Find section by looking at surrounding blocks
                const blockIndex = reportBlocks.value.findIndex(b => b.id === block.id);
                if (blockIndex > 0) {
                    const prevBlock = reportBlocks.value[blockIndex - 1];
                    if (prevBlock && prevBlock.sectionId) {
                        targetSectionId = prevBlock.sectionId;
                    }
                }
                // If still no section, use first visible section
                if (!targetSectionId) {
                    const firstVisible = reportSections.value.find(s => s.visible);
                    targetSectionId = firstVisible ? firstVisible.id : null;
                }
            }

            if (targetSectionId) {
                currentSectionId = targetSectionId;
                currentSection = reportSections.value.find(s => s.id === targetSectionId);
                if (currentSection) {
                    block.sectionId = targetSectionId;
                    currentSection.blocks.push(block);
                }
            }
        }
    });

    // Re-flatten to ensure consistency (though it should already match)
    flattenBlocks();
    hasChanges.value = true;
}

function handleContentDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
}

// Handle variable drop - insert expression as-is (watcher will parse it)
function handleVariableDrop(expression, event) {
    createTextBlockWithContent(expression, event);
}

const appendixFileInput = ref(null);

function triggerAppendixUpload() {
    appendixFileInput.value?.click();
}

async function handleAppendixUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (const file of files) {
        if (file.type !== 'application/pdf') continue;

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            addAppendix({
                id: `appendix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                order: appendices.value.length,
                title: file.name.replace('.pdf', ''),
                fileName: file.name,
                includeInPdf: true,
                includeInToc: true,
                data: base64
            });
        };
        reader.readAsDataURL(file);
    }
    // Reset input
    event.target.value = '';
}

function handleAppendicesReorder(event) {
    if (event.moved) {
        reorderAppendices(appendices.value);
    }
}

// Handle variable insert (double-click) - insert expression as-is (watcher will parse it)
function handleVariableInsert(expression) {
    createTextBlockWithContentSync(expression);
}

// Helper function to create text block and add to section (sync version for double-click)
function createTextBlockWithContentSync(content) {
    // Extract plain text from HTML if needed
    let textContent = content;
    if (content && content.includes('<')) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        textContent = tempDiv.textContent || tempDiv.innerText || content;
    }

    // Create a text block with the content (parsed value or expression)
    const block = createBlock(BLOCK_TYPES.TEXT, { content: textContent });

    // Find the last visible section that has blocks, or the last visible section
    const visibleSections = reportSections.value.filter(s => s.visible);
    let targetSection = null;

    // Find the last section with blocks
    for (let i = visibleSections.length - 1; i >= 0; i--) {
        if (visibleSections[i].blocks && visibleSections[i].blocks.length > 0) {
            targetSection = visibleSections[i];
            break;
        }
    }

    // If no section has blocks, use the last visible section
    if (!targetSection && visibleSections.length > 0) {
        targetSection = visibleSections[visibleSections.length - 1];
    }

    // Fallback to first visible section if no sections found
    if (!targetSection) {
        targetSection = visibleSections[0];
    }

    if (targetSection) {
        addBlockToSection(targetSection.id, block);
    } else {
        console.warn('No target section found');
    }
}

// Helper function to create text block and add to section (async version for drag-drop)
function createTextBlockWithContent(content, event) {
    // Create a text block with the content (parsed value or expression)
    const block = createBlock(BLOCK_TYPES.TEXT, { content: content });

    // Find the section where the drop occurred
    let targetSection = null;
    let targetElement = event.target;

    // Traverse up the DOM to find the section container
    while (targetElement && targetElement !== document.body) {
        if (targetElement.classList && targetElement.classList.contains('editor-section')) {
            const sectionId = targetElement.dataset.sectionId;
            if (sectionId) {
                targetSection = reportSections.value.find(s => s.id === sectionId);
                break;
            }
        }
        targetElement = targetElement.parentElement;
    }

    // If no section found from drop target, find the last visible section that has blocks, or the last visible section
    if (!targetSection) {
        const visibleSections = reportSections.value.filter(s => s.visible);

        // Find the last section with blocks
        for (let i = visibleSections.length - 1; i >= 0; i--) {
            if (visibleSections[i].blocks && visibleSections[i].blocks.length > 0) {
                targetSection = visibleSections[i];
                break;
            }
        }

        // If no section has blocks, use the last visible section
        if (!targetSection && visibleSections.length > 0) {
            targetSection = visibleSections[visibleSections.length - 1];
        }

        // Fallback to first visible section if no sections found
        if (!targetSection) {
            targetSection = visibleSections[0];
        }
    }

    if (targetSection) {
        addBlockToSection(targetSection.id, block);
    }
}

async function handleDrop(event) {
    // Check if drop is on a RichTextEditor - if so, let it handle it (unless it's a loop block)
    const blockType = event.dataTransfer.getData('block-type');
    let targetElement = event.target;
    while (targetElement && targetElement !== document.body) {
        if (targetElement.classList && (
            targetElement.classList.contains('rich-text-editor') ||
            targetElement.classList.contains('ql-editor') ||
            targetElement.closest('.rich-text-editor')
        )) {
            // Drop is on RichTextEditor
            // If it's a loop block, we need to handle it at the ReportBuilder level
            // Otherwise, let RichTextEditor handle it
            if (blockType === 'loop') {
                // Continue to handle loop blocks in ReportBuilder
                break;
            } else {
                // Let RichTextEditor handle variable blocks
                return;
            }
        }
        targetElement = targetElement.parentElement;
    }

    event.preventDefault();
    event.stopPropagation();

    // blockType was already retrieved above

    // Only handle new blocks from library (existing blocks are handled by Vue.Draggable)
    if (blockType && blockType !== 'existing') {
        const blockConfig = event.dataTransfer.getData('block-config');
        let config = {};
        if (blockConfig) {
            try {
                config = JSON.parse(blockConfig);
            } catch (e) {
                console.error('Error parsing block config:', e);
            }
        }

        // Handle loop blocks - show editor modal
        if (blockType === 'loop' && config.value) {
            // Determine loop type from title or value
            const titleLower = (config.title || '').toLowerCase();
            const valueLower = (config.value || '').toLowerCase();
            let loopType = 'point';
            if (titleLower.includes('note loop') || valueLower.includes('@beginfornote')) {
                loopType = 'note';
            } else if (titleLower.includes('screenshot loop') || valueLower.includes('@beginformapscreenshot')) {
                loopType = 'screenshot';
            }

            // Find the target editor element where the drop occurred
            // Start from the original event target before we traversed
            let editorElement = event.target;
            let foundEditor = null;

            while (editorElement && editorElement !== document.body) {
                // Check if this element is or contains a rich-text-editor
                if (editorElement.classList && editorElement.classList.contains('rich-text-editor')) {
                    foundEditor = editorElement;
                    break;
                }
                // Check if this element is inside a rich-text-editor
                const richTextEditor = editorElement.closest?.('.rich-text-editor');
                if (richTextEditor) {
                    foundEditor = richTextEditor;
                    break;
                }
                // Check if this is a ql-editor (Quill's editor div)
                if (editorElement.classList && editorElement.classList.contains('ql-editor')) {
                    const parentRichEditor = editorElement.closest?.('.rich-text-editor');
                    if (parentRichEditor) {
                        foundEditor = parentRichEditor;
                        break;
                    }
                }
                editorElement = editorElement.parentElement;
            }

            if (foundEditor) {
                targetEditorElement.value = foundEditor;
            } else {
                console.warn('Could not find rich-text-editor element');
            }

            // Store drop event info
            pendingLoopDrop.value = { event, config };
            loopEditorType.value = loopType;
            showLoopEditor.value = true;
            return;
        }

        // Handle variable blocks (MASL expressions)
        if (blockType === 'variable' && config.value) {
            // Parse the MASL expression immediately to get the actual value
            handleVariableDrop(config.value, event);
            return;
        }

        const mappedType = mapBlockType(blockType);

        // Check if this is a TOC block - prevent dropping directly in sections, but allow in editors
        if (mappedType === BLOCK_TYPES.TOC) {
            // Check if drop is directly in a section container (not inside a block/editor)
            // Editors inside text blocks are fine - we want to prevent dropping directly into section containers
            let targetElement = event.target;
            const isDirectlyInSection = targetElement.closest('.editor-section[data-section-id]') &&
                !targetElement.closest('.report-block-wrapper') &&
                !targetElement.closest('.rich-text-editor');

            if (isDirectlyInSection) {
                // Prevent dropping TOC blocks directly in section containers
                event.preventDefault();
                event.stopPropagation();
                return;
            }

            // Check if drop is on a RichTextEditor - if so, let it handle it
            let foundEditor = false;
            while (targetElement && targetElement !== document.body) {
                if (targetElement.classList && (
                    targetElement.classList.contains('rich-text-editor') ||
                    targetElement.classList.contains('custom-editor') ||
                    targetElement.closest('.rich-text-editor')
                )) {
                    // Found an editor - allow it (editors inside text blocks are fine)
                    foundEditor = true;
                    break;
                }
                targetElement = targetElement.parentElement;
            }

            if (!foundEditor) {
                // TOC blocks can only be dropped in editors
                event.preventDefault();
                event.stopPropagation();
                return;
            }

            // If we get here, the drop is on an editor, let RichTextEditor handle it
            // Return early to prevent adding to section
            return;
        }

        const block = createBlock(mappedType, config);

        // Find the section where the drop occurred
        let targetSection = null;
        targetElement = event.target;

        // Traverse up the DOM to find the section container
        while (targetElement && targetElement !== document.body) {
            if (targetElement.classList && targetElement.classList.contains('editor-section')) {
                const sectionId = targetElement.dataset.sectionId;
                if (sectionId) {
                    targetSection = reportSections.value.find(s => s.id === sectionId);
                    break;
                }
            }
            targetElement = targetElement.parentElement;
        }

        // If no section found from drop target, find the last visible section that has blocks, or the last visible section
        if (!targetSection) {
            const visibleSections = reportSections.value.filter(s => s.visible);

            // Find the last section with blocks
            for (let i = visibleSections.length - 1; i >= 0; i--) {
                if (visibleSections[i].blocks && visibleSections[i].blocks.length > 0) {
                    targetSection = visibleSections[i];
                    break;
                }
            }

            // If no section has blocks, use the last visible section
            if (!targetSection && visibleSections.length > 0) {
                targetSection = visibleSections[visibleSections.length - 1];
            }

            // Fallback to first visible section if no sections found
            if (!targetSection) {
                targetSection = visibleSections[0];
            }
        }

        if (targetSection) {
            addBlockToSection(targetSection.id, block);
        }
    }
}

// Map string block types to BLOCK_TYPES constants
function mapBlockType(blockType) {
    const typeMap = {
        'heading': BLOCK_TYPES.HEADING,
        'text': BLOCK_TYPES.TEXT,
        'image': BLOCK_TYPES.IMAGE,
        'table': BLOCK_TYPES.TABLE,
        'data_block': BLOCK_TYPES.DATA_BLOCK,
        'toc': BLOCK_TYPES.TOC,
        'page_break': BLOCK_TYPES.PAGE_BREAK,
        'divider': BLOCK_TYPES.DIVIDER,
    };
    return typeMap[blockType] || blockType;
}

async function handleInsertBlock(blockType, config = {}) {
    // Handle variable blocks (MASL expressions)
    if (blockType === 'variable' && config.value) {
        // Parse the expression and insert parsed value
        await handleVariableInsert(config.value);
        return;
    }

    const mappedType = mapBlockType(blockType);
    const block = createBlock(mappedType, config);

    // Find the last visible section that has blocks, or the last visible section
    const visibleSections = reportSections.value.filter(s => s.visible);
    let targetSection = null;

    // Find the last section with blocks
    for (let i = visibleSections.length - 1; i >= 0; i--) {
        if (visibleSections[i].blocks && visibleSections[i].blocks.length > 0) {
            targetSection = visibleSections[i];
            break;
        }
    }

    // If no section has blocks, use the last visible section
    if (!targetSection && visibleSections.length > 0) {
        targetSection = visibleSections[visibleSections.length - 1];
    }

    // Fallback to first visible section if no sections found
    if (!targetSection) {
        targetSection = visibleSections[0];
    }

    if (targetSection) {
        addBlockToSection(targetSection.id, block);
    }
}

function handleReorderSections(sectionIds) {
    // Reorder sections
    const sectionsMap = new Map(reportSections.value.map(s => [s.id, s]));
    reportSections.value = sectionIds.map(id => sectionsMap.get(id)).filter(Boolean);
    hasChanges.value = true;

    // Update data attribute synchronously before updating TOC
    // This ensures the TOC update reads the correct order
    try {
        const reportBuilderElement = document.querySelector('.report-builder');
        if (reportBuilderElement) {
            reportBuilderElement.setAttribute('data-report-sections', JSON.stringify(reportSections.value));
        }
    } catch (e) {
        console.debug('Could not update reportSections data attribute:', e);
    }

    // Update all TOCs in all editors
    updateAllTableOfContents();
}

// Section management handlers
function handleRemoveSection(sectionId) {
    if (confirm(t('confirmRemoveSection'))) {
        const result = removeSection(sectionId);
        if (result.success) {
            showMessage({ status: 'success', message: result.message });
            // Update all TOCs in all editors
            updateAllTableOfContents();
        } else {
            showMessage({ status: 'error', message: result.message });
        }
    }
}

// Section rename handlers
const sectionTitleInputRef = ref(null);

function startEditingSection(sectionId, currentTitle) {
    editingSectionId.value = sectionId;
    editingSectionTitle.value = currentTitle;
    // Focus the input after it's rendered
    nextTick(() => {
        if (sectionTitleInputRef.value) {
            sectionTitleInputRef.value.focus();
            sectionTitleInputRef.value.select();
        }
    });
}

function finishEditingSection(sectionId) {
    if (editingSectionTitle.value && editingSectionTitle.value.trim()) {
        const result = updateSectionTitle(sectionId, editingSectionTitle.value.trim());
        if (result.success) {
            showMessage({ status: 'success', message: result.message });
            // Update all TOCs in all editors
            updateAllTableOfContents();
        } else {
            showMessage({ status: 'error', message: result.message });
        }
    }
    editingSectionId.value = null;
    editingSectionTitle.value = '';
}

function cancelEditingSection() {
    editingSectionId.value = null;
    editingSectionTitle.value = '';
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Update all table of contents in all editors
function updateAllTableOfContents() {
    // Wait for DOM to update after section changes
    // Use double nextTick to ensure Vue has finished updating the DOM
    // Add a small delay to ensure draggable components have finished reordering
    nextTick(() => {
        nextTick(() => {
            setTimeout(() => {
                // Find all RichTextEditorCustom components in the DOM
                // They are inside .custom-editor-content elements
                const allEditors = document.querySelectorAll('.custom-editor-content');

                allEditors.forEach(editorElement => {
                    // Check if this editor has a TOC
                    const tocElement = editorElement.querySelector('[data-toc-marker="true"]');
                    if (tocElement) {
                        // Find the parent RichTextEditorCustom component
                        // The editor element is inside a .rich-text-editor container
                        const editorContainer = editorElement.closest('.rich-text-editor');
                        if (editorContainer) {
                            // Update the TOC directly
                            updateTOCInEditor(editorElement);
                        }
                    }
                });
            }, 50); // Small delay to ensure DOM has fully updated after drag-and-drop
        });
    });
}

// Update TOC in a specific editor element
async function updateTOCInEditor(editorElement) {
    if (!editorElement) return;

    const existingTOC = editorElement.querySelector('[data-toc-marker="true"]');
    if (!existingTOC) return;

    // Extract sections from the document (not just this editor)
    // We need to get sections from the report structure
    // Create a map of section containers by ID for quick lookup
    const allSectionContainers = Array.from(document.querySelectorAll('.editor-section[data-section-id]'))
        .filter(section => {
            const rect = section.getBoundingClientRect();
            return rect.width > 0 || rect.height > 0;
        });

    // Create a map for quick lookup by section ID
    const sectionContainersMap = new Map();
    allSectionContainers.forEach(container => {
        const sectionId = container.getAttribute('data-section-id');
        if (sectionId) {
            sectionContainersMap.set(sectionId, container);
        }
    });

    if (sectionContainersMap.size === 0) {
        // No sections found, update with empty TOC
        const emptyTOC = '<div data-toc-marker="true" style="margin: 1.5em 0; padding: 1.5em; border: none; border-radius: 8px; background: transparent; page-break-inside: avoid;"><h2 style="margin: 0 0 1em 0; padding-bottom: 0.75em; font-weight: 700; font-size: 1.5em; color: inherit; border-bottom: 1px solid transparent; text-transform: uppercase; letter-spacing: 0.5px;">Table of Contents</h2><p style="margin: 0.5em 0; color: inherit; font-style: italic; text-align: center; padding: 1em; opacity: 0.7;">No sections found in document.</p></div><div style="page-break-after: always;"></div>';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = emptyTOC;
        existingTOC.replaceWith(tempDiv.firstElementChild);
        if (tempDiv.querySelector('div[style*="page-break-after"]')) {
            existingTOC.parentNode.insertBefore(tempDiv.querySelector('div[style*="page-break-after"]'), existingTOC.nextSibling);
        }
        return;
    }

    // Build sections list from reportSections in the correct order
    // This ensures the TOC reflects the actual order of sections, not DOM order
    const sections = reportSections.value
        .filter(section => section.visible && sectionContainersMap.has(section.id))
        .map(section => {
            const sectionContainer = sectionContainersMap.get(section.id);
            return {
                title: section.title,
                id: section.id,
                container: sectionContainer
            };
        });

    // Generate TOC HTML
    const containerStyle = 'margin: 1.5em 0; padding: 1.5em; border: none; border-radius: 8px; background: transparent; page-break-inside: avoid;';
    const titleStyle = 'margin: 0 0 1em 0; padding-bottom: 0.75em; font-weight: 700; font-size: 1.5em; color: inherit; border-bottom: 1px solid transparent; text-transform: uppercase; letter-spacing: 0.5px;';
    const listStyle = 'list-style: none; padding: 0; margin: 0;';
    const itemStyle = 'display: flex; align-items: center; padding: 0.75em 0.5em; margin: 0.25em 0; border-bottom: 1px solid transparent; transition: background-color 0.2s ease; border-radius: 4px;';
    const sectionTitleStyle = 'font-size: 1em; font-weight: 500; color: inherit; line-height: 1.5;';

    let tocHTML = `<div data-toc-marker="true" class="toc-container" style="${containerStyle}">`;
    tocHTML += `<h2 class="toc-title" style="${titleStyle}">Table of Contents</h2>`;
    tocHTML += `<ul class="toc-list" style="${listStyle}">`;

    sections.forEach((section, sectionIndex) => {
        const itemStyleWithLast = sectionIndex === sections.length - 1
            ? itemStyle.replace('border-bottom: 1px solid #e0e0e0;', 'border-bottom: none;')
            : itemStyle;

        const escapedTitle = section.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

        tocHTML += `<li class="toc-item" style="${itemStyleWithLast}">`;
        tocHTML += `<span class="toc-section-title" style="${sectionTitleStyle}">${escapeHtml(section.title)}</span>`;
        tocHTML += '</li>';
    });

    tocHTML += '</ul></div>';
    tocHTML += '<div style="page-break-after: always;"></div>';

    // Replace existing TOC
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = tocHTML;
    const newTOCElement = tempDiv.firstElementChild;
    const pageBreakDiv = tempDiv.querySelector('div[style*="page-break-after"]');

    // Check if there's already a page break after the existing TOC
    const existingPageBreak = existingTOC.nextElementSibling;
    if (existingPageBreak && existingPageBreak.style && existingPageBreak.style.pageBreakAfter === 'always') {
        existingPageBreak.remove();
    }

    existingTOC.replaceWith(newTOCElement);

    // Insert page break after new TOC
    if (pageBreakDiv) {
        if (newTOCElement.nextSibling) {
            newTOCElement.parentNode.insertBefore(pageBreakDiv, newTOCElement.nextSibling);
        } else {
            newTOCElement.parentNode.appendChild(pageBreakDiv);
        }
    } else {
        const pageBreak = document.createElement('div');
        pageBreak.style.cssText = 'page-break-after: always;';
        if (newTOCElement.nextSibling) {
            newTOCElement.parentNode.insertBefore(pageBreak, newTOCElement.nextSibling);
        } else {
            newTOCElement.parentNode.appendChild(pageBreak);
        }
    }

    // Update the content value if this editor has a v-model binding
    // We'll trigger an input event to sync the content
    const inputEvent = new Event('input', { bubbles: true });
    editorElement.dispatchEvent(inputEvent);
}

// Header and Footer handlers
function handleClearHeader() {
    if (confirm(t('confirmRemoveHeader'))) {
        clearHeader();
        showMessage({ status: 'success', message: t('headerRemoved') });
    }
}

function handleClearFooter() {
    if (confirm(t('confirmRemoveFooter'))) {
        clearFooter();
        showMessage({ status: 'success', message: t('footerRemoved') });
    }
}

// Layout settings handlers
function openLayoutSettings() {
    // Sync current layout values to local state
    if (reportLayout.value && reportLayout.value.margin) {
        layoutMargin.value = {
            top: reportLayout.value.margin.top || '25mm',
            right: reportLayout.value.margin.right || '8mm',
            bottom: reportLayout.value.margin.bottom || '24mm',
            left: reportLayout.value.margin.left || '8mm'
        };
    }
    if (reportLayout.value && reportLayout.value.header) {
        layoutHeader.value = {
            height: reportLayout.value.header.height || '30px',
            padding: {
                top: reportLayout.value.header.padding?.top || '5px',
                right: reportLayout.value.header.padding?.right || '10px',
                bottom: reportLayout.value.header.padding?.bottom || '5px',
                left: reportLayout.value.header.padding?.left || '10px'
            },
            margin: {
                top: reportLayout.value.header.margin?.top || '0px',
                right: reportLayout.value.header.margin?.right || '0px',
                bottom: reportLayout.value.header.margin?.bottom || '0px',
                left: reportLayout.value.header.margin?.left || '0px'
            }
        };
    }
    if (reportLayout.value && reportLayout.value.footer) {
        layoutFooter.value = {
            height: reportLayout.value.footer.height || '40px',
            padding: {
                top: reportLayout.value.footer.padding?.top || '15px',
                right: reportLayout.value.footer.padding?.right || '30px',
                bottom: reportLayout.value.footer.padding?.bottom || '15px',
                left: reportLayout.value.footer.padding?.left || '30px'
            },
            margin: {
                top: reportLayout.value.footer.margin?.top || '0px',
                right: reportLayout.value.footer.margin?.right || '0px',
                bottom: reportLayout.value.footer.margin?.bottom || '0px',
                left: reportLayout.value.footer.margin?.left || '0px'
            }
        };
    }
    activeLayoutTab.value = 'page';
    showLayoutSettingsModal.value = true;
}

function handleResetLayoutSettings() {
    // Reset to default values
    layoutMargin.value = {
        top: '32mm',
        right: '8mm',
        bottom: '24mm',
        left: '8mm'
    };
    layoutHeader.value = {
        height: '30px',
        padding: { top: '5px', right: '10px', bottom: '5px', left: '10px' },
        margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    };
    layoutFooter.value = {
        height: '40px',
        padding: { top: '15px', right: '30px', bottom: '15px', left: '30px' },
        margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    };
    showMessage({ status: 'success', message: t('layoutSettingsReset') });
}

function handleSaveLayoutSettings() {
    updateLayout({
        margin: {
            top: layoutMargin.value.top,
            right: layoutMargin.value.right,
            bottom: layoutMargin.value.bottom,
            left: layoutMargin.value.left
        },
        header: {
            height: layoutHeader.value.height,
            padding: {
                top: layoutHeader.value.padding.top,
                right: layoutHeader.value.padding.right,
                bottom: layoutHeader.value.padding.bottom,
                left: layoutHeader.value.padding.left
            },
            margin: {
                top: layoutHeader.value.margin.top,
                right: layoutHeader.value.margin.right,
                bottom: layoutHeader.value.margin.bottom,
                left: layoutHeader.value.margin.left
            }
        },
        footer: {
            height: layoutFooter.value.height,
            padding: {
                top: layoutFooter.value.padding.top,
                right: layoutFooter.value.padding.right,
                bottom: layoutFooter.value.padding.bottom,
                left: layoutFooter.value.padding.left
            },
            margin: {
                top: layoutFooter.value.margin.top,
                right: layoutFooter.value.margin.right,
                bottom: layoutFooter.value.margin.bottom,
                left: layoutFooter.value.margin.left
            }
        }
    });
    showMessage({ status: 'success', message: t('layoutSettingsSaved') });
    showLayoutSettingsModal.value = false;
}

// Lock/unlock functions
function toggleLock(tab, pairType) {
    lockedPairs.value[tab][pairType] = !lockedPairs.value[tab][pairType];
}

function isLocked(tab, pairType) {
    return lockedPairs.value[tab]?.[pairType] || false;
}

// Update field with locking support
function updateField(tab, type, side, value) {
    if (tab === 'page') {
        if (type === 'margin') {
            layoutMargin.value[side] = value;
            // Sync if locked
            if (side === 'top' && isLocked('page', 'topBottom')) {
                layoutMargin.value.bottom = value;
            } else if (side === 'bottom' && isLocked('page', 'topBottom')) {
                layoutMargin.value.top = value;
            } else if (side === 'left' && isLocked('page', 'leftRight')) {
                layoutMargin.value.right = value;
            } else if (side === 'right' && isLocked('page', 'leftRight')) {
                layoutMargin.value.left = value;
            }
        }
    } else if (tab === 'header' || tab === 'footer') {
        const target = tab === 'header' ? layoutHeader : layoutFooter;
        if (type === 'padding') {
            target.value.padding[side] = value;
            const lockKey = 'padding' + (side === 'top' || side === 'bottom' ? 'TopBottom' : 'LeftRight');
            if (side === 'top' && isLocked(tab, lockKey)) {
                target.value.padding.bottom = value;
            } else if (side === 'bottom' && isLocked(tab, lockKey)) {
                target.value.padding.top = value;
            } else if (side === 'left' && isLocked(tab, lockKey)) {
                target.value.padding.right = value;
            } else if (side === 'right' && isLocked(tab, lockKey)) {
                target.value.padding.left = value;
            }
        } else if (type === 'margin') {
            target.value.margin[side] = value;
            const lockKey = 'margin' + (side === 'top' || side === 'bottom' ? 'TopBottom' : 'LeftRight');
            if (side === 'top' && isLocked(tab, lockKey)) {
                target.value.margin.bottom = value;
            } else if (side === 'bottom' && isLocked(tab, lockKey)) {
                target.value.margin.top = value;
            } else if (side === 'left' && isLocked(tab, lockKey)) {
                target.value.margin.right = value;
            } else if (side === 'right' && isLocked(tab, lockKey)) {
                target.value.margin.left = value;
            }
        } else if (type === 'height') {
            target.value.height = value;
        }
    }
}

// Watchers to sync locked pairs for regular inputs
watch(() => layoutMargin.value.top, (newVal) => {
    if (isLocked('page', 'topBottom') && layoutMargin.value.bottom !== newVal) {
        layoutMargin.value.bottom = newVal;
    }
});

watch(() => layoutMargin.value.bottom, (newVal) => {
    if (isLocked('page', 'topBottom') && layoutMargin.value.top !== newVal) {
        layoutMargin.value.top = newVal;
    }
});

watch(() => layoutMargin.value.left, (newVal) => {
    if (isLocked('page', 'leftRight') && layoutMargin.value.right !== newVal) {
        layoutMargin.value.right = newVal;
    }
});

watch(() => layoutMargin.value.right, (newVal) => {
    if (isLocked('page', 'leftRight') && layoutMargin.value.left !== newVal) {
        layoutMargin.value.left = newVal;
    }
});

// Header watchers
watch(() => layoutHeader.value.padding.top, (newVal) => {
    if (isLocked('header', 'paddingTopBottom') && layoutHeader.value.padding.bottom !== newVal) {
        layoutHeader.value.padding.bottom = newVal;
    }
});

watch(() => layoutHeader.value.padding.bottom, (newVal) => {
    if (isLocked('header', 'paddingTopBottom') && layoutHeader.value.padding.top !== newVal) {
        layoutHeader.value.padding.top = newVal;
    }
});

watch(() => layoutHeader.value.padding.left, (newVal) => {
    if (isLocked('header', 'paddingLeftRight') && layoutHeader.value.padding.right !== newVal) {
        layoutHeader.value.padding.right = newVal;
    }
});

watch(() => layoutHeader.value.padding.right, (newVal) => {
    if (isLocked('header', 'paddingLeftRight') && layoutHeader.value.padding.left !== newVal) {
        layoutHeader.value.padding.left = newVal;
    }
});

watch(() => layoutHeader.value.margin.top, (newVal) => {
    if (isLocked('header', 'marginTopBottom') && layoutHeader.value.margin.bottom !== newVal) {
        layoutHeader.value.margin.bottom = newVal;
    }
});

watch(() => layoutHeader.value.margin.bottom, (newVal) => {
    if (isLocked('header', 'marginTopBottom') && layoutHeader.value.margin.top !== newVal) {
        layoutHeader.value.margin.top = newVal;
    }
});

watch(() => layoutHeader.value.margin.left, (newVal) => {
    if (isLocked('header', 'marginLeftRight') && layoutHeader.value.margin.right !== newVal) {
        layoutHeader.value.margin.right = newVal;
    }
});

watch(() => layoutHeader.value.margin.right, (newVal) => {
    if (isLocked('header', 'marginLeftRight') && layoutHeader.value.margin.left !== newVal) {
        layoutHeader.value.margin.left = newVal;
    }
});

// Footer watchers
watch(() => layoutFooter.value.padding.top, (newVal) => {
    if (isLocked('footer', 'paddingTopBottom') && layoutFooter.value.padding.bottom !== newVal) {
        layoutFooter.value.padding.bottom = newVal;
    }
});

watch(() => layoutFooter.value.padding.bottom, (newVal) => {
    if (isLocked('footer', 'paddingTopBottom') && layoutFooter.value.padding.top !== newVal) {
        layoutFooter.value.padding.top = newVal;
    }
});

watch(() => layoutFooter.value.padding.left, (newVal) => {
    if (isLocked('footer', 'paddingLeftRight') && layoutFooter.value.padding.right !== newVal) {
        layoutFooter.value.padding.right = newVal;
    }
});

watch(() => layoutFooter.value.padding.right, (newVal) => {
    if (isLocked('footer', 'paddingLeftRight') && layoutFooter.value.padding.left !== newVal) {
        layoutFooter.value.padding.left = newVal;
    }
});

watch(() => layoutFooter.value.margin.top, (newVal) => {
    if (isLocked('footer', 'marginTopBottom') && layoutFooter.value.margin.bottom !== newVal) {
        layoutFooter.value.margin.bottom = newVal;
    }
});

watch(() => layoutFooter.value.margin.bottom, (newVal) => {
    if (isLocked('footer', 'marginTopBottom') && layoutFooter.value.margin.top !== newVal) {
        layoutFooter.value.margin.top = newVal;
    }
});

watch(() => layoutFooter.value.margin.left, (newVal) => {
    if (isLocked('footer', 'marginLeftRight') && layoutFooter.value.margin.right !== newVal) {
        layoutFooter.value.margin.right = newVal;
    }
});

watch(() => layoutFooter.value.margin.right, (newVal) => {
    if (isLocked('footer', 'marginLeftRight') && layoutFooter.value.margin.left !== newVal) {
        layoutFooter.value.margin.left = newVal;
    }
});

// Inline editing functions
function startEditing(fieldId) {
    editingField.value = fieldId;
}

function finishEditing(fieldId, value) {
    if (value !== undefined && value !== null && value !== '') {
        const parts = fieldId.split('-');
        if (parts.length >= 3) {
            const tab = parts[0];
            const type = parts[1];
            const side = parts[2];
            updateField(tab, type, side, value);
        } else if (parts.length === 2 && parts[1] === 'height') {
            // Handle height field (e.g., 'header-height')
            const tab = parts[0];
            const target = tab === 'header' ? layoutHeader : layoutFooter;
            target.value.height = value;
        }
    }
    editingField.value = null;
}

function cancelEditing() {
    editingField.value = null;
}

const availableSectionTemplates = computed(() => {
    const allTemplates = getDefaultSectionTemplates();
    const existingIds = reportSections.value.map(s => s.id);
    return allTemplates.filter(t => !existingIds.includes(t.id));
});

function handleAddDefaultSection(sectionType) {
    const result = addSection(sectionType);
    if (result.success) {
        showMessage({ status: 'success', message: result.message });
        showAddSectionModal.value = false;
        // Update all TOCs in all editors
        updateAllTableOfContents();
    } else {
        showMessage({ status: 'error', message: result.message });
    }
}

function handleAddCustomSection() {
    if (!newSectionTitle.value || newSectionTitle.value.trim() === '') {
        showMessage({ status: 'error', message: t('sectionTitleRequired') });
        return;
    }

    const result = addSection('custom', newSectionTitle.value.trim());
    if (result.success) {
        showMessage({ status: 'success', message: result.message });
        newSectionTitle.value = '';
        showAddSectionModal.value = false;
        // Update all TOCs in all editors
        updateAllTableOfContents();
    } else {
        showMessage({ status: 'error', message: result.message });
    }
}

// Handle loop drop from RichTextEditor
function handleLoopDropFromEditor(data) {
    const { event, config, editorElement, blockId } = data;

    if (config && config.value) {
        // Determine loop type
        const titleLower = (config.title || '').toLowerCase();
        const valueLower = (config.value || '').toLowerCase();
        let loopType = 'point';
        if (titleLower.includes('note loop') || valueLower.includes('@beginfornote')) {
            loopType = 'note';
        } else if (titleLower.includes('screenshot loop') || valueLower.includes('@beginformapscreenshot')) {
            loopType = 'screenshot';
        }

        // Store the editor element and drop info
        targetEditorElement.value = editorElement;
        pendingLoopDrop.value = { event, config, blockId };
        loopEditorType.value = loopType;
        showLoopEditor.value = true;
    }
}

// Loop editor handlers
function handleEditLoop(loopType, loopTitle) {
    loopEditorType.value = loopType;
    showLoopEditor.value = true;
    // Don't clear pendingLoopDrop here - it might be set from a drag operation
    // Only clear targetEditorElement for double-click
    if (!pendingLoopDrop.value) {
        targetEditorElement.value = null;
    }
}

// Row editor handler (for double-click from BlockLibrary)
// Note: Drag-and-drop is handled directly in RichTextEditorCustom
function handleEditRow(rowTitle) {
    // For double-click, we need to find the active editor
    // Since RowBodyEditor is in RichTextEditorCustom, we'll trigger it via a custom event
    // or we can emit an event that the editor listens to
    // For now, this is a placeholder - drag-and-drop works directly in the editor
    // The actual opening happens in RichTextEditorCustom when row block is dropped
}

async function handleLoopConfirm(loopContent) {

    // Extract plain text from HTML content if needed
    let textContent = loopContent;
    if (loopContent.includes('<')) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = loopContent;
        textContent = tempDiv.textContent || tempDiv.innerText || loopContent;
    }

    // Check if we have a blockId from the drop
    const blockId = pendingLoopDrop.value?.blockId;

    // Insert the loop content into the target editor
    if (blockId) {
        // Find the block and update its content
        for (const section of reportSections.value) {
            const block = section.blocks.find(b => b.id === blockId);
            if (block && block.type === BLOCK_TYPES.TEXT) {
                const currentContent = block.config.content || '';
                const newContent = currentContent + (currentContent ? '\n' : '') + textContent;
                updateBlockContent(blockId, newContent);
                break;
            }
        }
    } else if (targetEditorElement.value) {
        // Insert into the specific editor where it was dropped
        await insertIntoEditor(targetEditorElement.value, textContent);
    } else if (pendingLoopDrop.value && pendingLoopDrop.value.event) {
        // Fallback: Handle as drop (if no specific editor found but we have drop event)
        await handleVariableDrop(textContent, pendingLoopDrop.value.event);
    } else {
        // Handle as insert (double-click) - insert into a new or existing text block
        // This creates a new text block with the loop content
        handleVariableInsert(textContent);
    }

    // Cleanup
    showLoopEditor.value = false;
    loopEditorType.value = 'point';
    pendingLoopDrop.value = null;
    targetEditorElement.value = null;
}

// Insert content into a specific RichTextEditor element
async function insertIntoEditor(editorElement, content) {
    await nextTick();

    // Try to find contentEditable editor (custom editor)
    let contentEditableEditor = null;

    if (editorElement) {
        // Method 1: Direct query for custom editor
        contentEditableEditor = editorElement.querySelector?.('.custom-editor-content');

        // Method 2: Try to find via parent
        if (!contentEditableEditor) {
            const parentEditor = editorElement.closest('.rich-text-editor');
            if (parentEditor) {
                contentEditableEditor = parentEditor.querySelector?.('.custom-editor-content');
            }
        }

        // Method 3: Check if editorElement itself is the contentEditable
        if (!contentEditableEditor && editorElement.contentEditable === 'true') {
            contentEditableEditor = editorElement;
        }
    }

    if (contentEditableEditor) {
        console.log('Found contentEditable editor, inserting content');

        // Get current selection or place at end
        const selection = window.getSelection();
        let range = null;

        if (selection.rangeCount > 0) {
            range = selection.getRangeAt(0);
            // Ensure range is within the editor
            if (!contentEditableEditor.contains(range.commonAncestorContainer)) {
                range = null;
            }
        }

        if (!range) {
            range = document.createRange();
            range.selectNodeContents(contentEditableEditor);
            range.collapse(false);
        }

        // Convert newlines to <br> for HTML insertion
        const textWithBreaks = content.replace(/\n/g, '<br>');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = textWithBreaks;

        // Insert nodes from tempDiv
        const fragment = document.createDocumentFragment();
        const nodesToInsert = [];
        while (tempDiv.firstChild) {
            const node = tempDiv.firstChild;
            nodesToInsert.push(node);
            fragment.appendChild(node);
        }

        range.deleteContents();
        range.insertNode(fragment);

        // Move cursor after inserted content
        if (nodesToInsert.length > 0) {
            const lastNode = nodesToInsert[nodesToInsert.length - 1];
            if (lastNode.parentNode) {
                const newRange = document.createRange();
                newRange.setStartAfter(lastNode);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
            }
        }

        // Focus the editor
        contentEditableEditor.focus();

        // Get updated content
        await nextTick();
        const updatedContent = contentEditableEditor.innerHTML;

        // Find the block and update its content to keep it in sync
        let blockElement = editorElement;
        let blockId = null;

        while (blockElement && blockElement !== document.body) {
            if (blockElement.classList && blockElement.classList.contains('report-block-wrapper')) {
                blockId = blockElement.dataset?.blockId;
                break;
            }
            blockElement = blockElement.parentElement;
        }

        if (blockId) {
            // Update the block content to keep it in sync
            for (const section of reportSections.value) {
                const block = section.blocks.find(b => b.id === blockId);
                if (block && block.type === BLOCK_TYPES.TEXT) {
                    updateBlockContent(blockId, updatedContent);
                    break;
                }
            }
        } else {
            console.warn('Could not find block ID');
        }
    } else {
        // Fallback: Try Quill for backward compatibility
        let quill = null;
        let quillEditor = null;

        if (editorElement) {
            quillEditor = editorElement.querySelector?.('.ql-editor');
            if (quillEditor && quillEditor.__quill) {
                quill = quillEditor.__quill;
            }
        }

        if (quill) {
            const range = quill.getSelection(true);
            const currentIndex = range ? range.index : quill.getLength();
            const lines = content.split('\n');
            let insertIndex = currentIndex;

            for (let i = 0; i < lines.length; i++) {
                if (i > 0) {
                    quill.insertText(insertIndex, '\n', 'user');
                    insertIndex += 1;
                }
                if (lines[i]) {
                    quill.insertText(insertIndex, lines[i], 'user');
                    insertIndex += lines[i].length;
                }
            }
            quill.setSelection(insertIndex, 'user');
            await nextTick();
            const updatedContent = quill.root.innerHTML;

            let blockElement = editorElement;
            let blockId = null;
            while (blockElement && blockElement !== document.body) {
                if (blockElement.classList && blockElement.classList.contains('report-block-wrapper')) {
                    blockId = blockElement.dataset?.blockId;
                    break;
                }
                blockElement = blockElement.parentElement;
            }
            if (blockId) {
                for (const section of reportSections.value) {
                    const block = section.blocks.find(b => b.id === blockId);
                    if (block && block.type === BLOCK_TYPES.TEXT) {
                        updateBlockContent(blockId, updatedContent);
                        break;
                    }
                }
            }
        } else {
            console.warn('Could not find editor instance, falling back to block update');

            // Fallback: Find block and update content directly
            let blockElement = editorElement;
            let blockId = null;

            while (blockElement && blockElement !== document.body) {
                if (blockElement.classList && blockElement.classList.contains('report-block-wrapper')) {
                    blockId = blockElement.dataset?.blockId;
                    break;
                }
                blockElement = blockElement.parentElement;
            }

            if (blockId) {
                for (const section of reportSections.value) {
                    const block = section.blocks.find(b => b.id === blockId);
                    if (block && block.type === BLOCK_TYPES.TEXT) {
                        const currentContent = block.config.content || '';
                        const newContent = currentContent + (currentContent ? '\n' : '') + content;
                        updateBlockContent(blockId, newContent);
                        break;
                    }
                }
            }
        }
    }
}

function handleLoopCancel() {
    showLoopEditor.value = false;
    loopEditorType.value = 'point';

    // If there was a pending drop, we've cancelled it
    pendingLoopDrop.value = null;
    targetEditorElement.value = null;
}

// Save and generate
async function handleSave() {
    if (!selectedRoute.value) return;
    setGlobalLoading(true);
    try {
        const result = await saveReport(selectedRoute.value.id, reportTitle.value);
        if (result.success) {
            showMessage({ status: 'success', message: result.message });
            // Update initial title after successful save
            initialReportTitle.value = reportTitle.value;
        } else {
            showMessage({ status: 'error', message: result.message });
        }
    } catch (error) {
        showMessage({ status: 'error', message: 'Error saving report' });
    } finally {
        setGlobalLoading(false);
    }
}

async function handlePreview() {
    if (!selectedRoute.value) return;
    setGlobalLoading(true);
    try {
        await previewReport(selectedRoute.value.id);
    } finally {
        setGlobalLoading(false);
    }
}

async function handleGenerate() {
    if (!selectedRoute.value) return;
    setGlobalLoading(true);
    try {
        const result = await generateReport(selectedRoute.value.id, reportTitle.value);
        if (result.success) {
            showMessage({ status: 'success', message: result.message });
            showPreview.value = false;
            // Open reports page in a new tab
            const routeData = router.resolve({
                path: `/routes/${selectedRoute.value.id}/reports`
            });
            window.open(routeData.href, '_blank');
        } else {
            showMessage({ status: 'error', message: result.message });
        }
    } catch (error) {
        showMessage({ status: 'error', message: 'Error generating report' });
    } finally {
        setGlobalLoading(false);
    }
}

// Route listing
function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) {
        getRoutes(page);
    }
}

const getRoutes = async (page = 1) => {
    loadingRoutes.value = true;
    try {
        const res = await RoutesController.getCurrentUserRoutesPaginated(page, routesPerPage);
        if (res.result) {
            paginatedRoutes.value = res.data;

            // Check each route for generated reports and update status to "Reported" if reports exist
            // Use Promise.allSettled to check all routes in parallel
            const reportChecks = paginatedRoutes.value.map(async (route) => {
                try {
                    const reports = await ReportGenerationsController.getReportGenerations(route.id);
                    if (reports && reports.length > 0) {
                        // Check if there's at least one successful report
                        const hasSuccessfulReport = reports.some(r => r.status === 'Success');
                        if (hasSuccessfulReport) {
                            route.status = 'Reported';
                        }
                    }
                } catch (error) {
                    // Silently fail for individual route report checks
                    console.debug(`Error checking reports for route ${route.id}:`, error);
                }
            });

            // Wait for all report checks to complete
            await Promise.allSettled(reportChecks);

            if (res.pagination) {
                totalCount.value = res.pagination.TotalCount || res.pagination.totalCount || res.pagination.total_count || 0;
                totalPages.value = res.pagination.TotalPages || res.pagination.totalPages || res.pagination.total_pages || 1;
                currentPage.value = res.pagination.CurrentPage || res.pagination.currentPage || res.pagination.current_page || 1;
            } else {
                totalCount.value = res.data ? res.data.length : 0;
                totalPages.value = 1;
                currentPage.value = 1;
            }
        } else {
            paginatedRoutes.value = [];
            totalCount.value = 0;
            totalPages.value = 1;
        }
    } catch (error) {
        console.error('Error loading routes:', error);
        showMessage({ status: 'error', message: 'Error loading routes' });
    } finally {
        loadingRoutes.value = false;
    }
};

function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

const getRouteDistance = (route) => {
    if (route.distance) {
        return (route.distance / 1000).toFixed(2) + ' km';
    }
    return 'N/A';
};

const getStatusClass = (status) => {
    const statusMap = {
        'Completed': 'status-completed',
        'In Progress': 'status-progress',
        'Planned': 'status-planned',
        'Reported': 'status-reported'
    };
    return statusMap[status] || 'status-surveyed';
};

const getStatusText = (route) => {
    if (route.status) {
        return route.status;
    }
    return 'surveyed';
};

// Store reportSections in a data attribute so RichTextEditorCustom can access it
// Track initial title when route is selected to avoid false positives
const initialReportTitle = ref('');

// Watch for report title changes
watch(reportTitle, (newTitle) => {
    // Only mark as changed if title differs from initial title and we have a selected route
    if (selectedRoute.value && newTitle !== initialReportTitle.value) {
        hasChanges.value = true;
    }
});

watch(reportSections, (newSections) => {
    // Store reportSections in a data attribute on the document
    // This allows RichTextEditorCustom to access it for TOC generation
    try {
        const reportBuilderElement = document.querySelector('.report-builder');
        if (reportBuilderElement) {
            reportBuilderElement.setAttribute('data-report-sections', JSON.stringify(newSections));
        }
    } catch (e) {
        console.debug('Could not store reportSections in data attribute:', e);
    }
}, { deep: true, immediate: true });

// Sync layout values when reportLayout changes
watch(reportLayout, (newLayout) => {
    if (newLayout && newLayout.margin) {
        layoutMargin.value = {
            top: newLayout.margin.top || '25mm',
            right: newLayout.margin.right || '8mm',
            bottom: newLayout.margin.bottom || '24mm',
            left: newLayout.margin.left || '8mm'
        };
    }
    if (newLayout && newLayout.header) {
        layoutHeader.value = {
            height: newLayout.header.height || '30px',
            padding: {
                top: newLayout.header.padding?.top || '5px',
                right: newLayout.header.padding?.right || '10px',
                bottom: newLayout.header.padding?.bottom || '5px',
                left: newLayout.header.padding?.left || '10px'
            },
            margin: {
                top: newLayout.header.margin?.top || '0px',
                right: newLayout.header.margin?.right || '0px',
                bottom: newLayout.header.margin?.bottom || '0px',
                left: newLayout.header.margin?.left || '0px'
            }
        };
    }
    if (newLayout && newLayout.footer) {
        layoutFooter.value = {
            height: newLayout.footer.height || '40px',
            padding: {
                top: newLayout.footer.padding?.top || '15px',
                right: newLayout.footer.padding?.right || '30px',
                bottom: newLayout.footer.padding?.bottom || '15px',
                left: newLayout.footer.padding?.left || '30px'
            },
            margin: {
                top: newLayout.footer.margin?.top || '0px',
                right: newLayout.footer.margin?.right || '0px',
                bottom: newLayout.footer.margin?.bottom || '0px',
                left: newLayout.footer.margin?.left || '0px'
            }
        };
    }
}, { deep: true, immediate: true });

// Handle unsaved changes modal actions
const confirmLeaveWithoutSaving = () => {
    shouldBlockNavigation.value = false;
    showUnsavedChangesModal.value = false;
    if (pendingNavigation.value) {
        const nav = pendingNavigation.value;
        pendingNavigation.value = null;
        nav();
    } else {
        // If no pending navigation, just go back
        handleBack();
    }
};

const cancelLeave = () => {
    showUnsavedChangesModal.value = false;
    pendingNavigation.value = null;
    shouldBlockNavigation.value = null; // Reset so guard can check again
};

// Handle save and leave
const handleSaveAndLeave = async () => {
    if (!selectedRoute.value) return;

    isSaving.value = true;
    try {
        const result = await saveReport(selectedRoute.value.id, reportTitle.value);
        if (result.success) {
            showMessage({ status: 'success', message: result.message });
            // Update initial title after successful save
            initialReportTitle.value = reportTitle.value;
            // Clear changes flag
            hasChanges.value = false;

            // Now proceed with navigation
            shouldBlockNavigation.value = false;
            showUnsavedChangesModal.value = false;
            if (pendingNavigation.value) {
                const nav = pendingNavigation.value;
                pendingNavigation.value = null;
                nav();
            } else {
                handleBack();
            }
        } else {
            showMessage({ status: 'error', message: result.message });
        }
    } catch (error) {
        showMessage({ status: 'error', message: 'Error saving report' });
    } finally {
        isSaving.value = false;
    }
};

// Listen for back button event from MainLayout
const handleBackButtonEvent = (event) => {
    if (selectedRoute.value) {
        // Check for unsaved changes before going back
        if (hasChanges.value) {
            showUnsavedChangesModal.value = true;
            pendingNavigation.value = null; // Will use handleBack() in confirmLeaveWithoutSaving
        } else {
            handleBack();
        }
    }
};

// Navigation guard for route changes (browser back, router.push, etc.)
onBeforeRouteLeave((to, from, next) => {
    // If we're explicitly allowing navigation (e.g., after save), proceed
    if (shouldBlockNavigation.value === false) {
        shouldBlockNavigation.value = null; // Reset for next check
        next();
        return;
    }

    // If there are unsaved changes, show modal and block navigation
    if (hasChanges.value && selectedRoute.value) {
        shouldBlockNavigation.value = true;
        showUnsavedChangesModal.value = true;
        pendingNavigation.value = () => {
            shouldBlockNavigation.value = false;
            next();
        };
        // Don't call next() here - wait for user confirmation
    } else {
        // No unsaved changes, allow navigation
        next();
    }
});

// Handle browser tab/window close
const handleBeforeUnload = (e) => {
    if (hasChanges.value && selectedRoute.value) {
        e.preventDefault();
        // Modern browsers ignore custom messages, but we still need to call preventDefault
        e.returnValue = '';
        return '';
    }
};

// Helper function to restore selected route
async function restoreSelectedRoute(routeId) {
    if (!routeId) return;

    // Find the route in the loaded routes
    const routeToSelect = paginatedRoutes.value.find(r => r.id === routeId || String(r.id) === String(routeId));

    if (routeToSelect) {
        await selectRoute(routeToSelect);
        return true;
    } else {
        // If route not found in current page, try to fetch it directly
        try {
            const res = await RoutesController.getRoute(routeId);
            if (res.result && res.data) {
                await selectRoute(res.data);
                return true;
            }
        } catch (error) {
            console.error('Error loading route:', error);
        }
    }
    return false;
}

onMounted(async () => {
    MASLUtility.resetData();
    await getRoutes(1);

    // Check if there's a route ID in query parameters to restore selected route
    const returnRouteId = route.query.returnRouteId || sessionStorage.getItem('reportBuilderSelectedRouteId');

    if (returnRouteId) {
        const restored = await restoreSelectedRoute(returnRouteId);
        if (restored) {
            // Clean up the query parameter and sessionStorage
            if (route.query.returnRouteId) {
                router.replace({ query: {} });
            }
            sessionStorage.removeItem('reportBuilderSelectedRouteId');
        }
    }

    // Listen for back button event from MainLayout
    window.addEventListener('report-builder-back', handleBackButtonEvent);
    // Set up beforeunload listener
    window.addEventListener('beforeunload', handleBeforeUnload);
});

onUnmounted(() => {
    // Clean up event listeners
    window.removeEventListener('report-builder-back', handleBackButtonEvent);
    window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>

<style scoped>
.report-builder {
    padding: 0;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    color: var(--text-primary);
    position: relative;
    height: 100vh;
    overflow: hidden;
}

.route-selection {
    width: 100%;
    padding: 1rem;
}

.builder-layout {
    display: flex;
    flex-direction: row;
    height: 93vh;
    gap: var(--spacing-md);
    position: relative;
    padding-top: 0.5rem;
    box-sizing: border-box;
}


.outline-panel-wrapper {
    width: 280px;
    flex-shrink: 0;
    height: 100%;
    max-height: 100%;
    position: relative;
    transition: width 0.3s ease;
    padding-left: 1rem;
    padding-top: 1rem;
    padding-bottom: 1rem;
}

.outline-panel-wrapper.collapsed {
    width: 0;
    overflow: visible;
    padding: 0;
}

.outline-panel {
    width: 100%;
    height: 100%;
    max-height: 100%;
}

.library-panel-wrapper {
    width: 380px;
    flex-shrink: 0;
    height: 100%;
    max-height: 100%;
    position: relative;
    transition: width 0.3s ease;
    padding-right: 1rem;
    padding-top: 1rem;
    padding-bottom: 1rem;
}

.library-panel-wrapper.collapsed {
    width: 0;
    overflow: visible;
    padding: 0;
}

.library-panel {
    width: 100%;
    height: 100%;
    max-height: 100%;
}

.editor-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 300px;
    min-height: 400px;
    height: calc(100% - 1rem);
    max-height: calc(100% - 1rem);
    overflow: hidden;
    margin: 0.5rem 0;
}

/* Active state for toggle buttons in editor header */
.editor-actions .active {
    background: var(--accent) !important;
    color: white !important;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--border);
}

.panel-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
}

.panel-header-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

/* Compact BasePanel design for editor - matching RouteViewerNew */
.editor-panel :deep(.base-panel__header) {
    flex-direction: column;
    align-items: stretch;
}

.editor-panel :deep(.base-panel__header-main) {
    margin-bottom: 0.75rem;
    flex: 1;
    min-width: 0;
    justify-content: space-between;
    align-items: center;
}

.editor-panel :deep(.base-panel__header-content) {
    width: 100%;
    flex: 1;
}

.editor-panel :deep(.base-panel__actions-view) {
    width: 100%;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border);
    margin-top: 0;
    justify-content: space-between;
}

.header-actions-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    justify-content: space-between;
    flex-wrap: nowrap;
}

.header-actions-group .editor-title-input {
    flex: 1;
    min-width: 0;
    margin: 0;
}

.template-selector {
    min-width: 200px;
    max-width: 250px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
}

.template-selector :deep(.base-form-field) {
    margin: 0;
    display: flex;
    align-items: center;
}

.template-selector :deep(.base-form-field__select) {
    height: 32px;
    padding: 0 var(--spacing-sm);
    font-size: var(--font-size-sm);
    line-height: 32px;
    display: inline-block;
    vertical-align: middle;
    box-sizing: border-box;
}

.header-buttons-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
}

.header-buttons-group .active {
    background: var(--accent) !important;
    color: white !important;
}

.reset-button-toggle :deep(button),
.reset-button-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-width: auto;
    height: 28px;
    padding: 0 8px;
    background: transparent !important;
    border: 1px solid var(--border, #ddd) !important;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--text-secondary, #666) !important;
    user-select: none;
    font-size: 12px;
    white-space: nowrap;
}

.reset-button-toggle:hover :deep(button),
.reset-button-toggle:hover {
    background: var(--bg-elevated, #f5f5f5) !important;
    border-color: var(--accent, #09c) !important;
    color: var(--accent, #09c) !important;
    transform: scale(1.05);
}

.reset-button-toggle:active :deep(button),
.reset-button-toggle:active {
    background: var(--bg-active, var(--bg-elevated)) !important;
}

.actions-container {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.action-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
    width: 100%;
    flex-wrap: nowrap;
    overflow: auto hidden;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
    -webkit-overflow-scrolling: touch;
}

.action-row::-webkit-scrollbar {
    height: 6px;
}

.action-row::-webkit-scrollbar-track {
    background: transparent;
}

.action-row::-webkit-scrollbar-thumb {
    background-color: var(--border);
    border-radius: 3px;
}

.action-row::-webkit-scrollbar-thumb:hover {
    background-color: var(--text-secondary);
}

.action-row:last-child {
    margin-bottom: 0;
}

.action-group {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-shrink: 0;
}

.action-group-right {
    margin-left: auto;
    flex-shrink: 0;
}

.editor-panel :deep(.base-panel__content) {
    padding: var(--spacing-sm);
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
    flex: 1;
}

.editor-panel :deep(.base-panel__title) {
    display: none;
}

.editor-title-input {
    width: 300px;
}

.editor-title-input :deep(input) {
    width: 100%;
    font-size: 24px;
    font-weight: 600;
    background: transparent !important;
    color: var(--bs-body-color) !important;
    border: none !important;
    padding: 0 !important;
    outline: none !important;
    margin: 0 !important;
    box-shadow: none !important;
}

.editor-title-input :deep(input):focus {
    outline: none !important;
    box-shadow: none !important;
}

.editor-title-input :deep(input)::placeholder {
    color: var(--bs-secondary-color);
    opacity: 0.6;
}

.editor-panel :deep(.base-panel__actions-view) .active {
    background: var(--accent) !important;
    color: white !important;
}

.editor-panel :deep(.base-panel__actions-view) .active:hover {
    background: var(--accent-hover, #09c) !important;
}

.editor-content {
    flex: 1;
    overflow: hidden auto;
    min-height: 0;
    scrollbar-width: none;

    /* Firefox */
    -ms-overflow-style: none;

    /* Internet Explorer 10+ */
}

.editor-content::-webkit-scrollbar {
    display: none;

    /* WebKit */
}

.sections-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.header-footer-section {
    margin-bottom: var(--spacing-sm);
    background: var(--bg-elevated);
}

.header-footer-section :deep(.base-panel__header) {
    padding: var(--spacing-xs) var(--spacing-sm);
}

.header-footer-section :deep(.base-panel__header-main) {
    margin-bottom: 0;
    justify-content: flex-start;
}

.header-footer-section :deep(.base-panel__header-content) {
    width: 100%;
    text-align: left;
}

.header-footer-section :deep(.base-panel__title) {
    display: none;
}

.header-footer-content {
    padding: var(--spacing-sm);
}

.header-footer-content :deep(.rich-text-editor) {
    border: 1px solid var(--border);
    border-radius: 4px;
    min-height: 100px;
}

.header-footer-content :deep(.custom-editor-content) {
    min-height: 100px;
}

/* Legacy styles for textarea - kept for backward compatibility if needed */
.header-footer-input {
    width: 100%;
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: var(--spacing-xs);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: inherit;
    font-size: 14px;
    resize: vertical;
    min-height: 60px;
}

.header-footer-input:focus {
    outline: none;
    border-color: var(--accent);
}

.editor-section {
    margin-bottom: var(--spacing-sm);
}

.editor-section :deep(.base-panel__header) {
    user-select: none;
    padding: var(--spacing-xs) var(--spacing-sm);
}

.editor-section :deep(.base-panel__header-main) {
    margin-bottom: 0;
    justify-content: flex-start;
}

.editor-section :deep(.base-panel__header-content) {
    width: 100%;
    text-align: left;
}

.section-header-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    width: 100%;
    justify-content: space-between;
    cursor: pointer;
}

.section-header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    flex: 1;
}

.section-collapse-icon {
    color: var(--text-secondary);
    font-size: 14px;
    cursor: pointer;
    flex-shrink: 0;
    transition: transform 0.2s ease;
}

.section-header-actions {
    display: flex;
    gap: var(--spacing-xs);
    align-items: center;
}

.section-header-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin-left: auto;
}

.section-drag-handle {
    color: var(--text-secondary);
    font-size: 14px;
    cursor: grab;
    flex-shrink: 0;
}

.section-drag-handle:active {
    cursor: grabbing;
}

.section-drag-handle:hover {
    color: var(--text-primary);
}

.section-title-text {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    flex: 1;
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 4px;
    transition: background-color 0.2s ease;
}

.section-title-text:hover {
    background-color: var(--bg-elevated);
}

.section-title-input {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    flex: 1;
    background: var(--bg-surface);
    border: 1px solid var(--accent);
    border-radius: 4px;
    padding: 2px 6px;
    outline: none;
    min-width: 100px;
}

.section-title-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px rgba(var(--accent-rgb, 0, 167, 225), 0.2);
}

.editor-section :deep(.base-panel__title) {
    display: none;
}

/* Draggable section states */
.ghost-section {
    opacity: 0.4;
    background: var(--bg-elevated);
    border: 2px dashed var(--accent);
}

.chosen-section {
    cursor: grabbing;
}

.drag-section {
    opacity: 0.8;
    transform: rotate(2deg);
}

.section-blocks-container {
    min-height: 20px;
}

.empty-section-placeholder {
    padding: var(--spacing-md);
    border: 2px dashed var(--border);
    border-radius: 6px;
    text-align: center;
    color: var(--text-secondary);
    background: var(--bg-elevated);
    margin-top: var(--spacing-xs);
}

.empty-section-text {
    margin: 0;
    font-size: 12px;
    font-style: italic;
}

.add-section-container {
    display: flex;
    justify-content: center;
    padding: var(--spacing-md);
    border-top: 1px solid var(--border);
    margin-top: var(--spacing-sm);
}

/* Add Section Modal */
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgb(0 0 0 / 50%);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2100;
}

.add-section-modal {
    background: var(--bg-surface);
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 32px rgb(0 0 0 / 20%);
}

.add-section-modal .modal-header {
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-elevated);
}

.add-section-modal .modal-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
}

.add-section-modal .btn-close {
    background: none;
    border: none;
    font-size: 20px;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.add-section-modal .btn-close:hover {
    color: var(--text-primary);
}

.add-section-modal .modal-body {
    padding: var(--spacing-lg);
    overflow-y: auto;
}

.section-type-selection {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.section-type-option h6 {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
}

.section-templates {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--spacing-sm);
}

.section-template-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-md);
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-primary);
}

.section-template-btn:hover {
    background: var(--bg-surface);
    border-color: var(--accent);
    transform: translateY(-2px);
}

.section-template-btn i {
    font-size: 24px;
    color: var(--accent);
}

.section-type-divider {
    display: flex;
    align-items: center;
    text-align: center;
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
}

.section-type-divider::before,
.section-type-divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid var(--border);
}

.section-type-divider span {
    padding: 0 var(--spacing-md);
}

.custom-section-input {
    display: flex;
    gap: var(--spacing-sm);
    align-items: center;
}

.custom-section-input :deep(.base-input) {
    flex: 1;
}

/* Layout Settings Modal */
.layout-settings-modal {
    background: var(--bg-surface);
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 32px rgb(0 0 0 / 20%);
}

.layout-settings-modal .modal-header {
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-elevated);
}

.layout-settings-modal .modal-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
}

.layout-settings-modal .btn-close {
    background: none;
    border: none;
    font-size: 20px;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.layout-settings-modal .btn-close:hover {
    color: var(--text-primary);
}

.layout-settings-modal .modal-body {
    padding: var(--spacing-lg);
    overflow-y: auto;
}

.layout-tab-content {
    padding: var(--spacing-sm) 0;
}

.layout-section {
    margin-bottom: var(--spacing-xl);
    padding-bottom: var(--spacing-lg);
    border-bottom: 1px solid var(--border);
}

.layout-section:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}

.layout-section .section-title {
    margin: 0 0 var(--spacing-xs) 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
}

.layout-section .section-description {
    margin: 0 0 var(--spacing-md) 0;
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.4;
}

/* Box Model Visualization */
.box-model-visualization {
    margin: var(--spacing-lg) 0;
    padding: var(--spacing-lg);
    background: var(--bg-elevated);
    border-radius: 8px;
    border: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    overflow: visible;
    gap: var(--spacing-md);
}

.box-model-lock-controls {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
    justify-content: center;
    width: 100%;
}

.lock-button {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
}

.lock-button:hover {
    background: var(--bg-elevated);
    border-color: var(--accent);
    color: var(--text-primary);
}

.lock-button.locked {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
}

.lock-button i {
    font-size: 14px;
}

.lock-button span {
    font-size: 11px;
}

.box-model-container {
    position: relative;
    background: rgb(255 192 203 / 15%);
    border: 2px dashed rgb(255 87 87 / 50%);
    border-radius: 4px;
    min-width: 300px;
    min-height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
}

.box-model-content {
    position: relative;
    background: rgb(100 181 246 / 20%);
    border: 2px dashed rgb(33 150 243 / 60%);
    border-radius: 4px;
    width: 100%;
    min-height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
}

.box-model-content-area {
    background: rgb(129 199 132 / 30%);
    border: 2px solid rgb(76 175 80 / 70%);
    border-radius: 4px;
    padding: var(--spacing-sm);
    min-width: 100px;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
}

.box-model-content-text {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
    text-align: center;
}

.box-model-label {
    position: absolute;
    font-size: 10px;
    font-weight: 600;
    color: var(--text-primary);
    background: var(--bg-surface);
    padding: 2px 4px;
    border-radius: 3px;
    border: 1px solid var(--border);
    white-space: nowrap;
    z-index: 10;
}

.editable-label {
    cursor: pointer;
    pointer-events: auto;
    transition: all 0.2s;
}

.editable-label:hover {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
    transform: scale(1.05);
    box-shadow: 0 2px 6px rgb(0 0 0 / 20%);
}

.editable-input {
    pointer-events: auto;
    min-width: 60px;
    text-align: center;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border: 2px solid var(--accent);
    outline: none;
}

.box-model-content-area.editable-label {
    cursor: pointer;
    transition: all 0.2s;
}

.box-model-content-area.editable-label:hover {
    background: rgb(129 199 132 / 50%);
    border-color: rgb(76 175 80 / 100%);
    transform: scale(1.02);
}

.box-model-content-area.editable-input {
    width: 100%;
    height: 100%;
    min-width: 120px;
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    padding: var(--spacing-sm);
    border: 2px solid var(--accent);
    outline: none;
    background: rgb(129 199 132 / 40%);
}

/* Margin Labels */
.box-model-label-margin-top {
    top: -22px;
    left: 50%;
    transform: translateX(-50%);
    color: #d32f2f;
    background: rgb(255 255 255 / 95%);
    box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
}

.box-model-label-margin-right {
    right: -55px;
    top: 50%;
    transform: translateY(-50%);
    color: #d32f2f;
    background: rgb(255 255 255 / 95%);
    box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
}

.box-model-label-margin-bottom {
    bottom: -22px;
    left: 50%;
    transform: translateX(-50%);
    color: #d32f2f;
    background: rgb(255 255 255 / 95%);
    box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
}

.box-model-label-margin-left {
    left: -55px;
    top: 50%;
    transform: translateY(-50%);
    color: #d32f2f;
    background: rgb(255 255 255 / 95%);
    box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
}

/* Padding Labels */
.box-model-label-padding-top {
    top: 4px;
    left: 50%;
    transform: translateX(-50%);
    color: #1976d2;
    background: rgb(255 255 255 / 95%);
    box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
}

.box-model-label-padding-right {
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    color: #1976d2;
    background: rgb(255 255 255 / 95%);
    box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
}

.box-model-label-padding-bottom {
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    color: #1976d2;
    background: rgb(255 255 255 / 95%);
    box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
}

.box-model-label-padding-left {
    left: 4px;
    top: 50%;
    transform: translateY(-50%);
    color: #1976d2;
    background: rgb(255 255 255 / 95%);
    box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
}

/* Page Tab specific labels */
.box-model-label-top {
    top: -22px;
    left: 50%;
    transform: translateX(-50%);
    color: #d32f2f;
    background: rgb(255 255 255 / 95%);
    box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
}

.box-model-label-right {
    right: -55px;
    top: 50%;
    transform: translateY(-50%);
    color: #d32f2f;
    background: rgb(255 255 255 / 95%);
    box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
}

.box-model-label-bottom {
    bottom: -22px;
    left: 50%;
    transform: translateX(-50%);
    color: #d32f2f;
    background: rgb(255 255 255 / 95%);
    box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
}

.box-model-label-left {
    left: -55px;
    top: 50%;
    transform: translateY(-50%);
    color: #d32f2f;
    background: rgb(255 255 255 / 95%);
    box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
}

@media (width <= 768px) {
    .box-model-visualization {
        padding: var(--spacing-md);
        min-height: 150px;
        overflow-x: auto;
    }

    .box-model-container {
        min-width: 250px;
        min-height: 120px;
    }

    .box-model-label-margin-right,
    .box-model-label-margin-left,
    .box-model-label-right,
    .box-model-label-left {
        font-size: 9px;
        padding: 1px 3px;
    }

    .box-model-label-padding-right,
    .box-model-label-padding-left {
        font-size: 9px;
        padding: 1px 3px;
    }
}

.layout-settings-modal .modal-footer {
    padding: var(--spacing-md) var(--spacing-lg);
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-sm);
    background: var(--bg-elevated);
}

.modal-footer-actions {
    display: flex;
    gap: var(--spacing-sm);
    margin-left: auto;
}

.layout-settings-content h6 {
    margin: var(--spacing-lg) 0 var(--spacing-md) 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
}

.layout-settings-content h6:first-child {
    margin-top: 0;
}

.margin-inputs {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
}

.margin-input-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.margin-input-group label {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
}

.margin-input {
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg-elevated);
    color: var(--text-primary);
    font-size: 14px;
}

.margin-input:focus {
    outline: none;
    border-color: var(--accent);
}

.header-footer-settings {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
}

.header-footer-settings>.margin-input-group {
    margin-bottom: var(--spacing-sm);
}

.padding-margin-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    margin-top: var(--spacing-sm);
}

.sub-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.sub-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.report-block-wrapper {
    margin-bottom: var(--spacing-xs);
    padding: 2px;
    border: 2px solid transparent;
    border-radius: 6px;
    transition: all 0.2s;
    cursor: move;
}

.report-block-wrapper:hover {
    border-color: var(--border);
    background: var(--bg-elevated);
}

.report-block-wrapper.selected {
    border-color: var(--accent);
    background: var(--bg-elevated);
}

/* Vue.Draggable classes */
.ghost-block {
    opacity: 0.4;
    background: var(--bg-elevated);
    border: 2px dashed var(--accent);
}

.chosen-block {
    cursor: grabbing;
}

.drag-block {
    opacity: 0.8;
}


.empty-canvas {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    color: var(--text-secondary);
    font-size: 16px;
}

.editor-status {
    margin-top: var(--spacing-md);
    font-size: 13px;
    color: var(--text-secondary);
    text-align: right;
    flex-shrink: 0;
}

/* Route selection styles */
.route-name {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 16px;
}

.location-info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.location-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: 14px;
    color: var(--text-secondary);
}

.start-location {
    color: var(--success);
}

.end-location {
    color: var(--error);
}

.distance-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: 14px;
    color: var(--text-secondary);
}

.status-badge {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
}

.status-completed {
    background: rgb(0 179 134 / 20%);
    color: var(--success);
}

.status-progress {
    background: rgb(0 167 225 / 20%);
    color: var(--accent);
}

.status-planned {
    background: rgb(243 156 18 / 20%);
    color: var(--warning);
}

.status-surveyed {
    background: rgb(0 179 134 / 20%);
    color: var(--success);
}

.status-reported {
    background: rgb(0 167 225 / 20%);
    color: var(--accent);
}

.header-status-badge {
    flex-shrink: 0;
    margin: 0 0.5rem;
    font-size: 11px;
    padding: 4px 10px;
}

.header-status-badge.clickable {
    cursor: pointer;
    transition: all 0.2s ease;
}

.header-status-badge.clickable:hover {
    opacity: 0.8;
    transform: scale(1.05);
}

.update-time {
    font-size: 14px;
    color: var(--text-secondary);
}

.action-buttons {
    display: flex;
    gap: var(--spacing-xs);
}


/* Loading and Empty states handled by Base components */


/* Preview modal styles */
.preview-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgb(0 0 0 / 80%);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2100;
}

.preview-modal-fullscreen {
    background: var(--bs-tertiary-bg);
    border-radius: 0;
    width: 100vw;
    height: 100vh;
    max-width: none;
    max-height: none;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    margin: 0;
    position: relative;
}

.preview-modal-fullscreen .modal-header {
    background: var(--bs-secondary-bg);
    border-bottom: 1px solid var(--bs-border-color);
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
}

.preview-modal-fullscreen .modal-body {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
    background: var(--bs-body-bg);
    text-align: left;
}

.preview-modal-fullscreen .preview-content {
    background: #fff;
    color: #000 !important;
    padding: 2rem;
    border-radius: 8px;
    min-height: 100%;
    line-height: 1.6;
    text-align: left;
}

.preview-modal-fullscreen .preview-content * {
    color: #000 !important;
}

.preview-modal-fullscreen .modal-footer {
    background: var(--bs-secondary-bg);
    border-top: 1px solid var(--bs-border-color);
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
}

/* Responsive */
@media (width <= 1200px) {
    .report-builder {
        height: auto;
        min-height: 100vh;
        overflow: visible;
    }

    .builder-layout {
        flex-direction: column;
        height: auto;
        min-height: 100vh;
        padding: 0.5rem;
    }

    .outline-panel-wrapper {
        width: 100% !important;
        height: auto;
        max-height: 300px;
        padding: 0.5rem;
    }

    .outline-panel-wrapper.collapsed {
        width: 0 !important;
        height: 0;
        max-height: 0;
        overflow: hidden;
        padding: 0;
    }

    .library-panel-wrapper {
        width: 100% !important;
        height: auto;
        max-height: 300px;
        padding: 0.5rem;
    }

    .library-panel-wrapper.collapsed {
        width: 0 !important;
        height: 0;
        max-height: 0;
        overflow: hidden;
        padding: 0;
    }

    .editor-panel {
        flex: 1;
        min-width: 0 !important;
        width: 100%;
        height: auto;
        min-height: 400px;
        max-height: none;
        margin: 0.5rem 0;
    }

    .outline-panel,
    .library-panel {
        width: 100%;
        height: 100%;
        max-height: 300px;
    }
}

@media (width <= 768px) {
    .report-builder {
        height: auto;
        min-height: 100vh;
        overflow: visible;
    }

    .builder-layout {
        flex-direction: column;
        height: auto;
        min-height: calc(100vh - 2rem);
        gap: var(--spacing-sm);
        padding: 0.5rem;
    }

    .outline-panel-wrapper {
        width: 100% !important;
        height: auto;
        max-height: 250px;
        padding: 0.5rem;
    }

    .outline-panel-wrapper.collapsed {
        width: 0 !important;
        height: 0;
        max-height: 0;
        overflow: hidden;
        padding: 0;
    }

    .library-panel-wrapper {
        width: 100% !important;
        height: auto;
        max-height: 250px;
        padding: 0.5rem;
    }

    .library-panel-wrapper.collapsed {
        width: 0 !important;
        height: 0;
        max-height: 0;
        overflow: hidden;
        padding: 0;
    }

    .editor-panel {
        flex: 1;
        min-width: 0 !important;
        width: 100%;
        height: auto;
        min-height: 300px;
        max-height: none;
        margin: 0.5rem 0;
    }

    .action-row {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
    }

    .action-group {
        width: 100%;
        justify-content: flex-start;
        flex-wrap: wrap;
    }

    .header-actions-group {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
    }

    .template-selector {
        min-width: 100%;
        max-width: 100%;
    }

    .editor-title-input {
        font-size: 20px;
    }
}

@media (width <= 480px) {
    .builder-layout {
        padding: 0.25rem;
        gap: var(--spacing-xs);
    }

    .outline-panel-wrapper,
    .library-panel-wrapper {
        padding: 0.25rem;
    }

    .editor-panel {
        margin: 0.25rem 0;
        min-height: 250px;
    }

    .editor-title-input {
        font-size: 18px;
    }
}
</style>
