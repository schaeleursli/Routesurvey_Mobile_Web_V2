<template>
    <div ref="editorContainerRef" class="rich-text-editor custom-editor" @drop="handleDrop" @dragover="handleDragOver"
        @dragenter="handleDragEnter">
        <!-- Custom Toolbar -->
        <div v-if="showToolbar" class="custom-toolbar">
            <div class="toolbar-group">
                <select @change="formatBlock($event.target.value)" class="toolbar-select" :disabled="props.locked">
                    <option value="">Normal</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                    <option value="h4">Heading 4</option>
                    <option value="h5">Heading 5</option>
                    <option value="h6">Heading 6</option>
                </select>
            </div>
            <div class="toolbar-group">
                <select @change="setFontSize($event.target.value)" class="toolbar-select" title="Font Size"
                    :disabled="props.locked">
                    <option value="">Font Size</option>
                    <option value="8px">8px</option>
                    <option value="9px">9px</option>
                    <option value="10px">10px</option>
                    <option value="11px">11px</option>
                    <option value="12px">12px</option>
                    <option value="14px">14px</option>
                    <option value="16px">16px</option>
                    <option value="18px">18px</option>
                    <option value="20px">20px</option>
                    <option value="24px">24px</option>
                    <option value="28px">28px</option>
                    <option value="32px">32px</option>
                    <option value="36px">36px</option>
                    <option value="48px">48px</option>
                    <option value="72px">72px</option>
                </select>
            </div>
            <div class="toolbar-group">
                <button type="button" @mousedown.prevent.stop @click.prevent.stop="execCommand('bold')" title="Bold"
                    class="toolbar-btn" :class="{ 'active': isFormatActive('bold') }" :disabled="props.locked">
                    <i class="bi bi-type-bold"></i>
                </button>
                <button type="button" @mousedown.prevent.stop @click.prevent.stop="execCommand('italic')" title="Italic"
                    class="toolbar-btn" :class="{ 'active': isFormatActive('italic') }" :disabled="props.locked">
                    <i class="bi bi-type-italic"></i>
                </button>
                <button type="button" @mousedown.prevent.stop @click.prevent.stop="execCommand('underline')"
                    title="Underline" class="toolbar-btn" :class="{ 'active': isFormatActive('underline') }"
                    :disabled="props.locked">
                    <i class="bi bi-type-underline"></i>
                </button>
                <button type="button" @mousedown.prevent.stop @click.prevent.stop="execCommand('strikeThrough')"
                    title="Strikethrough" class="toolbar-btn" :class="{ 'active': isFormatActive('strikeThrough') }"
                    :disabled="props.locked">
                    <i class="bi bi-type-strikethrough"></i>
                </button>
            </div>
            <div class="toolbar-group">
                <input type="color" @change="setColor('foreColor', $event.target.value)" title="Text Color"
                    class="toolbar-color" :disabled="props.locked" />
                <button type="button" @mousedown.prevent.stop @click.prevent.stop="resetColor('foreColor')"
                    title="Reset Text Color" class="toolbar-btn toolbar-btn-secondary" :disabled="props.locked">
                    <i class="bi bi-arrow-counterclockwise"></i>
                </button>
                <!-- <input type="color" @change="setColor('backColor', $event.target.value)" title="Background Color"
                    class="toolbar-color" :disabled="props.locked" />
                <button type="button" @mousedown.prevent.stop @click.prevent.stop="resetColor('backColor')"
                    title="Reset Background Color" class="toolbar-btn toolbar-btn-secondary" :disabled="props.locked">
                    <i class="bi bi-arrow-counterclockwise"></i>
                </button> -->
            </div>
            <div class="toolbar-group">
                <button type="button" @mousedown.prevent.stop @click.prevent.stop="execCommand('justifyLeft')"
                    title="Align Left" class="toolbar-btn" :class="{ 'active': isFormatActive('justifyLeft') }"
                    :disabled="props.locked">
                    <i class="bi bi-text-left"></i>
                </button>
                <button type="button" @mousedown.prevent.stop @click.prevent.stop="execCommand('justifyCenter')"
                    title="Align Center" class="toolbar-btn" :class="{ 'active': isFormatActive('justifyCenter') }"
                    :disabled="props.locked">
                    <i class="bi bi-text-center"></i>
                </button>
                <button type="button" @mousedown.prevent.stop @click.prevent.stop="execCommand('justifyRight')"
                    title="Align Right" class="toolbar-btn" :class="{ 'active': isFormatActive('justifyRight') }"
                    :disabled="props.locked">
                    <i class="bi bi-text-right"></i>
                </button>
                <!-- <button type="button" @mousedown.prevent.stop @click.prevent.stop="execCommand('justifyFull')"
                    title="Justify" class="toolbar-btn" :class="{ 'active': isFormatActive('justifyFull') }"
                    :disabled="props.locked">
                    <i class="bi bi-justify"></i>
                </button> -->
            </div>
            <!-- <div class="toolbar-group">
                <button type="button" @click="execCommand('insertUnorderedList')" title="Bullet List"
                    class="toolbar-btn" :disabled="props.locked">
                    <i class="bi bi-list-ul"></i>
                </button>
                <button type="button" @click="execCommand('insertOrderedList')" title="Numbered List"
                    class="toolbar-btn" :disabled="props.locked">
                    <i class="bi bi-list-ol"></i>
                </button>
                <button type="button" @click="execCommand('outdent')" title="Decrease Indent" class="toolbar-btn"
                    :disabled="props.locked">
                    <i class="bi bi-dedent"></i>
                </button>
                <button type="button" @click="execCommand('indent')" title="Increase Indent" class="toolbar-btn"
                    :disabled="props.locked">
                    <i class="bi bi-indent"></i>
                </button>
            </div> -->
            <div class="toolbar-group">
                <!-- <button type="button" @click="execCommand('subscript')" title="Subscript" class="toolbar-btn"
                    :disabled="props.locked">
                    <i class="bi bi-subscript"></i>
                </button>
                <button type="button" @click="execCommand('superscript')" title="Superscript" class="toolbar-btn"
                    :disabled="props.locked">
                    <i class="bi bi-superscript"></i>
                </button> -->
                <!-- <button type="button" @click="createLink" title="Insert Link" class="toolbar-btn"
                    :disabled="props.locked">
                    <i class="bi bi-link"></i>
                </button> -->
                <button type="button" @click.stop.prevent="openImageModal" title="Insert Image" class="toolbar-btn"
                    :disabled="props.locked">
                    <i class="bi bi-image"></i>
                </button>
                <button type="button" @click.stop.prevent="insertTable" title="Insert Table" class="toolbar-btn"
                    :disabled="props.locked">
                    <i class="bi bi-table"></i>
                </button>
                <button type="button" @click.stop.prevent="insertTableOfContents" title="Insert Table of Contents"
                    class="toolbar-btn" :disabled="props.locked">
                    <i class="bi bi-list-nested"></i>
                </button>
                <button type="button" @click.stop.prevent="openRowBodyEditor" title="Insert Row" class="toolbar-btn"
                    :disabled="props.locked">
                    <i class="bi bi-grid"></i>
                </button>
            </div>
            <div class="toolbar-group">
                <button type="button" @click="clearFormatting" title="Clear Formatting" class="auto-parse-toggle"
                    :disabled="props.locked">
                    <i class="bi bi-eraser"></i>
                    <span>Reset</span>
                </button>
                <button type="button" class="auto-parse-toggle toolbar-btn" :class="{ 'active': autoParseEnabled }"
                    @click.stop.prevent="toggleAutoParse" :disabled="props.locked"
                    :title="autoParseEnabled ? 'Auto Parse: ON (Click to disable)' : 'Auto Parse: OFF (Click to enable)'">
                    <i class="bi" :class="autoParseEnabled ? 'bi-lightning-charge-fill' : 'bi-lightning-charge'"></i>
                </button>
            </div>
        </div>

        <!-- ContentEditable Editor -->
        <div ref="editorRef" class="custom-editor-content" :contenteditable="!props.locked"
            :data-placeholder="placeholder" :class="{ 'locked': props.locked }" @input="handleInput"
            @paste="handlePaste" @keydown="handleKeyDown" @keyup="saveSelectionOnChange"
            @mouseup="saveSelectionOnChange" @focus="handleFocus" @blur="handleBlur" @dragover="handleDragOver"
            @dragenter="handleDragEnter" @dragleave="handleDragLeave" @drop="handleDrop">
        </div>

        <!-- Table Size Selection Modal -->
        <BaseModal :visible="showTableModal" title="Insert Table" size="small" @close="closeTableModal">
            <div class="table-size-selector">
                <div class="grid-selector-container">
                    <div class="grid-selector-wrapper">
                        <div class="grid-selector" @mouseleave="hoveredRows = 0; hoveredColumns = 0">
                            <div v-for="row in 10" :key="row" class="grid-row">
                                <div v-for="col in 10" :key="col" class="grid-cell" :class="{
                                    'selected': row <= tableRows && col <= tableColumns,
                                    'hovered': row <= hoveredRows && col <= hoveredColumns,
                                    'active': row === tableRows && col === tableColumns
                                }" @mouseenter="hoveredRows = row; hoveredColumns = col"
                                    @click="tableRows = row; tableColumns = col" :title="`${row} × ${col} table`"></div>
                            </div>
                        </div>
                        <div class="grid-selection-info">
                            <div class="selection-display">
                                <span class="selection-label">Selected:</span>
                                <span class="selection-value">{{ tableRows }} × {{ tableColumns }}</span>
                            </div>
                            <div v-if="hoveredRows > 0 && hoveredColumns > 0" class="hover-display">
                                <span class="hover-label">Hover:</span>
                                <span class="hover-value">{{ hoveredRows }} × {{ hoveredColumns }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <BaseButton variant="secondary" size="small" @click="closeTableModal">Cancel</BaseButton>
                <BaseButton variant="primary" size="small" @click="confirmTableInsert"
                    :disabled="!tableRows || !tableColumns || tableRows < 1 || tableColumns < 1">
                    Insert Table
                </BaseButton>
            </template>
        </BaseModal>

        <!-- Row Body Editor Modal -->
        <RowBodyEditor :show="showRowBodyEditor" :route-id="routeId" :initial-column-count="initialRowColumnCount"
            @confirm="handleRowBodyConfirm" @cancel="showRowBodyEditor = false" />

        <!-- Image Selection Modal -->
        <BaseModal :visible="showImageModal" title="Insert Image" size="medium" @close="closeImageModal">
            <div class="image-selector">
                <div class="image-mode-tabs">
                    <button class="mode-tab" :class="{ active: imageMode === 'upload' }" @click="imageMode = 'upload'">
                        Upload from Device
                    </button>
                    <button class="mode-tab" :class="{ active: imageMode === 'browse' }" @click="imageMode = 'browse'"
                        :disabled="!routeId">
                        Browse Survey Photos
                    </button>
                </div>

                <div class="image-mode-content">
                    <!-- Upload from Device -->
                    <div v-if="imageMode === 'upload'" class="upload-section">
                        <input ref="fileInputRef" type="file" accept="image/*" @change="handleFileSelect"
                            style="display: none" />
                        <div class="upload-area" @click="triggerFileInput">
                            <div v-if="!selectedFile" class="upload-placeholder">
                                <svg viewBox="0 0 24 24" width="48" height="48">
                                    <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                </svg>
                                <p>Click to select an image</p>
                            </div>
                            <div v-else class="upload-preview">
                                <img :src="selectedFilePreview" alt="Preview" />
                                <p>{{ selectedFile.name }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Browse Survey Photos -->
                    <div v-if="imageMode === 'browse'" class="browse-section">
                        <div v-if="loadingPhotos" class="loading-photos">
                            <p>Loading photos...</p>
                        </div>
                        <div v-else-if="surveyPhotos.length === 0" class="no-photos">
                            <p>No photos available for this route</p>
                        </div>
                        <div v-else class="photos-grid">
                            <div v-for="(photo, index) in surveyPhotos" :key="index" class="photo-item"
                                :class="{ selected: selectedPhotoIndex === index }" @click="selectedPhotoIndex = index">
                                <img :src="getPhotoUrl(photo.url)" :alt="photo.note || 'Photo'" />
                                <div class="photo-overlay">
                                    <p v-if="photo.note" class="photo-note">{{ photo.note }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Image Size Selector -->
                <div class="image-size-selector">
                    <div class="size-input-group">
                        <label>Width:</label>
                        <input type="number" v-model.number="imageWidth" min="1" placeholder="Auto"
                            class="size-input" />
                        <select v-model="widthUnit" class="unit-select">
                            <option value="px">px</option>
                            <option value="%">%</option>
                        </select>
                    </div>
                    <div class="size-input-group">
                        <label>Height:</label>
                        <input type="number" v-model.number="imageHeight" min="1" placeholder="Auto"
                            class="size-input" />
                        <select v-model="heightUnit" class="unit-select">
                            <option value="px">px</option>
                            <option value="%">%</option>
                        </select>
                    </div>
                </div>
            </div>
            <template #footer>
                <BaseButton variant="secondary" size="small" @click="closeImageModal">Cancel</BaseButton>
                <BaseButton variant="primary" size="small" @click="confirmImageInsert" :disabled="!canInsertImage">
                    Insert Image
                </BaseButton>
            </template>
        </BaseModal>

        <!-- Image Resize Modal -->
        <BaseModal :visible="showImageResizeModal" title="Resize Image" size="small" @close="closeImageResizeModal">
            <div class="image-resize-selector">
                <div v-if="resizingImage" class="image-preview-container">
                    <img :src="resizingImage.src" alt="Preview" class="resize-preview-image" />
                </div>
                <div class="image-size-selector">
                    <div class="size-input-group">
                        <label>Width:</label>
                        <input type="number" v-model.number="resizeWidth" min="1" placeholder="Auto"
                            class="size-input" />
                        <select v-model="resizeWidthUnit" class="unit-select">
                            <option value="px">px</option>
                            <option value="%">%</option>
                        </select>
                    </div>
                    <div class="size-input-group">
                        <label>Height:</label>
                        <input type="number" v-model.number="resizeHeight" min="1" placeholder="Auto"
                            class="size-input" />
                        <select v-model="resizeHeightUnit" class="unit-select">
                            <option value="px">px</option>
                            <option value="%">%</option>
                        </select>
                    </div>
                </div>
            </div>
            <template #footer>
                <BaseButton variant="secondary" size="small" @click="closeImageResizeModal">Cancel</BaseButton>
                <BaseButton variant="primary" size="small" @click="confirmImageResize">
                    Apply
                </BaseButton>
            </template>
        </BaseModal>
    </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount, computed } from 'vue';
import { MASLUtility } from '@/utils/masl_utility';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import FileManagementController from '@/controllers/file_management/file_management_controller';
import RoutesController from '@/controllers/routes/routes_controller';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import RowBodyEditor from './RowBodyEditor.vue';

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    placeholder: {
        type: String,
        default: 'Enter text content...'
    },
    showToolbar: {
        type: Boolean,
        default: true
    },
    routeId: {
        type: [String, Number],
        default: null
    },
    autoParseDefault: {
        type: Boolean,
        default: true
    },
    locked: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue', 'loop-drop']);

const content = ref(props.modelValue || '');
const editorRef = ref(null);
const editorContainerRef = ref(null);
const parseTimeout = ref(null);
const selectionUpdateTrigger = ref(0); // Force reactivity updates for toolbar state
let selectionChangeHandler = null; // Store selection change handler for cleanup
const parsedContentCache = ref(new Map());
const isParsing = ref(false);

const autoParseEnabled = ref(props.autoParseDefault); // Toggle for auto-parsing MASL expressions
const isUpdatingContent = ref(false); // Prevent infinite loops
const imageHandlersTimeout = ref(null); // Debounce timer for image handlers setup
const savedSelectionOnBlur = ref(null); // Save selection when editor loses focus
const savedSelectionRange = ref(null); // Saved selection range
const savedSelectionFragment = ref(null); // Saved selection fragment (for visual selection)
const visualSelectionSpan = ref(null); // Temporary span for visual selection

// Table insertion modal state
const showTableModal = ref(false);
const tableRows = ref(3);
const tableColumns = ref(3);
const hoveredRows = ref(0);
const hoveredColumns = ref(0);
const isInsertingTable = ref(false); // Guard to prevent accidental insertion
const tableMutationObserver = ref(null); // Observer to fix corrupted tables

// Row body editor modal state
const showRowBodyEditor = ref(false);
const pendingRowDropRange = ref(null); // Store drop position for row insertion
const initialRowColumnCount = ref(1); // Store initial column count for row editor

// Image insertion modal state
const showImageModal = ref(false);
const imageMode = ref('upload'); // 'upload' or 'browse'
const selectedFile = ref(null);
const selectedFilePreview = ref(null);
const fileInputRef = ref(null);
const surveyPhotos = ref([]);
const loadingPhotos = ref(false);
const selectedPhotoIndex = ref(-1);
const imageWidth = ref(null);
const imageHeight = ref(null);
const widthUnit = ref('px');
const heightUnit = ref('px');

// Store cursor position/cell reference before opening modal
const storedInsertionTarget = ref(null); // { cell: HTMLElement, range: Range, index: number }

// Image resize modal state
const showImageResizeModal = ref(false);
const resizingImage = ref(null);
const resizeWidth = ref(null);
const resizeHeight = ref(null);
const resizeWidthUnit = ref('px');
const resizeHeightUnit = ref('px');

// Image resize handles state
const selectedImage = ref(null);
const resizeHandlesContainer = ref(null);
const isResizing = ref(false);
const resizeStartX = ref(0);
const resizeStartY = ref(0);
const resizeStartWidth = ref(0);
const resizeStartHeight = ref(0);
const resizeStartImageLeft = ref(0);
const resizeStartImageTop = ref(0);
const resizeHandleType = ref(''); // 'se', 'sw', 'ne', 'nw'

// Table of Contents state
const tocMarker = 'data-toc-marker="true"'; // Marker to identify TOC in editor
const tocUpdateTimeout = ref(null);

// ContentEditable event handlers
function handleInput(event) {
    if (isParsing.value || isResizing.value || isUpdatingContent.value) {
        return;
    }

    // Get current content from the editor
    const htmlContent = event.target.innerHTML;

    // Update content ref (but don't update DOM - that would reset cursor)
    content.value = htmlContent;

    // Debounce the emit to avoid interfering with typing
    if (parseTimeout.value) {
        clearTimeout(parseTimeout.value);
    }

    parseTimeout.value = setTimeout(() => {
        if (!isParsing.value && !isResizing.value && !isUpdatingContent.value) {
            // Normalize line breaks before emitting
            const normalizedContent = normalizeLineBreaks(htmlContent);
            emit('update:modelValue', normalizedContent);

            // Update TOC if it exists, but only if user is not editing the TOC
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const tocElement = editorRef.value?.querySelector('[data-toc-marker="true"]');
                const isEditingTOC = tocElement && tocElement.contains(range.commonAncestorContainer);

                if (!isEditingTOC) {
                    updateTableOfContents();
                }
            } else {
                updateTableOfContents();
            }

            // Only parse if there are MASL expressions in the content and editor is not locked
            if (autoParseEnabled.value && props.routeId && !props.locked) {
                // Check if content contains MASL expressions
                const maslPattern = /@(survey|point|user|plannedroute|date|beginfor|endfor|mapscreenshot|noteimg|note|pointimg|beginrow|endrow|begincol|endcol)\s*\([^)]*\)|@date|@beginfor|@endfor|@beginrow|@endrow|@begincol|@endcol/g;

                // Check both HTML content and text content
                const hasMaslInHtml = maslPattern.test(htmlContent);
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = htmlContent;
                const textContent = tempDiv.textContent || tempDiv.innerText || '';
                const hasMaslInText = maslPattern.test(textContent);

                if (hasMaslInHtml || hasMaslInText) {
                    parseMaslContent(htmlContent, props.routeId);
                }
            }
        }
    }, 300);
}

function handlePaste(event) {
    event.preventDefault();
    const text = (event.clipboardData || window.clipboardData).getData('text/html') ||
        (event.clipboardData || window.clipboardData).getData('text/plain');

    // Insert pasted content at cursor
    insertHTMLAtCursor(text);
}

function handleKeyDown(event) {
    // Handle Enter key - insert line break instead of paragraph
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        // Insert a line break (<br>) instead of creating a new paragraph
        document.execCommand('insertLineBreak');
        return;
    }

    // Handle special key combinations
    if (event.key === 'Enter' && event.shiftKey) {
        // Shift+Enter for line break (same behavior)
        event.preventDefault();
        document.execCommand('insertLineBreak');
    }
}

// Save selection when it changes (mouseup/keyup)
function saveSelectionOnChange() {
    if (!editorRef.value) return;

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const isInEditor = editorRef.value.contains(range.commonAncestorContainer) ||
            editorRef.value === range.commonAncestorContainer;

        if (isInEditor && !range.collapsed) {
            try {
                savedSelectionRange.value = range.cloneRange();
                savedSelectionFragment.value = range.cloneContents();
            } catch (e) {
                console.warn('Failed to save selection:', e);
                savedSelectionRange.value = null;
                savedSelectionFragment.value = null;
            }
        } else {
            savedSelectionRange.value = null;
            savedSelectionFragment.value = null;
        }
    } else {
        savedSelectionRange.value = null;
        savedSelectionFragment.value = null;
    }
}

// Create visual selection span (like the Stack Overflow example)
function createVisualSelection() {
    if (!savedSelectionRange.value || !savedSelectionFragment.value || !editorRef.value) {
        return;
    }

    try {
        // Remove any existing visual selection
        removeVisualSelection();

        // Create span and wrap the selection
        const span = document.createElement('span');
        span.className = 'editor-selected';
        savedSelectionRange.value.surroundContents(span);
        visualSelectionSpan.value = span;
    } catch (e) {
        console.warn('Failed to create visual selection:', e);
    }
}

// Remove visual selection span and restore actual selection
function removeVisualSelection() {
    if (visualSelectionSpan.value && editorRef.value) {
        try {
            const span = visualSelectionSpan.value;
            const parent = span.parentNode;

            // Move all children out of the span
            while (span.firstChild) {
                parent.insertBefore(span.firstChild, span);
            }

            // Remove the span
            parent.removeChild(span);
            visualSelectionSpan.value = null;
        } catch (e) {
            console.warn('Failed to remove visual selection:', e);
            visualSelectionSpan.value = null;
        }
    }
}

// Restore actual selection
function restoreActualSelection() {
    if (savedSelectionRange.value && editorRef.value) {
        try {
            // Remove visual selection first
            removeVisualSelection();

            // Verify range is still valid
            const commonAncestor = savedSelectionRange.value.commonAncestorContainer;
            if (editorRef.value.contains(commonAncestor) ||
                editorRef.value === commonAncestor) {
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(savedSelectionRange.value);
            }
        } catch (e) {
            console.warn('Failed to restore actual selection:', e);
        }
    }
}

function handleFocus() {
    // Restore actual selection if we have a saved one
    if (savedSelectionRange.value) {
        restoreActualSelection();
    } else if (savedSelectionOnBlur.value && editorRef.value) {
        // Fallback to old method
        try {
            const commonAncestor = savedSelectionOnBlur.value.commonAncestorContainer;
            if (editorRef.value.contains(commonAncestor) ||
                editorRef.value === commonAncestor) {
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(savedSelectionOnBlur.value);
                savedSelectionOnBlur.value = null;
                return;
            }
        } catch (e) {
            console.warn('Failed to restore saved selection:', e);
            savedSelectionOnBlur.value = null;
        }
    }

    // If no saved selection, ensure cursor is positioned correctly
    if (editorRef.value) {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) {
            const range = document.createRange();
            range.selectNodeContents(editorRef.value);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        } else {
            const range = selection.getRangeAt(0);
            if (!editorRef.value.contains(range.commonAncestorContainer)) {
                range.selectNodeContents(editorRef.value);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }
}

function handleBlur() {
    // Create visual selection if we have a saved selection
    if (savedSelectionRange.value && savedSelectionFragment.value) {
        createVisualSelection();
    }

    // Also save using old method as fallback
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const isInEditor = editorRef.value && (
            editorRef.value.contains(range.commonAncestorContainer) ||
            editorRef.value === range.commonAncestorContainer
        );

        if (isInEditor) {
            try {
                savedSelectionOnBlur.value = range.cloneRange();
            } catch (e) {
                console.warn('Failed to save selection on blur:', e);
                savedSelectionOnBlur.value = null;
            }
        } else {
            savedSelectionOnBlur.value = null;
        }
    } else {
        savedSelectionOnBlur.value = null;
    }

    // Sync content on blur
    if (editorRef.value && !isParsing.value) {
        const htmlContent = editorRef.value.innerHTML;
        if (htmlContent !== content.value) {
            content.value = htmlContent;
            emit('update:modelValue', htmlContent);
        }
    }
}

// Toolbar command functions
// Check if a format command is currently active on the selection
function isFormatActive(command) {
    // Access the trigger to make this reactive
    void selectionUpdateTrigger.value;

    if (!editorRef.value) return false;

    const selection = window.getSelection();
    if (selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);
    const isInEditor = editorRef.value.contains(range.commonAncestorContainer) ||
        editorRef.value === range.commonAncestorContainer;
    if (!isInEditor) return false;

    // For non-collapsed selection, use queryCommandState
    if (!range.collapsed) {
        try {
            return document.queryCommandState(command);
        } catch (e) {
            return false;
        }
    }

    // For collapsed selection, check the parent element
    let node = range.startContainer;
    if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentElement;
    }

    // Walk up the DOM tree to find the formatted element
    while (node && node !== editorRef.value) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the command is active on this element
            if (command === 'bold') {
                if (node.tagName === 'B' || node.tagName === 'STRONG') return true;
                const fontWeight = window.getComputedStyle(node).fontWeight;
                if (fontWeight === 'bold' || parseInt(fontWeight) >= 600) return true;
            }
            if (command === 'italic') {
                if (node.tagName === 'I' || node.tagName === 'EM') return true;
                if (window.getComputedStyle(node).fontStyle === 'italic') return true;
            }
            if (command === 'underline') {
                if (node.tagName === 'U') return true;
                if (window.getComputedStyle(node).textDecoration.includes('underline')) return true;
            }
            if (command === 'strikeThrough') {
                if (node.tagName === 'S' || node.tagName === 'STRIKE' || node.tagName === 'DEL') return true;
                if (window.getComputedStyle(node).textDecoration.includes('line-through')) return true;
            }
            if (command === 'justifyLeft') {
                if (window.getComputedStyle(node).textAlign === 'left') return true;
            }
            if (command === 'justifyCenter') {
                if (window.getComputedStyle(node).textAlign === 'center') return true;
            }
            if (command === 'justifyRight') {
                if (window.getComputedStyle(node).textAlign === 'right') return true;
            }
            if (command === 'justifyFull') {
                if (window.getComputedStyle(node).textAlign === 'justify') return true;
            }
        }
        node = node.parentElement;
    }

    return false;
}

// Helper function to get the text node and offset at cursor position
function getTextNodeAtCursor() {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    let container = range.startContainer;
    let offset = range.startOffset;

    // If we're in an element node, find the actual text node
    if (container.nodeType !== Node.TEXT_NODE) {
        // If offset points to a child node, use that node
        if (container.nodeType === Node.ELEMENT_NODE && container.childNodes.length > 0) {
            if (offset < container.childNodes.length) {
                const childNode = container.childNodes[offset];
                if (childNode.nodeType === Node.TEXT_NODE) {
                    container = childNode;
                    offset = 0;
                } else {
                    // Find first text node in this child
                    const walker = document.createTreeWalker(
                        childNode,
                        NodeFilter.SHOW_TEXT,
                        null
                    );
                    const textNode = walker.nextNode();
                    if (textNode) {
                        container = textNode;
                        offset = 0;
                    }
                }
            }
        }

        // If still not a text node, search for nearest text node
        if (container.nodeType !== Node.TEXT_NODE) {
            let node = container;
            while (node && node !== editorRef.value) {
                if (node.nodeType === Node.TEXT_NODE) {
                    container = node;
                    offset = node.textContent.length;
                    break;
                }
                // Check children
                const walker = document.createTreeWalker(
                    node,
                    NodeFilter.SHOW_TEXT,
                    null
                );
                const textNode = walker.nextNode();
                if (textNode) {
                    container = textNode;
                    offset = 0;
                    break;
                }
                node = node.parentNode;
            }
        }
    }

    if (container.nodeType === Node.TEXT_NODE) {
        return { node: container, offset: offset };
    }

    return null;
}

// Helper function to select the current word at cursor position
function selectCurrentWord() {
    if (!editorRef.value) return null;

    const textInfo = getTextNodeAtCursor();
    if (!textInfo) return null;

    const textNode = textInfo.node;
    const offset = textInfo.offset;
    const text = textNode.textContent;

    let start = offset;
    let end = offset;

    // Expand backward to find word start
    while (start > 0 && /\S/.test(text[start - 1])) {
        start--;
    }

    // Expand forward to find word end
    while (end < text.length && /\S/.test(text[end])) {
        end++;
    }

    // If we found a word, select it
    if (start < end) {
        const selection = window.getSelection();
        const newRange = document.createRange();
        newRange.setStart(textNode, start);
        newRange.setEnd(textNode, end);
        selection.removeAllRanges();
        selection.addRange(newRange);
        return newRange;
    }

    // If cursor is on whitespace, try to find the next word
    if (end < text.length) {
        // Skip whitespace
        while (end < text.length && /\s/.test(text[end])) {
            end++;
        }
        const wordStart = end;
        while (end < text.length && /\S/.test(text[end])) {
            end++;
        }
        if (wordStart < end) {
            const selection = window.getSelection();
            const newRange = document.createRange();
            newRange.setStart(textNode, wordStart);
            newRange.setEnd(textNode, end);
            selection.removeAllRanges();
            selection.addRange(newRange);
            return newRange;
        }
    }

    return null;
}

// Helper function to select the current line/block at cursor position
function selectCurrentLine() {
    if (!editorRef.value) return null;

    const selection = window.getSelection();
    if (selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    const node = range.startContainer;

    // Find the block element containing the cursor
    const findBlockElement = (node) => {
        while (node && node !== editorRef.value) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const tagName = node.tagName?.toLowerCase();
                if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'li', 'blockquote'].includes(tagName)) {
                    return node;
                }
            }
            node = node.parentNode;
        }
        // If no block element found, create a paragraph or use the editor itself
        return editorRef.value;
    };

    const blockElement = findBlockElement(node);

    // Select the entire block
    const newRange = document.createRange();
    newRange.selectNodeContents(blockElement);
    selection.removeAllRanges();
    selection.addRange(newRange);
    return newRange;
}

function execCommand(command, value = null) {
    if (!editorRef.value) return;

    // Use saved selection if available, otherwise get current selection
    let savedRange = savedSelectionRange.value;
    let hadSelection = false;

    if (!savedRange) {
        // Get current selection
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const isInEditor = editorRef.value.contains(range.commonAncestorContainer) ||
                editorRef.value === range.commonAncestorContainer;

            if (isInEditor) {
                try {
                    savedRange = range.cloneRange();
                    hadSelection = !range.collapsed;
                } catch (e) {
                    console.warn('Failed to clone range:', e);
                }
            }
        }
    } else {
        hadSelection = !savedRange.collapsed;
    }

    // Remove visual selection before executing command
    removeVisualSelection();

    // Restore actual selection if we have one
    if (savedRange && hadSelection) {
        try {
            const currentSelection = window.getSelection();
            currentSelection.removeAllRanges();
            currentSelection.addRange(savedRange);
        } catch (e) {
            console.warn('Failed to restore selection:', e);
            savedRange = null;
            hadSelection = false;
        }
    }

    // Define alignment commands
    const alignmentCommands = ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'];

    // If no selection, auto-select word or line
    if (!hadSelection) {
        const formattingCommands = ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript'];

        if (formattingCommands.includes(command)) {
            if (!selectCurrentWord()) {
                selectCurrentLine();
            }
        } else if (alignmentCommands.includes(command)) {
            selectCurrentLine();
        } else {
            if (!selectCurrentWord()) {
                selectCurrentLine();
            }
        }
    }

    // Handle alignment for images
    if (alignmentCommands.includes(command)) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);

            // Map alignment command to CSS text-align value
            const alignMap = {
                'justifyLeft': 'left',
                'justifyCenter': 'center',
                'justifyRight': 'right',
                'justifyFull': 'justify'
            };
            const alignValue = alignMap[command];

            // Get all images in the selection or at cursor
            const allImages = [];

            if (!range.collapsed) {
                // Get images from the range
                try {
                    const walker = document.createTreeWalker(
                        range.commonAncestorContainer,
                        NodeFilter.SHOW_ELEMENT,
                        {
                            acceptNode: (node) => {
                                if (node.tagName === 'IMG') {
                                    try {
                                        if (range.intersectsNode(node)) {
                                            return NodeFilter.FILTER_ACCEPT;
                                        }
                                    } catch (e) {
                                        // Fallback: check if node is within range
                                        return NodeFilter.FILTER_ACCEPT;
                                    }
                                }
                                return NodeFilter.FILTER_SKIP;
                            }
                        }
                    );

                    let node;
                    while ((node = walker.nextNode())) {
                        allImages.push(node);
                    }
                } catch (e) {
                    console.warn('Error walking tree for images:', e);
                }
            }

            // Also check if cursor is on an image (even if selection is collapsed)
            const startContainer = range.startContainer;
            let node = startContainer.nodeType === Node.TEXT_NODE ? startContainer.parentElement : startContainer;
            while (node && node !== editorRef.value) {
                if (node.tagName === 'IMG') {
                    if (!allImages.includes(node)) {
                        allImages.push(node);
                    }
                    break;
                }
                node = node.parentElement;
            }

            // If we found images, apply alignment to them
            if (allImages.length > 0) {
                allImages.forEach(img => {
                    // Find the parent block element (p, div, or create one)
                    let parent = img.parentElement;
                    let blockParent = null;

                    // Walk up to find a block element that's not the editor itself
                    while (parent && parent !== editorRef.value) {
                        const display = window.getComputedStyle(parent).display;
                        const tagName = parent.tagName;
                        if ((display === 'block' || display === 'flex' || tagName === 'P' || tagName === 'DIV') &&
                            !parent.classList.contains('custom-editor-content')) {
                            blockParent = parent;
                            break;
                        }
                        parent = parent.parentElement;
                    }

                    if (blockParent) {
                        // Apply alignment to existing block parent
                        blockParent.style.textAlign = alignValue;
                    } else {
                        // Wrap image in a div with alignment
                        const wrapper = document.createElement('div');
                        wrapper.style.textAlign = alignValue;
                        wrapper.style.display = 'block';
                        wrapper.style.margin = '0';
                        wrapper.style.padding = '0';

                        // Insert wrapper before image
                        if (img.parentNode) {
                            img.parentNode.insertBefore(wrapper, img);
                            wrapper.appendChild(img);
                        }
                    }
                });

                syncContent();
                return;
            }
        }
    }

    // Execute command
    const success = document.execCommand(command, false, value);

    // After command, the browser typically maintains selection on the formatted content
    // We just need to verify and save it
    if (success && savedRange && hadSelection) {
        // Use requestAnimationFrame to ensure DOM has updated
        requestAnimationFrame(() => {
            try {
                const currentSelection = window.getSelection();

                // Check if browser maintained the selection
                if (currentSelection.rangeCount > 0) {
                    const currentRange = currentSelection.getRangeAt(0);
                    const isInEditor = editorRef.value.contains(currentRange.commonAncestorContainer) ||
                        editorRef.value === currentRange.commonAncestorContainer;

                    if (isInEditor && !currentRange.collapsed) {
                        // Browser maintained the selection - use it
                        savedSelectionRange.value = currentRange.cloneRange();
                        savedSelectionFragment.value = currentRange.cloneContents();
                        // Selection is already there, just ensure editor is focused
                        editorRef.value.focus();
                        return;
                    }
                }

                // If browser didn't maintain selection, try to find the formatted content
                const selectedText = savedRange.toString().trim();

                if (selectedText) {
                    const formatTags = ['b', 'strong', 'i', 'em', 'u', 's', 'strike', 'del', 'sub', 'sup'];

                    // Try to find formatted elements starting from original position
                    let startNode = savedRange.startContainer;
                    if (startNode.nodeType === Node.TEXT_NODE) {
                        startNode = startNode.parentElement;
                    }

                    let formattedElement = null;
                    while (startNode && startNode !== editorRef.value) {
                        if (startNode.nodeType === Node.ELEMENT_NODE) {
                            const tagName = startNode.tagName?.toLowerCase();
                            if (formatTags.includes(tagName)) {
                                formattedElement = startNode;
                                break;
                            }
                        }
                        startNode = startNode.parentElement;
                    }

                    if (formattedElement && editorRef.value.contains(formattedElement)) {
                        const newRange = document.createRange();
                        newRange.selectNodeContents(formattedElement);
                        currentSelection.removeAllRanges();
                        currentSelection.addRange(newRange);
                        savedSelectionRange.value = newRange;
                        savedSelectionFragment.value = newRange.cloneContents();
                    } else {
                        // Search by text content as fallback
                        const walker = document.createTreeWalker(
                            editorRef.value,
                            NodeFilter.SHOW_TEXT,
                            null
                        );

                        let node;
                        while ((node = walker.nextNode())) {
                            if (node.textContent.includes(selectedText)) {
                                let parent = node.parentElement;
                                while (parent && parent !== editorRef.value) {
                                    if (parent.nodeType === Node.ELEMENT_NODE) {
                                        const tagName = parent.tagName?.toLowerCase();
                                        if (formatTags.includes(tagName)) {
                                            const newRange = document.createRange();
                                            newRange.selectNodeContents(parent);
                                            currentSelection.removeAllRanges();
                                            currentSelection.addRange(newRange);
                                            savedSelectionRange.value = newRange;
                                            savedSelectionFragment.value = newRange.cloneContents();
                                            break;
                                        }
                                    }
                                    parent = parent.parentElement;
                                }
                                break;
                            }
                        }
                    }
                }

                // Ensure editor stays focused
                editorRef.value.focus();
            } catch (e) {
                console.warn('Failed to restore selection after formatting:', e);
            }
        });
    }

    // Sync content
    syncContent();
}

function formatBlock(tag) {
    if (!editorRef.value) return;

    // Save the current selection BEFORE focusing
    const selection = window.getSelection();
    let savedRange = null;
    let hasSelection = false;

    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const isInEditor = editorRef.value.contains(range.commonAncestorContainer) ||
            editorRef.value === range.commonAncestorContainer;

        if (isInEditor && !range.collapsed) {
            savedRange = range.cloneRange();
            hasSelection = true;
        }
    }

    // Ensure editor has focus
    editorRef.value.focus();

    // Restore selection if we had one
    if (savedRange && hasSelection) {
        try {
            selection.removeAllRanges();
            selection.addRange(savedRange);
        } catch (e) {
            hasSelection = false;
        }
    }

    requestAnimationFrame(() => {
        // Re-check selection after focus
        const currentSelection = window.getSelection();
        let currentHasSelection = false;

        if (currentSelection.rangeCount > 0) {
            const range = currentSelection.getRangeAt(0);
            const isInEditor = editorRef.value.contains(range.commonAncestorContainer) ||
                editorRef.value === range.commonAncestorContainer;
            currentHasSelection = isInEditor && !range.collapsed;
        }

        // If no selection, select the current line/block
        if (!currentHasSelection) {
            selectCurrentLine();
        }

        // Execute formatBlock command - use tag name directly, not wrapped in <>
        const blockTag = tag || 'p';
        const success = document.execCommand('formatBlock', false, blockTag);

        if (success) {
            editorRef.value.focus();
            syncContent();
        }
    });
}

function setColor(command, color) {
    if (!editorRef.value) return;

    // Save the current selection BEFORE focusing
    const selection = window.getSelection();
    let savedRange = null;
    let hasSelection = false;

    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const isInEditor = editorRef.value.contains(range.commonAncestorContainer) ||
            editorRef.value === range.commonAncestorContainer;

        if (isInEditor && !range.collapsed) {
            savedRange = range.cloneRange();
            hasSelection = true;
        }
    }

    // Ensure editor has focus
    editorRef.value.focus();

    // Restore selection if we had one
    if (savedRange && hasSelection) {
        try {
            selection.removeAllRanges();
            selection.addRange(savedRange);
        } catch (e) {
            hasSelection = false;
        }
    }

    requestAnimationFrame(() => {
        // Re-check selection after focus
        const currentSelection = window.getSelection();
        let currentHasSelection = false;

        if (currentSelection.rangeCount > 0) {
            const range = currentSelection.getRangeAt(0);
            const isInEditor = editorRef.value.contains(range.commonAncestorContainer) ||
                editorRef.value === range.commonAncestorContainer;
            currentHasSelection = isInEditor && !range.collapsed;
        }

        // If no selection, select the current word
        if (!currentHasSelection) {
            if (!selectCurrentWord()) {
                // If no word found, select current line
                selectCurrentLine();
            }
        }

        // Execute color command
        const success = document.execCommand(command, false, color);

        if (success) {
            editorRef.value.focus();
            syncContent();
        }
    });
}

function setFontSize(size) {
    if (!editorRef.value || !size) return;

    // Save the current selection BEFORE focusing
    const selection = window.getSelection();
    let savedRange = null;
    let hasSelection = false;

    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const isInEditor = editorRef.value.contains(range.commonAncestorContainer) ||
            editorRef.value === range.commonAncestorContainer;

        if (isInEditor && !range.collapsed) {
            savedRange = range.cloneRange();
            hasSelection = true;
        }
    }

    // Ensure editor has focus
    editorRef.value.focus();

    // Restore selection if we had one
    if (savedRange && hasSelection) {
        try {
            selection.removeAllRanges();
            selection.addRange(savedRange);
        } catch (e) {
            hasSelection = false;
        }
    }

    requestAnimationFrame(() => {
        // Re-check selection after focus
        const currentSelection = window.getSelection();
        let currentHasSelection = false;

        if (currentSelection.rangeCount > 0) {
            const range = currentSelection.getRangeAt(0);
            const isInEditor = editorRef.value.contains(range.commonAncestorContainer) ||
                editorRef.value === range.commonAncestorContainer;
            currentHasSelection = isInEditor && !range.collapsed;
        }

        // If no selection, select the current word
        if (!currentHasSelection) {
            if (!selectCurrentWord()) {
                // If no word found, select current line
                selectCurrentLine();
            }
        }

        // Apply font size by wrapping selection in span with inline style
        try {
            const currentSelection = window.getSelection();
            if (currentSelection.rangeCount > 0) {
                const range = currentSelection.getRangeAt(0);
                const isInEditor = editorRef.value.contains(range.commonAncestorContainer) ||
                    editorRef.value === range.commonAncestorContainer;

                if (isInEditor) {
                    if (!range.collapsed) {
                        // Wrap selected content in span with font-size
                        const span = document.createElement('span');
                        span.style.fontSize = size;

                        try {
                            range.surroundContents(span);
                        } catch (e) {
                            // If surroundContents fails (e.g., selection spans multiple nodes),
                            // extract contents and wrap them
                            const contents = range.extractContents();
                            span.appendChild(contents);
                            range.insertNode(span);
                        }

                        // Collapse selection to end of inserted span
                        range.collapse(false);
                        currentSelection.removeAllRanges();
                        currentSelection.addRange(range);
                    } else {
                        // No selection - insert span at cursor and move cursor inside
                        const span = document.createElement('span');
                        span.style.fontSize = size;
                        span.textContent = '\u200B'; // Zero-width space to maintain cursor position
                        range.insertNode(span);

                        // Move cursor inside the span
                        range.setStartAfter(span.firstChild);
                        range.collapse(true);
                        currentSelection.removeAllRanges();
                        currentSelection.addRange(range);
                    }

                    editorRef.value.focus();
                    syncContent();
                }
            }
        } catch (e) {
            console.error('Error setting font size:', e);
        }
    });
}

function resetColor(command) {
    if (!editorRef.value) return;

    // Use saved selection if available, otherwise get current selection
    let savedRange = savedSelectionRange.value;
    let hadSelection = false;

    if (!savedRange) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const isInEditor = editorRef.value.contains(range.commonAncestorContainer) ||
                editorRef.value === range.commonAncestorContainer;

            if (isInEditor) {
                try {
                    savedRange = range.cloneRange();
                    hadSelection = !range.collapsed;
                } catch (e) {
                    console.warn('Failed to clone range:', e);
                }
            }
        }
    } else {
        hadSelection = !savedRange.collapsed;
    }

    // Remove visual selection before executing
    removeVisualSelection();

    // Restore actual selection if we have one
    if (savedRange && hadSelection) {
        try {
            const currentSelection = window.getSelection();
            currentSelection.removeAllRanges();
            currentSelection.addRange(savedRange);
        } catch (e) {
            console.warn('Failed to restore selection:', e);
            savedRange = null;
            hadSelection = false;
        }
    }

    // If no selection, auto-select word or line
    if (!hadSelection) {
        if (!selectCurrentWord()) {
            selectCurrentLine();
        }
    }

    // Get the current selection range
    const currentSelection = window.getSelection();
    if (currentSelection.rangeCount === 0) return;

    const range = currentSelection.getRangeAt(0);
    if (range.collapsed) return;

    // Remove color by manipulating the DOM directly
    try {
        // Get all elements in the selection
        const contents = range.cloneContents();
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(contents.cloneNode(true));

        // Remove color styles from all elements
        const allElements = tempDiv.querySelectorAll('*');
        allElements.forEach(el => {
            if (command === 'foreColor') {
                el.style.color = '';
                if (el.hasAttribute('color')) {
                    el.removeAttribute('color');
                }
            } else if (command === 'backColor') {
                el.style.backgroundColor = '';
                el.style.background = '';
            }
        });

        // Delete the original content
        range.deleteContents();

        // Insert the cleaned content
        const fragment = document.createDocumentFragment();
        while (tempDiv.firstChild) {
            fragment.appendChild(tempDiv.firstChild);
        }
        range.insertNode(fragment);

        // Select the newly inserted content
        const newRange = document.createRange();
        newRange.setStartBefore(fragment.firstChild);
        newRange.setEndAfter(fragment.lastChild);
        currentSelection.removeAllRanges();
        currentSelection.addRange(newRange);

        // Update saved selection
        savedSelectionRange.value = newRange.cloneRange();
        savedSelectionFragment.value = newRange.cloneContents();

        editorRef.value.focus();
        syncContent();
    } catch (e) {
        console.warn('Failed to reset color:', e);
        // Fallback: use removeFormat for the specific color
        if (command === 'foreColor') {
            // Try to remove just the color style
            const success = document.execCommand('removeFormat', false, null);
            if (!success) {
                document.execCommand('foreColor', false, '');
            }
        } else if (command === 'backColor') {
            document.execCommand('backColor', false, '');
        }
        syncContent();
    }
}

function createLink() {
    if (!editorRef.value) return;

    // Ensure editor has focus
    editorRef.value.focus();

    // Get current selection
    const selection = window.getSelection();
    if (selection.rangeCount === 0 || selection.toString().trim() === '') {
        // No selection, ask for text and URL
        const text = prompt('Enter link text:');
        if (!text) return;

        const url = prompt('Enter URL:');
        if (!url) return;

        // Insert link at cursor
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : document.createRange();
        if (selection.rangeCount === 0) {
            range.selectNodeContents(editorRef.value);
            range.collapse(false);
        }

        const link = document.createElement('a');
        link.href = url;
        link.textContent = text;
        range.insertNode(link);
        range.setStartAfter(link);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        editorRef.value.focus();
        syncContent();
    } else {
        // Has selection, create link from selection
        const url = prompt('Enter URL:');
        if (url) {
            const success = document.execCommand('createLink', false, url);
            if (success) {
                editorRef.value.focus();
                syncContent();
            }
        }
    }
}

function clearFormatting() {
    if (!editorRef.value) return;

    // Save the current selection BEFORE focusing
    const selection = window.getSelection();
    let savedRange = null;
    let hasSelection = false;

    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const isInEditor = editorRef.value.contains(range.commonAncestorContainer) ||
            editorRef.value === range.commonAncestorContainer;

        if (isInEditor && !range.collapsed) {
            savedRange = range.cloneRange();
            hasSelection = true;
        }
    }

    // Ensure editor has focus
    editorRef.value.focus();

    // Restore selection if we had one
    if (savedRange && hasSelection) {
        try {
            selection.removeAllRanges();
            selection.addRange(savedRange);
        } catch (e) {
            hasSelection = false;
        }
    }

    requestAnimationFrame(() => {
        // Re-check selection after focus
        const currentSelection = window.getSelection();
        let currentHasSelection = false;

        if (currentSelection.rangeCount > 0) {
            const range = currentSelection.getRangeAt(0);
            const isInEditor = editorRef.value.contains(range.commonAncestorContainer) ||
                editorRef.value === range.commonAncestorContainer;
            currentHasSelection = isInEditor && !range.collapsed;
        }

        // If no selection, select the current word or line
        if (!currentHasSelection) {
            if (!selectCurrentWord()) {
                // If no word found, select current line
                selectCurrentLine();
            }
        }

        // Execute removeFormat command
        const success = document.execCommand('removeFormat', false, null);

        if (success) {
            editorRef.value.focus();
            syncContent();
        }
    });
}

function insertHTMLAtCursor(html) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const fragment = document.createDocumentFragment();
        while (tempDiv.firstChild) {
            fragment.appendChild(tempDiv.firstChild);
        }

        range.insertNode(fragment);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    syncContent();
}

function syncContent() {
    if (editorRef.value && !isParsing.value) {
        const htmlContent = editorRef.value.innerHTML;
        if (htmlContent !== content.value) {
            content.value = htmlContent;
            // Normalize line breaks before emitting
            const normalizedContent = normalizeLineBreaks(htmlContent);
            emit('update:modelValue', normalizedContent);
        }
    }
}

// Setup content change listener
function setupContentListener() {
    if (!editorRef.value) return;

    // Use MutationObserver only for non-input changes (like programmatic updates)
    // The input event handler is the primary source for user typing
    // We'll disable this during active typing to prevent cursor issues
    let mutationTimeout = null;
    let isUserTyping = false;
    let typingTimeout = null;

    // Track when user is typing
    const handleTypingStart = () => {
        isUserTyping = true;
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }
        typingTimeout = setTimeout(() => {
            isUserTyping = false;
        }, 500);
    };

    // Listen for input events to know when user is typing
    editorRef.value.addEventListener('input', handleTypingStart);

    const observer = new MutationObserver(() => {
        // Skip if user is actively typing or we're parsing/resizing/updating
        if (isUserTyping || isParsing.value || isResizing.value || isUpdatingContent.value) {
            return;
        }

        // Check if selected image was deleted
        if (selectedImage.value && editorRef.value && !editorRef.value.contains(selectedImage.value)) {
            hideResizeHandles();
        }

        // Debounce mutation observer to avoid interfering with typing
        // Only sync if content actually changed and it wasn't from user input
        if (mutationTimeout) {
            clearTimeout(mutationTimeout);
        }

        mutationTimeout = setTimeout(() => {
            if (isUserTyping || isParsing.value || isResizing.value || isUpdatingContent.value) {
                return;
            }

            const htmlContent = editorRef.value.innerHTML;
            // Only update if content is different and we're not in the middle of user input
            // The input handler will handle user typing
            if (htmlContent !== content.value) {
                content.value = htmlContent;
                emit('update:modelValue', htmlContent);
            }
        }, 500); // Longer delay to avoid interfering
    });

    observer.observe(editorRef.value, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: false // Don't watch attribute changes to reduce noise
    });

    return observer;
}

// Attach resize handlers to a single image
function attachImageResizeHandler(img) {
    if (!img || img.tagName !== 'IMG') {
        console.warn('attachImageResizeHandler: Invalid image element', img);
        return;
    }

    // Skip if already attached (but still ensure properties are set)
    if (img.hasAttribute('data-resize-handler-attached')) {
        // Just ensure properties are set
        img.style.cursor = 'grab';
        img.draggable = true;
        return;
    }

    img.setAttribute('data-resize-handler-attached', 'true');
    img.style.cursor = 'grab';
    img.draggable = true;

    // Click handler - show resize handles
    const handleClick = (e) => {
        console.log('Image click handler fired for:', img);
        if (e.target.closest('.resize-handle') || e.target.closest('.resize-handles-container')) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log('Calling showResizeHandles for:', img);
        showResizeHandles(img);
    };

    // Double click - open resize modal
    const handleDoubleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        openImageResizeModal(img);
    };

    // Drag start - store the image HTML and mark as dragging
    const handleDragStart = (e) => {
        e.stopPropagation();
        img.style.cursor = 'grabbing';
        img.style.opacity = '0.5';

        // Prevent text selection during drag
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';

        // Store the image HTML in dataTransfer - clone with all attributes
        const imgClone = img.cloneNode(true);
        // Ensure all attributes are preserved
        const imgHtml = imgClone.outerHTML;
        console.log('Drag start - image HTML:', imgHtml);

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', imgHtml);
        e.dataTransfer.setData('text/plain', imgHtml);

        // Store reference to original image
        e.dataTransfer.setData('application/x-image-element', 'true');
        img.setAttribute('data-dragging', 'true');

        console.log('Drag start - dataTransfer types:', Array.from(e.dataTransfer.types));
    };

    // Drag end - restore appearance
    const handleDragEnd = (e) => {
        img.style.cursor = 'grab';
        img.style.opacity = '1';

        // Restore text selection
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';

        // The drop handler will remove the original image if drop was successful
        // We just clean up the dragging attribute here
        setTimeout(() => {
            img.removeAttribute('data-dragging');
        }, 100);
    };

    img.addEventListener('click', handleClick, { capture: true });
    img.addEventListener('dblclick', handleDoubleClick, { capture: true });
    img.addEventListener('dragstart', handleDragStart);
    img.addEventListener('dragend', handleDragEnd);
}

// Restore image styles from saved content
function restoreImageStyles() {
    // Get editor root (contentEditable div)
    const editorRoot = editorRef.value;
    if (!editorRoot) {
        return;
    }

    // Find all images and ensure their styles and attributes are preserved
    const images = editorRoot.querySelectorAll('img');
    images.forEach(img => {
        const styleAttr = img.getAttribute('style') || '';

        // Check if this is a fit image (has width: 100% or max-width: 100% without explicit dimensions)
        const hasWidth100 = styleAttr.includes('width: 100%') || styleAttr.includes('width:100%');
        const hasMaxWidth100 = styleAttr.includes('max-width: 100%') || styleAttr.includes('max-width:100%');
        const hasExplicitWidth = styleAttr.match(/width\s*:\s*[\d.]+px/i);
        const hasWidthAttr = img.hasAttribute('width');

        // If it's a fit image, preserve the fit behavior
        if ((hasWidth100 || (hasMaxWidth100 && !hasExplicitWidth && !hasWidthAttr)) && !hasExplicitWidth) {
            // This is a fit image - preserve its fit behavior
            let style = styleAttr;

            // Ensure width: 100% is present
            if (!hasWidth100) {
                style = style.replace(/width\s*:\s*[^;]+;?/gi, '').trim();
                style = style.replace(/;;+/g, ';').replace(/^;|;$/g, '').trim();
                style += (style ? ' ' : '') + 'width: 100%;';
            }

            // Ensure max-width: 100% is present
            if (!hasMaxWidth100) {
                style = style.replace(/max-width\s*:\s*[^;]+;?/gi, '').trim();
                style = style.replace(/;;+/g, ';').replace(/^;|;$/g, '').trim();
                style += (style ? ' ' : '') + 'max-width: 100%;';
            }

            // Ensure height: auto
            if (!styleAttr.includes('height: auto') && !styleAttr.includes('height:auto')) {
                style = style.replace(/height\s*:\s*[^;]+;?/gi, '').trim();
                style = style.replace(/;;+/g, ';').replace(/^;|;$/g, '').trim();
                style += (style ? ' ' : '') + 'height: auto;';
            }

            img.setAttribute('style', style);
            img.style.cssText = style;

            // Remove width/height attributes for fit images
            img.removeAttribute('width');
            img.removeAttribute('height');
            return; // Skip the dimension restoration for fit images
        }

        // For non-fit images, restore dimensions from attributes or style
        let width = img.getAttribute('width');
        let height = img.getAttribute('height');
        let widthUnit = 'px';
        let heightUnit = 'px';

        // If not in attributes, try to get from style
        if (!width || !height) {
            const widthMatch = styleAttr.match(/width\s*:\s*([\d.]+)\s*(px|%)?/i);
            const heightMatch = styleAttr.match(/height\s*:\s*([\d.]+)\s*(px|%)?/i);

            if (widthMatch && !width) {
                width = widthMatch[1];
                widthUnit = widthMatch[2] || 'px';
            }
            if (heightMatch && !height) {
                height = heightMatch[1];
                heightUnit = heightMatch[2] || 'px';
            }
        }

        // Set attributes and style if we have values
        if (width) {
            img.setAttribute('width', width);
            // Also ensure it's in style with correct unit
            let style = img.getAttribute('style') || '';
            style = style.replace(/width\s*:\s*[^;]+;?/gi, '').trim();
            style = style.replace(/;;+/g, ';').replace(/^;|;$/g, '').trim();
            style += (style ? ' ' : '') + `width: ${width}${widthUnit};`;
            img.setAttribute('style', style);
            img.style.width = `${width}${widthUnit}`;
        }

        if (height) {
            img.setAttribute('height', height);
            // Also ensure it's in style with correct unit
            let style = img.getAttribute('style') || '';
            style = style.replace(/height\s*:\s*[^;]+;?/gi, '').trim();
            style = style.replace(/;;+/g, ';').replace(/^;|;$/g, '').trim();
            style += (style ? ' ' : '') + `height: ${height}${heightUnit};`;
            img.setAttribute('style', style);
            img.style.height = `${height}${heightUnit}`;
        }
    });
}

// Setup image resize handlers for all images in editor
function setupImageHandlers(immediate = false) {
    // Skip if user is actively editing (unless immediate is true)
    if (!immediate && (isParsing.value || isResizing.value || isUpdatingContent.value)) {
        return;
    }

    // Get editor root (contentEditable div)
    const editorRoot = editorRef.value;
    if (!editorRoot) {
        return;
    }

    // Restore image styles first
    restoreImageStyles();

    // Attach handlers to all existing images
    const attachToAllImages = () => {
        const images = editorRoot.querySelectorAll('img');
        // Only log if there are images to avoid spam
        if (images.length > 0) {
            console.log(`setupImageHandlers: Found ${images.length} images to attach handlers to`);
        }

        images.forEach((img, index) => {
            // Always remove the attribute to force re-attachment
            img.removeAttribute('data-resize-handler-attached');
            // Ensure image is draggable and has proper cursor
            img.draggable = true;
            img.style.cursor = 'grab';
            // Attach handlers
            attachImageResizeHandler(img);
        });
    };

    attachToAllImages();

    // Watch for new images and deleted images - debounced to avoid interfering with editing
    const imageObserverTimeout = null;
    const observer = new MutationObserver((mutations) => {
        // Skip if user is actively editing
        if (isParsing.value || isResizing.value || isUpdatingContent.value) {
            return;
        }

        let imagesChanged = false;

        mutations.forEach((mutation) => {
            // Check for removed nodes
            mutation.removedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    // Check if the selected image was removed
                    if (selectedImage.value && (node === selectedImage.value || node.contains(selectedImage.value))) {
                        hideResizeHandles();
                    }
                    // Check for images within removed nodes
                    if (node.tagName === 'IMG' || (node.querySelector && node.querySelector('img'))) {
                        imagesChanged = true;
                    }
                }
            });

            // Check for added nodes
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && (node.tagName === 'IMG' || (node.querySelector && node.querySelector('img')))) {
                    imagesChanged = true;
                }
            });
        });

        // Debounce re-attaching handlers to avoid interfering with editing
        if (imagesChanged) {
            if (imageHandlersTimeout.value) {
                clearTimeout(imageHandlersTimeout.value);
            }
            imageHandlersTimeout.value = setTimeout(() => {
                if (!isParsing.value && !isResizing.value && !isUpdatingContent.value) {
                    attachToAllImages();
                }
            }, 1000); // Wait 1 second after images change
        }

        // Also check if selected image still exists in DOM
        if (selectedImage.value && !editorRoot.contains(selectedImage.value)) {
            hideResizeHandles();
        }
    });

    observer.observe(editorRoot, {
        childList: true,
        subtree: true
    });

    // Handle clicks outside to hide handles
    const handleClick = (e) => {
        if (isResizing.value) return;
        if (e.target.closest('.resize-handle') || e.target.closest('.resize-handles-container')) return;
        if (selectedImage.value && (e.target === selectedImage.value || selectedImage.value.contains(e.target))) return;
        hideResizeHandles();
    };

    document.addEventListener('click', handleClick, true);

    // Also add a direct click handler on the editor root to catch image clicks
    // This is a fallback in case individual image handlers don't work
    const editorClickHandler = (e) => {
        // Check if click is on an image
        const clickedImg = e.target.closest('img');
        if (clickedImg && editorRoot.contains(clickedImg)) {
            console.log('Editor root click handler detected image click:', clickedImg);
            // Check if this image has handlers attached
            if (!clickedImg.hasAttribute('data-resize-handler-attached')) {
                console.log('Image does not have handlers, attaching now...');
                attachImageResizeHandler(clickedImg);
            }
            // Show resize handles
            e.preventDefault();
            e.stopPropagation();
            showResizeHandles(clickedImg);
        }
    };

    editorRoot.addEventListener('click', editorClickHandler, { capture: true });
}

// Show resize handles for an image
function showResizeHandles(imgElement) {
    console.log('showResizeHandles called with:', imgElement);
    if (!imgElement || imgElement.tagName !== 'IMG') {
        console.warn('Invalid image element:', imgElement);
        return;
    }

    // Hide previous handles if any
    hideResizeHandles();

    selectedImage.value = imgElement;

    // Get image position relative to viewport
    const rect = imgElement.getBoundingClientRect();
    console.log('Image rect:', rect);

    // Get computed styles for colors
    const computedStyle = window.getComputedStyle(document.documentElement);
    const accentColor = computedStyle.getPropertyValue('--accent').trim() || '#00A7E1';
    const bgSurface = computedStyle.getPropertyValue('--bg-surface').trim() || '#FFFFFF';

    // Create resize handles container - use fixed positioning from the start
    const handlesContainer = document.createElement('div');
    handlesContainer.className = 'resize-handles-container';

    // Set inline styles for positioning and visibility - use fixed positioning
    handlesContainer.style.position = 'fixed';
    handlesContainer.style.left = `${rect.left}px`;
    handlesContainer.style.top = `${rect.top}px`;
    handlesContainer.style.width = `${rect.width}px`;
    handlesContainer.style.height = `${rect.height}px`;
    handlesContainer.style.zIndex = '99999';
    handlesContainer.style.pointerEvents = 'none';
    handlesContainer.style.border = `2px solid ${accentColor}`;
    handlesContainer.style.borderRadius = '4px';
    handlesContainer.style.boxShadow = '0 0 0 1px rgba(255, 255, 255, 0.5)';
    handlesContainer.style.boxSizing = 'border-box';
    handlesContainer.style.margin = '0';
    handlesContainer.style.padding = '0';
    handlesContainer.style.overflow = 'visible';
    handlesContainer.style.visibility = 'visible';
    handlesContainer.style.display = 'block';
    handlesContainer.style.opacity = '1';
    handlesContainer.style.backgroundColor = 'rgba(255, 0, 0, 0.1)'; // Temporary: light red background for debugging

    // Create corner handles
    const corners = ['nw', 'ne', 'sw', 'se'];
    corners.forEach(corner => {
        const handle = document.createElement('div');
        handle.className = `resize-handle resize-handle-${corner}`;
        handle.setAttribute('data-handle', corner);

        // Get computed styles for colors (inside loop to ensure we have the values)
        const computedStyle = window.getComputedStyle(document.documentElement);
        const accentColor = computedStyle.getPropertyValue('--accent').trim() || '#00A7E1';
        const bgSurface = computedStyle.getPropertyValue('--bg-surface').trim() || '#FFFFFF';

        // Set inline styles for handles - make them larger and more visible
        handle.style.position = 'absolute';
        handle.style.width = '16px';
        handle.style.height = '16px';
        handle.style.background = accentColor;
        handle.style.border = `3px solid ${bgSurface}`;
        handle.style.borderRadius = '50%';
        handle.style.pointerEvents = 'all';
        handle.style.cursor = corner === 'nw' || corner === 'se' ? 'nwse-resize' : 'nesw-resize';
        handle.style.zIndex = '10001';
        handle.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.4)';
        handle.style.transition = 'all 0.2s ease';
        handle.style.visibility = 'visible';
        handle.style.display = 'block';
        handle.style.opacity = '1';
        handle.style.overflow = 'visible';
        handle.style.minWidth = '16px';
        handle.style.minHeight = '16px';

        // Position based on corner - center the handle on the corner
        if (corner === 'nw') {
            handle.style.top = '-8px';
            handle.style.left = '-8px';
        } else if (corner === 'ne') {
            handle.style.top = '-8px';
            handle.style.right = '-8px';
        } else if (corner === 'sw') {
            handle.style.bottom = '-8px';
            handle.style.left = '-8px';
        } else if (corner === 'se') {
            handle.style.bottom = '-8px';
            handle.style.right = '-8px';
        }

        // Hover effect
        handle.addEventListener('mouseenter', () => {
            handle.style.transform = 'scale(1.2)';
            handle.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.3)';
        });
        handle.addEventListener('mouseleave', () => {
            handle.style.transform = 'scale(1)';
            handle.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
        });

        handlesContainer.appendChild(handle);

        // Add drag listeners
        handle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log('Resize handle clicked:', corner, imgElement);
            startResize(e, corner, imgElement);
        });
    });

    // Append directly to body with fixed positioning
    document.body.appendChild(handlesContainer);
    resizeHandlesContainer.value = handlesContainer;

    // Force a reflow to ensure styles are applied
    void handlesContainer.offsetHeight;

    // Verify handles are visible
    const containerRect = handlesContainer.getBoundingClientRect();
    const handlesVisible = Array.from(handlesContainer.children).every(handle => {
        const handleRect = handle.getBoundingClientRect();
        return handleRect.width > 0 && handleRect.height > 0;
    });

    console.log('Resize handles created:', {
        container: handlesContainer,
        position: {
            left: handlesContainer.style.left,
            top: handlesContainer.style.top,
            width: handlesContainer.style.width,
            height: handlesContainer.style.height
        },
        computedRect: containerRect,
        handlesCount: handlesContainer.children.length,
        containerVisible: containerRect.width > 0 && containerRect.height > 0,
        handlesVisible: handlesVisible,
        containerInDOM: document.body.contains(handlesContainer),
        allHandles: Array.from(handlesContainer.children).map(h => ({
            rect: h.getBoundingClientRect(),
            styles: window.getComputedStyle(h)
        }))
    });

    // Update position on scroll/resize
    const updateFixedPosition = () => {
        if (selectedImage.value && resizeHandlesContainer.value && !isResizing.value) {
            // Check if image still exists in DOM
            if (!document.contains(selectedImage.value)) {
                hideResizeHandles();
                return;
            }
            const newRect = selectedImage.value.getBoundingClientRect();
            resizeHandlesContainer.value.style.left = `${newRect.left}px`;
            resizeHandlesContainer.value.style.top = `${newRect.top}px`;
            resizeHandlesContainer.value.style.width = `${newRect.width}px`;
            resizeHandlesContainer.value.style.height = `${newRect.height}px`;
        }
    };

    window.addEventListener('scroll', updateFixedPosition, true);
    window.addEventListener('resize', updateFixedPosition);

    // Store cleanup
    imgElement._resizeCleanup = () => {
        window.removeEventListener('scroll', updateFixedPosition, true);
        window.removeEventListener('resize', updateFixedPosition);
    };
}

// Hide resize handles
function hideResizeHandles() {
    // Don't hide if we're currently resizing
    if (isResizing.value) {
        return;
    }

    // Clean up scroll/resize listeners
    if (selectedImage.value && selectedImage.value._resizeCleanup) {
        selectedImage.value._resizeCleanup();
        delete selectedImage.value._resizeCleanup;
    }

    // Remove handles container from DOM
    if (resizeHandlesContainer.value) {
        if (resizeHandlesContainer.value.parentNode) {
            resizeHandlesContainer.value.parentNode.removeChild(resizeHandlesContainer.value);
        }
        resizeHandlesContainer.value = null;
    }

    // Clear selected image reference
    selectedImage.value = null;
}

// Start resizing
function startResize(e, handleType, imgElement) {
    e.preventDefault();
    e.stopPropagation();

    // Ensure we have the correct image reference
    if (!imgElement || imgElement.tagName !== 'IMG') {
        console.warn('Invalid image element for resize');
        return;
    }

    isResizing.value = true;
    resizeHandleType.value = handleType;
    selectedImage.value = imgElement; // Ensure reference is set

    resizeStartX.value = e.clientX;
    resizeStartY.value = e.clientY;

    // Get current dimensions - check both style and computed
    let currentWidth = parseFloat(imgElement.style.width);
    let currentHeight = parseFloat(imgElement.style.height);

    if (!currentWidth || !currentHeight) {
        const imgRect = imgElement.getBoundingClientRect();
        currentWidth = currentWidth || imgRect.width;
        currentHeight = currentHeight || imgRect.height;
    }

    resizeStartWidth.value = currentWidth;
    resizeStartHeight.value = currentHeight;

    // Store initial image position for reference
    const initialRect = imgElement.getBoundingClientRect();
    resizeStartImageLeft.value = initialRect.left;
    resizeStartImageTop.value = initialRect.top;

    // Ensure the image has initial styles set
    if (!imgElement.style.width || !imgElement.style.height) {
        imgElement.style.width = `${currentWidth}px`;
        imgElement.style.height = `${currentHeight}px`;
    }

    // Add global mouse move and up listeners
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
}

// Handle resize - update image element directly
function handleResize(e) {
    if (!isResizing.value || !selectedImage.value) return;

    const img = selectedImage.value;
    const deltaX = e.clientX - resizeStartX.value;
    const deltaY = e.clientY - resizeStartY.value;

    let newWidth = resizeStartWidth.value;
    let newHeight = resizeStartHeight.value;

    // Calculate new dimensions based on handle type
    switch (resizeHandleType.value) {
        case 'se': // Southeast (bottom-right)
            newWidth = resizeStartWidth.value + deltaX;
            newHeight = resizeStartHeight.value + deltaY;
            break;
        case 'sw': // Southwest (bottom-left)
            newWidth = resizeStartWidth.value - deltaX;
            newHeight = resizeStartHeight.value + deltaY;
            break;
        case 'ne': // Northeast (top-right)
            newWidth = resizeStartWidth.value + deltaX;
            newHeight = resizeStartHeight.value - deltaY;
            break;
        case 'nw': // Northwest (top-left)
            newWidth = resizeStartWidth.value - deltaX;
            newHeight = resizeStartHeight.value - deltaY;
            break;
    }

    // Maintain aspect ratio (hold Shift to disable)
    if (!e.shiftKey) {
        const aspectRatio = resizeStartWidth.value / resizeStartHeight.value;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            newHeight = newWidth / aspectRatio;
        } else {
            newWidth = newHeight * aspectRatio;
        }
    }

    // Apply minimum size
    newWidth = Math.max(50, newWidth);
    newHeight = Math.max(50, newHeight);

    // Update the image element's style attribute directly
    let currentStyle = img.getAttribute('style') || '';
    // Remove existing width/height from style
    currentStyle = currentStyle.replace(/width\s*:\s*[^;]+;?/gi, '').replace(/height\s*:\s*[^;]+;?/gi, '').trim();
    currentStyle = currentStyle.replace(/;;+/g, ';').replace(/^;|;$/g, '').trim();
    // Add new width and height to style
    const newStyle = `${currentStyle}${currentStyle ? ' ' : ''}width: ${newWidth}px; height: ${newHeight}px;`.trim();

    // Update style attribute and style object
    img.setAttribute('style', newStyle);
    img.style.width = `${newWidth}px`;
    img.style.height = `${newHeight}px`;

    // Also save to width and height attributes for persistence
    // Remove any existing width/height attributes first
    img.removeAttribute('width');
    img.removeAttribute('height');
    img.setAttribute('width', Math.round(newWidth).toString());
    img.setAttribute('height', Math.round(newHeight).toString());

    // Store dimensions in data attributes as well for better persistence
    img.setAttribute('data-width', Math.round(newWidth).toString());
    img.setAttribute('data-height', Math.round(newHeight).toString());

    // Update handles position
    requestAnimationFrame(() => {
        if (resizeHandlesContainer.value && selectedImage.value) {
            const rect = selectedImage.value.getBoundingClientRect();
            resizeHandlesContainer.value.style.left = `${rect.left}px`;
            resizeHandlesContainer.value.style.top = `${rect.top}px`;
            resizeHandlesContainer.value.style.width = `${rect.width}px`;
            resizeHandlesContainer.value.style.height = `${rect.height}px`;
        }
    });
}

// Stop resizing - sync content
function stopResize() {
    if (!isResizing.value || !selectedImage.value) {
        isResizing.value = false;
        resizeHandleType.value = '';
        return;
    }

    const img = selectedImage.value;

    // Get editor root
    const editorRoot = editorRef.value;

    if (editorRoot) {
        // Ensure width and height attributes are set before syncing
        if (img.hasAttribute('style')) {
            const style = img.getAttribute('style');
            const widthMatch = style.match(/width\s*:\s*([\d.]+)\s*px/i);
            const heightMatch = style.match(/height\s*:\s*([\d.]+)\s*px/i);

            if (widthMatch) {
                img.setAttribute('width', Math.round(parseFloat(widthMatch[1])).toString());
            }
            if (heightMatch) {
                img.setAttribute('height', Math.round(parseFloat(heightMatch[1])).toString());
            }
        }

        // Sync content - the image element already has the updated style attribute and width/height attributes
        isParsing.value = true;

        // Ensure dimensions are saved in both style and attributes
        const style = img.getAttribute('style') || '';
        const widthMatch = style.match(/width\s*:\s*([\d.]+)\s*px/i);
        const heightMatch = style.match(/height\s*:\s*([\d.]+)\s*px/i);

        if (widthMatch && !img.hasAttribute('width')) {
            img.setAttribute('width', Math.round(parseFloat(widthMatch[1])).toString());
        }
        if (heightMatch && !img.hasAttribute('height')) {
            img.setAttribute('height', Math.round(parseFloat(heightMatch[1])).toString());
        }

        const updatedContent = editorRoot.innerHTML;
        content.value = updatedContent;
        emit('update:modelValue', updatedContent);

        // Update handles position
        requestAnimationFrame(() => {
            if (selectedImage.value && resizeHandlesContainer.value) {
                const rect = selectedImage.value.getBoundingClientRect();
                resizeHandlesContainer.value.style.left = `${rect.left}px`;
                resizeHandlesContainer.value.style.top = `${rect.top}px`;
                resizeHandlesContainer.value.style.width = `${rect.width}px`;
                resizeHandlesContainer.value.style.height = `${rect.height}px`;
            }
            isParsing.value = false;
        });
    }

    isResizing.value = false;
    resizeHandleType.value = '';

    // Remove global listeners
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
}

// Setup table event handlers for syncing content
function setupTableHandlers() {
    if (!editorRef.value) return;

    const editorRoot = editorRef.value;

    // Sync table content changes back to contentEditable
    const syncTableContent = () => {
        if (!isParsing.value && !isUpdatingContent.value) {
            const html = editorRoot.innerHTML;
            if (html !== content.value) {
                content.value = html;
                emit('update:modelValue', html);
            }
        }
    };

    // Listen for input events in table cells
    editorRoot.addEventListener('input', (e) => {
        if (e.target.closest('table')) {
            syncTableContent();
        }
    }, true);

    // Listen for paste events in table cells
    editorRoot.addEventListener('paste', (e) => {
        if (e.target.closest('table')) {
            setTimeout(syncTableContent, 0);
        }
    }, true);

    // Setup drag and drop for images into table cells
    const draggedImage = null;
    let dragOverCell = null;

    // Handle drag over table cells - must check for image drags
    const handleTableDragOver = (e) => {
        // Check if this is an image drag
        // Image drags will have text/html type and there should be a dragging image in the editor
        const hasDraggingImage = editorRoot.querySelector('img[data-dragging="true"]');
        const hasHtmlType = e.dataTransfer.types.includes('text/html');
        const hasImageType = e.dataTransfer.types.includes('application/x-image-element');

        // Check if it's an image drag: either has the image type or there's a dragging image
        const isImageDrag = hasHtmlType && (hasImageType || hasDraggingImage);

        if (!isImageDrag) {
            return; // Let other handlers deal with non-image drags
        }

        const cell = e.target.closest('td, th');
        if (cell) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            e.dataTransfer.dropEffect = 'move';

            // Prevent text selection in the cell during drag
            cell.style.userSelect = 'none';
            cell.style.webkitUserSelect = 'none';

            // Clear any text selection
            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
            }

            // Highlight the cell
            if (dragOverCell && dragOverCell !== cell) {
                dragOverCell.style.backgroundColor = '';
                dragOverCell.style.userSelect = '';
                dragOverCell.style.webkitUserSelect = '';
            }
            dragOverCell = cell;
            cell.style.backgroundColor = 'rgba(0, 123, 255, 0.2)';
        } else if (dragOverCell) {
            // Left the cell, remove highlight
            dragOverCell.style.backgroundColor = '';
            dragOverCell.style.userSelect = '';
            dragOverCell.style.webkitUserSelect = '';
            dragOverCell = null;
        }
    };

    // Handle drag enter on table cells
    const handleTableDragEnter = (e) => {
        const hasDraggingImage = editorRoot.querySelector('img[data-dragging="true"]');
        const hasHtmlType = e.dataTransfer.types.includes('text/html');
        const hasImageType = e.dataTransfer.types.includes('application/x-image-element');
        const isImageDrag = hasHtmlType && (hasImageType || hasDraggingImage);

        if (!isImageDrag) return;

        const cell = e.target.closest('td, th');
        if (cell) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    // Handle drag leave
    const handleTableDragLeave = (e) => {
        const cell = e.target.closest('td, th');
        if (cell) {
            // Only remove highlight if we're actually leaving the cell (not just moving to a child)
            const relatedTarget = e.relatedTarget;
            if (!relatedTarget || !cell.contains(relatedTarget)) {
                cell.style.backgroundColor = '';
                cell.style.userSelect = '';
                cell.style.webkitUserSelect = '';
                if (dragOverCell === cell) {
                    dragOverCell = null;
                }
            }
        }
    };

    editorRoot.addEventListener('dragover', handleTableDragOver, true);
    editorRoot.addEventListener('dragenter', handleTableDragEnter, true);
    editorRoot.addEventListener('dragleave', handleTableDragLeave, true);

    // Handle drop on table cells
    const handleTableDrop = async (e) => {
        console.log('handleTableDrop called', e.target);

        const cell = e.target.closest('td, th');
        if (!cell) {
            console.log('No cell found - not a table drop, let main handler deal with it');
            // Clear any remaining highlights
            if (dragOverCell) {
                dragOverCell.style.backgroundColor = '';
                dragOverCell.style.userSelect = '';
                dragOverCell.style.webkitUserSelect = '';
                dragOverCell = null;
            }
            // Don't prevent default or stop propagation - let the main drop handler process it
            return;
        }

        // Only handle if it's actually a table cell drop
        e.stopPropagation(); // Stop from bubbling to main drop handler

        console.log('Cell found:', cell);

        // Check if this is an image drag
        const hasDraggingImage = editorRoot.querySelector('img[data-dragging="true"]');
        const hasHtmlType = e.dataTransfer.types.includes('text/html');
        const hasImageType = e.dataTransfer.types.includes('application/x-image-element');
        const isImageDrag = hasHtmlType && (hasImageType || hasDraggingImage);

        console.log('Image drag check:', { hasDraggingImage: !!hasDraggingImage, hasHtmlType, hasImageType, isImageDrag });

        if (!isImageDrag) {
            console.log('Not an image drag, returning - let main handler process');
            // Clear highlights even if not an image drag
            if (dragOverCell) {
                dragOverCell.style.backgroundColor = '';
                dragOverCell.style.userSelect = '';
                dragOverCell.style.webkitUserSelect = '';
                dragOverCell = null;
            }
            // Don't prevent default - let main drop handler process it
            return;
            if (dragOverCell) {
                dragOverCell.style.backgroundColor = '';
                dragOverCell.style.userSelect = '';
                dragOverCell.style.webkitUserSelect = '';
                dragOverCell = null;
            }
            return; // Let other handlers deal with non-image drops
        }

        console.log('Processing image drop');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Clear highlight and restore selection
        if (dragOverCell) {
            dragOverCell.style.backgroundColor = '';
            dragOverCell.style.userSelect = '';
            dragOverCell.style.webkitUserSelect = '';
            dragOverCell = null;
        }
        cell.style.backgroundColor = '';
        cell.style.userSelect = '';
        cell.style.webkitUserSelect = '';

        // Get the image HTML from dataTransfer
        const imgHtml = e.dataTransfer.getData('text/html');
        console.log('Image HTML:', imgHtml);
        if (!imgHtml) {
            console.log('No image HTML in dataTransfer');
            return;
        }

        // Find the dragged image element
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = imgHtml;
        const imgElement = tempDiv.firstElementChild;

        if (imgElement && imgElement.tagName === 'IMG') {
            console.log('Image element found, inserting into cell');
            // Find and remove the original image if it exists
            const originalImg = editorRoot.querySelector('img[data-dragging="true"]');
            if (originalImg && originalImg !== imgElement) {
                console.log('Removing original image');
                originalImg.remove();
            }

            // Insert image into the cell
            isParsing.value = true;

            // Clear cell if it only has &nbsp;
            if (cell.textContent.trim() === '' || cell.innerHTML === '&nbsp;') {
                cell.innerHTML = '';
            }

            // Clear any existing selection
            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
            }

            // Simply append to cell - don't try to use selection as it may be from text selection during drag
            cell.appendChild(imgElement);
            const textNode = document.createTextNode('\u00A0');
            cell.appendChild(textNode);

            // Set cursor after the image
            try {
                const range = document.createRange();
                range.setStartAfter(textNode);
                range.collapse(true);
                const sel = window.getSelection();
                if (sel) {
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            } catch (error) {
                // Ignore cursor positioning errors
            }

            // Attach resize handler to the new image
            await nextTick();
            attachImageResizeHandler(imgElement);

            // Sync content
            await nextTick();
            const updatedContent = editorRoot.innerHTML;
            content.value = updatedContent;
            isParsing.value = false;

            console.log('Image successfully inserted into cell');
        } else {
            console.log('No image element found in HTML');
        }
    };

    // Register drop handler with capture phase to ensure it runs before container handler
    editorRoot.addEventListener('drop', handleTableDrop, true);

    // Handle keyboard navigation in tables
    editorRoot.addEventListener('keydown', (e) => {
        const target = e.target;

        // If we're in a table cell
        if (target.tagName === 'TD' || target.tagName === 'TH') {
            // Tab key - move to next/previous cell
            if (e.key === 'Tab') {
                e.preventDefault();
                const currentCell = target;
                const currentRow = currentCell.parentElement;
                const cellIndex = Array.from(currentRow.cells).indexOf(currentCell);

                if (e.shiftKey) {
                    // Shift+Tab: move to previous cell
                    if (cellIndex > 0) {
                        currentRow.cells[cellIndex - 1].focus();
                    } else if (currentRow.previousElementSibling) {
                        const prevRow = currentRow.previousElementSibling;
                        if (prevRow.cells && prevRow.cells.length > 0) {
                            prevRow.cells[prevRow.cells.length - 1].focus();
                        }
                    }
                } else {
                    // Tab: move to next cell
                    if (cellIndex < currentRow.cells.length - 1) {
                        currentRow.cells[cellIndex + 1].focus();
                    } else if (currentRow.nextElementSibling) {
                        const nextRow = currentRow.nextElementSibling;
                        if (nextRow.cells && nextRow.cells.length > 0) {
                            nextRow.cells[0].focus();
                        }
                    }
                }
                syncTableContent();
            }

            // Delete/Backspace at start of cell - allow normal deletion
            // This allows deleting the table if you're at the start
            if ((e.key === 'Backspace' || e.key === 'Delete') && target.textContent === '') {
                // Allow default behavior - this will delete the cell/table
                syncTableContent();
            }
        }
    }, true);
}

// Expose methods for parent components
// Expose methods for external access
defineExpose({
    updateTableOfContents,
    insertTextAtCursor: (text) => {
        if (!editorRef.value) return;
        const selection = window.getSelection();
        let range = null;

        if (selection.rangeCount > 0) {
            range = selection.getRangeAt(0);
        } else {
            range = document.createRange();
            range.selectNodeContents(editorRef.value);
            range.collapse(false);
        }

        const textNode = document.createTextNode(text);
        range.deleteContents();
        range.insertNode(textNode);

        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        syncContent();
    },
    getEditorElement: () => editorRef.value
});

// Get Quill instance after component is mounted
onMounted(async () => {
    await nextTick();

    // Setup contentEditable editor
    if (editorRef.value) {
        console.log('ContentEditable editor ready');

        // Set initial content
        if (props.modelValue) {
            editorRef.value.innerHTML = props.modelValue;
            content.value = props.modelValue;
        }

        setupContentListener();
        setupTableHandlers();

        // Setup image handlers on mount (only once)
        setTimeout(() => {
            setupImageHandlers(true);
        }, 500);
    }

    // Listen for selection changes to update toolbar state
    selectionChangeHandler = () => {
        if (editorRef.value) {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const isInEditor = editorRef.value.contains(range.commonAncestorContainer) ||
                    editorRef.value === range.commonAncestorContainer;
                if (isInEditor) {
                    // Trigger reactivity update
                    selectionUpdateTrigger.value++;
                }
            }
        }
    };
    document.addEventListener('selectionchange', selectionChangeHandler);

    // Function to enforce inline styles on images and remove <p> wrappers
    // Only run when not actively editing to avoid interference
    const enforceImageInlineStyles = () => {
        if (!editorRef.value) return;

        // Skip if user is actively editing
        if (isParsing.value || isResizing.value || isUpdatingContent.value) {
            return;
        }

        const editorRoot = editorRef.value;

        // Wrap images in table cells first
        wrapImagesInTableCells(editorRoot);

        // Remove <p> tags around tables and images
        const paragraphsToFix = Array.from(editorRoot.querySelectorAll('p'));
        paragraphsToFix.forEach(p => {
            const hasImages = p.querySelector('img');
            const hasTables = p.querySelector('table');
            const textContent = p.textContent?.trim() || '';

            if ((hasImages || hasTables) && textContent === '') {
                const span = document.createElement('span');
                span.style.cssText = 'display: inline !important; white-space: normal !important; line-height: 0 !important;';
                while (p.firstChild) {
                    span.appendChild(p.firstChild);
                }
                if (p.parentNode) {
                    p.parentNode.replaceChild(span, p);
                }
            }
        });

        const images = editorRoot.querySelectorAll('img');
        const links = editorRoot.querySelectorAll('a[href][target="_blank"]');

        // Force inline styles on all image links
        links.forEach(link => {
            const existingStyle = link.getAttribute('style') || '';
            if (!existingStyle.includes('display: inline-block')) {
                link.style.cssText = existingStyle + (existingStyle ? ' ' : '') + 'display: inline-block !important; vertical-align: middle !important; line-height: 0 !important; margin: 0 !important;';
            }
        });

        // Force block display on images (but parent link is inline-block)
        images.forEach(img => {
            const existingStyle = img.getAttribute('style') || '';

            // Check if this is a fit image (has width: 100% or should be fit)
            const hasWidth100 = existingStyle.includes('width: 100%') || existingStyle.includes('width:100%');
            const hasMaxWidth100 = existingStyle.includes('max-width: 100%') || existingStyle.includes('max-width:100%');
            const hasExplicitWidth = existingStyle.match(/width\s*:\s*[\d.]+px/i);
            const hasWidthAttr = img.hasAttribute('width');
            const isFitImage = hasWidth100 || (hasMaxWidth100 && !hasExplicitWidth && !hasWidthAttr);

            if (isFitImage) {
                // Fit images - preserve fit behavior, don't override
                let style = existingStyle;

                // Only add missing properties, don't override existing ones
                if (!existingStyle.includes('display: block') && !existingStyle.includes('display:block')) {
                    style = style + (style ? ' ' : '') + 'display: block !important;';
                }

                if (!hasWidth100) {
                    style = style.replace(/width\s*:\s*[^;]+;?/gi, '').trim();
                    style = style.replace(/;;+/g, ';').replace(/^;|;$/g, '').trim();
                    style = style + (style ? ' ' : '') + 'width: 100% !important;';
                }

                if (!hasMaxWidth100) {
                    style = style.replace(/max-width\s*:\s*[^;]+;?/gi, '').trim();
                    style = style.replace(/;;+/g, ';').replace(/^;|;$/g, '').trim();
                    style = style + (style ? ' ' : '') + 'max-width: 100% !important;';
                }

                if (!existingStyle.includes('height: auto') && !existingStyle.includes('height:auto')) {
                    style = style.replace(/height\s*:\s*[^;]+;?/gi, '').trim();
                    style = style.replace(/;;+/g, ';').replace(/^;|;$/g, '').trim();
                    style = style + (style ? ' ' : '') + 'height: auto !important;';
                }

                if (!existingStyle.includes('padding: 10px') && !existingStyle.includes('padding:10px')) {
                    style = style + (style ? ' ' : '') + 'padding: 10px !important;';
                }

                if (!existingStyle.includes('box-sizing: border-box') && !existingStyle.includes('box-sizing:border-box')) {
                    style = style + (style ? ' ' : '') + 'box-sizing: border-box !important;';
                }

                img.setAttribute('style', style);
                img.style.cssText = style;
            } else {
                // Non-fit images - preserve existing dimensions, don't force max-width
                let newStyle = existingStyle;

                // Preserve existing width/height from style
                const widthMatch = existingStyle.match(/width\s*:\s*([\d.]+)\s*(px|%)/i);
                const heightMatch = existingStyle.match(/height\s*:\s*([\d.]+)\s*(px|%)/i);

                if (!existingStyle.includes('display: block') && !existingStyle.includes('display:block')) {
                    newStyle = newStyle + (newStyle ? ' ' : '') + 'display: block !important;';
                }

                // Don't add max-width to images with explicit pixel dimensions - let them overflow
                // Only add max-width if there's no explicit width and it's not already there
                if (!hasExplicitWidth && !hasWidthAttr && !existingStyle.includes('max-width')) {
                    // Only add max-width if it's not a fit image
                    if (!hasWidth100) {
                        newStyle = newStyle + (newStyle ? ' ' : '') + 'max-width: 100% !important;';
                    }
                }

                if (!heightMatch && !existingStyle.includes('height: auto') && !existingStyle.includes('height:auto')) {
                    newStyle = newStyle + (newStyle ? ' ' : '') + 'height: auto !important;';
                }

                if (!existingStyle.includes('padding: 10px') && !existingStyle.includes('padding:10px')) {
                    newStyle = newStyle + (newStyle ? ' ' : '') + 'padding: 10px !important;';
                }

                if (!existingStyle.includes('box-sizing: border-box') && !existingStyle.includes('box-sizing:border-box')) {
                    newStyle = newStyle + (newStyle ? ' ' : '') + 'box-sizing: border-box !important;';
                }

                img.setAttribute('style', newStyle);
                img.style.cssText = newStyle;
            }
        });

        // Ensure table cells have proper styling
        const tableCells = editorRoot.querySelectorAll('table td');
        tableCells.forEach(td => {
            const hasImage = td.querySelector('img');
            if (hasImage) {
                const existingStyle = td.getAttribute('style') || '';
                if (!existingStyle.includes('padding: 5px')) {
                    td.style.cssText = existingStyle + (existingStyle ? ' ' : '') + 'display: table-cell !important; padding: 5px !important; border: none !important; vertical-align: middle !important;';
                }
            }
        });

        // Remove <p> tags around images (second pass for any remaining)
        const remainingParagraphs = Array.from(editorRoot.querySelectorAll('p'));
        remainingParagraphs.forEach(p => {
            const images = p.querySelectorAll('img');
            const textContent = p.textContent?.trim() || '';

            if (images.length > 0 && textContent === '') {
                // Preserve styles
                const styleMap = new Map();
                images.forEach((img, idx) => {
                    const imgStyles = img.getAttribute('style') || '';
                    const link = img.closest('a');
                    const linkStyles = link ? (link.getAttribute('style') || '') : '';
                    styleMap.set(idx, { imgStyles, linkStyles, link });
                });

                // Create inline span
                const span = document.createElement('span');
                span.style.cssText = 'display: inline !important; white-space: normal !important; line-height: 0 !important;';
                while (p.firstChild) {
                    span.appendChild(p.firstChild);
                }

                // Restore styles
                images.forEach((img, idx) => {
                    const saved = styleMap.get(idx);
                    if (saved) {
                        if (saved.imgStyles) {
                            const existingStyle = img.getAttribute('style') || '';
                            img.setAttribute('style', existingStyle + (existingStyle ? ' ' : '') + saved.imgStyles);
                        }
                        if (saved.link && saved.linkStyles) {
                            const existingLinkStyle = saved.link.getAttribute('style') || '';
                            saved.link.setAttribute('style', existingLinkStyle + (existingLinkStyle ? ' ' : '') + 'display: inline-block !important; vertical-align: middle !important; line-height: 0 !important; margin: 0 5px !important;');
                        }
                    }
                });

                if (p.parentNode) {
                    p.parentNode.replaceChild(span, p);
                }
            }
        });
    };

    // Set up a periodic check to ensure all images have handlers - but only when not editing
    // This is especially important for images loaded after initial mount
    const checkImagesInterval = setInterval(() => {
        // Skip if user is actively editing
        if (isParsing.value || isResizing.value || isUpdatingContent.value) {
            return;
        }

        if (editorRef.value) {
            const editorRoot = editorRef.value;
            const images = editorRoot.querySelectorAll('img');
            const imagesWithoutHandlers = Array.from(images).filter(img =>
                !img.hasAttribute('data-resize-handler-attached')
            );
            if (imagesWithoutHandlers.length > 0) {
                console.log(`Found ${imagesWithoutHandlers.length} images without handlers, attaching...`);
                imagesWithoutHandlers.forEach(img => {
                    console.log('Attaching handler to image found by interval:', img);
                    img.draggable = true;
                    img.style.cursor = 'grab';
                    attachImageResizeHandler(img);
                });
            }

            // Also ensure editor root has click handler
            if (!editorRoot._hasImageClickHandler) {
                const editorClickHandler = (e) => {
                    const clickedImg = e.target.closest('img');
                    if (clickedImg && editorRoot.contains(clickedImg)) {
                        console.log('Editor root click handler (interval-set) detected image click:', clickedImg);
                        if (!clickedImg.hasAttribute('data-resize-handler-attached')) {
                            console.log('Image does not have handlers, attaching now...');
                            clickedImg.draggable = true;
                            clickedImg.style.cursor = 'grab';
                            attachImageResizeHandler(clickedImg);
                        }
                        e.preventDefault();
                        e.stopPropagation();
                        showResizeHandles(clickedImg);
                    }
                };
                editorRoot.addEventListener('click', editorClickHandler, { capture: true });
                editorRoot._hasImageClickHandler = true;
            }
        }
    }, 2000); // Check every 2 seconds (less frequent to avoid interference)

    // Store interval for cleanup
    if (editorRef.value) {
        editorRef.value._imageCheckInterval = checkImagesInterval;
    }
});

// Cleanup on unmount
onBeforeUnmount(() => {
    hideResizeHandles();

    // Remove selection change listener
    if (selectionChangeHandler) {
        document.removeEventListener('selectionchange', selectionChangeHandler);
        selectionChangeHandler = null;
    }

    // Clear any pending image handler timeouts
    if (imageHandlersTimeout.value) {
        clearTimeout(imageHandlersTimeout.value);
        imageHandlersTimeout.value = null;
    }

    // Clean up image handler intervals and mutation observer
    if (editorRef.value) {
        const editorRoot = editorRef.value;
        if (editorRoot._imageHandlerInterval) {
            clearInterval(editorRoot._imageHandlerInterval);
            delete editorRoot._imageHandlerInterval;
        }
        if (editorRoot._imageCheckInterval) {
            clearInterval(editorRoot._imageCheckInterval);
            delete editorRoot._imageCheckInterval;
        }
        if (editorRoot._imageMutationObserver) {
            editorRoot._imageMutationObserver.disconnect();
            delete editorRoot._imageMutationObserver;
        }
    }
});

// Handle content update (no longer needed with contentEditable, but kept for compatibility)
function handleContentUpdate(newValue) {
    // This is handled by handleInput now
}

// Helper to save cursor position
function saveCursorPosition() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && editorRef.value) {
        const range = selection.getRangeAt(0);
        if (editorRef.value.contains(range.commonAncestorContainer)) {
            // Save by offset from start of editor
            const preRange = document.createRange();
            preRange.selectNodeContents(editorRef.value);
            preRange.setEnd(range.startContainer, range.startOffset);
            const startOffset = preRange.toString().length;

            preRange.setEnd(range.endContainer, range.endOffset);
            const endOffset = preRange.toString().length;

            return { startOffset, endOffset };
        }
    }
    return null;
}

// Helper to restore cursor position
function restoreCursorPosition(savedPosition) {
    if (!savedPosition || !editorRef.value) return;

    try {
        const range = document.createRange();
        const walker = document.createTreeWalker(
            editorRef.value,
            NodeFilter.SHOW_TEXT,
            null
        );

        let currentOffset = 0;
        let startNode = null;
        let startOffset = 0;
        let endNode = null;
        let endOffset = 0;

        let node;
        while ((node = walker.nextNode()) !== null) {
            const nodeLength = node.textContent.length;

            if (!startNode && currentOffset + nodeLength >= savedPosition.startOffset) {
                startNode = node;
                startOffset = savedPosition.startOffset - currentOffset;
            }

            if (currentOffset + nodeLength >= savedPosition.endOffset) {
                endNode = node;
                endOffset = savedPosition.endOffset - currentOffset;
                break;
            }

            currentOffset += nodeLength;
        }

        if (startNode) {
            range.setStart(startNode, Math.min(startOffset, startNode.textContent.length));
            if (endNode) {
                range.setEnd(endNode, Math.min(endOffset, endNode.textContent.length));
            } else {
                range.setEnd(startNode, Math.min(startOffset, startNode.textContent.length));
            }
        } else {
            // Fallback: place at end
            range.selectNodeContents(editorRef.value);
            range.collapse(false);
        }

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    } catch (e) {
        // If restoration fails, place cursor at end
        const range = document.createRange();
        range.selectNodeContents(editorRef.value);
        range.collapse(false);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

// Watch for external changes to modelValue
watch(() => [props.modelValue, props.locked], async ([newVal, locked]) => {
    // If locked, don't parse, just update content
    if (locked) {
        if (newVal !== content.value) {
            content.value = newVal || '';
            if (editorRef.value) {
                editorRef.value.innerHTML = newVal || '';
            }
        }
        return;
    }
    // Only update if content actually changed and we're not in the middle of user input
    // Also check if the editor's current content differs from the new value
    const currentEditorContent = editorRef.value ? editorRef.value.innerHTML : '';
    if (newVal !== currentEditorContent && newVal !== content.value && !isParsing.value && !isUpdatingContent.value) {
        // Save cursor position before updating
        const savedPosition = saveCursorPosition();

        isParsing.value = true;
        isUpdatingContent.value = true;

        // Preserve image styles when loading content
        let processedContent = newVal || '';
        if (processedContent) {
            processedContent = preserveImageStyles(processedContent);
        }

        if (editorRef.value) {
            // Update contentEditable directly
            editorRef.value.innerHTML = processedContent;
            content.value = processedContent;

            // Restore cursor position after update
            await nextTick();

            // If no saved position (e.g., new content), place cursor at end
            if (savedPosition) {
                restoreCursorPosition(savedPosition);
            } else {
                // Place cursor at end of content
                const range = document.createRange();
                range.selectNodeContents(editorRef.value);
                range.collapse(false);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
            }

            isUpdatingContent.value = false;

            // Check if we should parse after content update
            // Only parse if auto-parse is enabled and content has MASL expressions
            if (autoParseEnabled.value && props.routeId) {
                // Reset last parsed content to force re-parsing of new content
                lastParsedContent.value = '';

                // Use a small delay to ensure DOM is updated
                setTimeout(() => {
                    if (hasMaslExpressions(processedContent)) {
                        parseMaslContent(processedContent, props.routeId);
                    }
                }, 100);
            }

            // Debounce image handlers setup after content is loaded
            if (imageHandlersTimeout.value) {
                clearTimeout(imageHandlersTimeout.value);
            }
            imageHandlersTimeout.value = setTimeout(() => {
                if (!isParsing.value && !isResizing.value && !isUpdatingContent.value) {
                    setupImageHandlers(true);
                }
            }, 1000);

            // Update TOC after content is loaded (wait for images to load)
            await nextTick();
            updateTOCAfterContentLoad();
        } else {
            content.value = processedContent;
        }

        isParsing.value = false;
    }
}, { immediate: true });

// Don't watch content changes - handleInput will handle updates
// This prevents cursor position issues from reactive updates

// Track last parsed content to avoid re-parsing
const lastParsedContent = ref('');
const lastRouteId = ref(null);

// Watch routeId changes - reset cache when route changes
watch(() => props.routeId, (newRouteId) => {
    if (newRouteId !== lastRouteId.value) {
        lastParsedContent.value = '';
        parsedContentCache.value.clear();
        lastRouteId.value = newRouteId;
    }
});

// Watch content for MASL expressions and parse them
watch([content, () => props.routeId, () => props.locked], async ([newContent, routeId, locked]) => {
    if (!routeId || !newContent || isParsing.value || !autoParseEnabled.value || locked) {
        return;
    }

    // Skip if this content was already parsed with the same routeId
    if (lastParsedContent.value === newContent && lastRouteId.value === routeId) {
        return;
    }

    // Only parse if content contains MASL expressions
    if (!hasMaslExpressions(newContent)) {
        // If no MASL expressions, reset last parsed content if it was different
        if (lastParsedContent.value && lastParsedContent.value !== newContent) {
            lastParsedContent.value = '';
        }
        return;
    }

    // Clear existing timeout
    if (parseTimeout.value) {
        clearTimeout(parseTimeout.value);
    }

    // Debounce parsing to avoid excessive API calls
    parseTimeout.value = setTimeout(async () => {
        // Re-check content hasn't changed
        const currentContent = editorRef.value ? editorRef.value.innerHTML : content.value;
        if (currentContent === newContent) {
            await parseMaslContent(newContent, routeId);
        }
    }, 500); // 500ms debounce
}, { deep: true });

// Toggle auto-parse functionality
function toggleAutoParse() {
    const wasEnabled = autoParseEnabled.value;
    autoParseEnabled.value = !autoParseEnabled.value;

    // If auto-parse was just enabled, parse the current content
    if (autoParseEnabled.value && !wasEnabled && props.routeId && content.value) {
        const currentContent = editorRef.value ? editorRef.value.innerHTML : content.value;
        if (currentContent && hasMaslExpressions(currentContent)) {
            // Clear any existing timeout
            if (parseTimeout.value) {
                clearTimeout(parseTimeout.value);
            }
            // Parse immediately when toggle is turned on
            parseMaslContent(currentContent, props.routeId);
        }
    }
}

// Helper function to wrap images in inline spans for better inline control
function wrapImagesInTableCells(editorRoot) {
    if (!editorRoot) return;

    const images = Array.from(editorRoot.querySelectorAll('img'));
    images.forEach(img => {
        // Check if already wrapped in inline-image-wrapper
        if (img.closest('.inline-image-wrapper')) {
            return;
        }

        // Check if in a table cell - if so, ensure table is inline
        const existingCell = img.closest('td, th');
        if (existingCell) {
            const parentTable = existingCell.closest('table');
            if (parentTable) {
                const tableStyle = parentTable.getAttribute('style') || '';
                if (!tableStyle.includes('display: inline-table')) {
                    parentTable.style.cssText = tableStyle + (tableStyle ? ' ' : '') + 'display: inline-table !important; border-collapse: collapse !important; border: none !important; margin: 0 !important; padding: 0 !important; vertical-align: middle !important;';
                }
            }
            return;
        }

        // Get the parent link if it exists
        const link = img.closest('a');
        const container = link || img;
        const parent = container.parentNode;

        if (!parent) return;

        // Wrap in inline span instead of table
        const wrapper = document.createElement('span');
        wrapper.className = 'inline-image-wrapper';
        wrapper.style.cssText = 'display: inline-block !important; margin: 0 5px !important; vertical-align: middle !important; line-height: 0 !important;';

        // Move the container into the wrapper
        wrapper.appendChild(container);

        // Replace container with wrapper
        parent.replaceChild(wrapper, container);
    });
}

// Helper function to make consecutive images inline (remove unnecessary <p> tags)
// In HTML, <img> tags are inline by default, but Quill wraps them in <p> tags which creates line breaks
function makeImagesInline(htmlContent) {
    if (!htmlContent || typeof htmlContent !== 'string') return htmlContent;

    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // Find all paragraphs that only contain images (or images with minimal text)
    const paragraphs = Array.from(tempDiv.querySelectorAll('p'));
    paragraphs.forEach(p => {
        const images = p.querySelectorAll('img');
        const textContent = p.textContent?.trim() || '';

        // If paragraph only contains images (or just whitespace), remove <p> wrapper to make inline with natural wrapping
        if (images.length > 0 && textContent === '') {
            // Create a span that allows inline flow with natural wrapping
            const span = document.createElement('span');
            span.style.display = 'inline';
            span.style.whiteSpace = 'normal';
            while (p.firstChild) {
                span.appendChild(p.firstChild);
            }
            // Replace <p> with inline span that allows wrapping
            if (p.parentNode) {
                p.parentNode.replaceChild(span, p);
            }
        } else if (images.length > 0) {
            // If there's text and images, make images inline within the paragraph
            images.forEach(img => {
                const imgParent = img.parentElement;
                if (imgParent && imgParent.tagName === 'A') {
                    const existingLinkStyle = imgParent.getAttribute('style') || '';
                    imgParent.style.cssText = existingLinkStyle + (existingLinkStyle ? ' ' : '') + 'display: inline-block !important; vertical-align: middle !important; line-height: 0 !important; margin: 0 5px !important;';
                }
                // Image should be block to respect dimensions, preserve existing styles
                const existingImgStyle = img.getAttribute('style') || '';
                img.style.cssText = existingImgStyle + (existingImgStyle ? ' ' : '') + 'display: block !important; max-width: 100% !important; height: auto !important; padding: 10px !important;';
            });
        }
    });

    return tempDiv.innerHTML;
}

// Helper to check if content contains MASL expressions
function hasMaslExpressions(htmlContent) {
    if (!htmlContent || typeof htmlContent !== 'string') {
        return false;
    }

    // MASL expression pattern - includes all MASL commands
    const maslPattern = /@(survey|point|user|plannedroute|date|beginfor|endfor|mapscreenshot|noteimg|note|pointimg|beginrow|endrow|begincol|endcol)\s*\([^)]*\)|@date|@beginfor|@endfor|@beginrow|@endrow|@begincol|@endcol/g;

    // Check HTML content
    const hasMaslInHtml = maslPattern.test(htmlContent);

    // Also check text content (extract from HTML)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    const hasMaslInText = maslPattern.test(textContent);

    return hasMaslInHtml || hasMaslInText;
}

// Parse MASL content in the editor
async function parseMaslContent(htmlContent, routeId) {
    if (isParsing.value) {
        return;
    }

    // Only parse if there are MASL expressions
    if (!hasMaslExpressions(htmlContent)) {
        return;
    }

    // Check cache first
    const cacheKey = `${routeId}-${htmlContent}`;
    if (parsedContentCache.value.has(cacheKey)) {
        const cached = parsedContentCache.value.get(cacheKey);
        // Only update if content hasn't changed and is different from cached
        if (content.value === htmlContent && content.value !== cached) {
            await updateEditorContent(cached);
            lastParsedContent.value = cached;
        }
        return;
    }

    isParsing.value = true;

    try {
        let parsedContent = await MASLUtility.parseMASL(htmlContent, String(routeId));

        // Convert any remaining \n to <br /> in the parsed content
        parsedContent = convertNewlinesToBr(parsedContent);

        // Make consecutive images inline with natural wrapping (remove unnecessary line breaks)
        // This is especially important for loops where multiple images are concatenated
        parsedContent = makeImagesInline(parsedContent);

        // Additional processing: Remove <p> tags that only contain images (common in loops)
        // Replace with inline spans that allow natural wrapping when width doesn't allow
        parsedContent = parsedContent.replace(/<p[^>]*>((?:<a[^>]*><img[^>]*><\/a>\s*)+)<\/p>/gi, '<span style="display: inline; white-space: normal;">$1</span>');
        // Remove consecutive <p> tags between images
        parsedContent = parsedContent.replace(/<\/p>\s*<p[^>]*>/gi, '');

        // Process parsed content to wrap images in inline wrappers if not already wrapped
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = parsedContent;

        // Wrap images in inline-image-wrapper spans
        const imagesInContent = tempDiv.querySelectorAll('img');
        imagesInContent.forEach(img => {
            if (!img.closest('.inline-image-wrapper')) {
                const link = img.closest('a');
                const container = link || img;
                const parent = container.parentNode;
                if (parent) {
                    const wrapper = document.createElement('span');
                    wrapper.className = 'inline-image-wrapper';
                    wrapper.style.cssText = 'display: inline-block !important; margin: 0 5px !important; vertical-align: middle !important; line-height: 0 !important;';
                    wrapper.appendChild(container);
                    parent.replaceChild(wrapper, container);
                }
            }
        });

        parsedContent = tempDiv.innerHTML;

        // Cache the result
        parsedContentCache.value.set(cacheKey, parsedContent);

        // Only update if content hasn't changed during parsing
        if (content.value === htmlContent) {
            await updateEditorContent(parsedContent);
            lastParsedContent.value = parsedContent;
            lastRouteId.value = routeId;
        }
    } catch (error) {
        console.error('Error parsing MASL content:', error);
    } finally {
        isParsing.value = false;

        // Debounce image handlers setup - only run after user stops editing
        if (imageHandlersTimeout.value) {
            clearTimeout(imageHandlersTimeout.value);
        }
        imageHandlersTimeout.value = setTimeout(() => {
            if (!isParsing.value && !isResizing.value && !isUpdatingContent.value) {
                setupImageHandlers(true); // Force immediate when debounced
            }
        }, 1000); // Wait 1 second after parsing completes

        // Update TOC after MASL parsing completes and images are loaded
        // Wait for images to load before calculating page numbers
        updateTOCAfterContentLoad();
    }
}

// Helper function to preserve image styles from HTML
function preserveImageStyles(htmlContent) {
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // Find all images and ensure their styles and attributes are preserved
    const images = tempDiv.querySelectorAll('img');
    images.forEach(img => {
        const styleAttr = img.getAttribute('style') || '';

        // Check if this is a fit image (has width: 100% or max-width: 100% without explicit dimensions)
        const hasWidth100 = styleAttr.includes('width: 100%') || styleAttr.includes('width:100%');
        const hasMaxWidth100 = styleAttr.includes('max-width: 100%') || styleAttr.includes('max-width:100%');
        const hasExplicitWidth = styleAttr.match(/width\s*:\s*[\d.]+px/i);
        const hasWidthAttr = img.hasAttribute('width');

        // If it's a fit image, preserve the fit behavior
        if ((hasWidth100 || (hasMaxWidth100 && !hasExplicitWidth && !hasWidthAttr)) && !hasExplicitWidth) {
            // This is a fit image - preserve its fit behavior
            let style = styleAttr;

            // Ensure width: 100% is present
            if (!hasWidth100) {
                style = style.replace(/width\s*:\s*[^;]+;?/gi, '').trim();
                style = style.replace(/;;+/g, ';').replace(/^;|;$/g, '').trim();
                style += (style ? ' ' : '') + 'width: 100%;';
            }

            // Ensure max-width: 100% is present
            if (!hasMaxWidth100) {
                style = style.replace(/max-width\s*:\s*[^;]+;?/gi, '').trim();
                style = style.replace(/;;+/g, ';').replace(/^;|;$/g, '').trim();
                style += (style ? ' ' : '') + 'max-width: 100%;';
            }

            // Ensure height: auto
            if (!styleAttr.includes('height: auto') && !styleAttr.includes('height:auto')) {
                style = style.replace(/height\s*:\s*[^;]+;?/gi, '').trim();
                style = style.replace(/;;+/g, ';').replace(/^;|;$/g, '').trim();
                style += (style ? ' ' : '') + 'height: auto;';
            }

            img.setAttribute('style', style);

            // Remove width/height attributes for fit images
            img.removeAttribute('width');
            img.removeAttribute('height');
            return; // Skip the dimension restoration for fit images
        }

        // For non-fit images, preserve dimensions from style or attributes
        let width = null;
        let height = null;
        let widthUnit = 'px';
        let heightUnit = 'px';

        // Extract from style first (preserves units)
        const widthMatch = styleAttr.match(/width\s*:\s*([\d.]+)\s*(px|%)?/i);
        const heightMatch = styleAttr.match(/height\s*:\s*([\d.]+)\s*(px|%)?/i);

        if (widthMatch) {
            width = widthMatch[1];
            widthUnit = widthMatch[2] || 'px';
        } else if (img.hasAttribute('width')) {
            width = img.getAttribute('width');
            // Check if it's a percentage
            if (width.includes('%')) {
                widthUnit = '%';
                width = width.replace('%', '');
            }
        }

        if (heightMatch) {
            height = heightMatch[1];
            heightUnit = heightMatch[2] || 'px';
        } else if (img.hasAttribute('height')) {
            height = img.getAttribute('height');
            // Check if it's a percentage
            if (height.includes('%')) {
                heightUnit = '%';
                height = height.replace('%', '');
            }
        }

        // Ensure both style and attributes are set with correct units
        if (width) {
            img.setAttribute('width', width);
            // Update style to include width with correct unit
            let style = styleAttr.replace(/width\s*:\s*[^;]+;?/gi, '').trim();
            style = style.replace(/;;+/g, ';').replace(/^;|;$/g, '').trim();
            style += (style ? ' ' : '') + `width: ${width}${widthUnit};`;
            img.setAttribute('style', style);
        }

        if (height) {
            img.setAttribute('height', height);
            // Update style to include height with correct unit
            let style = img.getAttribute('style') || '';
            style = style.replace(/height\s*:\s*[^;]+;?/gi, '').trim();
            style = style.replace(/;;+/g, ';').replace(/^;|;$/g, '').trim();
            style += (style ? ' ' : '') + `height: ${height}${heightUnit};`;
            img.setAttribute('style', style);
        }
    });

    return tempDiv.innerHTML;
}

// Helper to update editor content without triggering watcher
async function updateEditorContent(newContent) {
    await nextTick();

    if (!editorRef.value) {
        return;
    }

    // Save cursor position before updating
    const savedPosition = saveCursorPosition();

    // Temporarily disable watcher by setting flag
    isParsing.value = true;
    isUpdatingContent.value = true;

    // Convert any \n to <br /> before inserting
    let contentToInsert = convertNewlinesToBr(newContent);

    // Preserve image styles before inserting
    contentToInsert = preserveImageStyles(contentToInsert);

    // Update content directly - contentEditable preserves HTML structure
    editorRef.value.innerHTML = contentToInsert;

    // Restore cursor position after update
    await nextTick();
    restoreCursorPosition(savedPosition);

    // Sync content
    content.value = editorRef.value.innerHTML;
    emit('update:modelValue', content.value);

    isParsing.value = false;
    isUpdatingContent.value = false;

    // Update TOC after content is updated (wait for images to load)
    updateTOCAfterContentLoad();

    // Debounce image handlers setup after content update
    if (imageHandlersTimeout.value) {
        clearTimeout(imageHandlersTimeout.value);
    }
    imageHandlersTimeout.value = setTimeout(() => {
        if (!isParsing.value && !isResizing.value && !isUpdatingContent.value) {
            setupImageHandlers(true);
        }
    }, 1000); // Wait 1 second after content update
}

// Simple drop handler - just insert the expression as-is
function handleDragOver(event) {
    // Don't interfere with image drags to table cells
    const isImageDrag = event.dataTransfer.types.includes('text/html') &&
        event.dataTransfer.types.includes('application/x-image-element');

    if (isImageDrag) {
        // Let table handlers deal with it
        return;
    }

    // Check if this is a variable or block drag
    const blockType = event.dataTransfer.getData('block-type');
    const hasVariableData = event.dataTransfer.types.some(type =>
        type.includes('application/json') || type.includes('text/plain') || type === 'block-type'
    );

    if (blockType === 'variable' || hasVariableData || event.dataTransfer.types.length > 0) {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'copy';
    }
}

function handleDragEnter(event) {
    // Check if this is a drag we should handle
    // Note: getData only works in drop event, so we check types here
    const hasVariableData = event.dataTransfer.types.some(type =>
        type.includes('application/json') || type.includes('text/plain') || type === 'block-type' || type === 'text/plain'
    );

    if (hasVariableData || event.dataTransfer.types.length > 0) {
        event.preventDefault();
        event.stopPropagation();
        // Add visual feedback
        if (editorContainerRef.value) {
            editorContainerRef.value.classList.add('drag-over');
        }
        if (editorRef.value) {
            editorRef.value.classList.add('drag-over');
        }
    }
}

function handleDragLeave(event) {
    // Only remove drag-over class if we're leaving the editor container
    if (editorContainerRef.value && !editorContainerRef.value.contains(event.relatedTarget)) {
        editorContainerRef.value.classList.remove('drag-over');
    }
    if (editorRef.value && !editorRef.value.contains(event.relatedTarget)) {
        editorRef.value.classList.remove('drag-over');
    }
}

async function handleDrop(event) {
    // Always prevent default and stop propagation first
    event.preventDefault();
    event.stopPropagation();

    // Remove drag-over class
    if (editorContainerRef.value) {
        editorContainerRef.value.classList.remove('drag-over');
    }
    if (editorRef.value) {
        editorRef.value.classList.remove('drag-over');
    }

    // Ensure we're handling the drop on this editor instance
    // Check if the drop target is within this editor container
    const dropTarget = event.target;
    const isWithinEditor = editorRef.value && (
        editorRef.value.contains(dropTarget) ||
        dropTarget === editorRef.value ||
        editorContainerRef.value?.contains(dropTarget)
    );

    if (!isWithinEditor) {
        // Drop is not on this editor, ignore it
        console.log('Drop ignored - not on this editor instance', {
            dropTarget,
            editorRef: editorRef.value,
            editorContainer: editorContainerRef.value
        });
        return;
    }

    console.log('Handling drop on editor', {
        dropTarget,
        editorRef: editorRef.value,
        blockType: event.dataTransfer.getData('block-type')
    });

    // Check if this is an image drag - let table handlers deal with it
    const hasDraggingImage = editorRef.value?.querySelector('img[data-dragging="true"]');
    const hasHtmlType = event.dataTransfer.types.includes('text/html');
    const hasImageType = event.dataTransfer.types.includes('application/x-image-element');
    const isImageDrag = hasHtmlType && (hasImageType || hasDraggingImage);

    // If it's an image drag and we're over a table cell, let the table handler deal with it
    if (isImageDrag && event.target.closest('td, th')) {
        return; // Don't handle it here, let table handler process it
    }

    const blockType = event.dataTransfer.getData('block-type');
    const hasVariableData = event.dataTransfer.types.some(type =>
        type.includes('application/json') || type.includes('text/plain') || type === 'block-type'
    );

    // If it's a loop block, emit event to parent to handle it
    if (blockType === 'loop') {
        // Get block config
        const blockConfig = event.dataTransfer.getData('block-config');
        let config = {};
        if (blockConfig) {
            try {
                config = JSON.parse(blockConfig);
            } catch (e) {
                console.error('Error parsing block config:', e);
            }
        }

        // Emit event to parent with the editor element and config
        emit('loop-drop', {
            event,
            config,
            editorElement: editorRef.value
        });
        return;
    }

    // If it's a row block, open row body editor
    if (blockType === 'row') {
        // Get block config
        const blockConfig = event.dataTransfer.getData('block-config');
        let config = {};
        if (blockConfig) {
            try {
                config = JSON.parse(blockConfig);
            } catch (e) {
                console.error('Error parsing block config:', e);
            }
        }

        // Store drop position for later insertion
        const selection = window.getSelection();
        let savedRange = null;
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (editorRef.value.contains(range.commonAncestorContainer) || editorRef.value === range.commonAncestorContainer) {
                savedRange = range.cloneRange();
            }
        }

        // Store the range for when row is confirmed
        pendingRowDropRange.value = savedRange;

        // Extract column count from row block config
        let columnCount = 1; // Default to 1 column
        if (config.value) {
            // Check for patterns like @beginrow2, @beginrow3, etc.
            const match = config.value.match(/@beginrow(\d+)/);
            if (match && match[1]) {
                columnCount = parseInt(match[1], 10) || 1;
            } else if (config.value.includes('@beginrow')) {
                // If it's just @beginrow without a number, it's 1 column
                columnCount = 1;
            }
        } else if (config.title) {
            // Fallback: try to extract from title like "Start Row (2 Columns)"
            const titleMatch = config.title.match(/(\d+)\s+[Cc]olumn/i);
            if (titleMatch && titleMatch[1]) {
                columnCount = parseInt(titleMatch[1], 10) || 1;
            }
        }

        // Set initial column count
        initialRowColumnCount.value = columnCount;

        // Open row body editor
        showRowBodyEditor.value = true;
        return;
    }

    // If it's a TOC block, insert table of contents
    if (blockType === 'toc') {
        // Check if drop is directly in a section container (not inside a block/editor)
        // Editors inside text blocks are fine - we want to prevent dropping directly into section containers
        const dropTarget = event.target;
        const isDirectlyInSection = dropTarget.closest('.editor-section[data-section-id]') &&
            !dropTarget.closest('.report-block-wrapper') &&
            !dropTarget.closest('.rich-text-editor');

        if (isDirectlyInSection) {
            // Prevent dropping TOC blocks directly in section containers
            console.log('Cannot drop TOC block directly in section containers - only allowed in editors');
            event.preventDefault();
            return;
        }

        // Allow in any editor (editors inside text blocks are fine)
        if (editorRef.value) {
            // Save selection before inserting TOC
            const selection = window.getSelection();
            let savedRange = null;
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                if (editorRef.value.contains(range.commonAncestorContainer) || editorRef.value === range.commonAncestorContainer) {
                    savedRange = range.cloneRange();
                }
            }

            // If no range, create one at the beginning
            if (!savedRange) {
                savedRange = document.createRange();
                savedRange.selectNodeContents(editorRef.value);
                savedRange.collapse(true);
            }

            // Set selection to the saved range
            selection.removeAllRanges();
            selection.addRange(savedRange);

            // Insert table of contents
            await insertTableOfContents();
            return;
        } else {
            // Not in main editor, prevent drop
            console.log('Cannot drop TOC block outside main editor');
            event.preventDefault();
            return;
        }
    }

    if (blockType === 'variable' || hasVariableData) {

        const blockConfig = event.dataTransfer.getData('block-config');
        let config = {};

        if (blockConfig) {
            try {
                config = JSON.parse(blockConfig);
            } catch (e) {
                if (typeof blockConfig === 'string' && blockConfig.trim()) {
                    config = { value: blockConfig };
                } else {
                    return;
                }
            }
        }

        if (config.value) {
            // Check if this is @toc expression
            const isTocExpression = config.value.trim().toLowerCase() === '@toc';

            if (isTocExpression) {
                // Check if drop is directly in a section container (not inside a block/editor)
                // Editors inside text blocks are fine - we want to prevent dropping directly into section containers
                const dropTarget = event.target;
                const isDirectlyInSection = dropTarget.closest('.editor-section[data-section-id]') &&
                    !dropTarget.closest('.report-block-wrapper') &&
                    !dropTarget.closest('.rich-text-editor');

                if (isDirectlyInSection) {
                    // Prevent dropping @toc directly in section containers
                    console.log('Cannot drop @toc directly in section containers - only allowed in editors');
                    event.preventDefault();
                    return;
                }

                // Allow in any editor (editors inside text blocks are fine)
                if (editorRef.value) {
                    // Save selection before inserting TOC
                    const selection = window.getSelection();
                    let savedRange = null;
                    if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        if (editorRef.value.contains(range.commonAncestorContainer) || editorRef.value === range.commonAncestorContainer) {
                            savedRange = range.cloneRange();
                        }
                    }

                    // If no range, create one at the beginning
                    if (!savedRange) {
                        savedRange = document.createRange();
                        savedRange.selectNodeContents(editorRef.value);
                        savedRange.collapse(true);
                    }

                    // Set selection to the saved range
                    selection.removeAllRanges();
                    selection.addRange(savedRange);

                    // Insert table of contents
                    await insertTableOfContents();
                    return;
                } else {
                    // Not in main editor, prevent drop
                    console.log('Cannot drop @toc outside main editor');
                    event.preventDefault();
                    return;
                }
            }

            await nextTick();

            if (editorRef.value) {
                // Get current selection
                const selection = window.getSelection();
                let range = null;

                if (selection.rangeCount > 0) {
                    range = selection.getRangeAt(0);
                } else {
                    // Create range at end of editor
                    range = document.createRange();
                    range.selectNodeContents(editorRef.value);
                    range.collapse(false);
                }

                // Insert text with newlines converted to <br>
                const textWithBreaks = config.value.replace(/\n/g, '<br>');
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = textWithBreaks;

                // If editor is empty, ensure it has a structure
                if (!editorRef.value.firstChild) {
                    const p = document.createElement('p');
                    editorRef.value.appendChild(p);
                    range.selectNodeContents(p);
                    range.collapse(false);
                }

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
                // Find the last inserted node in the DOM
                let lastInsertedNode = null;
                if (nodesToInsert.length > 0) {
                    // After insertion, nodes are in the DOM
                    lastInsertedNode = nodesToInsert[nodesToInsert.length - 1];
                    if (lastInsertedNode.parentNode) {
                        // Create new range after the last inserted node
                        const newRange = document.createRange();
                        newRange.setStartAfter(lastInsertedNode);
                        newRange.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(newRange);
                    } else {
                        // Fallback: place cursor at end of editor
                        const newRange = document.createRange();
                        newRange.selectNodeContents(editorRef.value);
                        newRange.collapse(false);
                        selection.removeAllRanges();
                        selection.addRange(newRange);
                    }
                } else {
                    // No nodes inserted, place cursor at end
                    const newRange = document.createRange();
                    newRange.selectNodeContents(editorRef.value);
                    newRange.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }

                // Sync content and ensure editor is focused
                await nextTick();

                // Force content sync by reading innerHTML again
                const updatedContent = editorRef.value.innerHTML;
                content.value = updatedContent;
                emit('update:modelValue', updatedContent);

                // Ensure editor is focused and content is visible
                editorRef.value.focus();

                // Force a visual update by triggering a repaint
                // Use requestAnimationFrame to ensure DOM is updated
                requestAnimationFrame(() => {
                    if (editorRef.value) {
                        // Trigger a reflow to ensure content is visible
                        const scrollTop = editorRef.value.scrollTop;
                        editorRef.value.scrollTop = scrollTop + 1;
                        editorRef.value.scrollTop = scrollTop;

                        // Ensure selection is visible
                        const selection = window.getSelection();
                        if (selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0);
                            range.getBoundingClientRect(); // Force layout calculation
                        }
                    }
                });
            } else {
                const currentContent = content.value || '';
                const newContent = currentContent + escapeHtml(config.value);
                content.value = newContent;
                emit('update:modelValue', newContent);
            }
        }
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Convert newlines to <br /> tags
function convertNewlinesToBr(text) {
    if (!text) return text;
    // Convert \n to <br />
    return text.replace(/\n/g, '<br />');
}

// Normalize HTML content to ensure line breaks are preserved
// Converts paragraph tags to line breaks while preserving content
function normalizeLineBreaks(html) {
    if (!html) return html;

    // Use DOM parsing to properly handle nested elements
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Process all paragraph tags
    const paragraphs = tempDiv.querySelectorAll('p');
    paragraphs.forEach(p => {
        // Check if paragraph has complex formatting (bold, italic, links, etc.)
        const hasComplexFormatting = p.querySelector('strong, em, b, i, a, img, table, ul, ol');

        if (!hasComplexFormatting && p.textContent.trim()) {
            // Simple paragraph - convert to line break
            const br = document.createElement('br');
            // Move all children before the paragraph
            while (p.firstChild) {
                p.parentNode.insertBefore(p.firstChild, p);
            }
            // Insert br after the content
            p.parentNode.insertBefore(br, p);
            p.remove();
        } else if (!hasComplexFormatting && !p.textContent.trim()) {
            // Empty paragraph - just replace with br
            const br = document.createElement('br');
            p.parentNode.replaceChild(br, p);
        } else {
            // Complex paragraph - keep structure but add br after
            const br = document.createElement('br');
            p.parentNode.insertBefore(br, p.nextSibling);
        }
    });

    // Handle empty divs used for line breaks
    const emptyDivs = Array.from(tempDiv.querySelectorAll('div')).filter(div => {
        return !div.textContent.trim() && !div.querySelector('img, table, a, strong, em');
    });
    emptyDivs.forEach(div => {
        const br = document.createElement('br');
        div.parentNode.replaceChild(br, div);
    });

    let normalized = tempDiv.innerHTML;

    // Clean up multiple consecutive <br> tags (keep max 2 for paragraph spacing)
    normalized = normalized.replace(/(<br\s*\/?>){3,}/gi, '<br><br>');

    // Remove leading and trailing <br> tags
    normalized = normalized.replace(/^(<br\s*\/?>)+/i, '');
    normalized = normalized.replace(/(<br\s*\/?>)+$/i, '');

    return normalized;
}

// Convert text with newlines - no longer needed with contentEditable
// (handled directly in drop handler)

// Show table insertion modal
function insertTable(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }

    // Only open modal - do NOT insert table here
    showTableModal.value = true;

    // Reset to default values
    tableRows.value = 3;
    tableColumns.value = 3;
    hoveredRows.value = 0;
    hoveredColumns.value = 0;

    // Return false to prevent any default behavior
    return false;
}

// Open row body editor modal
function openRowBodyEditor() {
    pendingRowDropRange.value = null; // Clear any pending drop range when opening manually
    initialRowColumnCount.value = 1; // Default to 1 column when opening manually
    showRowBodyEditor.value = true;
}

// Handle row body editor confirm
function handleRowBodyConfirm(rowData) {
    if (!editorRef.value) return;

    const editorRoot = editorRef.value;
    const selection = window.getSelection();

    // Use saved drop range if available, otherwise use current selection
    let savedRange = pendingRowDropRange.value;
    if (!savedRange && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (editorRoot.contains(range.commonAncestorContainer) || editorRoot === range.commonAncestorContainer) {
            savedRange = range.cloneRange();
        }
    }

    // Handle both new object format and legacy string format
    let rowContent = '';
    let columnContents = [];

    if (typeof rowData === 'object' && rowData.columns) {
        // New format with structured data
        columnContents = rowData.columns;
        rowContent = rowData.stringFormat || '';
    } else {
        // Legacy string format - parse it to extract columns
        rowContent = rowData || '';
        // Try to extract column contents from the string format
        // This is a fallback for backward compatibility
        const colMatches = rowContent.match(/@begincol\n([\s\S]*?)\n@endcol/g);
        if (colMatches) {
            columnContents = colMatches.map(match => {
                return match.replace(/@begincol\n|\n@endcol/g, '').trim();
            });
        }
    }

    // Build the row structure with HTML formatting preserved
    const fragment = document.createDocumentFragment();

    // Add @beginrow with newline
    fragment.appendChild(document.createTextNode('@beginrow'));
    fragment.appendChild(document.createElement('br'));

    // Add each column with its HTML content
    columnContents.forEach((colContent, index) => {
        if (colContent) {
            // Add @begincol with newline
            fragment.appendChild(document.createTextNode('@begincol'));
            fragment.appendChild(document.createElement('br'));

            // Insert column content as HTML fragment if it contains HTML, otherwise as text
            if (colContent.includes('<')) {
                // Content has HTML - insert as HTML fragment to preserve formatting
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = colContent;
                while (tempDiv.firstChild) {
                    fragment.appendChild(tempDiv.firstChild);
                }
            } else {
                // Plain text - insert as text node
                fragment.appendChild(document.createTextNode(colContent));
            }

            // Add @endcol with newline
            fragment.appendChild(document.createElement('br'));
            fragment.appendChild(document.createTextNode('@endcol'));

            if (index < columnContents.length - 1) {
                fragment.appendChild(document.createElement('br'));
            }
        }
    });

    // Add @endrow with newline
    fragment.appendChild(document.createElement('br'));
    fragment.appendChild(document.createTextNode('@endrow'));

    // Insert the fragment at cursor or at the end
    if (savedRange && !savedRange.collapsed) {
        savedRange.deleteContents();
        savedRange.insertNode(fragment);
        savedRange.collapse(false);
    } else if (savedRange) {
        savedRange.insertNode(fragment);
        savedRange.collapse(false);
    } else {
        const range = document.createRange();
        range.setStart(editorRoot, editorRoot.childNodes.length);
        range.collapse(true);
        range.insertNode(fragment);
    }

    // Update content
    content.value = editorRoot.innerHTML;
    emit('update:modelValue', editorRoot.innerHTML);

    // Clear pending drop range
    pendingRowDropRange.value = null;

    // Close modal
    showRowBodyEditor.value = false;

    // Focus editor
    editorRef.value.focus();
}

// Close table modal
function closeTableModal() {
    showTableModal.value = false;
}

// Table of Contents functions
// A4 page dimensions in pixels (at 96 DPI)
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const A4_MARGIN_TOP_MM = 25.4; // 1 inch
const A4_MARGIN_BOTTOM_MM = 25.4; // 1 inch
const A4_USABLE_HEIGHT_MM = A4_HEIGHT_MM - A4_MARGIN_TOP_MM - A4_MARGIN_BOTTOM_MM;
const MM_TO_PX = 3.779527559; // 96 DPI conversion

// Calculate page number for an element based on A4 layout
function calculatePageNumber(element, editorRoot) {
    if (!element || !editorRoot) return 1;

    // Create a temporary container with A4 dimensions for measurement
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.width = `${A4_WIDTH_MM * MM_TO_PX}px`;
    tempContainer.style.height = `${A4_HEIGHT_MM * MM_TO_PX}px`;
    tempContainer.style.visibility = 'hidden';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    tempContainer.style.padding = `${A4_MARGIN_TOP_MM * MM_TO_PX}px ${A4_MARGIN_BOTTOM_MM * MM_TO_PX}px`;
    tempContainer.style.fontSize = '12pt';
    tempContainer.style.lineHeight = '1.5';
    tempContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';

    // Clone the editor content up to the element
    const clone = editorRoot.cloneNode(true);
    const allElements = Array.from(clone.querySelectorAll('*'));

    // Find the corresponding element in the clone
    let targetElement = null;
    const originalIndex = Array.from(editorRoot.querySelectorAll('*')).indexOf(element);
    if (originalIndex >= 0 && originalIndex < allElements.length) {
        targetElement = allElements[originalIndex];
    }

    if (!targetElement) {
        // Fallback: find by tag name and text content
        const tagName = element.tagName;
        const textContent = element.textContent?.trim().substring(0, 50);
        targetElement = Array.from(clone.querySelectorAll(tagName)).find(el =>
            el.textContent?.trim().substring(0, 50) === textContent
        );
    }

    if (!targetElement) {
        document.body.removeChild(tempContainer);
        return 1;
    }

    // Get all content before the target element
    const beforeContent = document.createElement('div');
    let currentNode = clone.firstChild;
    while (currentNode && currentNode !== targetElement) {
        if (currentNode.nodeType === Node.ELEMENT_NODE || currentNode.nodeType === Node.TEXT_NODE) {
            const nodeClone = currentNode.cloneNode(true);
            beforeContent.appendChild(nodeClone);
        }
        currentNode = currentNode.nextSibling || (currentNode.parentNode && currentNode.parentNode.nextSibling);
    }

    // Add content before target to temp container
    tempContainer.appendChild(beforeContent);
    document.body.appendChild(tempContainer);

    // Calculate height
    const contentHeight = tempContainer.scrollHeight;
    const pageHeight = A4_USABLE_HEIGHT_MM * MM_TO_PX;
    const pageNumber = Math.max(1, Math.ceil(contentHeight / pageHeight) + 1);

    document.body.removeChild(tempContainer);
    return pageNumber;
}

// Alternative simpler method: estimate based on element position
function calculatePageNumberSimple(element, editorRoot) {
    if (!element || !editorRoot) return 1;

    // Try to get actual rendered positions if available
    const elementRect = element.getBoundingClientRect();
    const editorRect = editorRoot.getBoundingClientRect();

    // If element is visible and we can get its position, use it
    if (elementRect.height > 0 && editorRect.height > 0) {
        // Get all elements before this one
        const allElements = Array.from(editorRoot.querySelectorAll('*'));
        const elementIndex = allElements.indexOf(element);

        if (elementIndex > 0) {
            let cumulativeHeight = 0;
            for (let i = 0; i < elementIndex; i++) {
                const el = allElements[i];
                const rect = el.getBoundingClientRect();

                // Use actual height if available, otherwise estimate
                if (rect.height > 0) {
                    cumulativeHeight += rect.height;
                } else {
                    // Fallback to estimation
                    const tagName = el.tagName.toLowerCase();
                    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
                        cumulativeHeight += 30;
                    } else if (tagName === 'p') {
                        cumulativeHeight += 20;
                    } else if (tagName === 'img') {
                        // Try to get actual image height
                        const img = el.tagName === 'IMG' ? el : el.querySelector('img');
                        if (img && img.complete && img.naturalHeight > 0) {
                            // Use actual image height, scaled to display size
                            const displayHeight = img.offsetHeight || img.naturalHeight;
                            cumulativeHeight += displayHeight + 10;
                        } else {
                            cumulativeHeight += 200; // Default estimate
                        }
                    } else {
                        cumulativeHeight += 20;
                    }
                }

                // Check for page breaks
                const textContent = el.textContent || '';
                if (textContent.includes('@pagebreak') || textContent.includes('page-break')) {
                    const pageHeight = A4_USABLE_HEIGHT_MM * MM_TO_PX;
                    cumulativeHeight = Math.ceil(cumulativeHeight / pageHeight) * pageHeight;
                }
            }

            const pageHeight = A4_USABLE_HEIGHT_MM * MM_TO_PX;
            const pageNumber = Math.max(1, Math.ceil(cumulativeHeight / pageHeight) + 1);
            return pageNumber;
        }
    }

    // Fallback: estimate based on element position
    const allElements = Array.from(editorRoot.querySelectorAll('*'));
    const elementIndex = allElements.indexOf(element);

    if (elementIndex < 0) return 1;

    // Estimate: assume average line height of 20px and page height of ~750px (A4 usable height)
    // This is a rough estimate
    const estimatedLineHeight = 20;
    const estimatedPageHeight = A4_USABLE_HEIGHT_MM * MM_TO_PX; // ~930px

    // Count approximate lines before this element
    let estimatedHeight = 0;
    for (let i = 0; i < elementIndex; i++) {
        const el = allElements[i];
        const tagName = el.tagName.toLowerCase();

        // Estimate height based on element type
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
            estimatedHeight += estimatedLineHeight * 1.5;
        } else if (tagName === 'p') {
            const textLength = el.textContent?.length || 0;
            const lines = Math.max(1, Math.ceil(textLength / 80)); // ~80 chars per line
            estimatedHeight += lines * estimatedLineHeight;
        } else if (tagName === 'img') {
            // Try to get actual image dimensions if loaded
            const img = el.tagName === 'IMG' ? el : el.querySelector('img');
            if (img && img.complete && img.naturalHeight > 0) {
                const displayHeight = img.offsetHeight || img.naturalHeight;
                estimatedHeight += displayHeight + estimatedLineHeight;
            } else {
                const imgHeight = parseInt(el.style.height) || parseInt(el.getAttribute('height')) || 200;
                estimatedHeight += imgHeight + estimatedLineHeight;
            }
        } else if (tagName === 'table') {
            const rows = el.querySelectorAll('tr').length;
            estimatedHeight += rows * 30 + estimatedLineHeight;
        } else {
            estimatedHeight += estimatedLineHeight;
        }

        // Check for page breaks
        const textContent = el.textContent || '';
        if (textContent.includes('@pagebreak') || textContent.includes('page-break')) {
            estimatedHeight = Math.ceil(estimatedHeight / estimatedPageHeight) * estimatedPageHeight;
        }
    }

    const pageNumber = Math.max(1, Math.ceil(estimatedHeight / estimatedPageHeight) + 1);
    return pageNumber;
}

// Calculate the height of a section by parsing all its HTML elements
function calculateSectionHeight(sectionContent, pageHeight) {
    if (!sectionContent) return 0;

    let totalHeight = 0;

    // Get all block wrappers first (most accurate)
    const blockWrappers = Array.from(sectionContent.querySelectorAll('.report-block-wrapper'))
        .filter(block => {
            // Skip TOC blocks
            return !block.querySelector('[data-toc-marker="true"]');
        });

    if (blockWrappers.length > 0) {
        blockWrappers.forEach((block, blockIndex) => {
            // Get the actual content within the block (the editor or block content)
            const blockContent = block.querySelector('.rich-text-editor, .custom-editor-content, .ql-editor') ||
                block.querySelector('[contenteditable="true"]') ||
                block;

            // Calculate height of this block's content
            const blockHeight = calculateContentHeight(blockContent);

            // Add block margin (spacing-xs = 8px typically, but check computed style)
            const computedStyle = window.getComputedStyle(block);
            const marginBottom = parseFloat(computedStyle.marginBottom) || 8;
            const marginTop = parseFloat(computedStyle.marginTop) || 0;

            totalHeight += blockHeight + marginTop + marginBottom;
        });
    } else {
        // Fallback: parse all direct children of section content
        const directChildren = Array.from(sectionContent.children).filter(child => {
            // Skip TOC and headers
            if (child.closest('[data-toc-marker="true"]')) return false;
            if (child.classList.contains('base-panel__header')) return false;
            return true;
        });

        directChildren.forEach(child => {
            const height = calculateContentHeight(child);
            totalHeight += height;
        });
    }

    // Add section spacing (margin between sections)
    totalHeight += 16; // spacing-sm

    return totalHeight;
}

// Calculate height of content by parsing HTML elements recursively
function calculateContentHeight(element) {
    if (!element) return 0;

    const tagName = element.tagName?.toLowerCase();

    // Special handling for images - always use getElementHeight for accurate calculation
    if (tagName === 'img') {
        return getElementHeight(element);
    }

    // Check if element contains images - need special handling
    const images = element.querySelectorAll('img');
    const hasImages = images.length > 0;

    // Try to get actual rendered height first
    const rect = element.getBoundingClientRect();
    const isRendered = rect.height > 0 && rect.width > 0;

    if (isRendered && !hasImages) {
        // Element is rendered and has no images, use actual height
        const computedStyle = window.getComputedStyle(element);
        const marginTop = parseFloat(computedStyle.marginTop) || 0;
        const marginBottom = parseFloat(computedStyle.marginBottom) || 0;
        return rect.height + marginTop + marginBottom;
    }

    // Element has images or not rendered - calculate from children for accuracy
    const children = Array.from(element.children);
    let height = 0;

    if (children.length > 0) {
        // Calculate height from children to get accurate image heights
        children.forEach(child => {
            height += calculateContentHeight(child);
        });
    } else {
        // Leaf element, estimate based on content
        height = getElementHeight(element);
    }

    // For elements with images, also check if rendered height is larger (might have spacing)
    if (hasImages && isRendered) {
        const computedStyle = window.getComputedStyle(element);
        const renderedHeight = rect.height;
        const marginTop = parseFloat(computedStyle.marginTop) || 0;
        const marginBottom = parseFloat(computedStyle.marginBottom) || 0;
        const totalRendered = renderedHeight + marginTop + marginBottom;

        // Use the larger of calculated or rendered (rendered might include spacing we missed)
        height = Math.max(height, totalRendered);
    }

    // Add element's own padding
    const computedStyle = window.getComputedStyle(element);
    const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
    const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
    const marginTop = parseFloat(computedStyle.marginTop) || 0;
    const marginBottom = parseFloat(computedStyle.marginBottom) || 0;

    return height + paddingTop + paddingBottom + marginTop + marginBottom;
}

// Get the height of a leaf element (doesn't recurse into children)
function getElementHeight(element) {
    if (!element) return 0;

    // Try to get actual rendered height first
    const rect = element.getBoundingClientRect();
    if (rect.height > 0 && rect.width > 0) {
        // Element is rendered, use actual height
        const computedStyle = window.getComputedStyle(element);
        const marginTop = parseFloat(computedStyle.marginTop) || 0;
        const marginBottom = parseFloat(computedStyle.marginBottom) || 0;
        const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
        const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;

        return rect.height + marginTop + marginBottom + paddingTop + paddingBottom;
    }

    // If not rendered, estimate based on element type and content (leaf elements only)
    const tagName = element.tagName?.toLowerCase();
    const computedStyle = window.getComputedStyle(element);
    const marginTop = parseFloat(computedStyle.marginTop) || 0;
    const marginBottom = parseFloat(computedStyle.marginBottom) || 0;
    const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
    const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
    const lineHeight = parseFloat(computedStyle.lineHeight) || 20;

    let estimatedHeight = 0;

    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        // Headings: use font size + line height
        const fontSize = parseFloat(computedStyle.fontSize) || 16;
        estimatedHeight = Math.max(fontSize * 1.5, lineHeight);
    } else if (tagName === 'p') {
        // Paragraphs: calculate based on text length and width
        const textContent = element.textContent || '';
        const textLength = textContent.length;
        // Use A4 width minus margins for calculation
        const width = A4_WIDTH_MM * MM_TO_PX - (A4_MARGIN_TOP_MM * MM_TO_PX * 2); // ~750px
        const fontSize = parseFloat(computedStyle.fontSize) || 16;
        const charsPerLine = Math.floor(width / (fontSize * 0.6)); // Rough estimate
        const lines = Math.max(1, Math.ceil(textLength / charsPerLine));
        estimatedHeight = lines * lineHeight;
    } else if (tagName === 'img') {
        // Images: use actual display dimensions with proper scaling
        const img = element.tagName === 'IMG' ? element : element.querySelector('img');
        if (img) {
            const computedStyle = window.getComputedStyle(img);

            // Priority 1: Use actual rendered dimensions (most accurate)
            const rect = img.getBoundingClientRect();
            if (rect.height > 0 && rect.width > 0) {
                estimatedHeight = rect.height;
            }
            // Priority 2: Use offsetHeight (actual display size)
            else if (img.offsetHeight > 0) {
                estimatedHeight = img.offsetHeight;
            }
            // Priority 3: Use computed style height
            else {
                const computedHeight = computedStyle.height;
                if (computedHeight && computedHeight !== 'auto' && computedHeight !== '0px') {
                    const heightValue = parseFloat(computedHeight);
                    if (!isNaN(heightValue) && heightValue > 0) {
                        estimatedHeight = heightValue;
                    }
                }
            }

            // If still no height, calculate from width and aspect ratio
            if (estimatedHeight === 0 || isNaN(estimatedHeight)) {
                // Try to get width first
                let displayWidth = 0;
                if (rect.width > 0) {
                    displayWidth = rect.width;
                } else if (img.offsetWidth > 0) {
                    displayWidth = img.offsetWidth;
                } else {
                    const computedWidth = computedStyle.width;
                    if (computedWidth && computedWidth !== 'auto' && computedWidth !== '0px') {
                        displayWidth = parseFloat(computedWidth);
                    }
                }

                // If we have natural dimensions, calculate from aspect ratio
                if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                    if (displayWidth > 0) {
                        // Calculate height maintaining aspect ratio
                        const aspectRatio = img.naturalHeight / img.naturalWidth;
                        estimatedHeight = displayWidth * aspectRatio;
                    } else {
                        // Use natural height, but scale to A4 width if too wide
                        const a4Width = A4_WIDTH_MM * MM_TO_PX - (A4_MARGIN_TOP_MM * MM_TO_PX * 2);
                        if (img.naturalWidth > a4Width) {
                            const aspectRatio = img.naturalHeight / img.naturalWidth;
                            estimatedHeight = a4Width * aspectRatio;
                        } else {
                            estimatedHeight = img.naturalHeight;
                        }
                    }
                }
                // Try to get from style or attributes
                else {
                    const styleHeight = img.style.height;
                    const heightAttr = img.getAttribute('height');
                    const widthAttr = img.getAttribute('width');

                    if (styleHeight) {
                        const heightMatch = styleHeight.match(/(\d+(?:\.\d+)?)/);
                        if (heightMatch) {
                            estimatedHeight = parseFloat(heightMatch[1]);
                            if (styleHeight.includes('%')) {
                                // Percentage - estimate based on container
                                const containerHeight = 800;
                                estimatedHeight = (estimatedHeight / 100) * containerHeight;
                            }
                        }
                    } else if (heightAttr) {
                        estimatedHeight = parseInt(heightAttr);
                    } else if (widthAttr) {
                        // Calculate from width assuming 4:3 aspect ratio
                        const width = parseInt(widthAttr);
                        estimatedHeight = width * 0.75;
                    } else {
                        // Default: use A4 width with 4:3 aspect ratio
                        const a4Width = A4_WIDTH_MM * MM_TO_PX - (A4_MARGIN_TOP_MM * MM_TO_PX * 2);
                        estimatedHeight = a4Width * 0.75;
                    }
                }
            }

            // Add image margins and padding
            const imgMarginTop = parseFloat(computedStyle.marginTop) || 0;
            const imgMarginBottom = parseFloat(computedStyle.marginBottom) || 0;
            const imgPaddingTop = parseFloat(computedStyle.paddingTop) || 0;
            const imgPaddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
            estimatedHeight += imgMarginTop + imgMarginBottom + imgPaddingTop + imgPaddingBottom;
        }
    } else if (tagName === 'table') {
        // Tables: calculate from rows
        const rows = element.querySelectorAll('tr');
        const rowHeight = 30; // Average row height
        estimatedHeight = rows.length * rowHeight + 20; // Add padding
    } else if (tagName === 'ul' || tagName === 'ol') {
        // Lists: calculate from items
        const items = element.querySelectorAll('li');
        estimatedHeight = items.length * lineHeight + 10;
    } else if (tagName === 'br') {
        // Line breaks
        estimatedHeight = lineHeight;
    } else if (element.children.length === 0) {
        // Leaf element with no children, use line height
        estimatedHeight = lineHeight;
    } else {
        // Has children but not rendered - will be calculated by calculateContentHeight
        estimatedHeight = 0;
    }

    return estimatedHeight + marginTop + marginBottom + paddingTop + paddingBottom;
}

// Calculate page numbers based on real rendered pages using A4 container simulation
function calculateRenderedPages(sectionContainer, cumulativeHeightBefore) {
    if (!sectionContainer) return { startPage: 1, endPage: 1 };

    // Create a hidden container with A4 dimensions to simulate real page rendering
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.width = `${A4_WIDTH_MM * MM_TO_PX}px`;
    tempContainer.style.visibility = 'hidden';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    tempContainer.style.overflow = 'visible';
    tempContainer.style.fontSize = '12pt';
    tempContainer.style.lineHeight = '1.5';
    tempContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    tempContainer.style.padding = `${A4_MARGIN_TOP_MM * MM_TO_PX}px ${A4_MARGIN_BOTTOM_MM * MM_TO_PX}px`;
    tempContainer.style.boxSizing = 'border-box';

    // Get section content
    const sectionContent = sectionContainer.querySelector(':scope > div:not(.base-panel__header)') ||
        sectionContainer.querySelector('.section-blocks-container') ||
        sectionContainer;

    // Clone the section content deeply
    const clonedContent = sectionContent.cloneNode(true);

    // Remove TOC from clone
    const tocInClone = clonedContent.querySelector('[data-toc-marker="true"]');
    if (tocInClone) {
        tocInClone.remove();
    }

    // Copy computed styles to cloned elements for accurate rendering
    const copyStyles = (source, target) => {
        if (source.nodeType === Node.ELEMENT_NODE && target.nodeType === Node.ELEMENT_NODE) {
            const sourceStyle = window.getComputedStyle(source);
            const targetStyle = target.style;

            // Copy important styles
            targetStyle.fontSize = sourceStyle.fontSize;
            targetStyle.lineHeight = sourceStyle.lineHeight;
            targetStyle.fontFamily = sourceStyle.fontFamily;
            targetStyle.margin = sourceStyle.margin;
            targetStyle.padding = sourceStyle.padding;
            targetStyle.border = sourceStyle.border;
            targetStyle.display = sourceStyle.display;

            // Copy image dimensions if it's an image
            if (source.tagName === 'IMG' && target.tagName === 'IMG') {
                target.width = source.width || source.naturalWidth;
                target.height = source.height || source.naturalHeight;
                target.style.width = sourceStyle.width;
                target.style.height = sourceStyle.height;
            }

            // Recursively copy styles for children
            const sourceChildren = Array.from(source.children);
            const targetChildren = Array.from(target.children);
            sourceChildren.forEach((sourceChild, index) => {
                if (targetChildren[index]) {
                    copyStyles(sourceChild, targetChildren[index]);
                }
            });
        }
    };

    // Copy styles from original to clone
    copyStyles(sectionContent, clonedContent);

    // Append to temp container
    tempContainer.appendChild(clonedContent);
    document.body.appendChild(tempContainer);

    // Wait for images to load and force layout calculation
    const images = clonedContent.querySelectorAll('img');
    let imagesLoaded = 0;
    const totalImages = images.length;

    return new Promise((resolve) => {
        const calculateHeight = () => {
            // Force layout recalculation
            void tempContainer.offsetHeight;

            // Get the actual rendered height
            const sectionHeight = tempContainer.scrollHeight;
            const pageHeight = A4_USABLE_HEIGHT_MM * MM_TO_PX;

            // Calculate pages
            const sectionStartPage = Math.max(1, Math.ceil(cumulativeHeightBefore / pageHeight) + 1);
            const cumulativeHeightAfter = cumulativeHeightBefore + sectionHeight;
            const sectionEndPage = Math.max(sectionStartPage, Math.ceil(cumulativeHeightAfter / pageHeight));

            // Cleanup
            document.body.removeChild(tempContainer);

            resolve({ startPage: sectionStartPage, endPage: sectionEndPage, height: sectionHeight });
        };

        if (totalImages === 0) {
            // No images, calculate immediately
            setTimeout(calculateHeight, 0);
        } else {
            // Wait for images to load
            images.forEach(img => {
                if (img.complete) {
                    imagesLoaded++;
                } else {
                    img.addEventListener('load', () => {
                        imagesLoaded++;
                        if (imagesLoaded >= totalImages) {
                            setTimeout(calculateHeight, 100);
                        }
                    }, { once: true });
                    img.addEventListener('error', () => {
                        imagesLoaded++;
                        if (imagesLoaded >= totalImages) {
                            setTimeout(calculateHeight, 100);
                        }
                    }, { once: true });
                }
            });

            if (imagesLoaded >= totalImages) {
                setTimeout(calculateHeight, 100);
            }

            // Fallback timeout
            setTimeout(() => {
                if (document.body.contains(tempContainer)) {
                    calculateHeight();
                }
            }, 3000);
        }
    });
}

// Extract sections from the document based on data-section-id attributes
async function extractSections(editorRoot) {
    if (!editorRoot) return { sections: [] };

    // Find all section containers in the document (not just in this editor)
    // Sections are identified by elements with data-section-id attribute and class 'editor-section'
    const allSectionContainers = Array.from(document.querySelectorAll('.editor-section[data-section-id]'))
        .filter(section => {
            // Only include visible sections (check if they're rendered)
            const rect = section.getBoundingClientRect();
            return rect.width > 0 || rect.height > 0;
        });

    if (allSectionContainers.length === 0) {
        // Fallback: if no sections found, treat the editor content as one section
        return extractSectionsFromContent(editorRoot);
    }

    // Create a map of section containers by ID for quick lookup
    const sectionContainersMap = new Map();
    allSectionContainers.forEach(container => {
        const sectionId = container.getAttribute('data-section-id');
        if (sectionId) {
            sectionContainersMap.set(sectionId, container);
        }
    });

    // Try to get reportSections from the data attribute stored by ReportBuilder
    // This allows us to get the correct order of sections from the report structure
    let reportSections = null;
    try {
        const reportBuilderElement = document.querySelector('.report-builder');
        if (reportBuilderElement) {
            const sectionsData = reportBuilderElement.getAttribute('data-report-sections');
            if (sectionsData) {
                reportSections = JSON.parse(sectionsData);
            }
        }
    } catch (e) {
        // If we can't get reportSections, we'll use DOM order as fallback
        console.debug('Could not access reportSections from data attribute, using DOM order:', e);
    }

    // Build sections list - use reportSections order if available, otherwise use DOM order
    let orderedSections = [];

    if (reportSections && Array.isArray(reportSections)) {
        // Use reportSections order - this ensures correct order when sections are reordered
        orderedSections = reportSections
            .filter(section => section.visible && sectionContainersMap.has(section.id))
            .map(section => ({
                id: section.id,
                title: section.title,
                container: sectionContainersMap.get(section.id)
            }));
    } else {
        // Fallback to DOM order if reportSections not available
        orderedSections = allSectionContainers
            .sort((a, b) => {
                // Sort sections by their position in the DOM
                const position = a.compareDocumentPosition(b);
                if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
                    return -1;
                } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
                    return 1;
                }
                return 0;
            })
            .map(container => {
                const sectionId = container.getAttribute('data-section-id');
                let sectionTitle = 'Content';
                const sectionHeader = container.querySelector('.section-title-text');
                if (sectionHeader) {
                    sectionTitle = sectionHeader.textContent?.trim() || sectionTitle;
                }
                return {
                    id: sectionId || `section-${orderedSections.length + 1}`,
                    title: sectionTitle,
                    container: container
                };
            });
    }

    const sections = [];
    let cumulativeHeight = 0;

    // Process each section container in order (async to wait for image loading)
    const processSections = async () => {
        for (let index = 0; index < orderedSections.length; index++) {
            const sectionData = orderedSections[index];
            const sectionContainer = sectionData.container;

            // Get section ID and title
            const sectionId = sectionData.id;
            const sectionTitle = sectionData.title || 'Content';

            // Calculate page range using real rendered pages (wait for images)
            const pageInfo = await calculateRenderedPages(sectionContainer, cumulativeHeight);
            cumulativeHeight += pageInfo.height;

            sections.push({
                title: sectionTitle,
                id: sectionId || `section-${index + 1}`,
                startPage: pageInfo.startPage,
                endPage: pageInfo.endPage,
                pageRange: pageInfo.startPage === pageInfo.endPage
                    ? `${pageInfo.startPage}`
                    : `${pageInfo.startPage}-${pageInfo.endPage}`
            });
        }

        return { sections };
    };

    // Execute async processing
    return await processSections();
}

// Fallback: extract sections from editor content if no section containers found
function extractSectionsFromContent(editorRoot) {
    const sections = [];
    const pageHeight = A4_USABLE_HEIGHT_MM * MM_TO_PX;

    // Get all content elements, excluding TOC
    const allElements = Array.from(editorRoot.querySelectorAll('*')).filter(el => {
        return !el.closest('[data-toc-marker="true"]');
    });

    if (allElements.length === 0) {
        return { sections: [] };
    }

    let cumulativeHeight = 0;
    allElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.height > 0) {
            cumulativeHeight += rect.height;
        } else {
            cumulativeHeight += 20; // Estimate
        }
    });

    const totalPages = Math.max(1, Math.floor(cumulativeHeight / pageHeight) + 1);

    sections.push({
        title: 'Content',
        id: 'section-1',
        startPage: 1,
        endPage: totalPages,
        pageRange: totalPages === 1 ? '1' : `1-${totalPages}`
    });

    return { sections };
}

// Generate TOC HTML organized by sections with page ranges (with inline styles for preview/report)
function generateTOC(sectionsData) {
    const sections = sectionsData.sections || [];

    if (!sections || sections.length === 0) {
        return '<div data-toc-marker="true" style="margin: 1.5em 0; padding: 1.5em; border: none; border-radius: 8px; background: transparent; page-break-inside: avoid;"><h2 style="margin: 0 0 1em 0; padding-bottom: 0.75em; font-weight: 700; font-size: 1.5em; color: inherit; border-bottom: 1px solid transparent; text-transform: uppercase; letter-spacing: 0.5px;">Table of Contents</h2><p style="margin: 0.5em 0; color: inherit; font-style: italic; text-align: center; padding: 1em; opacity: 0.7;">No sections found in document.</p></div><div style="page-break-after: always;"></div>';
    }

    // Inline styles for TOC container - transparent to blend with theme
    const containerStyle = 'margin: 1.5em 0; padding: 1.5em; border: none; border-radius: 8px; background: transparent; page-break-inside: avoid;';

    // Inline styles for TOC title - transparent to blend with theme
    const titleStyle = 'margin: 0 0 1em 0; padding-bottom: 0.75em; font-weight: 700; font-size: 1.5em; color: inherit; border-bottom: 1px solid transparent; text-transform: uppercase; letter-spacing: 0.5px;';

    // Inline styles for TOC list
    const listStyle = 'list-style: none; padding: 0; margin: 0;';

    // Inline styles for TOC item - transparent borders
    const itemStyle = 'display: flex; align-items: center; padding: 0.75em 0.5em; margin: 0.25em 0; border-bottom: 1px solid transparent; transition: background-color 0.2s ease; border-radius: 4px;';

    // Inline styles for section title - inherit color
    const sectionTitleStyle = 'font-size: 1em; font-weight: 500; color: inherit; line-height: 1.5;';

    let tocHTML = `<div data-toc-marker="true" class="toc-container" style="${containerStyle}">`;
    tocHTML += `<h2 class="toc-title" style="${titleStyle}">Table of Contents</h2>`;
    tocHTML += `<ul class="toc-list" style="${listStyle}">`;

    sections.forEach((section, sectionIndex) => {
        const itemStyleWithLast = sectionIndex === sections.length - 1
            ? itemStyle.replace('border-bottom: 1px solid #e0e0e0;', 'border-bottom: none;')
            : itemStyle;

        tocHTML += `<li class="toc-item" style="${itemStyleWithLast}">`;
        tocHTML += `<span class="toc-section-title" style="${sectionTitleStyle}">${escapeHtml(section.title)}</span>`;
        // Page numbers removed
        tocHTML += '</li>';
    });

    tocHTML += '</ul></div>';
    // Add page break after TOC
    tocHTML += '<div style="page-break-after: always;"></div>';
    return tocHTML;
}


// Insert or update Table of Contents
async function insertTableOfContents() {
    if (!editorRef.value) {
        console.warn('Editor ref not available');
        return;
    }

    const editorRoot = editorRef.value;

    // Ensure we're looking at the actual content
    if (!editorRoot || !editorRoot.querySelectorAll) {
        console.warn('Editor root not valid:', editorRoot);
        return;
    }

    // Extract sections from editor content (async - waits for images to load)
    const sectionsData = await extractSections(editorRoot);

    // Generate TOC HTML
    const tocHTML = generateTOC(sectionsData);

    // Check if TOC already exists
    const existingTOC = editorRoot.querySelector('[data-toc-marker="true"]');

    // Save selection
    const selection = window.getSelection();
    let savedRange = null;
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (editorRoot.contains(range.commonAncestorContainer) || editorRoot === range.commonAncestorContainer) {
            savedRange = range.cloneRange();
        }
    }

    // Variable to store the inserted TOC element for selection restoration
    let tocElement = null;

    // If TOC exists, replace it; otherwise insert at cursor or beginning
    if (existingTOC) {
        // Replace existing TOC
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = tocHTML;
        const newTOCElement = tempDiv.firstElementChild;
        tocElement = newTOCElement; // Store for selection restoration
        const pageBreakDiv = tempDiv.querySelector('div[style*="page-break-after"]');

        // Check if there's already a page break after the existing TOC
        const existingPageBreak = existingTOC.nextElementSibling;
        if (existingPageBreak && existingPageBreak.style && existingPageBreak.style.pageBreakAfter === 'always') {
            // Remove existing page break
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
            // Fallback: add page break div
            const pageBreak = document.createElement('div');
            pageBreak.style.cssText = 'page-break-after: always;';
            if (newTOCElement.nextSibling) {
                newTOCElement.parentNode.insertBefore(pageBreak, newTOCElement.nextSibling);
            } else {
                newTOCElement.parentNode.appendChild(pageBreak);
            }
        }
    } else {
        // Insert new TOC
        if (savedRange && !savedRange.collapsed) {
            // Insert at selection
            savedRange.deleteContents();
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = tocHTML;
            tocElement = tempDiv.firstElementChild; // Store for selection restoration
            savedRange.insertNode(tocElement);

            // Insert page break after TOC
            const pageBreakDiv = tempDiv.querySelector('div[style*="page-break-after"]');
            if (pageBreakDiv) {
                if (tocElement.nextSibling) {
                    tocElement.parentNode.insertBefore(pageBreakDiv, tocElement.nextSibling);
                } else {
                    tocElement.parentNode.appendChild(pageBreakDiv);
                }
            } else {
                // Fallback: add page break div
                const pageBreak = document.createElement('div');
                pageBreak.style.cssText = 'page-break-after: always;';
                if (tocElement.nextSibling) {
                    tocElement.parentNode.insertBefore(pageBreak, tocElement.nextSibling);
                } else {
                    tocElement.parentNode.appendChild(pageBreak);
                }
            }
        } else {
            // Insert at cursor or beginning
            const range = document.createRange();
            if (savedRange && !savedRange.collapsed) {
                range.setStart(savedRange.startContainer, savedRange.startOffset);
            } else {
                // Insert at beginning of editor
                range.setStart(editorRoot, 0);
            }
            range.collapse(true);

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = tocHTML;
            tocElement = tempDiv.firstElementChild; // Store for selection restoration
            range.insertNode(tocElement);

            // Insert page break after TOC if it exists in the HTML
            const pageBreakDiv = tempDiv.querySelector('div[style*="page-break-after"]');
            if (pageBreakDiv && tocElement.nextSibling) {
                tocElement.parentNode.insertBefore(pageBreakDiv, tocElement.nextSibling);
            } else if (pageBreakDiv) {
                tocElement.parentNode.appendChild(pageBreakDiv);
            } else {
                // Fallback: add page break div if not already in HTML
                const pageBreak = document.createElement('div');
                pageBreak.style.cssText = 'page-break-after: always;';
                if (tocElement.nextSibling) {
                    tocElement.parentNode.insertBefore(pageBreak, tocElement.nextSibling);
                } else {
                    tocElement.parentNode.appendChild(pageBreak);
                }
            }
        }
    }

    // Update content
    content.value = editorRoot.innerHTML;
    emit('update:modelValue', editorRoot.innerHTML);

    // Restore selection after TOC
    if (savedRange && tocElement) {
        try {
            selection.removeAllRanges();
            const newRange = document.createRange();
            // Find the page break after TOC, or use TOC itself
            const pageBreakAfter = tocElement.nextElementSibling;
            if (pageBreakAfter && pageBreakAfter.style && pageBreakAfter.style.pageBreakAfter === 'always') {
                newRange.setStartAfter(pageBreakAfter);
            } else if (tocElement.nextSibling) {
                newRange.setStartAfter(tocElement);
            } else {
                newRange.setStartAfter(tocElement);
            }
            newRange.collapse(true);
            selection.addRange(newRange);
        } catch (e) {
            console.warn('Failed to restore selection:', e);
        }
    }

    editorRef.value.focus();
}

// Update existing TOC if content changes
function updateTableOfContents() {
    if (!editorRef.value) return;

    const editorRoot = editorRef.value;
    const existingTOC = editorRoot.querySelector('[data-toc-marker="true"]');

    if (existingTOC) {
        // Check if user is currently editing the TOC
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const isEditingTOC = existingTOC.contains(range.commonAncestorContainer);

            // If user is editing TOC, don't auto-update it
            if (isEditingTOC) {
                return;
            }
        }

        // Debounce updates
        if (tocUpdateTimeout.value) {
            clearTimeout(tocUpdateTimeout.value);
        }

        tocUpdateTimeout.value = setTimeout(async () => {
            // Double-check user is not editing TOC before updating
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const isEditingTOC = existingTOC.contains(range.commonAncestorContainer);
                if (isEditingTOC) {
                    return;
                }
            }

            const sectionsData = await extractSections(editorRoot);
            const tocHTML = generateTOC(sectionsData);

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = tocHTML;
            const newTOC = tempDiv.firstElementChild;

            // Preserve position
            existingTOC.replaceWith(newTOC);

            // Update content
            content.value = editorRoot.innerHTML;
        }, 500); // Debounce for 500ms
    }
}

// Update TOC after content loads (especially after MASL parsing and image loading)
function updateTOCAfterContentLoad() {
    if (!editorRef.value) return;

    const editorRoot = editorRef.value;
    const existingTOC = editorRoot.querySelector('[data-toc-marker="true"]');

    if (!existingTOC) return;

    // Wait for images to load before calculating page numbers
    const images = editorRoot.querySelectorAll('img');
    let imagesLoaded = 0;
    const totalImages = images.length;

    if (totalImages === 0) {
        // No images, update TOC immediately
        setTimeout(() => {
            updateTableOfContents();
        }, 100);
        return;
    }

    // Wait for all images to load
    const checkImagesLoaded = () => {
        imagesLoaded++;
        if (imagesLoaded >= totalImages) {
            // All images loaded, wait a bit more for layout to settle, then update TOC
            setTimeout(() => {
                updateTableOfContents();
            }, 300);
        }
    };

    images.forEach(img => {
        if (img.complete) {
            checkImagesLoaded();
        } else {
            img.addEventListener('load', checkImagesLoaded, { once: true });
            img.addEventListener('error', checkImagesLoaded, { once: true });
        }
    });

    // Fallback: if images don't load within 3 seconds, update anyway
    setTimeout(() => {
        if (imagesLoaded < totalImages) {
            updateTableOfContents();
        }
    }, 3000);
}

// Setup MutationObserver to protect table from Quill corruption
function setupTableProtection(table, expectedRows, expectedCols) {
    if (!table || !editorRoot) return;

    // Clean up existing observer
    if (tableMutationObserver.value) {
        tableMutationObserver.value.disconnect();
    }

    // Create observer to watch for table corruption
    const observer = new MutationObserver((mutations) => {
        if (isParsing.value) return; // Don't fix during our own parsing

        const tbody = table.querySelector('tbody');
        const bodyRows = tbody ? tbody.querySelectorAll('tr') : [];
        const firstRowCells = bodyRows[0] ? bodyRows[0].querySelectorAll('td').length : 0;

        // Check if table is corrupted (no headers, just check body rows)
        if (bodyRows.length !== expectedRows || firstRowCells !== expectedCols) {
            console.log('MutationObserver detected table corruption, fixing...');

            // Prevent infinite loop
            isParsing.value = true;

            // Fix the table structure
            fixTableStructure(table, expectedRows, expectedCols);

            isParsing.value = false;
        }
    });

    // Observe the table for changes
    observer.observe(table, {
        childList: true,
        subtree: true,
        attributes: false
    });

    tableMutationObserver.value = observer;
}

// Fix table structure - more aggressive version
function fixTableStructure(table, rows, cols, editorRootParam = null) {
    if (!table) return;

    // Get editor root - use parameter or try to find it
    let editorRoot = editorRootParam;
    if (!editorRoot) {
        editorRoot = editorRef.value;
    }

    if (!editorRoot) {
        console.error('Cannot fix table: editor root not found');
        return;
    }

    // Prevent Quill from processing during fix
    isParsing.value = true;

    // Get current tbody to preserve any user content if possible
    const existingTbody = table.querySelector('tbody');

    // Store existing content - no headers, just body cells
    const cellContents = [];

    // Extract body content
    const existingBodyCells = existingTbody ? existingTbody.querySelectorAll('td') : [];
    existingBodyCells.forEach((cell, index) => {
        cellContents[index] = cell.innerHTML;
    });

    // Completely replace the table structure
    const tableParent = table.parentNode;
    const tableNextSibling = table.nextSibling;

    // Remove old table
    table.remove();

    // Create new table with correct structure (no headers)
    const newTable = document.createElement('table');
    newTable.style.cssText = 'border-collapse: collapse; width: 100%; margin: 1em 0; border: 1px solid var(--border, #ddd); display: table !important; table-layout: auto;';
    newTable.setAttribute('data-quill-table', 'true');
    newTable.setAttribute('data-table-rows', rows.toString());
    newTable.setAttribute('data-table-cols', cols.toString());

    // Create tbody with all rows (no header row)
    const tbody = document.createElement('tbody');
    tbody.style.cssText = 'display: table-row-group !important;';
    let cellIndex = 0; // Start from 0 (no headers)
    for (let r = 0; r < rows; r++) {
        const tr = document.createElement('tr');
        tr.style.cssText = 'display: table-row !important;';
        for (let c = 0; c < cols; c++) {
            const td = document.createElement('td');
            td.style.cssText = 'border: 1px solid var(--border, #ddd); padding: 8px; min-width: 100px; display: table-cell !important;';
            td.contentEditable = 'true';
            td.setAttribute('data-cell-index', c.toString());
            td.setAttribute('data-cell-row', r.toString());
            td.setAttribute('data-cell-type', 'body');

            // Try to preserve existing content
            if (cellContents[cellIndex] && cellContents[cellIndex].trim()) {
                td.innerHTML = cellContents[cellIndex];
            } else {
                td.innerHTML = '&nbsp;';
            }

            tr.appendChild(td);
            cellIndex++;
        }
        tbody.appendChild(tr);
    }
    newTable.appendChild(tbody);

    // Insert new table where old one was
    if (tableNextSibling) {
        tableParent.insertBefore(newTable, tableNextSibling);
    } else {
        tableParent.appendChild(newTable);
    }

    // Update content
    content.value = editorRoot.innerHTML;

    isParsing.value = false;
}

// Helper function to get editor root (contentEditable div)
async function getEditorRootOrWait(retries = 5) {
    // Return editor root directly
    if (editorRef.value) {
        return { root: editorRef.value };
    }

    // Wait for editor to be ready
    for (let attempt = 0; attempt < retries; attempt++) {
        if (editorRef.value) {
            return { root: editorRef.value };
        }
        await nextTick();
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return null;
}

// Confirm and insert table with selected dimensions
async function confirmTableInsert() {
    // Set guard to prevent accidental insertion
    if (isInsertingTable.value) {
        console.warn('Table insertion already in progress');
        return;
    }

    try {
        isInsertingTable.value = true;

        let rows = parseInt(tableRows.value) || 3;
        let cols = parseInt(tableColumns.value) || 3;

        // Validate and clamp values
        rows = Math.max(1, Math.min(20, rows));
        cols = Math.max(1, Math.min(20, cols));

        if (rows < 1 || cols < 1 || rows > 20 || cols > 20) {
            return;
        }

        // IMPORTANT: Get editor root element BEFORE closing modal
        // We'll work directly with the DOM element
        const editorInfo = await getEditorRootOrWait(5);

        if (!editorInfo || !editorInfo.root) {
            console.error('Editor root not found after retries');
            // Try one more time with a longer wait
            await nextTick();
            await new Promise(resolve => setTimeout(resolve, 200));
            const retryInfo = await getEditorRootOrWait(3);

            if (!retryInfo || !retryInfo.root) {
                console.error('Editor root still not found. Editor may not be ready.');
                alert('Editor is not ready. Please try again.');
                return;
            }
            editorInfo.root = retryInfo.root;
        }

        // Get current HTML BEFORE closing modal
        const editorRoot = editorInfo.root;
        const currentHTML = editorRoot.innerHTML;

        // Get cursor position using Selection API
        const selection = window.getSelection();
        let insertRange = null;
        if (selection.rangeCount > 0) {
            insertRange = selection.getRangeAt(0);
        }

        // Now close the modal
        showTableModal.value = false;
        await nextTick();

        // Small delay to ensure modal is closed
        await new Promise(resolve => setTimeout(resolve, 50));

        // Build table HTML string - verify we're creating all rows/cols
        console.log('Creating table with rows:', rows, 'cols:', cols);

        isParsing.value = true;

        // Build table HTML - create elements in memory first to verify structure
        const tempDiv = document.createElement('div');
        const table = document.createElement('table');
        table.style.cssText = 'border-collapse: collapse; width: 100%; margin: 1em 0; border: 1px solid var(--border, #ddd); display: table !important; table-layout: auto;';

        // Create tbody with ALL rows (no header row)
        const tbody = document.createElement('tbody');
        tbody.style.cssText = 'display: table-row-group !important;';
        for (let r = 0; r < rows; r++) {
            const tr = document.createElement('tr');
            tr.style.cssText = 'display: table-row !important;';
            // Create ALL columns for this row
            for (let c = 0; c < cols; c++) {
                const td = document.createElement('td');
                td.style.cssText = 'border: 1px solid var(--border, #ddd); padding: 8px; min-width: 100px; display: table-cell !important;';
                td.contentEditable = 'true';
                td.setAttribute('data-cell-index', c.toString());
                td.setAttribute('data-cell-row', r.toString());
                td.setAttribute('data-cell-type', 'body');
                // Use non-breaking space to ensure cell is not empty
                td.innerHTML = '&nbsp;';
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);

        // Verify structure before inserting
        const actualBodyRows = table.querySelectorAll('tbody tr').length;
        const actualFirstRowCells = table.querySelector('tbody tr') ? table.querySelector('tbody tr').querySelectorAll('td').length : 0;

        // console.log('Table structure before insert:', {
        //     expected: { rows, cols },
        //     actual: {
        //         bodyRows: actualBodyRows,
        //         firstRowCells: actualFirstRowCells
        //     }
        // });

        if (actualBodyRows !== rows || actualFirstRowCells !== cols) {
            console.error('Table structure is WRONG before insertion!');
            isParsing.value = false;
            return;
        }

        // Mark table with data attributes so we can find and fix it
        table.setAttribute('data-quill-table', 'true');
        table.setAttribute('data-table-rows', rows.toString());
        table.setAttribute('data-table-cols', cols.toString());

        // Insert table directly into DOM (contentEditable preserves structure)
        if (!editorRoot || editorRoot.appendChild === undefined) {
            console.error('Editor root is not a valid DOM element', editorRoot);
            return;
        }

        // Temporarily disable content sync
        isParsing.value = true;
        isUpdatingContent.value = true;

        // Insert at cursor position if available, otherwise append
        if (insertRange && editorRoot.contains(insertRange.commonAncestorContainer)) {
            // Insert at cursor
            insertRange.collapse(false);
            insertRange.insertNode(table.cloneNode(true));

            // Add spacing after table
            const brAfter = document.createElement('br');
            insertRange.setStartAfter(table);
            insertRange.insertNode(brAfter);
        } else {
            // Append to end
            editorRoot.appendChild(table.cloneNode(true));
            const brAfter = document.createElement('br');
            editorRoot.appendChild(brAfter);
        }

        // Immediately verify the table structure is correct before Quill processes it
        const immediateCheck = editorRoot.querySelector('table[data-quill-table="true"]:last-of-type');
        if (immediateCheck) {
            const firstRowCells = immediateCheck.querySelector('tbody tr') ? immediateCheck.querySelector('tbody tr').querySelectorAll('td').length : 0;
            console.log('Immediate check after DOM insertion:', {
                firstRowCellsFound: firstRowCells,
                expected: cols
            });

            // If already flattened, fix immediately
            if (firstRowCells !== cols) {
                console.warn('Table was already flattened on insertion! Fixing immediately...');
                fixTableStructure(immediateCheck, rows, cols, editorRoot);
            }
        }

        // Immediately sync content to Quill
        const initialHTML = editorRoot.innerHTML;
        content.value = initialHTML;

        // Immediately check and fix table structure after insertion
        await nextTick();
        await new Promise(resolve => setTimeout(resolve, 50));

        // Check for flattened cells and fix immediately
        const checkAndFixTable = (rootElement) => {
            const insertedTable = rootElement.querySelector('table[data-quill-table="true"]:last-of-type');
            if (!insertedTable) {
                return false;
            }

            let needsFix = false;

            // Check body rows (no header row)
            const tbody = insertedTable.querySelector('tbody');
            if (tbody) {
                const bodyRows = tbody.querySelectorAll('tr');
                if (bodyRows.length !== rows) {
                    console.warn('Body rows were flattened! Expected', rows, 'but found', bodyRows.length);
                    needsFix = true;
                } else {
                    // Check each row
                    for (let rowIndex = 0; rowIndex < bodyRows.length; rowIndex++) {
                        const cells = bodyRows[rowIndex].querySelectorAll('td');
                        if (cells.length !== cols) {
                            console.warn(`Row ${rowIndex} was flattened! Expected ${cols} cells but found ${cells.length}`);
                            needsFix = true;
                            break;
                        }
                    }
                }
            } else {
                console.warn('No tbody found!');
                needsFix = true;
            }

            if (needsFix) {
                console.warn('Table structure needs fixing, calling fixTableStructure...');
                fixTableStructure(insertedTable, rows, cols, rootElement);
                return true;
            }

            return false;
        };

        // Always check and fix immediately, regardless of Quill
        const rootToCheck = editorInfo.quill ? editorInfo.root : editorRoot;

        // Immediate check and fix
        let wasFixed = checkAndFixTable(rootToCheck);
        if (wasFixed) {
            content.value = rootToCheck.innerHTML;
        }

        // If we have Quill instance, check multiple times as Quill might process it asynchronously
        if (editorInfo.quill) {
            // Check multiple times to catch any async processing by Quill
            for (let i = 0; i < 8; i++) {
                await nextTick();
                await new Promise(resolve => setTimeout(resolve, 150));

                const checkResult = checkAndFixTable(editorInfo.root);
                if (checkResult) {
                    wasFixed = true;
                    content.value = editorInfo.root.innerHTML;
                    console.log(`Fix applied on check ${i + 1}`);
                }
            }

            // Final verification and fix if needed
            const finalCheck = checkAndFixTable(editorInfo.root);
            if (finalCheck) {
                content.value = editorInfo.root.innerHTML;
            }

            // Final verification that table exists
            const insertedTable = editorInfo.root.querySelector('table[data-quill-table="true"]:last-of-type');
            if (!insertedTable) {
                console.error('Table was removed by Quill! Re-inserting...');
                // Re-insert the table
                const newTable = table.cloneNode(true);
                editorInfo.root.appendChild(newTable);
                // Add <br /> after table
                const newBrAfter = document.createElement('br');
                editorInfo.root.appendChild(newBrAfter);
                const newPAfter = document.createElement('p');
                newPAfter.innerHTML = '<br>';
                editorInfo.root.appendChild(newPAfter);
                const newPAfter2 = document.createElement('p');
                newPAfter2.innerHTML = '<br>';
                editorInfo.root.appendChild(newPAfter2);
                content.value = editorInfo.root.innerHTML;

                // Fix the re-inserted table
                await nextTick();
                checkAndFixTable(editorInfo.root);
                content.value = editorInfo.root.innerHTML;
            }

            // Set cursor position
            await nextTick();
            const newLength = editorInfo.quill.getLength();
            editorInfo.quill.setSelection(newLength - 1, 'user');
        } else {
            // For non-Quill case, do one more check
            checkAndFixTable(editorRoot);
            content.value = editorRoot.innerHTML;
        }

        // Wait for any Quill processing (only if we didn't use Quill API)
        if (!editorInfo.quill) {
            await nextTick();
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Get the inserted table - it should be the last one with our data attribute
        const editorRootForCheck = editorInfo.quill ? editorInfo.root : editorRoot;
        const insertedTable = editorRootForCheck.querySelector('table[data-quill-table="true"]:last-of-type');

        console.log('Looking for table in editor root:', {
            hasQuill: !!editorInfo.quill,
            editorRootHTML: editorRootForCheck.innerHTML.substring(0, 500),
            tableFound: !!insertedTable
        });
        if (insertedTable) {
            const tbody = insertedTable.querySelector('tbody');
            const bodyRows = tbody ? tbody.querySelectorAll('tr') : [];
            const firstRowCells = bodyRows[0] ? bodyRows[0].querySelectorAll('td').length : 0;

            console.log('Table structure check:', {
                bodyRowCount: bodyRows.length,
                expectedRows: rows,
                firstRowCells,
                expectedCols: cols
            });

            // If structure was corrupted (wrong row count or cell count), fix it
            if (bodyRows.length !== rows || firstRowCells !== cols) {
                console.warn('Table structure corrupted by Quill, fixing...');

                // Remove the corrupted table
                insertedTable.remove();

                // Recreate the table with proper structure (no headers)
                const fixedTable = document.createElement('table');
                fixedTable.style.cssText = 'border-collapse: collapse; width: 100%; margin: 1em 0; border: 1px solid var(--border, #ddd); display: table !important; table-layout: auto;';
                fixedTable.setAttribute('data-quill-table', 'true');
                fixedTable.setAttribute('data-table-rows', rows.toString());
                fixedTable.setAttribute('data-table-cols', cols.toString());

                // Recreate tbody with all rows (no header row)
                const fixedTbody = document.createElement('tbody');
                fixedTbody.style.cssText = 'display: table-row-group !important;';
                for (let r = 0; r < rows; r++) {
                    const tr = document.createElement('tr');
                    tr.style.cssText = 'display: table-row !important;';
                    for (let c = 0; c < cols; c++) {
                        const td = document.createElement('td');
                        td.style.cssText = 'border: 1px solid var(--border, #ddd); padding: 8px; min-width: 100px; display: table-cell !important;';
                        td.contentEditable = 'true';
                        td.setAttribute('data-cell-index', c.toString());
                        td.setAttribute('data-cell-row', r.toString());
                        td.setAttribute('data-cell-type', 'body');
                        td.innerHTML = '&nbsp;';
                        tr.appendChild(td);
                    }
                    fixedTbody.appendChild(tr);
                }
                fixedTable.appendChild(fixedTbody);

                // Insert the fixed table at the end (before pAfter if it still exists, otherwise just append)
                try {
                    if (pAfter && pAfter.parentNode === editorRoot) {
                        editorRoot.insertBefore(fixedTable, pAfter);
                        // Add <br /> after table but before pAfter
                        const newBrAfter = document.createElement('br');
                        editorRoot.insertBefore(newBrAfter, pAfter);
                    } else {
                        // pAfter was moved/removed by Quill, just append at end
                        editorRoot.appendChild(fixedTable);
                        // Add <br /> after table
                        const newBrAfter = document.createElement('br');
                        editorRoot.appendChild(newBrAfter);
                        // Re-add paragraphs after table for spacing and new line
                        const newPAfter = document.createElement('p');
                        newPAfter.innerHTML = '<br>';
                        editorRoot.appendChild(newPAfter);
                        const newPAfter2 = document.createElement('p');
                        newPAfter2.innerHTML = '<br>';
                        editorRoot.appendChild(newPAfter2);
                    }
                } catch (e) {
                    // Fallback: just append at end
                    console.warn('Could not insert before pAfter, appending at end:', e);
                    editorRoot.appendChild(fixedTable);
                    // Add <br /> after table
                    const newBrAfter = document.createElement('br');
                    editorRoot.appendChild(newBrAfter);
                    const newPAfter = document.createElement('p');
                    newPAfter.innerHTML = '<br>';
                    editorRoot.appendChild(newPAfter);
                    const newPAfter2 = document.createElement('p');
                    newPAfter2.innerHTML = '<br>';
                    editorRoot.appendChild(newPAfter2);
                }

                // Mark the fixed table
                fixedTable.setAttribute('data-quill-table', 'true');
                fixedTable.setAttribute('data-table-rows', rows.toString());
                fixedTable.setAttribute('data-table-cols', cols.toString());

                console.log('Table structure fixed and reinserted');

                // Aggressively fix the table multiple times until it sticks
                // Quill might process it multiple times, so we need to keep fixing it
                let fixAttempts = 0;
                const maxFixAttempts = 15;

                const fixInterval = setInterval(() => {
                    if (fixAttempts >= maxFixAttempts) {
                        clearInterval(fixInterval);
                        console.log('Stopped fixing table after max attempts');
                        return;
                    }

                    const currentTable = editorRoot.querySelector('table[data-quill-table="true"]:last-of-type');
                    if (!currentTable) {
                        clearInterval(fixInterval);
                        return;
                    }

                    const tbody = currentTable.querySelector('tbody');
                    const bodyRows = tbody ? tbody.querySelectorAll('tr') : [];
                    const firstRowCells = bodyRows[0] ? bodyRows[0].querySelectorAll('td').length : 0;

                    if (bodyRows.length !== rows || firstRowCells !== cols) {
                        console.log(`Fix attempt ${fixAttempts + 1}/${maxFixAttempts}: Table still corrupted, fixing again...`);
                        // Get editor root for the fix function
                        let editorRootForFix = editorRoot;
                        if (!editorRootForFix) {
                            editorRootForFix = editorRef.value;
                        }
                        if (editorRootForFix) {
                            fixTableStructure(currentTable, rows, cols, editorRootForFix);
                        }
                        fixAttempts++;
                    } else {
                        console.log('Table structure is correct, stopping fix attempts');
                        clearInterval(fixInterval);
                    }
                }, 150); // Check every 150ms

                // Stop after 3 seconds max
                setTimeout(() => {
                    clearInterval(fixInterval);
                }, 3000);
            }
        }

        // Update content value from the actual DOM
        await nextTick();

        // Get the correct editor root for verification
        const editorRootForVerify = editorInfo.quill ? editorInfo.root : editorRoot;

        // Verify table structure after insertion
        const insertedTables = editorRootForVerify.querySelectorAll('table[data-quill-table="true"]');
        console.log('Tables found after insertion:', insertedTables.length);

        if (insertedTables.length > 0) {
            const insertedTable = insertedTables[insertedTables.length - 1];
            const insertedBodyRows = insertedTable.querySelectorAll('tbody tr').length;
            const insertedFirstRowCells = insertedTable.querySelector('tbody tr') ? insertedTable.querySelector('tbody tr').querySelectorAll('td').length : 0;

            console.log('Table structure after insertion:', {
                expected: { rows, cols },
                actual: {
                    bodyRows: insertedBodyRows,
                    firstRowCells: insertedFirstRowCells
                },
                tableHTML: insertedTable.outerHTML.substring(0, 500)
            });

            if (insertedBodyRows !== rows || insertedFirstRowCells !== cols) {
                console.error('Table structure was CORRUPTED after insertion!');
                console.log('Full Table HTML:', insertedTable.outerHTML);

                // Try to fix the structure one more time
                fixTableStructure(insertedTable, rows, cols, currentEditorRoot);

                // Verify again after fix
                await nextTick();
                const fixedTable = currentEditorRoot.querySelector('table[data-quill-table="true"]:last-of-type');
                if (fixedTable) {
                    const fixedBodyRows = fixedTable.querySelectorAll('tbody tr').length;
                    const fixedFirstRowCells = fixedTable.querySelector('tbody tr') ? fixedTable.querySelector('tbody tr').querySelectorAll('td').length : 0;
                    console.log('Table structure after fix:', {
                        bodyRows: fixedBodyRows,
                        firstRowCells: fixedFirstRowCells
                    });
                }
            }
        } else {
            // console.error('No tables found after insertion! Editor HTML:', editorRootForVerify.innerHTML.substring(0, 1000));
        }

        // Update content from the editor root
        const finalHTML = editorRootForVerify.innerHTML;
        content.value = finalHTML;

        // DON'T call quill.update() as it might strip/corrupt the table
        // The table is already in the DOM, we just need to sync the content value

        // Restore focus to editor
        try {
            const editorRootForFocus = editorInfo.quill ? editorInfo.root : editorRoot;
            if (editorRootForFocus) {
                editorRootForFocus.focus();
            }
        } catch (e) {
            console.warn('Could not focus editor:', e);
        }

        isParsing.value = false;

        // Set cursor after table in the new line paragraph we created
        await nextTick();
        try {
            const editorRootForCursor = editorInfo.quill ? editorInfo.root : editorRoot;
            // Find the paragraph after the table (the second one for the new line)
            const insertedTable = editorRootForCursor.querySelector('table[data-quill-table="true"]:last-of-type');
            if (insertedTable) {
                if (editorInfo.quill) {
                    // Use Quill's selection API - place cursor at the end for new line
                    const newLength = editorInfo.quill.getLength();
                    editorInfo.quill.setSelection(newLength - 1, 'user');
                } else {
                    // Use DOM selection - find the second paragraph after table (the new line)
                    const pAfter = insertedTable.nextSibling;
                    const pAfter2 = pAfter && pAfter.nextSibling;
                    const targetParagraph = (pAfter2 && pAfter2.tagName === 'P') ? pAfter2 : pAfter;
                    if (targetParagraph && targetParagraph.tagName === 'P') {
                        const range = document.createRange();
                        const selection = window.getSelection();
                        if (targetParagraph.firstChild) {
                            range.setStart(targetParagraph.firstChild, 0);
                        } else {
                            range.setStart(targetParagraph, 0);
                        }
                        range.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }
            }
        } catch (e) {
            // Ignore selection errors
            console.warn('Could not set cursor position:', e);
        }

        // Emit update
        emit('update:modelValue', content.value);
    } catch (error) {
        console.error('Error inserting table:', error);
    } finally {
        // Always clear guard, even on error
        isInsertingTable.value = false;
    }
}

// This function is no longer needed - we create tables directly in DOM
// Keeping it for potential future use
function generateTableHTML(rows, cols) {
    return ''; // Not used anymore
}

// Image insertion functions
function openImageModal() {
    // Ensure editor has focus to maintain cursor position
    if (editorRef.value) {
        editorRef.value.focus();
    }

    // Store cursor position/cell BEFORE opening modal (before focus is lost)
    storedInsertionTarget.value = null;

    try {
        // Method 1: Check if cursor is in a table cell
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0).cloneRange();
            const startContainer = range.startContainer;

            // Check if we're inside a table cell
            let targetCell = null;
            if (startContainer.nodeType === 1) {
                targetCell = startContainer.closest('td, th');
            } else if (startContainer.parentElement) {
                targetCell = startContainer.parentElement.closest('td, th');
            }

            if (targetCell) {
                // Store the cell and position within it
                // Calculate offset within the cell to preserve cursor position
                let offset = 0;
                try {
                    // Try to get text offset within cell
                    const cellRange = document.createRange();
                    cellRange.selectNodeContents(targetCell);
                    cellRange.setEnd(range.startContainer, range.startOffset);
                    offset = cellRange.toString().length;
                } catch (e) {
                    // If we can't calculate offset, use 0 (start of cell)
                    offset = 0;
                }

                storedInsertionTarget.value = {
                    type: 'cell',
                    cell: targetCell,
                    offset: offset,
                    range: range.cloneRange() // Clone to preserve
                };
            } else {
                // Not in a cell - store Quill index
                // Use Selection API
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    storedInsertionTarget.value = {
                        type: 'range',
                        range: range.cloneRange()
                    };
                } else {
                    // Create range at end of editor
                    if (editorRef.value) {
                        const range = document.createRange();
                        range.selectNodeContents(editorRef.value);
                        range.collapse(false);
                        storedInsertionTarget.value = {
                            type: 'range',
                            range: range
                        };
                    }
                }
            }
        } else {
            // No selection, create range at end of editor
            if (editorRef.value) {
                const range = document.createRange();
                range.selectNodeContents(editorRef.value);
                range.collapse(false);
                storedInsertionTarget.value = {
                    type: 'range',
                    range: range
                };
            }
        }
    } catch (error) {
        console.warn('Could not store cursor position:', error);
    }

    showImageModal.value = true;
    imageMode.value = 'upload';
    selectedFile.value = null;
    selectedFilePreview.value = null;
    selectedPhotoIndex.value = -1;
    imageWidth.value = null;
    imageHeight.value = null;
    widthUnit.value = 'px';
    heightUnit.value = 'px';

    // Load survey photos if routeId is available
    if (props.routeId && imageMode.value === 'browse') {
        loadSurveyPhotos();
    }
}

function closeImageModal() {
    showImageModal.value = false;
    selectedFile.value = null;
    selectedFilePreview.value = null;
    selectedPhotoIndex.value = -1;
    imageWidth.value = null;
    imageHeight.value = null;
}

function triggerFileInput() {
    if (fileInputRef.value) {
        fileInputRef.value.click();
    }
}

function handleFileSelect(event) {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        selectedFile.value = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            selectedFilePreview.value = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

async function loadSurveyPhotos() {
    if (!props.routeId) return;

    loadingPhotos.value = true;
    surveyPhotos.value = [];

    try {
        const result = await RoutesController.getRoute(props.routeId);
        if (result.result && result.data?.pointsData) {
            const photos = [];
            result.data.pointsData.forEach((point) => {
                if (point.type !== 'route_point' && point.data) {
                    try {
                        const parsedData = JSON.parse(point.data);
                        if (parsedData.media && Array.isArray(parsedData.media)) {
                            const pointPhotos = parsedData.media.filter(media => media.type === 'photo');
                            pointPhotos.forEach(photo => {
                                photos.push({
                                    ...photo,
                                    url: String(photo.url)
                                        .replace('10.0.2.2', 'localhost')
                                        .replace("http://api.route-survey.survys.com", "https://api.route-survey.survys.com"),
                                    pointType: point.type
                                });
                            });
                        }
                    } catch (error) {
                        console.error('Error parsing point data:', error);
                    }
                }
            });
            surveyPhotos.value = photos;
        }
    } catch (error) {
        console.error('Error loading survey photos:', error);
    } finally {
        loadingPhotos.value = false;
    }
}

function getPhotoUrl(url) {
    return String(url).replace('10.0.2.2', 'localhost');
}

const canInsertImage = computed(() => {
    if (imageMode.value === 'upload') {
        return !!selectedFile.value;
    } else {
        return selectedPhotoIndex.value >= 0 && selectedPhotoIndex.value < surveyPhotos.value.length;
    }
});

async function confirmImageInsert() {
    if (!canInsertImage.value) {
        console.warn('Cannot insert image: canInsertImage is false');
        return;
    }

    try {
        let imageUrl = '';

        if (imageMode.value === 'upload') {
            if (!selectedFile.value) {
                console.error('No file selected for upload');
                return;
            }

            // Try to upload the file first
            const formData = new FormData();
            formData.append('file', selectedFile.value);

            try {
                const uploadResult = await FileManagementController.uploadRoutePhoto(formData);
                if (uploadResult.result && uploadResult.url) {
                    imageUrl = uploadResult.url;
                    console.log('Image uploaded successfully, URL:', imageUrl);
                } else {
                    // Upload failed, fallback to base64
                    console.warn('Upload failed, using base64:', uploadResult.message);
                    if (!selectedFilePreview.value) {
                        console.error('No base64 preview available');
                        return;
                    }
                    imageUrl = selectedFilePreview.value; // This is already base64 from handleFileSelect
                }
            } catch (uploadError) {
                // Upload error, fallback to base64
                console.warn('Upload error, using base64:', uploadError);
                if (!selectedFilePreview.value) {
                    console.error('No base64 preview available');
                    return;
                }
                imageUrl = selectedFilePreview.value; // This is already base64 from handleFileSelect
            }
        } else {
            // Use selected survey photo
            if (selectedPhotoIndex.value < 0 || selectedPhotoIndex.value >= surveyPhotos.value.length) {
                console.error('Invalid photo index:', selectedPhotoIndex.value);
                return;
            }
            const selectedPhoto = surveyPhotos.value[selectedPhotoIndex.value];
            if (!selectedPhoto || !selectedPhoto.url) {
                console.error('Selected photo is invalid or missing URL:', selectedPhoto);
                return;
            }
            imageUrl = selectedPhoto.url;
            console.log('Using survey photo URL:', imageUrl);
        }

        // Validate that we have an image URL
        if (!imageUrl || imageUrl.trim() === '') {
            console.error('No image URL available');
            return;
        }

        // Build image HTML with size - save dimensions in both style and attributes
        let style = '';
        let widthAttr = '';
        let heightAttr = '';

        if (imageWidth.value) {
            const widthValue = `${imageWidth.value}${widthUnit.value}`;
            style += `width: ${widthValue}; `;
            // Save as attribute for persistence (only for px, not %)
            if (widthUnit.value === 'px') {
                widthAttr = ` width="${imageWidth.value}"`;
            }
        }
        if (imageHeight.value) {
            const heightValue = `${imageHeight.value}${heightUnit.value}`;
            style += `height: ${heightValue}; `;
            // Save as attribute for persistence (only for px, not %)
            if (heightUnit.value === 'px') {
                heightAttr = ` height="${imageHeight.value}"`;
            }
        }

        const imgTag = style.trim()
            ? `<img src="${imageUrl}" style="${style.trim()}"${widthAttr}${heightAttr} />`
            : `<img src="${imageUrl}"${widthAttr}${heightAttr} />`;

        console.log('Inserting image with tag:', imgTag);

        // Insert image into editor
        await insertImageIntoEditor(imgTag);

        closeImageModal();
    } catch (error) {
        console.error('Error inserting image:', error);
        // Last resort: try to insert as base64 if we have it
        if (imageMode.value === 'upload' && selectedFilePreview.value) {
            try {
                let style = '';
                let widthAttr = '';
                let heightAttr = '';

                if (imageWidth.value) {
                    const widthValue = `${imageWidth.value}${widthUnit.value}`;
                    style += `width: ${widthValue}; `;
                    if (widthUnit.value === 'px') {
                        widthAttr = ` width="${imageWidth.value}"`;
                    }
                }
                if (imageHeight.value) {
                    const heightValue = `${imageHeight.value}${heightUnit.value}`;
                    style += `height: ${heightValue}; `;
                    if (heightUnit.value === 'px') {
                        heightAttr = ` height="${imageHeight.value}"`;
                    }
                }

                const imgTag = style.trim()
                    ? `<img src="${selectedFilePreview.value}" style="${style.trim()}"${widthAttr}${heightAttr} />`
                    : `<img src="${selectedFilePreview.value}"${widthAttr}${heightAttr} />`;

                console.log('Fallback: Inserting image with tag:', imgTag);
                await insertImageIntoEditor(imgTag);
                closeImageModal();
            } catch (fallbackError) {
                console.error('Fallback insertion also failed:', fallbackError);
            }
        }
    }
}

async function insertImageIntoEditor(imgHtml) {
    console.log('insertImageIntoEditor called with HTML:', imgHtml);
    await nextTick();

    if (!editorRef.value) {
        console.log('Editor ref not found, waiting for editor root...');
        const editorInfo = await getEditorRootOrWait(5);
        if (!editorInfo || !editorInfo.root) {
            console.error('Editor root not found');
            return;
        }
        editorRef.value = editorInfo.root;
        console.log('Editor root found:', editorRef.value);
    }

    // Temporarily disable parsing
    isParsing.value = true;
    isUpdatingContent.value = true;

    // Get current cursor position using Selection API
    const selection = window.getSelection();
    let insertionRange = null;
    let targetCell = null;

    try {
        // Get current selection
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0).cloneRange();
            const startContainer = range.startContainer;

            // Check if cursor is in a table cell
            if (startContainer.nodeType === 1) {
                targetCell = startContainer.closest('td, th');
            } else if (startContainer.parentElement) {
                targetCell = startContainer.parentElement.closest('td, th');
            }

            if (targetCell) {
                // We're in a cell, use the range directly
                insertionRange = range;
            } else {
                // Not in a cell, use the range
                insertionRange = range;
            }
        } else {
            // No selection, create range at end of editor
            const range = document.createRange();
            range.selectNodeContents(editorRef.value);
            range.collapse(false);
            insertionRange = range;
        }
    } catch (error) {
        console.warn('Error getting cursor position:', error);
        // Fallback to end of document
        const range = document.createRange();
        if (editorRef.value) {
            range.selectNodeContents(editorRef.value);
            range.collapse(false);
            insertionRange = range;
        }
    }

    // If cursor is in a table cell, insert image directly into the cell at cursor position
    if (targetCell && insertionRange) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = imgHtml;
        const imgElement = tempDiv.firstElementChild;

        console.log('Table cell insertion - Parsed image element:', imgElement, 'Tag name:', imgElement?.tagName);

        if (!imgElement) {
            console.error('Failed to parse image HTML in table cell, no element found');
            isParsing.value = false;
            isUpdatingContent.value = false;
            return;
        }

        if (imgElement.tagName !== 'IMG') {
            console.error('Parsed element in table cell is not an IMG tag:', imgElement.tagName);
            isParsing.value = false;
            isUpdatingContent.value = false;
            return;
        }

        if (imgElement && imgElement.tagName === 'IMG') {
            try {
                // Verify the cell still exists and range is valid
                if (document.contains(targetCell) && insertionRange.startContainer) {
                    // Verify range is still in the cell
                    const rangeCell = insertionRange.startContainer.nodeType === 1
                        ? insertionRange.startContainer.closest('td, th')
                        : insertionRange.startContainer.parentElement?.closest('td, th');

                    if (rangeCell === targetCell) {
                        // Insert at exact cursor position
                        insertionRange.insertNode(imgElement);

                        // Add a space after image for cursor
                        const textNode = document.createTextNode('\u00A0');
                        insertionRange.setStartAfter(imgElement);
                        insertionRange.insertNode(textNode);
                        insertionRange.setStartAfter(textNode);
                        insertionRange.collapse(true);

                        // Update selection to place cursor after image
                        const selection = window.getSelection();
                        if (selection) {
                            selection.removeAllRanges();
                            selection.addRange(insertionRange);
                        }
                    } else {
                        // Range is not in cell anymore, append to cell
                        if (targetCell.textContent.trim() === '' || targetCell.innerHTML === '&nbsp;') {
                            targetCell.innerHTML = '';
                        }
                        targetCell.appendChild(imgElement);
                        const textNode = document.createTextNode('\u00A0');
                        targetCell.appendChild(textNode);

                        const range = document.createRange();
                        range.setStartAfter(textNode);
                        range.collapse(true);
                        const sel = window.getSelection();
                        if (sel) {
                            sel.removeAllRanges();
                            sel.addRange(range);
                        }
                    }
                } else {
                    // Cell or range invalid, append to cell
                    if (targetCell.textContent.trim() === '' || targetCell.innerHTML === '&nbsp;') {
                        targetCell.innerHTML = '';
                    }
                    targetCell.appendChild(imgElement);
                    const textNode = document.createTextNode('\u00A0');
                    targetCell.appendChild(textNode);
                }
            } catch (error) {
                console.warn('Error inserting into cell:', error);
                // Fallback: append to cell
                if (targetCell.textContent.trim() === '' || targetCell.innerHTML === '&nbsp;') {
                    targetCell.innerHTML = '';
                }
                targetCell.appendChild(imgElement);
                const textNode = document.createTextNode('\u00A0');
                targetCell.appendChild(textNode);
            }

            // Ensure dimensions are preserved from the HTML
            const widthAttr = imgElement.getAttribute('width');
            const heightAttr = imgElement.getAttribute('height');
            const styleAttr = imgElement.getAttribute('style') || '';

            // If we have width/height attributes but no style, add them to style
            if (widthAttr && !styleAttr.includes('width:')) {
                imgElement.style.width = `${widthAttr}px`;
            }
            if (heightAttr && !styleAttr.includes('height:')) {
                imgElement.style.height = `${heightAttr}px`;
            }

            // Attach resize handler
            setTimeout(() => {
                attachImageResizeHandler(imgElement);
                // Also restore styles to ensure consistency
                restoreImageStyles();
            }, 50);

            console.log('Image inserted successfully into table cell');
        } else {
            console.error('Image element is null or not an IMG tag in table cell');
            isParsing.value = false;
            isUpdatingContent.value = false;
            return;
        }

        // Sync content
        await nextTick();
        const updatedContent = editorRef.value.innerHTML;
        console.log('Updated content length (table cell):', updatedContent.length);
        content.value = updatedContent;
        emit('update:modelValue', updatedContent);
        isParsing.value = false;
        isUpdatingContent.value = false;

        // Ensure image styles are restored after insertion
        await nextTick();
        restoreImageStyles();

        // Clear stored target after insertion
        storedInsertionTarget.value = null;
        return;
    }

    // Normal insertion (not in table cell) - use insertionRange
    if (!insertionRange && editorRef.value) {
        const range = document.createRange();
        range.selectNodeContents(editorRef.value);
        range.collapse(false);
        insertionRange = range;
    }

    // Insert image HTML at cursor position using contentEditable
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = imgHtml;
    const imgElement = tempDiv.firstElementChild;

    console.log('Parsed image element:', imgElement, 'Tag name:', imgElement?.tagName);

    if (!imgElement) {
        console.error('Failed to parse image HTML, no element found');
        isParsing.value = false;
        isUpdatingContent.value = false;
        return;
    }

    if (imgElement.tagName !== 'IMG') {
        console.error('Parsed element is not an IMG tag:', imgElement.tagName);
        isParsing.value = false;
        isUpdatingContent.value = false;
        return;
    }

    if (imgElement && imgElement.tagName === 'IMG') {
        try {
            // Use range-based insertion
            if (insertionRange) {
                console.log('Inserting image using range at:', insertionRange.startContainer, insertionRange.startOffset);
                insertionRange.insertNode(imgElement);

                // Verify image was inserted
                const insertedImg = editorRef.value ? editorRef.value.querySelector(`img[src="${imgElement.src}"]`) : null;
                console.log('Image found in DOM after insertion:', !!insertedImg);

                insertionRange.setStartAfter(imgElement);
                insertionRange.collapse(true);
                const selection = window.getSelection();
                if (selection) {
                    selection.removeAllRanges();
                    selection.addRange(insertionRange);
                }
            } else if (editorRef.value) {
                // Append to end
                console.log('Appending image to end of editor');
                editorRef.value.appendChild(imgElement);

                // Verify image was appended
                const appendedImg = editorRef.value.querySelector(`img[src="${imgElement.src}"]`);
                console.log('Image found in DOM after append:', !!appendedImg);
            }
        } catch (error) {
            console.warn('Error inserting image:', error);
            // Fallback: append to end
            if (editorRef.value) {
                editorRef.value.appendChild(imgElement);
                const fallbackImg = editorRef.value.querySelector(`img[src="${imgElement.src}"]`);
                console.log('Image found in DOM after fallback append:', !!fallbackImg);
            }
        }

        // Ensure dimensions are preserved from the HTML
        // The imgElement should already have the attributes and styles from the HTML string
        // But let's make sure they're properly set
        const widthAttr = imgElement.getAttribute('width');
        const heightAttr = imgElement.getAttribute('height');
        const styleAttr = imgElement.getAttribute('style') || '';

        console.log('Image attributes - width:', widthAttr, 'height:', heightAttr, 'style:', styleAttr);

        // If we have width/height attributes but no style, add them to style
        if (widthAttr && !styleAttr.includes('width:')) {
            imgElement.style.width = `${widthAttr}px`;
        }
        if (heightAttr && !styleAttr.includes('height:')) {
            imgElement.style.height = `${heightAttr}px`;
        }

        // Verify image is in DOM before proceeding
        await nextTick();
        const imageInDOM = editorRef.value ? editorRef.value.contains(imgElement) : false;
        console.log('Image is in DOM after insertion:', imageInDOM);
        if (!imageInDOM) {
            console.error('Image was not inserted into DOM! Attempting fallback...');
            // Try to append directly
            if (editorRef.value) {
                editorRef.value.appendChild(imgElement);
                console.log('Image appended as fallback, now in DOM:', editorRef.value.contains(imgElement));
            }
        }

        // Attach resize handler
        setTimeout(() => {
            attachImageResizeHandler(imgElement);
            // Also restore styles to ensure consistency
            restoreImageStyles();
        }, 50);

        console.log('Image inserted successfully at normal position');
    } else {
        console.error('Image element is null or not an IMG tag');
        isParsing.value = false;
        isUpdatingContent.value = false;
        return;
    }

    // Sync content - wait a bit to ensure DOM is updated
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 50));

    // Check if image is actually in the DOM
    const imagesInEditor = editorRef.value ? editorRef.value.querySelectorAll('img') : [];
    console.log('Images in editor after insertion:', imagesInEditor.length);
    if (imagesInEditor.length > 0) {
        console.log('First image src:', imagesInEditor[0].src);
        console.log('First image outerHTML:', imagesInEditor[0].outerHTML);
        console.log('First image parent:', imagesInEditor[0].parentElement?.tagName);
    } else {
        console.error('No images found in editor after insertion!');
    }

    const updatedContent = editorRef.value ? editorRef.value.innerHTML : '';
    console.log('Updated content length:', updatedContent.length);
    console.log('Updated content:', updatedContent.substring(0, 200)); // First 200 chars
    content.value = updatedContent;
    emit('update:modelValue', updatedContent);
    isParsing.value = false;
    isUpdatingContent.value = false;

    // Ensure image styles are restored after insertion
    await nextTick();
    restoreImageStyles();

    // Check again after restoreImageStyles
    const imagesAfterRestore = editorRef.value ? editorRef.value.querySelectorAll('img') : [];
    console.log('Images in editor after restoreImageStyles:', imagesAfterRestore.length);
    const contentAfterRestore = editorRef.value ? editorRef.value.innerHTML : '';
    console.log('Content after restoreImageStyles length:', contentAfterRestore.length);

    // Clear stored target after insertion
    storedInsertionTarget.value = null;
}

// Watch imageMode to load photos when switching to browse
watch(imageMode, (newMode) => {
    if (newMode === 'browse' && props.routeId) {
        loadSurveyPhotos();
    }
});

// Image resize functions
function openImageResizeModal(imgElement) {
    if (!imgElement || imgElement.tagName !== 'IMG') return;

    resizingImage.value = imgElement;
    showImageResizeModal.value = true;

    // Parse current width and height from style attribute
    const style = imgElement.getAttribute('style') || imgElement.style.cssText || '';
    const widthMatch = style.match(/width\s*:\s*([\d.]+)\s*(px|%)/i);
    const heightMatch = style.match(/height\s*:\s*([\d.]+)\s*(px|%)/i);

    // Also check natural dimensions if no style is set
    if (widthMatch) {
        resizeWidth.value = parseFloat(widthMatch[1]);
        resizeWidthUnit.value = widthMatch[2].toLowerCase();
    } else {
        // Use natural width as default if available
        resizeWidth.value = imgElement.naturalWidth || null;
        resizeWidthUnit.value = 'px';
    }

    if (heightMatch) {
        resizeHeight.value = parseFloat(heightMatch[1]);
        resizeHeightUnit.value = heightMatch[2].toLowerCase();
    } else {
        // Use natural height as default if available
        resizeHeight.value = imgElement.naturalHeight || null;
        resizeHeightUnit.value = 'px';
    }
}

function closeImageResizeModal() {
    showImageResizeModal.value = false;
    resizingImage.value = null;
    resizeWidth.value = null;
    resizeHeight.value = null;
}

async function confirmImageResize() {
    if (!resizingImage.value) return;

    // Build style string
    let style = resizingImage.value.style.cssText || '';

    // Remove existing width and height from style
    style = style.replace(/width\s*:\s*[^;]+;?/gi, '').replace(/height\s*:\s*[^;]+;?/gi, '');
    style = style.trim();

    // Add new width and height to style
    if (resizeWidth.value) {
        style += (style ? ' ' : '') + `width: ${resizeWidth.value}${resizeWidthUnit.value};`;
    }
    if (resizeHeight.value) {
        style += (style ? ' ' : '') + `height: ${resizeHeight.value}${resizeHeightUnit.value};`;
    }

    // Update image style
    resizingImage.value.style.cssText = style;

    // Also save to width and height attributes for persistence
    if (resizeWidth.value) {
        const widthValue = resizeWidthUnit.value === 'px'
            ? Math.round(resizeWidth.value).toString()
            : resizeWidth.value.toString() + resizeWidthUnit.value;
        resizingImage.value.setAttribute('width', widthValue);
    }
    if (resizeHeight.value) {
        const heightValue = resizeHeightUnit.value === 'px'
            ? Math.round(resizeHeight.value).toString()
            : resizeHeight.value.toString() + resizeHeightUnit.value;
        resizingImage.value.setAttribute('height', heightValue);
    }

    // Sync content
    if (editorRef.value) {
        isParsing.value = true;
        const updatedContent = editorRef.value.innerHTML;
        content.value = updatedContent;
        emit('update:modelValue', updatedContent);
        isParsing.value = false;
    }

    closeImageResizeModal();
}
</script>

<style scoped>
.rich-text-editor {
    border: 1px solid var(--border);
    border-radius: var(--radius-md, 4px);
    background: var(--bg-surface);
    overflow: hidden;
}

/* Dark theme support for rich-text-editor */
[data-bs-theme="dark"] .rich-text-editor {
    border-color: var(--border);
    background: var(--bg-surface);
}

:deep(.p-editor-content) {
    border: none;
    border-top: 1px solid var(--border);
    background: var(--bg-surface);
}

:deep(.ql-container) {
    font-family: inherit;
    font-size: 14px;
    color: var(--text-primary);
    background: var(--bg-surface);
    min-height: 200px;
    max-height: 400px;
    overflow-y: auto;
}

:deep(.ql-editor) {
    min-height: 200px;
    padding: var(--spacing-sm);
    color: var(--text-primary);
    background: var(--bg-surface);
}

:deep(.ql-editor.ql-blank::before) {
    color: var(--text-secondary);
    opacity: 0.6;
    font-style: normal;
}

:deep(.ql-toolbar .ql-stroke) {
    stroke: var(--text-secondary);
}

:deep(.ql-toolbar .ql-fill) {
    fill: var(--text-secondary);
}

:deep(.ql-toolbar button:hover) {
    color: var(--accent);
}

:deep(.ql-toolbar button.ql-active) {
    color: var(--accent) !important;
    background: var(--bg-elevated);
}

:deep(.ql-toolbar button:hover .ql-stroke) {
    stroke: var(--accent);
}

:deep(.ql-toolbar button.ql-active .ql-stroke) {
    stroke: var(--accent) !important;
}

:deep(.ql-toolbar button:hover .ql-fill) {
    fill: var(--accent);
}

:deep(.ql-toolbar button.ql-active .ql-fill) {
    fill: var(--accent) !important;
}

:deep(.ql-toolbar .ql-picker-label) {
    color: var(--text-secondary);
}

:deep(.ql-toolbar .ql-picker-label:hover) {
    color: var(--text-primary);
}

:deep(.ql-toolbar .ql-picker.ql-expanded .ql-picker-label) {
    color: var(--accent);
}

:deep(.ql-toolbar .ql-picker.ql-expanded .ql-picker-label .ql-stroke) {
    stroke: var(--accent);
}

:deep(.ql-toolbar .ql-picker.ql-expanded .ql-picker-label .ql-fill) {
    fill: var(--accent);
}

:deep(.ql-toolbar .ql-picker-options) {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 4px;
    box-shadow: var(--shadow-md);
}

/* Dark mode specific adjustments */
[data-bs-theme="dark"] :deep(.ql-toolbar .ql-picker-options) {
    box-shadow: var(--shadow-lg);
}

:deep(.ql-toolbar .ql-picker-item) {
    color: var(--text-primary);
}

:deep(.ql-toolbar .ql-picker-item:hover) {
    background: var(--bg-elevated);
    color: var(--accent);
}

/* Scrollbar styling */
:deep(.ql-container)::-webkit-scrollbar {
    width: 6px;
}

:deep(.ql-container)::-webkit-scrollbar-track {
    background: transparent;
}

:deep(.ql-container)::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 3px;
}

:deep(.ql-container)::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
}

/* Content styling */
:deep(.ql-editor p) {
    margin: 0 0 0.5em;
}

:deep(.ql-editor p:last-child) {
    margin-bottom: 0;
}

/* Force images to stay inline - aggressive CSS rules */
:deep(.ql-editor a[href][target="_blank"]) {
    display: inline-block !important;
    vertical-align: middle !important;
    line-height: 0 !important;
    margin: 0 !important;
    text-decoration: none !important;
}

/* Table cells containing images - inline table for horizontal flow */
:deep(.ql-editor table:has(img)),
:deep(.ql-editor table[style*="inline-table"]) {
    display: inline-table !important;
    border-collapse: collapse !important;
    border: none !important;
    margin: 0 !important;
    padding: 0 !important;
    vertical-align: middle !important;
}

:deep(.ql-editor table:has(img) td),
:deep(.ql-editor table[style*="inline-table"] td) {
    display: table-cell !important;
    padding: 5px !important;
    border: none !important;
    vertical-align: middle !important;
}

/* Force all images to be inline - override Quill's paragraph wrapping */
:deep(.ql-editor p:has(img)),
:deep(.ql-editor p:has(.inline-image-wrapper)),
:deep(.ql-editor p:has(table)) {
    display: inline !important;
    margin: 0 !important;
    padding: 0 !important;
    line-height: 0 !important;
}

:deep(.ql-editor span:has(.inline-image-wrapper)),
:deep(.ql-editor span:has(table:has(img))),
:deep(.ql-editor span:has(table)) {
    display: inline !important;
    white-space: normal !important;
    line-height: 0 !important;
}

/* Inline image wrapper - force inline display */
:deep(.ql-editor .inline-image-wrapper) {
    display: inline-block !important;
    margin: 0 5px !important;
    vertical-align: middle !important;
    line-height: 0 !important;
}

/* Force all tables containing images to be inline, even if wrapped in p or span */
:deep(.ql-editor p table:has(img)),
:deep(.ql-editor span table:has(img)),
:deep(.ql-editor table:has(img)) {
    display: inline-table !important;
    border-collapse: collapse !important;
    border: none !important;
    margin: 0 !important;
    padding: 0 !important;
    vertical-align: middle !important;
}

/* Ensure paragraphs and spans don't create line breaks */
:deep(.ql-editor > p:has(.inline-image-wrapper)),
:deep(.ql-editor > p:has(table)),
:deep(.ql-editor > span:has(.inline-image-wrapper)),
:deep(.ql-editor > span:has(table)) {
    display: inline !important;
    margin: 0 !important;
    padding: 0 !important;
}

/* Preserve flexbox grid system in editor */
:deep(.ql-editor div[style*="display: flex"]) {
    display: flex !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
}

:deep(.ql-editor div[style*="flex: 0 0"]) {
    display: inline-block !important;
    vertical-align: top !important;
    box-sizing: border-box !important;
}

/* Prevent Quill from wrapping flexbox divs in <p> tags */
:deep(.ql-editor p:has(div[style*="display: flex"])) {
    display: block !important;
    margin: 0 !important;
    padding: 0 !important;
}

:deep(.ql-editor img) {
    display: block !important;
    max-width: 100% !important;
    height: auto !important;
    margin: 0 !important;
    padding: 10px !important;
}

/* Remove block-level spacing for image containers */
:deep(.ql-editor span:has(img)) {
    display: inline !important;
    white-space: normal !important;
    line-height: 0 !important;
}

/* Prevent paragraphs from creating line breaks for images */
:deep(.ql-editor p:has(img)) {
    display: inline !important;
    margin: 0 !important;
    padding: 0 !important;
}

/* Force inline for any container with only images */
:deep(.ql-editor p:has(> a > img):not(:has(text))) {
    display: inline !important;
    margin: 0 !important;
    padding: 0 !important;
}

:deep(.ql-editor ul),
:deep(.ql-editor ol) {
    margin: 0.5em 0;
    padding-left: 1.5em;
}

:deep(.ql-editor li) {
    margin: 0.25em 0;
}

:deep(.ql-editor a) {
    color: var(--accent);
    text-decoration: underline;
}

:deep(.ql-editor a:hover) {
    color: var(--accent-hover, #09c);
}

/* Additional dark mode support for Quill editor */
[data-bs-theme="dark"] :deep(.ql-snow) {
    border-color: var(--border);
}

[data-bs-theme="dark"] :deep(.ql-snow .ql-stroke) {
    stroke: var(--text-secondary);
}

[data-bs-theme="dark"] :deep(.ql-snow .ql-fill) {
    fill: var(--text-secondary);
}

[data-bs-theme="dark"] :deep(.ql-snow .ql-picker) {
    color: var(--text-secondary);
}

[data-bs-theme="dark"] :deep(.ql-snow .ql-picker-options) {
    background-color: var(--bg-surface);
    border-color: var(--border);
}

[data-bs-theme="dark"] :deep(.ql-snow .ql-picker-item:hover) {
    background-color: var(--bg-elevated);
    color: var(--accent);
}

[data-bs-theme="dark"] :deep(.ql-snow .ql-picker-item.ql-selected) {
    background-color: var(--bg-elevated);
    color: var(--accent);
}

/* Ensure editor content area adapts to theme - using bg-surface to match form inputs */
[data-bs-theme="dark"] :deep(.ql-editor) {
    background-color: var(--bg-surface);
}

[data-bs-theme="dark"] :deep(.ql-container) {
    background-color: var(--bg-surface);
}

/* PrimeVue Editor container theme support */
[data-bs-theme="dark"] :deep(.p-editor-container) {
    background: var(--bg-surface);
    border-color: var(--border);
}

[data-bs-theme="dark"] :deep(.p-editor-toolbar) {
    background: var(--bg-surface);
    border-color: var(--border);
}

[data-bs-theme="dark"] :deep(.p-editor-content) {
    background: var(--bg-surface);
    border-color: var(--border);
}

/* Table size selector modal styles */
.table-size-selector {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.grid-selector-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.grid-selector-wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    align-items: center;
}

.grid-selector {
    display: inline-grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 2px;
    padding: 6px;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    cursor: pointer;
    user-select: none;
}

.grid-row {
    display: contents;
}

.grid-cell {
    width: 20px;
    height: 20px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    transition: all 0.15s ease;
    cursor: pointer;
    position: relative;
}

.grid-cell:hover {
    transform: scale(1.1);
    z-index: 2;
}

.grid-cell.selected {
    background: var(--accent);
    border-color: var(--accent);
    opacity: 0.6;
}

.grid-cell.hovered {
    background: var(--accent);
    border-color: var(--accent);
    opacity: 0.4;
    z-index: 1;
}

.grid-cell.active {
    background: var(--accent);
    border-color: var(--accent);
    opacity: 1;
    box-shadow: 0 0 0 2px var(--bg-surface), 0 0 0 4px var(--accent);
    z-index: 3;
}

.grid-cell.selected.hovered {
    opacity: 0.7;
}

.grid-selection-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-items: center;
    min-height: auto;
}

.selection-display,
.hover-display {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--font-size-sm);
}

.selection-label,
.hover-label {
    color: var(--text-secondary);
    font-weight: var(--font-weight-medium);
}

.selection-value {
    color: var(--accent);
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-sm);
}

.hover-value {
    color: var(--text-primary);
    font-weight: var(--font-weight-medium);
}

/* Table styling - tables are inserted directly into DOM, not through Quill */
:deep(.ql-editor table),
:deep(.ql-editor table[data-quill-table]) {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
    display: table !important;
    border: 1px solid var(--border, #ddd);
    table-layout: auto;
}

:deep(.ql-editor table thead),
:deep(.ql-editor table tbody),
:deep(.ql-editor table tfoot) {
    display: table-row-group !important;
}

:deep(.ql-editor table tr) {
    display: table-row !important;
}

:deep(.ql-editor table td),
:deep(.ql-editor table th) {
    position: relative;
    padding: 8px;
    border: 1px solid var(--border, #ddd);
    min-width: 100px;
    display: table-cell !important;
    vertical-align: top;
    overflow-wrap: break-word;
    white-space: normal;
}

:deep(.ql-editor table td[contenteditable="true"]),
:deep(.ql-editor table th[contenteditable="true"]) {
    outline: none;
    cursor: text;
}

:deep(.ql-editor table td:focus),
:deep(.ql-editor table th:focus) {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
    background-color: var(--bg-elevated);
}

:deep(.ql-editor table thead th) {
    background-color: var(--bg-elevated, #f2f2f2);
    font-weight: 600;
}

:deep(.ql-editor table tbody td) {
    background-color: var(--bg-surface);
}

/* Allow normal editing outside tables */
:deep(.ql-editor) {
    position: relative;
    user-select: text;
}

:deep(.ql-editor p) {
    min-height: 1em;
}

/* Ensure tables can be selected and deleted */
:deep(.ql-editor table) {
    user-select: contain;
}

/* Make sure clicking outside table works */
:deep(.ql-editor) {
    cursor: text;
}

:deep(.ql-editor table td),
:deep(.ql-editor table th) {
    cursor: text;
}

/* Table button styling - using non-ql class to avoid Quill format detection */
:deep(.custom-table-btn) {
    width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
    background: transparent;
    padding: 0;
    margin: 0 2px;
}

:deep(.custom-table-btn svg) {
    width: 18px;
    height: 18px;
}

:deep(.custom-table-btn svg .ql-stroke) {
    stroke: var(--text-secondary);
    stroke-width: 1.5;
    fill: none;
}

:deep(.custom-table-btn:hover svg .ql-stroke) {
    stroke: var(--accent);
}

:deep(.custom-table-btn:active svg .ql-stroke) {
    stroke: var(--accent);
}

/* Image button styling */
:deep(.custom-image-btn) {
    width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
    background: transparent;
    padding: 0;
    margin: 0 2px;
}

:deep(.custom-image-btn svg) {
    width: 18px;
    height: 18px;
}

:deep(.custom-image-btn svg .ql-stroke) {
    stroke: var(--text-secondary);
    stroke-width: 1.5;
    fill: none;
}

:deep(.custom-image-btn svg .ql-fill) {
    fill: var(--text-secondary);
}

:deep(.custom-image-btn:hover svg .ql-stroke) {
    stroke: var(--accent);
}

:deep(.custom-image-btn:hover svg .ql-fill) {
    fill: var(--accent);
}

:deep(.custom-image-btn:active svg .ql-stroke) {
    stroke: var(--accent);
}

:deep(.custom-image-btn:active svg .ql-fill) {
    fill: var(--accent);
}

/* Image selector modal styles */
.image-selector {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.image-mode-tabs {
    display: flex;
    gap: var(--spacing-xs);
    border-bottom: 1px solid var(--border);
}

.mode-tab {
    padding: var(--spacing-sm) var(--spacing-md);
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    transition: all 0.2s ease;
}

.mode-tab:hover:not(:disabled) {
    color: var(--text-primary);
    background: var(--bg-elevated);
}

.mode-tab.active {
    color: var(--accent);
    border-bottom-color: var(--accent);
}

.mode-tab:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.image-mode-content {
    min-height: 300px;
    max-height: 400px;
    overflow-y: auto;
}

.upload-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.upload-area {
    border: 2px dashed var(--border);
    border-radius: var(--radius-md);
    padding: var(--spacing-lg);
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    background: var(--bg-elevated);
}

.upload-area:hover {
    border-color: var(--accent);
    background: var(--bg-surface);
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
    color: var(--text-secondary);
}

.upload-placeholder svg {
    color: var(--text-secondary);
}

.upload-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
}

.upload-preview img {
    max-width: 100%;
    max-height: 250px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
}

.browse-section {
    display: flex;
    flex-direction: column;
}

.loading-photos,
.no-photos {
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--text-secondary);
}

.photos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: var(--spacing-sm);
    padding: var(--spacing-xs);
}

.photo-item {
    position: relative;
    aspect-ratio: 1;
    border: 2px solid var(--border);
    border-radius: var(--radius-sm);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s ease;
}

.photo-item:hover {
    border-color: var(--accent);
    transform: scale(1.05);
}

.photo-item.selected {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(var(--accent-rgb, 0, 153, 204), 0.2);
}

.photo-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.photo-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgb(0 0 0 / 70%), transparent);
    padding: var(--spacing-xs);
    opacity: 0;
    transition: opacity 0.2s ease;
}

.photo-item:hover .photo-overlay {
    opacity: 1;
}

.photo-note {
    color: white;
    font-size: var(--font-size-xs);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.image-size-selector {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--border);
}

.size-input-group {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

.size-input-group label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    font-weight: var(--font-weight-medium);
    min-width: 50px;
}

.size-input {
    flex: 1;
    padding: var(--spacing-xs) var(--spacing-sm);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: var(--font-size-sm);
}

.size-input:focus {
    outline: none;
    border-color: var(--accent);
}

.unit-select {
    padding: var(--spacing-xs) var(--spacing-sm);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: var(--font-size-sm);
    cursor: pointer;
}

.unit-select:focus {
    outline: none;
    border-color: var(--accent);
}

/* Image resize modal styles */
.image-resize-selector {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.image-preview-container {
    display: flex;
    justify-content: center;
    padding: var(--spacing-md);
    background: var(--bg-elevated);
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
}

.resize-preview-image {
    max-width: 100%;
    max-height: 200px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
}

/* Make images in editor clickable */
:deep(.ql-editor img) {
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
    border-radius: var(--radius-sm);
    position: relative;
}

:deep(.ql-editor img:hover) {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(var(--accent-rgb, 0, 153, 204), 0.1);
    transform: scale(1.02);
}

:deep(.ql-editor img:active) {
    transform: scale(0.98);
}

/* Table of Contents styling - transparent to blend with theme */
:deep(.toc-container) {
    margin: 1.5em 0;
    padding: 1.5em;
    border: none;
    border-radius: var(--radius-md, 8px);
    background: transparent;
    break-inside: avoid;
}

:deep(.toc-title) {
    margin: 0 0 1em;
    padding-bottom: 0.75em;
    font-weight: 700;
    font-size: 1.5em;
    color: var(--text-primary);
    border-bottom: 1px solid transparent;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

:deep(.toc-empty) {
    margin: 0.5em 0;
    color: var(--text-secondary);
    font-style: italic;
    text-align: center;
    padding: 1em;
    opacity: 0.7;
}

:deep(.toc-list) {
    list-style: none;
    padding: 0;
    margin: 0;
}

:deep(.toc-item) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75em 0.5em;
    margin: 0.25em 0;
    border-bottom: 1px solid transparent;
    transition: background-color 0.2s ease;
    border-radius: var(--radius-sm, 4px);
}

:deep(.toc-item:last-child) {
    border-bottom: none;
}

:deep(.toc-item:hover) {
    background-color: transparent;
    padding-left: 0.75em;
    padding-right: 0.75em;
}

:deep(.toc-section-title) {
    flex: 1;
    font-size: 1em;
    font-weight: 500;
    color: var(--text-primary);
    line-height: 1.5;
    padding-right: 1em;
}

:deep(.toc-page-range) {
    color: var(--text-secondary);
    font-size: 0.9em;
    font-weight: 600;
    white-space: nowrap;
    min-width: fit-content;
    padding-left: 1em;
    border-left: 1px solid transparent;
    opacity: 0.8;
}

/* Resize handles container */
:deep(.resize-handles-container) {
    position: absolute;
    pointer-events: none;
    z-index: 1000;
    border: 2px solid var(--accent);
    border-radius: var(--radius-sm);
    box-shadow: 0 0 0 1px rgb(255 255 255 / 50%);
}

/* Resize handles */
:deep(.resize-handle) {
    position: absolute;
    width: 12px;
    height: 12px;
    background: var(--accent);
    border: 2px solid var(--bg-surface);
    border-radius: 50%;
    pointer-events: all;
    cursor: nwse-resize;
    box-shadow: 0 2px 4px rgb(0 0 0 / 20%);
    transition: all 0.2s ease;
}

:deep(.resize-handle:hover) {
    transform: scale(1.2);
    background: var(--accent-hover, var(--accent));
    box-shadow: 0 3px 6px rgb(0 0 0 / 30%);
}

:deep(.resize-handle-nw) {
    top: -6px;
    left: -6px;
    cursor: nwse-resize;
}

:deep(.resize-handle-ne) {
    top: -6px;
    right: -6px;
    cursor: nesw-resize;
}

:deep(.resize-handle-sw) {
    bottom: -6px;
    left: -6px;
    cursor: nesw-resize;
}

:deep(.resize-handle-se) {
    bottom: -6px;
    right: -6px;
    cursor: nwse-resize;
}

/* Auto Parse Toggle Button */
.auto-parse-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-width: 28px;
    height: 28px;
    padding: 0 8px;
    background: transparent;
    border: 1px solid var(--border, #ddd);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--text-secondary, #666);
    user-select: none;
    position: relative;
    font-size: 12px;
    white-space: nowrap;
}

.auto-parse-toggle:hover {
    background: var(--bg-elevated, #f5f5f5);
    border-color: var(--accent, #09c);
    color: var(--accent, #09c);
    transform: scale(1.05);
}

.auto-parse-toggle.active {
    background: var(--accent, #09c);
    border-color: var(--accent, #09c);
    color: white;
    box-shadow: 0 2px 4px rgb(0 153 204 / 30%);
}

.auto-parse-toggle.active:hover {
    background: var(--accent-hover, #08b);
    border-color: var(--accent-hover, #08b);
    transform: scale(1.05);
    box-shadow: 0 2px 6px rgb(0 153 204 / 40%);
}

.auto-parse-toggle i {
    font-size: 14px;
    line-height: 1;
}

.auto-parse-toggle span {
    font-size: 12px;
    line-height: 1;
    font-weight: 500;
}

/* Custom Editor Styles */
.custom-editor {
    border: 1px solid var(--border);
    border-radius: var(--radius-md, 4px);
    background: var(--bg-surface);
    position: relative;
}

.custom-editor.drag-over {
    border-color: var(--accent, #09c);
    background: var(--bg-elevated);
    box-shadow: 0 0 0 2px rgb(0 153 204 / 20%);
}

.custom-toolbar {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs, 8px);
    padding: var(--spacing-xs, 8px);
    border-bottom: 1px solid var(--border);
    background: var(--bg-elevated);
    flex-wrap: wrap;
}

.toolbar-group {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs, 4px);
    padding: 0 var(--spacing-xs, 4px);
    border-right: 1px solid var(--border);
}

.toolbar-group:last-child {
    border-right: none;
}

.toolbar-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius-sm, 4px);
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--text-secondary);
}

.toolbar-btn:hover {
    background: var(--bg-elevated);
    border-color: var(--border);
    color: var(--text-primary);
}

.toolbar-btn:active {
    background: var(--bg-active, var(--bg-elevated));
}

.toolbar-btn.active {
    background: var(--accent, #09c);
    color: white;
    border-color: var(--accent, #09c);
}

.toolbar-btn.active:hover {
    background: var(--accent-hover, #08b);
    border-color: var(--accent-hover, #08b);
}

.toolbar-btn:disabled,
.toolbar-select:disabled,
.toolbar-color:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}

.toolbar-btn-secondary {
    background: var(--bs-secondary-bg, #e9ecef);
    border-color: var(--bs-border-color, #dee2e6);
    color: var(--bs-secondary, #6c757d);
}

.toolbar-btn-secondary:hover {
    background: var(--bs-secondary, #6c757d);
    border-color: var(--bs-secondary, #6c757d);
    color: white;
}

.toolbar-btn-secondary:active {
    background: var(--bs-secondary-dark, #5a6268);
    border-color: var(--bs-secondary-dark, #5a6268);
}

.toolbar-select {
    padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm, 4px);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: var(--font-size-sm, 13px);
    cursor: pointer;
}

.toolbar-select:focus {
    outline: none;
    border-color: var(--accent);
}

.toolbar-color {
    width: 28px;
    height: 28px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm, 4px);
    cursor: pointer;
    padding: 0;
    background: var(--bg-surface);
}

/* Visual selection span (like Stack Overflow example) */
.editor-selected {
    background-color: dodgerblue;
    color: white;
}

[data-bs-theme="dark"] .editor-selected {
    background-color: #06c;
    color: white;
}

.custom-editor-content {
    min-height: 200px;
    max-height: 400px;
    overflow: auto;
    padding: var(--spacing-sm, 12px);
    outline: none;
    background: var(--bg-surface);
    color: var(--text-primary);
    line-height: 1.5;
    overflow-wrap: break-word;
    text-align: left;
    direction: ltr;
    transition: background-color 0.2s, border-color 0.2s;
}

.custom-editor-content:focus {
    outline: none;
}

.custom-editor-content.locked {
    background: var(--bg-elevated, #f5f5f5);
    cursor: not-allowed;
    opacity: 0.8;
    user-select: none;
    pointer-events: none;
}

.custom-editor-content.locked * {
    pointer-events: none;
}

.custom-editor-content.drag-over {
    background: var(--bg-elevated);
    border: 2px dashed var(--accent, #09c);
    border-radius: 4px;
}

/* Ensure proper cursor alignment */
.custom-editor-content p,
.custom-editor-content div {
    margin: 0;
    padding: 0;
    line-height: inherit;
    text-align: left;
}

.custom-editor-content p:not(:last-child) {
    margin-bottom: 0.5em;
}

/* Ensure empty editor shows cursor at start */
.custom-editor-content:empty::before {
    content: '';
    display: inline-block;
}

.custom-editor-content[data-placeholder]:empty::before {
    content: attr(data-placeholder);
    color: var(--text-placeholder, var(--text-secondary));
    pointer-events: none;
}

.custom-editor-content img {
    box-sizing: border-box;
}

/* Only apply max-width: 100% to fit images, not images with explicit dimensions */
.custom-editor-content img[style*="width: 100%"] {
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
}

/* For images with explicit pixel dimensions, preserve them and allow overflow */
.custom-editor-content img:not([style*="width: 100%"], [style*="width:100%"]) {
    /* Don't force max-width on images with explicit dimensions */
    height: auto;
}

.custom-editor-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
}

.custom-editor-content table td,
.custom-editor-content table th {
    border: 1px solid var(--border);
    padding: var(--spacing-sm, 8px);
    background: var(--bg-surface);
    color: var(--text-primary);
}

/* Dark theme support */
[data-bs-theme="dark"] .custom-editor {
    border-color: var(--border);
    background: var(--bg-surface);
}

[data-bs-theme="dark"] .custom-toolbar {
    background: var(--bg-elevated);
    border-color: var(--border);
}

[data-bs-theme="dark"] .custom-editor-content {
    background: var(--bg-surface);
    color: var(--text-primary);
}

[data-bs-theme="dark"] .toolbar-btn {
    color: var(--text-secondary);
}

[data-bs-theme="dark"] .toolbar-btn:hover {
    background: var(--bg-elevated);
    color: var(--text-primary);
}

[data-bs-theme="dark"] .toolbar-select {
    background: var(--bg-surface);
    color: var(--text-primary);
    border-color: var(--border);
}

[data-bs-theme="dark"] .custom-editor-content table td,
[data-bs-theme="dark"] .custom-editor-content table th {
    border-color: var(--border);
    background: var(--bg-surface);
    color: var(--text-primary);
}
</style>
