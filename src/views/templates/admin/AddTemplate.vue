<template>
    <div class="template-editor-page">
        <div class="template-editor-container">
            <!-- Builder Layout -->
            <div class="builder-layout">
                <!-- Left Panel: Report Outline -->
                <div class="outline-panel-wrapper" :class="{ 'collapsed': isOutlineCollapsed }">
                    <BasePanel v-show="!isOutlineCollapsed" class="outline-panel" elevation="level1" :scrollable="true">
                        <div class="panel-header">
                            <h3>{{ $t('templateOutline') }}</h3>
                        </div>
                        <ReportOutline :sections="reportSections" :selected-block-id="selectedBlockId"
                            @select-block="selectedBlockId = $event" @toggle-visibility="toggleSectionVisibility"
                            @toggle-collapse="toggleSectionCollapse" @reorder-sections="handleReorderSections" />
                    </BasePanel>
                </div>

                <!-- Main Canvas: Document Editor -->
                <BasePanel class="editor-panel" elevation="level1" :scrollable="true">
                    <template #header>
                        <div class="header-actions-group">
                            <input v-model="addName" class="editor-title-input" :placeholder="$t('templateTitle')" />
                            <div class="header-buttons-group">
                                <BaseButton variant="ghost" size="small" @click="showTemplateMetadataModal = true">
                                    <i class="bi bi-gear"></i>
                                    {{ $t('templateSettings') }}
                                </BaseButton>
                                <BaseButton variant="ghost" size="small" leftIcon="bi bi-arrow-counterclockwise"
                                    @click="handleResetSections" :title="t('resetSectionsToDefault')"
                                    class="reset-button-toggle">
                                    Reset
                                </BaseButton>
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
                                    <BaseButton variant="primary" size="small" leftIcon="bi bi-save"
                                        @click="handleSaveTemplate" :disabled="!hasChanges">
                                        {{ t('save') }}
                                    </BaseButton>
                                    <BaseButton variant="ghost" size="small" leftIcon="bi bi-eye"
                                        @click="handlePreview">
                                        {{ t('preview') }}
                                    </BaseButton>
                                    <BaseButton variant="ghost" size="small" leftIcon="bi bi-sliders"
                                        @click="openLayoutSettings" :title="t('layoutSettings')">
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
                                        <div class="section-header-content"
                                            @click.stop="toggleSectionCollapse(section.id)">
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
                                            ghost-class="ghost-block" chosen-class="chosen-block"
                                            drag-class="drag-block"
                                            @change="(event) => handleSectionBlocksReorder(section.id, event)"
                                            @start="handleDragStart" @end="handleDragEnd"
                                            class="section-blocks-container" @drop="handleDrop" @dragover.prevent>
                                            <template #item="{ element: block }">
                                                <div class="report-block-wrapper" :data-block-id="block.id" :class="{
                                                    'selected': selectedBlockId === block.id
                                                }" @click="selectedBlockId = block.id">
                                                    <ReportBlock :block="block" :route-data="null" :route-id="null"
                                                        :table-config="tableConfigs[block.id]" :editors-locked="false"
                                                        @update-content="handleBlockContentUpdate(block.id, $event)"
                                                        @update-table-config="handleTableConfigUpdate(block.id, $event)"
                                                        @remove="handleBlockRemove(block.id)"
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
                                {{ $t('addSection') }}
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
                                <RichTextEditorCustom v-model="reportHeader" @update:modelValue="handleHeaderUpdate"
                                    :route-id="null" :locked="false"
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
                                <RichTextEditorCustom v-model="reportFooter" @update:modelValue="handleFooterUpdate"
                                    :route-id="null" :locked="false"
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
        </div>

        <!-- Template Metadata Modal -->
        <div v-if="showTemplateMetadataModal" class="modal-backdrop" @click="showTemplateMetadataModal = false">
            <div class="modal-content template-metadata-modal" @click.stop>
                <div class="modal-header">
                    <h5 class="modal-title">{{ $t('templateSettings') }}</h5>
                    <button type="button" class="btn-close" @click="showTemplateMetadataModal = false">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent>
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

                        <div class="media-upload-section">
                            <label class="form-label">{{ $t('media') }}</label>
                            <div class="media-upload-area">
                                <input type="file" ref="addMediaInput" @change="onAddAddTemplateMedia" accept="image/*"
                                    multiple style="display: none;" />
                                <BaseButton variant="secondary" size="small" left-icon="bi bi-upload"
                                    @click="$refs.addMediaInput.click()">
                                    {{ $t('uploadMedia') }}
                                </BaseButton>
                            </div>
                            <div class="media-preview" v-if="addMedia.length > 0">
                                <div v-for="(media, index) in addMedia" :key="index" class="media-item">
                                    <img :src="media.url" :alt="media.name" />
                                    <button type="button" class="remove-media" @click="removeAddTemplateMedia(index)">
                                        <i class="bi bi-x"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="checkbox-group">
                            <BaseFormField type="checkbox" :label="$t('makeVisible')" v-model="addIsVisible" />
                            <BaseFormField type="checkbox" :label="$t('isDefault')" v-model="addIsDefault" />
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <BaseButton variant="secondary" size="small" @click="showTemplateMetadataModal = false">
                        {{ $t('close') }}
                    </BaseButton>
                </div>
            </div>
        </div>

        <!-- Layout Settings Modal -->
        <div v-if="showLayoutSettingsModal" class="modal-backdrop" @click="showLayoutSettingsModal = false">
            <div class="modal-content layout-settings-modal" @click.stop>
                <div class="modal-header">
                    <h5 class="modal-title">{{ t('layoutSettings') }}</h5>
                    <button type="button" class="btn-close" @click="showLayoutSettingsModal = false">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="layout-settings-content">
                        <h6>{{ t('margins') }}</h6>
                        <div class="margin-inputs">
                            <div class="margin-input-group">
                                <label>{{ t('top') }}</label>
                                <input v-model="layoutMargin.top" type="text" class="form-control margin-input"
                                    placeholder="25mm" />
                            </div>
                            <div class="margin-input-group">
                                <label>{{ t('right') }}</label>
                                <input v-model="layoutMargin.right" type="text" class="form-control margin-input"
                                    placeholder="8mm" />
                            </div>
                            <div class="margin-input-group">
                                <label>{{ t('bottom') }}</label>
                                <input v-model="layoutMargin.bottom" type="text" class="form-control margin-input"
                                    placeholder="24mm" />
                            </div>
                            <div class="margin-input-group">
                                <label>{{ t('left') }}</label>
                                <input v-model="layoutMargin.left" type="text" class="form-control margin-input"
                                    placeholder="8mm" />
                            </div>
                        </div>

                        <h6>{{ t('headerSettings') }}</h6>
                        <div class="header-footer-settings">
                            <div class="margin-input-group">
                                <label>{{ t('height') }}</label>
                                <input v-model="layoutHeader.height" type="text" class="form-control margin-input"
                                    placeholder="30px" />
                            </div>
                            <div class="padding-margin-group">
                                <div class="sub-group">
                                    <label class="sub-label">{{ t('padding') }}</label>
                                    <div class="margin-inputs">
                                        <div class="margin-input-group">
                                            <label>{{ t('top') }}</label>
                                            <input v-model="layoutHeader.padding.top" type="text"
                                                class="form-control margin-input" placeholder="5px" />
                                        </div>
                                        <div class="margin-input-group">
                                            <label>{{ t('right') }}</label>
                                            <input v-model="layoutHeader.padding.right" type="text"
                                                class="form-control margin-input" placeholder="10px" />
                                        </div>
                                        <div class="margin-input-group">
                                            <label>{{ t('bottom') }}</label>
                                            <input v-model="layoutHeader.padding.bottom" type="text"
                                                class="form-control margin-input" placeholder="5px" />
                                        </div>
                                        <div class="margin-input-group">
                                            <label>{{ t('left') }}</label>
                                            <input v-model="layoutHeader.padding.left" type="text"
                                                class="form-control margin-input" placeholder="10px" />
                                        </div>
                                    </div>
                                </div>
                                <div class="sub-group">
                                    <label class="sub-label">{{ t('margins') }}</label>
                                    <div class="margin-inputs">
                                        <div class="margin-input-group">
                                            <label>{{ t('top') }}</label>
                                            <input v-model="layoutHeader.margin.top" type="text"
                                                class="form-control margin-input" placeholder="0px" />
                                        </div>
                                        <div class="margin-input-group">
                                            <label>{{ t('right') }}</label>
                                            <input v-model="layoutHeader.margin.right" type="text"
                                                class="form-control margin-input" placeholder="0px" />
                                        </div>
                                        <div class="margin-input-group">
                                            <label>{{ t('bottom') }}</label>
                                            <input v-model="layoutHeader.margin.bottom" type="text"
                                                class="form-control margin-input" placeholder="0px" />
                                        </div>
                                        <div class="margin-input-group">
                                            <label>{{ t('left') }}</label>
                                            <input v-model="layoutHeader.margin.left" type="text"
                                                class="form-control margin-input" placeholder="0px" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <h6>{{ t('footerSettings') }}</h6>
                        <div class="header-footer-settings">
                            <div class="margin-input-group">
                                <label>{{ t('height') }}</label>
                                <input v-model="layoutFooter.height" type="text" class="form-control margin-input"
                                    placeholder="40px" />
                            </div>
                            <div class="padding-margin-group">
                                <div class="sub-group">
                                    <label class="sub-label">{{ t('padding') }}</label>
                                    <div class="margin-inputs">
                                        <div class="margin-input-group">
                                            <label>{{ t('top') }}</label>
                                            <input v-model="layoutFooter.padding.top" type="text"
                                                class="form-control margin-input" placeholder="15px" />
                                        </div>
                                        <div class="margin-input-group">
                                            <label>{{ t('right') }}</label>
                                            <input v-model="layoutFooter.padding.right" type="text"
                                                class="form-control margin-input" placeholder="30px" />
                                        </div>
                                        <div class="margin-input-group">
                                            <label>{{ t('bottom') }}</label>
                                            <input v-model="layoutFooter.padding.bottom" type="text"
                                                class="form-control margin-input" placeholder="15px" />
                                        </div>
                                        <div class="margin-input-group">
                                            <label>{{ t('left') }}</label>
                                            <input v-model="layoutFooter.padding.left" type="text"
                                                class="form-control margin-input" placeholder="30px" />
                                        </div>
                                    </div>
                                </div>
                                <div class="sub-group">
                                    <label class="sub-label">{{ t('margins') }}</label>
                                    <div class="margin-inputs">
                                        <div class="margin-input-group">
                                            <label>{{ t('top') }}</label>
                                            <input v-model="layoutFooter.margin.top" type="text"
                                                class="form-control margin-input" placeholder="0px" />
                                        </div>
                                        <div class="margin-input-group">
                                            <label>{{ t('right') }}</label>
                                            <input v-model="layoutFooter.margin.right" type="text"
                                                class="form-control margin-input" placeholder="0px" />
                                        </div>
                                        <div class="margin-input-group">
                                            <label>{{ t('bottom') }}</label>
                                            <input v-model="layoutFooter.margin.bottom" type="text"
                                                class="form-control margin-input" placeholder="0px" />
                                        </div>
                                        <div class="margin-input-group">
                                            <label>{{ t('left') }}</label>
                                            <input v-model="layoutFooter.margin.left" type="text"
                                                class="form-control margin-input" placeholder="0px" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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

        <!-- Loop Body Editor Modal -->
        <LoopBodyEditor :show="showLoopEditor" :loop-type="loopEditorType" :route-id="null" @confirm="handleLoopConfirm"
            @cancel="handleLoopCancel" />

        <!-- Preview Options Modal -->
        <div v-if="showPreviewOptionsModal" class="modal-backdrop" @click="showPreviewOptionsModal = false">
            <div class="modal-content preview-options-modal" @click.stop>
                <div class="modal-header">
                    <h5 class="modal-title">{{ t('previewOptions') }}</h5>
                    <button type="button" class="btn-close" @click="showPreviewOptionsModal = false">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="preview-options-content">
                        <BaseButton variant="primary" size="medium" leftIcon="bi bi-eye" @click="handleStandardPreview"
                            class="preview-option-btn">
                            {{ t('preview') }}
                        </BaseButton>
                        <BaseButton variant="secondary" size="medium" leftIcon="bi bi-route"
                            @click="handlePreviewOnRoute" class="preview-option-btn">
                            {{ t('previewOnRoute') }}
                        </BaseButton>
                    </div>
                </div>
            </div>
        </div>

        <!-- Route Selection Modal -->
        <div v-if="showRouteSelectionModal" class="modal-backdrop" @click="showRouteSelectionModal = false">
            <div class="modal-content route-selection-modal" @click.stop>
                <div class="modal-header">
                    <h5 class="modal-title">{{ t('selectRoute') }}</h5>
                    <button type="button" class="btn-close" @click="showRouteSelectionModal = false">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div v-if="loadingRoutes" class="loading-container">
                        <BaseLoadingIndicator />
                    </div>
                    <div v-else-if="routes.length === 0" class="no-routes-message">
                        {{ t('noRoutesAvailable') }}
                    </div>
                    <div v-else class="routes-list">
                        <div v-for="route in routes" :key="route.id" class="route-item"
                            @click="selectRouteForPreview(route)"
                            :class="{ 'selected': selectedRouteForPreview?.id === route.id }">
                            <div class="route-info">
                                <h6 class="route-title">{{ route.title || route.name }}</h6>
                                <p class="route-description" v-if="route.description">{{ route.description }}</p>
                                <div class="route-meta">
                                    <span class="route-date" v-if="route.dateAdded">
                                        {{ formatDate(route.dateAdded) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <BasePagination v-if="totalRoutePages > 1 && routes.length > 0" :current-page="currentRoutePage"
                        :total-pages="totalRoutePages" :total-items="totalRouteCount" :items-per-page="routesPerPage"
                        item-label="routes" @page-change="goToRoutePage" />
                </div>
                <div class="modal-footer">
                    <BaseButton variant="secondary" size="small" @click="showRouteSelectionModal = false">
                        {{ t('cancel') }}
                    </BaseButton>
                    <BaseButton variant="primary" size="small" @click="handlePreviewWithRoute"
                        :disabled="!selectedRouteForPreview">
                        {{ t('preview') }}
                    </BaseButton>
                </div>
            </div>
        </div>

        <!-- Preview Modal -->
        <div v-if="showPreview" class="modal-backdrop preview-fullscreen" @click="showPreview = false">
            <div class="modal-content preview-modal-fullscreen" @click.stop>
                <div class="modal-header">
                    <h5 class="modal-title">{{ t('templatePreview') }}</h5>
                    <div class="preview-actions">
                        <button type="button" class="btn-close" @click="showPreview = false">
                            <i class="bi bi-x-lg"></i>
                        </button>
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

        <!-- Add Section Modal -->
        <div v-if="showAddSectionModal" class="modal-backdrop" @click="showAddSectionModal = false">
            <div class="modal-content add-section-modal" @click.stop>
                <div class="modal-header">
                    <h5 class="modal-title">{{ t('addSection') }}</h5>
                    <button type="button" class="btn-close" @click="showAddSectionModal = false">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="section-type-selection">
                        <div class="section-type-option">
                            <h6>{{ t('defaultSections') }}</h6>
                            <div class="section-templates">
                                <button v-for="template in availableSectionTemplates" :key="template.id"
                                    class="section-template-btn" @click="handleAddDefaultSection(template.id)">
                                    <i class="bi bi-file-text"></i>
                                    <span>{{ template.title }}</span>
                                </button>
                            </div>
                        </div>
                        <div class="section-type-divider">
                            <span>{{ t('or') }}</span>
                        </div>
                        <div class="section-type-option">
                            <h6>{{ t('customSection') }}</h6>
                            <div class="custom-section-input">
                                <input v-model="newSectionTitle" type="text" :placeholder="t('sectionTitle')"
                                    class="form-control" @keyup.enter="handleAddCustomSection" />
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

    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useManageTemplates } from '@/composables/templates/useManageTemplates';
import { useReportBuilder } from '@/composables/useReportBuilder';
import BaseButton from '@/components/ui/BaseButton.vue';
import BasePanel from '@/components/ui/BasePanel.vue';
import BaseFormField from '@/components/ui/BaseFormField.vue';
import BaseLoadingIndicator from '@/components/ui/BaseLoadingIndicator.vue';
import BasePagination from '@/components/ui/BasePagination.vue';
import ReportOutline from '@/components/reports/ReportOutline.vue';
import ReportBlock from '@/components/reports/ReportBlock.vue';
import BlockLibrary from '@/components/reports/BlockLibrary.vue';
import LoopBodyEditor from '@/components/reports/LoopBodyEditor.vue';
import RichTextEditorCustom from '@/components/reports/RichTextEditorCustom.vue';
import draggable from 'vuedraggable';
import RoutesController from '@/controllers/routes/routes_controller';
import { MASLUtility } from '@/utils/masl_utility';

const { t } = useI18n();
const router = useRouter();
const showMessage = inject('showMessage');
const setGlobalLoading = inject('setGlobalLoading');

// Use report builder composable
const {
    reportSections,
    reportBlocks,
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
    initializeReportStructure,
    createBlock,
    addBlockToSection,
    removeBlock,
    updateBlockContent,
    updateTableConfig,
    toggleSectionVisibility,
    toggleSectionCollapse,
    updateSectionTitle,
    removeSection,
    addSection,
    getDefaultSectionTemplates,
    updateHeader,
    updateFooter,
    clearHeader,
    clearFooter,
    updateLayout,
    resetSectionsToDefault,
    undo,
    redo,
    flattenBlocks,
    previewReport,
    generateHTMLContent,
} = useReportBuilder();

// Use template composable
const {
    addName,
    addDescription,
    addPrice,
    addContent,
    addMedia,
    addIsVisible,
    addIsDefault,
    onAddTemplate,
    onAddAddTemplateMedia,
    removeAddTemplateMedia,
    clearAddTemplateFields,
} = useManageTemplates();

// Local state
const showTemplateMetadataModal = ref(false);
const isOutlineCollapsed = ref(true);
const isLibraryCollapsed = ref(true);
const showAddSectionModal = ref(false);
const newSectionTitle = ref('');
const editingSectionId = ref(null);
const editingSectionTitle = ref('');
const showLoopEditor = ref(false);
const loopEditorType = ref('point');
const targetEditorElement = ref(null);
const availableSectionTemplates = ref([]);
const sectionTitleInputRef = ref(null);

// Preview options state
const showPreviewOptionsModal = ref(false);
const showRouteSelectionModal = ref(false);
const routes = ref([]);
const loadingRoutes = ref(false);
const selectedRouteForPreview = ref(null);
const routesPerPage = 10;
const currentRoutePage = ref(1);
const totalRoutePages = ref(1);
const totalRouteCount = ref(0);

// Layout settings state
const showLayoutSettingsModal = ref(false);
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

// Initialize
onMounted(() => {
    initializeReportStructure(null);
    availableSectionTemplates.value = getDefaultSectionTemplates();
});

// Watch for changes
watch([reportSections, reportHeader, reportFooter], () => {
    hasChanges.value = true;
}, { deep: true });

// Save template
const handleSaveTemplate = async () => {
    if (!addName.value || !addName.value.trim()) {
        showMessage({ status: 'error', message: t('templateNameRequired') });
        return;
    }

    setGlobalLoading(true);
    try {
        // Serialize template structure
        const structure = {
            sections: reportSections.value,
            tableConfigs: tableConfigs.value,
            header: reportHeader.value,
            footer: reportFooter.value,
            layout: reportLayout.value,
        };

        // Update addContent with JSON structure
        addContent.value = JSON.stringify({
            structure,
            version: '2.0',
            timestamp: new Date().toISOString(),
        });

        // Save template
        const result = await onAddTemplate();
        if (result) {
            hasChanges.value = false;
            showMessage({ status: 'success', message: t('templateSavedSuccessfully') });
            router.push({ name: 'ManageTemplates' });
        }
    } catch (error) {
        console.error('Error saving template:', error);
        showMessage({ status: 'error', message: 'Error saving template' });
    } finally {
        setGlobalLoading(false);
    }
};

// Panel toggles
const toggleOutlinePanel = () => {
    isOutlineCollapsed.value = !isOutlineCollapsed.value;
};

const toggleLibraryPanel = () => {
    isLibraryCollapsed.value = !isLibraryCollapsed.value;
};

// Section editing
const startEditingSection = (sectionId, currentTitle) => {
    editingSectionId.value = sectionId;
    editingSectionTitle.value = currentTitle;
    nextTick(() => {
        if (sectionTitleInputRef.value) {
            sectionTitleInputRef.value.focus();
        }
    });
};

const finishEditingSection = (sectionId) => {
    if (editingSectionTitle.value && editingSectionTitle.value.trim()) {
        updateSectionTitle(sectionId, editingSectionTitle.value.trim());
    }
    editingSectionId.value = null;
    editingSectionTitle.value = '';
};

const cancelEditingSection = () => {
    editingSectionId.value = null;
    editingSectionTitle.value = '';
};

const handleRemoveSection = (sectionId) => {
    if (confirm(t('confirmRemoveSection'))) {
        removeSection(sectionId);
    }
};

// Section management
const handleSectionsReorder = () => {
    hasChanges.value = true;
};

const handleSectionBlocksReorder = (sectionId, event) => {
    if (event.moved) {
        hasChanges.value = true;
    }
};

const handleReorderSections = (sectionIds) => {
    const sectionsMap = new Map(reportSections.value.map(s => [s.id, s]));
    reportSections.value = sectionIds.map(id => sectionsMap.get(id)).filter(Boolean);
    hasChanges.value = true;
};

const handleAddDefaultSection = (templateId) => {
    const template = availableSectionTemplates.value.find(t => t.id === templateId);
    if (template) {
        const result = addSection(template.id);
        if (result && result.success) {
            showAddSectionModal.value = false;
            newSectionTitle.value = '';
        } else if (result && !result.success) {
            showMessage({ status: 'error', message: result.message || 'Failed to add section' });
        }
    }
};

const handleAddCustomSection = () => {
    if (newSectionTitle.value && newSectionTitle.value.trim()) {
        const result = addSection('custom', newSectionTitle.value.trim());
        if (result && result.success) {
            showAddSectionModal.value = false;
            newSectionTitle.value = '';
        } else if (result && !result.success) {
            showMessage({ status: 'error', message: result.message || 'Failed to add section' });
        }
    }
};

const handleResetSections = () => {
    if (confirm(t('confirmResetSections'))) {
        resetSectionsToDefault();
    }
};

// Drag and drop
const handleDragStart = (event) => {
    draggedBlockId.value = event.item.dataset.blockId || null;
};

const handleDragEnd = () => {
    draggedBlockId.value = null;
    draggedOverBlockId.value = null;
};

const handleContentDragOver = (event) => {
    event.preventDefault();
};

const handleDrop = (event) => {
    event.preventDefault();
    const blockType = event.dataTransfer.getData('block-type');
    const blockConfig = event.dataTransfer.getData('block-config');

    if (blockType) {
        try {
            const config = blockConfig ? JSON.parse(blockConfig) : {};
            const block = createBlock(blockType, config);

            let targetSection = null;
            let targetElement = event.target;

            while (targetElement && targetElement !== document.body) {
                if (targetElement.classList && targetElement.classList.contains('editor-section')) {
                    const sectionId = targetElement.dataset.sectionId;
                    targetSection = reportSections.value.find(s => s.id === sectionId);
                    break;
                }
                targetElement = targetElement.parentElement;
            }

            if (targetSection) {
                addBlockToSection(targetSection.id, block);
            }
        } catch (error) {
            console.error('Error handling drop:', error);
        }
    }
};

// Block handlers
const handleBlockContentUpdate = (blockId, content) => {
    updateBlockContent(blockId, content);
    hasChanges.value = true;
};

const handleTableConfigUpdate = (blockId, config) => {
    updateTableConfig(blockId, config);
    hasChanges.value = true;
};

const handleBlockRemove = (blockId) => {
    removeBlock(blockId);
    hasChanges.value = true;
};

const handleInsertBlock = (blockType, config = {}) => {
    const block = createBlock(blockType, config);
    if (reportSections.value.length > 0) {
        addBlockToSection(reportSections.value[0].id, block);
    } else {
        const newSection = addSection('New Section');
        addBlockToSection(newSection.id, block);
    }
    hasChanges.value = true;
};

// Loop editor
const handleEditLoop = (loopType) => {
    loopEditorType.value = loopType;
    showLoopEditor.value = true;
    targetEditorElement.value = null;
};

const handleLoopDropFromEditor = (data) => {
    const { event, config, editorElement, blockId } = data;
    const loopType = config?.type || 'point';
    targetEditorElement.value = editorElement;
    loopEditorType.value = loopType;
    showLoopEditor.value = true;
};

const handleLoopConfirm = async (textContent) => {
    if (targetEditorElement.value) {
        await insertIntoEditor(targetEditorElement.value, textContent);
    }
    showLoopEditor.value = false;
    loopEditorType.value = 'point';
    targetEditorElement.value = null;
    hasChanges.value = true;
};

const handleLoopCancel = () => {
    showLoopEditor.value = false;
    loopEditorType.value = 'point';
    targetEditorElement.value = null;
};

// Row editor
const handleEditRow = (rowTitle) => {
    console.log('Row editor requested:', rowTitle);
};

// Editor helpers
async function insertIntoEditor(editorElement, content) {
    let contentEditableEditor = null;

    if (editorElement) {
        contentEditableEditor = editorElement.querySelector?.('.custom-editor-content');
        if (!contentEditableEditor) {
            const parentEditor = editorElement.closest('.rich-text-editor');
            if (parentEditor) {
                contentEditableEditor = parentEditor.querySelector?.('.custom-editor-content');
            }
        }
        if (!contentEditableEditor && editorElement.contentEditable === 'true') {
            contentEditableEditor = editorElement;
        }
    }

    if (contentEditableEditor) {
        const selection = window.getSelection();
        let range = null;

        if (selection.rangeCount > 0) {
            range = selection.getRangeAt(0);
            if (!contentEditableEditor.contains(range.commonAncestorContainer)) {
                range = null;
            }
        }

        if (!range) {
            range = document.createRange();
            range.selectNodeContents(contentEditableEditor);
            range.collapse(false);
        }

        const textWithBreaks = content.replace(/\n/g, '<br>');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = textWithBreaks;

        const fragment = document.createDocumentFragment();
        while (tempDiv.firstChild) {
            fragment.appendChild(tempDiv.firstChild);
        }

        range.deleteContents();
        range.insertNode(fragment);

        contentEditableEditor.focus();

        await nextTick();
        const updatedContent = contentEditableEditor.innerHTML;

        let blockElement = editorElement;
        let blockId = null;
        while (blockElement && blockElement !== document.body) {
            if (blockElement.dataset && blockElement.dataset.blockId) {
                blockId = blockElement.dataset.blockId;
                break;
            }
            blockElement = blockElement.parentElement;
        }

        if (blockId) {
            updateBlockContent(blockId, updatedContent);
        }
    }
}

// Editor lock

// Header/Footer
const handleHeaderUpdate = (value) => {
    updateHeader(value);
    hasChanges.value = true;
};

const handleFooterUpdate = (value) => {
    updateFooter(value);
    hasChanges.value = true;
};

const handleClearHeader = () => {
    if (confirm(t('confirmRemoveHeader'))) {
        clearHeader();
        hasChanges.value = true;
    }
};

const handleClearFooter = () => {
    if (confirm(t('confirmRemoveFooter'))) {
        clearFooter();
        hasChanges.value = true;
    }
};

// Preview
const handlePreview = () => {
    // Reset cached route selection
    MASLUtility.resetData();
    selectedRouteForPreview.value = null;
    showPreviewOptionsModal.value = true;
};

const handleStandardPreview = async () => {
    showPreviewOptionsModal.value = false;
    setGlobalLoading(true);
    try {
        let html = '';

        reportSections.value.forEach(section => {
            if (section.visible) {
                html += `<h2>${section.title}</h2>`;
                section.blocks.forEach(block => {
                    if (block.type === 'text') {
                        html += `<div>${block.config?.content || ''}</div>`;
                    } else if (block.type === 'heading') {
                        html += `<h3>${block.config?.content || ''}</h3>`;
                    }
                });
            }
        });

        previewContent.value = html;
        showPreview.value = true;
    } catch (error) {
        console.error('Error generating preview:', error);
        showMessage({ status: 'error', message: 'Error generating preview' });
    } finally {
        setGlobalLoading(false);
    }
};

const handlePreviewOnRoute = async () => {
    showPreviewOptionsModal.value = false;
    showRouteSelectionModal.value = true;
    await loadRoutes(1);
};

const loadRoutes = async (page = 1) => {
    loadingRoutes.value = true;
    try {
        const res = await RoutesController.getCurrentUserRoutesPaginated(page, routesPerPage);
        if (res.result) {
            routes.value = res.data;
            if (res.pagination) {
                totalRouteCount.value = res.pagination.TotalCount || res.pagination.totalCount || res.pagination.total_count || 0;
                totalRoutePages.value = res.pagination.TotalPages || res.pagination.totalPages || res.pagination.total_pages || 1;
                currentRoutePage.value = res.pagination.CurrentPage || res.pagination.currentPage || res.pagination.current_page || 1;
            } else {
                totalRouteCount.value = res.data ? res.data.length : 0;
                totalRoutePages.value = 1;
                currentRoutePage.value = 1;
            }
        } else {
            routes.value = [];
            totalRouteCount.value = 0;
            totalRoutePages.value = 1;
        }
    } catch (error) {
        console.error('Error loading routes:', error);
        showMessage({ status: 'error', message: 'Error loading routes' });
    } finally {
        loadingRoutes.value = false;
    }
};

const goToRoutePage = (page) => {
    loadRoutes(page);
};

const selectRouteForPreview = (route) => {
    selectedRouteForPreview.value = route;
};

const handlePreviewWithRoute = async () => {
    if (!selectedRouteForPreview.value) return;

    showRouteSelectionModal.value = false;
    setGlobalLoading(true);
    try {
        await previewReport(selectedRouteForPreview.value.id);
    } catch (error) {
        console.error('Error generating preview with route:', error);
        showMessage({ status: 'error', message: 'Error generating preview' });
    } finally {
        setGlobalLoading(false);
        selectedRouteForPreview.value = null;
    }
};

// Format date
const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
};

// Layout settings handlers
const openLayoutSettings = () => {
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
    showLayoutSettingsModal.value = true;
};

const handleResetLayoutSettings = () => {
    // Reset to default values
    layoutMargin.value = {
        top: '25mm',
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
};

const handleSaveLayoutSettings = () => {
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
    hasChanges.value = true;
    showMessage({ status: 'success', message: t('layoutSettingsSaved') });
    showLayoutSettingsModal.value = false;
};
</script>

<style scoped>
.template-editor-page {
    min-height: 100vh;

    /* background: var(--bg-surface); */
}

.template-editor-container {
    display: flex;
    flex-direction: column;
    height: 93vh;
    overflow: hidden;
    padding: 1rem;
}

.editor-header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;

    /* padding: 1rem; */

    /* background: var(--bg-elevated); */
    border-bottom: 1px solid var(--border);
}

.editor-header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

.editor-title {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
}

.builder-layout {
    display: flex;
    flex: 1;
    overflow: hidden;

    /* gap: var(--spacing-md); */

    /* padding: 1rem; */
}

.outline-panel-wrapper {
    width: 250px;
    transition: width 0.3s ease;
    overflow: hidden;
}

.outline-panel-wrapper.collapsed {
    width: 0;
    padding: 0;
}

.library-panel-wrapper {
    width: 300px;
    transition: width 0.3s ease;
    overflow: hidden;
}

.library-panel-wrapper.collapsed {
    width: 0;
    padding: 0;
}

.editor-panel {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
}

.editor-content {
    flex: 1;
    overflow-y: auto;

    /* padding: var(--spacing-md); */
}

.sections-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.editor-section {
    margin-bottom: var(--spacing-sm);
}

.editor-section :deep(.base-panel__header) {
    user-select: none;
    padding: var(--spacing-2xs) var(--spacing-sm);
    min-height: auto;
}

.editor-section :deep(.base-panel__header-main) {
    margin-bottom: 0;
    justify-content: flex-start;
}

.editor-section :deep(.base-panel__header-content) {
    width: 100%;
    text-align: left;
}

.editor-section :deep(.base-panel__title) {
    display: none;
}

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
    border-radius: var(--radius-sm);
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
    border-radius: var(--radius-sm);
    padding: 2px 6px;
    outline: none;
    min-width: 100px;
}

.section-title-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px rgba(var(--accent-rgb, 0, 167, 225), 0.2);
}

.section-header-actions {
    display: flex;
    gap: var(--spacing-xs);
    align-items: center;
    margin-left: auto;
}

.section-blocks-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
}

.report-block-wrapper {
    position: relative;
}

.report-block-wrapper.selected {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
}

.empty-section-placeholder {
    padding: var(--spacing-lg);
    text-align: center;
    border: 2px dashed var(--border);
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    background: var(--bg-elevated);
}

.empty-canvas {
    padding: var(--spacing-xl);
    text-align: center;
    color: var(--text-secondary);
}

.add-section-container {
    margin-top: var(--spacing-md);
    text-align: center;
}

.header-footer-section {
    margin-top: var(--spacing-md);
}

.header-footer-content {
    padding: var(--spacing-md);
}

.editor-status {
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--bg-elevated);
    border-top: 1px solid var(--border);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    text-align: center;
}

.header-actions-group {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    flex: 1;
}

.editor-title-input {
    flex: 1;
    padding: var(--spacing-xs) var(--spacing-sm);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
}

.header-buttons-group {
    display: flex;
    gap: var(--spacing-xs);
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

.panel-header {
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--border);
}

.panel-header h3 {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
}

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
    border-radius: var(--radius-lg);
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

/* Modal Backdrop */
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

/* Add Section Modal */
.add-section-modal {
    background: var(--bg-surface);
    border-radius: var(--radius-xl);
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
    border-radius: var(--radius-lg);
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

.custom-section-input .form-control {
    flex: 1;
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--bg-elevated);
    color: var(--text-primary);
    font-size: 14px;
}

.custom-section-input .form-control:focus {
    outline: none;
    border-color: var(--accent);
}

.ghost-section,
.ghost-block {
    opacity: 0.5;
}

.chosen-section,
.chosen-block {
    opacity: 0.8;
}

.drag-section,
.drag-block {
    opacity: 0.5;
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

.form-row {
    display: flex;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
}

.form-col {
    flex: 1;
}

/* Template Metadata Modal */
.template-metadata-modal {
    background: var(--bg-surface);
    border-radius: var(--radius-xl);
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 32px rgb(0 0 0 / 20%);
}

.template-metadata-modal .modal-header {
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-elevated);
}

.template-metadata-modal .modal-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
}

.template-metadata-modal .btn-close {
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

.template-metadata-modal .btn-close:hover {
    color: var(--text-primary);
}

.template-metadata-modal .modal-body {
    padding: var(--spacing-lg);
    overflow-y: auto;
}

.template-metadata-modal .modal-footer {
    padding: var(--spacing-md) var(--spacing-lg);
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: var(--spacing-sm);
    background: var(--bg-elevated);
}

/* Layout Settings Modal */
.layout-settings-modal {
    background: var(--bg-surface);
    border-radius: var(--radius-xl);
    width: 90%;
    max-width: 500px;
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
    border-radius: var(--radius-md);
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
    gap: var(--spacing-sm);
}

.sub-label {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
}

/* Hide parsing toggle in editors */
:deep(.auto-parse-toggle.toolbar-btn) {
    display: none !important;
}

/* Preview Options Modal */
.preview-options-modal {
    background: var(--bg-surface);
    border-radius: var(--radius-xl);
    width: 90%;
    max-width: 400px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 32px rgb(0 0 0 / 20%);
}

.preview-options-modal .modal-header {
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-elevated);
}

.preview-options-modal .modal-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
}

.preview-options-modal .btn-close {
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

.preview-options-modal .btn-close:hover {
    color: var(--text-primary);
}

.preview-options-modal .modal-body {
    padding: var(--spacing-lg);
}

.preview-options-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.preview-option-btn {
    width: 100%;
    justify-content: flex-start;
}

/* Route Selection Modal */
.route-selection-modal {
    background: var(--bg-surface);
    border-radius: var(--radius-xl);
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 32px rgb(0 0 0 / 20%);
}

.route-selection-modal .modal-header {
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-elevated);
}

.route-selection-modal .modal-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
}

.route-selection-modal .btn-close {
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

.route-selection-modal .btn-close:hover {
    color: var(--text-primary);
}

.route-selection-modal .modal-body {
    padding: var(--spacing-lg);
    overflow-y: auto;
    max-height: 60vh;
}

.route-selection-modal .modal-footer {
    padding: var(--spacing-md) var(--spacing-lg);
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: var(--spacing-sm);
    background: var(--bg-elevated);
}

.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: var(--spacing-2xl);
    min-height: 200px;
}

.no-routes-message {
    text-align: center;
    padding: var(--spacing-2xl);
    color: var(--text-secondary);
}

.routes-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.route-item {
    padding: var(--spacing-md);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all 0.2s;
    background: var(--bg-elevated);
}

.route-item:hover {
    background: var(--bg-surface);
    border-color: var(--accent);
}

.route-item.selected {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
}

.route-item.selected .route-title,
.route-item.selected .route-description,
.route-item.selected .route-meta {
    color: white;
}

.route-info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.route-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
}

.route-description {
    margin: 0;
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.4;
}

.route-meta {
    display: flex;
    gap: var(--spacing-md);
    font-size: 12px;
    color: var(--text-secondary);
}

.checkbox-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
}
</style>
