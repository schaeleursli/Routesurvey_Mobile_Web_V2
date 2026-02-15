<template>
    <div ref="editorContainerRef" class="rich-text-editor" @drop="handleDrop" @dragover="handleDragOver"
        @dragenter="handleDragEnter">
        <Editor ref="editorRef" :modelValue="content" @update:modelValue="handleContentUpdate"
            editorStyle="height: auto; min-height: 200px; max-height: 400px;" :placeholder="placeholder"
            :readonly="!showToolbar">
            <template v-if="showToolbar" v-slot:toolbar>
                <span class="ql-formats">
                    <select class="ql-header">
                        <option value="1">Heading 1</option>
                        <option value="2">Heading 2</option>
                        <option value="3">Heading 3</option>
                        <option value="4">Heading 4</option>
                        <option value="5">Heading 5</option>
                        <option value="6">Heading 6</option>
                        <option selected>Normal</option>
                    </select>
                </span>
                <span class="ql-formats">
                    <button class="ql-bold"></button>
                    <button class="ql-italic"></button>
                    <button class="ql-underline"></button>
                    <button class="ql-strike"></button>
                </span>
                <span class="ql-formats">
                    <select class="ql-color"></select>
                    <select class="ql-background"></select>
                </span>
                <span class="ql-formats">
                    <select class="ql-font"></select>
                    <select class="ql-size"></select>
                </span>
                <span class="ql-formats">
                    <button class="ql-align" value=""></button>
                    <button class="ql-align" value="center"></button>
                    <button class="ql-align" value="right"></button>
                    <button class="ql-align" value="justify"></button>
                </span>
                <span class="ql-formats">
                    <button class="ql-list" value="ordered"></button>
                    <button class="ql-list" value="bullet"></button>
                </span>
                <span class="ql-formats">
                    <button class="ql-indent" value="-1"></button>
                    <button class="ql-indent" value="+1"></button>
                </span>
                <span class="ql-formats">
                    <button class="ql-script" value="sub"></button>
                    <button class="ql-script" value="super"></button>
                </span>
                <span class="ql-formats">
                    <button class="ql-link"></button>
                    <button class="custom-image-btn" @click.stop.prevent="openImageModal" @mousedown.stop.prevent
                        type="button" title="Insert Image">
                        <svg viewBox="0 0 18 18">
                            <rect class="ql-stroke" x="3" y="3" width="12" height="12"></rect>
                            <circle class="ql-fill" cx="6" cy="6" r="1"></circle>
                            <polyline class="ql-even ql-stroke" points="5 8 8 11 11 8 13 10 13 14 5 14 5 8"></polyline>
                        </svg>
                    </button>
                    <button class="custom-table-btn" @click.stop.prevent="insertTable" @mousedown.stop.prevent
                        type="button" title="Insert Table">
                        <svg viewBox="0 0 18 18">
                            <rect class="ql-stroke" x="3" y="3" width="12" height="12"></rect>
                            <line class="ql-stroke" x1="9" y1="3" x2="9" y2="15"></line>
                            <line class="ql-stroke" x1="3" y1="9" x2="15" y2="9"></line>
                        </svg>
                    </button>
                </span>
                <span class="ql-formats">
                    <button class="ql-clean"></button>
                </span>
                <span class="ql-formats">
                    <button class="auto-parse-toggle" :class="{ 'active': autoParseEnabled }"
                        @click.stop.prevent="toggleAutoParse" type="button"
                        :title="autoParseEnabled ? 'Auto Parse: ON (Click to disable)' : 'Auto Parse: OFF (Click to enable)'">
                        <i class="bi"
                            :class="autoParseEnabled ? 'bi-lightning-charge-fill' : 'bi-lightning-charge'"></i>
                    </button>
                </span>
            </template>
        </Editor>

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
import Editor from 'primevue/editor';
import { MASLUtility } from '@/utils/masl_utility';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import FileManagementController from '@/controllers/file_management/file_management_controller';
import RoutesController from '@/controllers/routes/routes_controller';

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
    }
});

const emit = defineEmits(['update:modelValue', 'loop-drop']);

const content = ref(props.modelValue || '');
const editorRef = ref(null);
const editorContainerRef = ref(null);
const quillInstance = ref(null);
const parseTimeout = ref(null);
const parsedContentCache = ref(new Map());
const isParsing = ref(false);
const autoParseEnabled = ref(props.autoParseDefault); // Toggle for auto-parsing MASL expressions

// Table insertion modal state
const showTableModal = ref(false);
const tableRows = ref(3);
const tableColumns = ref(3);
const hoveredRows = ref(0);
const hoveredColumns = ref(0);
const isInsertingTable = ref(false); // Guard to prevent accidental insertion
const tableMutationObserver = ref(null); // Observer to fix corrupted tables

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

// Setup Quill text-change listener
function setupQuillListener() {
    if (quillInstance.value) {
        // Remove existing listener if any (if we're re-setting up)
        try {
            quillInstance.value.off('text-change');
        } catch (e) {
            // Ignore if listener doesn't exist
        }

        // Listen to Quill text changes to trigger parsing
        quillInstance.value.on('text-change', () => {
            if (isParsing.value || isResizing.value) {
                return; // Don't update during parsing or resizing
            }

            // Check if selected image was deleted
            if (selectedImage.value && !quillInstance.value.root.contains(selectedImage.value)) {
                hideResizeHandles();
            }

            // Get current HTML content from Quill
            const editorRoot = quillInstance.value.root;
            let htmlContent = editorRoot.innerHTML;

            // Continuously remove <p> tags around images, tables, and flexbox divs to keep them inline
            // This is needed because Quill wraps content in <p> tags on every change
            const paragraphs = Array.from(editorRoot.querySelectorAll('p'));
            let contentChanged = false;
            paragraphs.forEach(p => {
                const images = p.querySelectorAll('img');
                const tables = p.querySelectorAll('table');
                const flexboxDivs = p.querySelectorAll('div[style*="display: flex"]');
                const textContent = p.textContent?.trim() || '';

                // If paragraph contains flexbox divs, unwrap them (preserve flexbox structure)
                if (flexboxDivs.length > 0) {
                    // Create a fragment to hold the children
                    const fragment = document.createDocumentFragment();
                    while (p.firstChild) {
                        fragment.appendChild(p.firstChild);
                    }
                    // Replace <p> with its children directly
                    if (p.parentNode) {
                        p.parentNode.replaceChild(fragment, p);
                        contentChanged = true;
                    }
                }
                // If paragraph only contains images or tables (no text), unwrap to make them inline
                else if ((images.length > 0 || tables.length > 0) && textContent === '') {
                    // Create a span that allows inline flow with natural wrapping
                    const span = document.createElement('span');
                    span.style.cssText = 'display: inline !important; white-space: normal !important; line-height: 0 !important;';
                    while (p.firstChild) {
                        span.appendChild(p.firstChild);
                    }

                    // Replace <p> with inline span
                    if (p.parentNode) {
                        p.parentNode.replaceChild(span, p);
                        contentChanged = true;
                    }
                }
            });

            // If we unwrapped any paragraphs, get the updated HTML and set flag to prevent loop
            if (contentChanged) {
                isParsing.value = true; // Prevent infinite loop
                htmlContent = editorRoot.innerHTML;
                // Reset flag after a microtask to allow this update to complete
                Promise.resolve().then(() => {
                    isParsing.value = false;
                });
            }

            // Wrap images in table cells for better inline control
            wrapImagesInTableCells(editorRoot);

            // Always enforce inline styles on images to prevent Quill from breaking them
            const imagesInEditor = editorRoot.querySelectorAll('img');
            const links = editorRoot.querySelectorAll('a[href][target="_blank"]');
            links.forEach(link => {
                const existingStyle = link.getAttribute('style') || '';
                if (!existingStyle.includes('display: inline-block !important')) {
                    link.style.cssText = existingStyle + (existingStyle ? ' ' : '') + 'display: inline-block !important; vertical-align: middle !important; line-height: 0 !important; margin: 0 !important;';
                }
            });
            imagesInEditor.forEach(img => {
                const existingStyle = img.getAttribute('style') || '';
                if (!existingStyle.includes('display: block !important')) {
                    img.style.cssText = existingStyle + (existingStyle ? ' ' : '') + 'display: block !important; max-width: 100% !important; height: auto !important; padding: 10px !important;';
                }
            });

            // Check if tables are being stripped
            const tables = editorRoot.querySelectorAll('table');
            if (tables.length > 0) {
                // Verify table structure is intact (no headers, just body rows)
                tables.forEach((table, idx) => {
                    const bodyRows = table.querySelectorAll('tbody tr').length;
                    const firstRowCells = table.querySelector('tbody tr') ? table.querySelector('tbody tr').querySelectorAll('td').length : 0;
                    if (bodyRows === 0 || firstRowCells === 0) {
                        console.warn(`Table ${idx} structure corrupted:`, { bodyRows, firstRowCells });
                    }
                });
            }

            // Only update if different to avoid infinite loops
            if (htmlContent !== content.value) {
                content.value = htmlContent;
            }
        });
    }
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
    // Get editor root
    let editorRoot = null;
    if (quillInstance.value && quillInstance.value.root) {
        editorRoot = quillInstance.value.root;
    } else if (editorContainerRef.value) {
        editorRoot = editorContainerRef.value.querySelector('.ql-editor');
    } else if (editorRef.value) {
        const editorElement = editorRef.value.$el || editorRef.value;
        editorRoot = editorElement?.querySelector('.ql-editor');
    }

    if (!editorRoot) {
        return;
    }

    // Find all images and ensure their styles and attributes are preserved
    const images = editorRoot.querySelectorAll('img');
    images.forEach(img => {
        // Get width and height from attributes first (more reliable)
        let width = img.getAttribute('width');
        let height = img.getAttribute('height');

        // If not in attributes, try to get from style
        if (!width || !height) {
            const styleAttr = img.getAttribute('style') || '';
            const widthMatch = styleAttr.match(/width\s*:\s*([\d.]+)\s*(px|%)?/i);
            const heightMatch = styleAttr.match(/height\s*:\s*([\d.]+)\s*(px|%)?/i);

            if (widthMatch && !width) {
                width = widthMatch[1];
            }
            if (heightMatch && !height) {
                height = heightMatch[1];
            }
        }

        // Set attributes if we have values
        if (width) {
            img.setAttribute('width', width);
            // Also ensure it's in style
            let style = img.getAttribute('style') || '';
            style = style.replace(/width\s*:\s*[^;]+;?/gi, '').trim();
            style = style.replace(/;;+/g, ';').replace(/^;|;$/g, '').trim();
            style += (style ? ' ' : '') + `width: ${width}px;`;
            img.setAttribute('style', style);
            img.style.width = `${width}px`;
        }

        if (height) {
            img.setAttribute('height', height);
            // Also ensure it's in style
            let style = img.getAttribute('style') || '';
            style = style.replace(/height\s*:\s*[^;]+;?/gi, '').trim();
            style = style.replace(/;;+/g, ';').replace(/^;|;$/g, '').trim();
            style += (style ? ' ' : '') + `height: ${height}px;`;
            img.setAttribute('style', style);
            img.style.height = `${height}px`;
        }
    });
}

// Setup image resize handlers for all images in editor
function setupImageHandlers() {
    // Get editor root
    let editorRoot = null;
    if (quillInstance.value && quillInstance.value.root) {
        editorRoot = quillInstance.value.root;
    } else if (editorContainerRef.value) {
        editorRoot = editorContainerRef.value.querySelector('.ql-editor');
    } else if (editorRef.value) {
        const editorElement = editorRef.value.$el || editorRef.value;
        editorRoot = editorElement?.querySelector('.ql-editor');
    }

    if (!editorRoot) {
        console.warn('setupImageHandlers: Editor root not found');
        return;
    }

    // Restore image styles first
    restoreImageStyles();

    // Attach handlers to all existing images
    const attachToAllImages = () => {
        const images = editorRoot.querySelectorAll('img');
        console.log(`setupImageHandlers: Found ${images.length} images to attach handlers to`);

        images.forEach((img, index) => {
            console.log(`Attaching handler to image ${index + 1}:`, img, 'src:', img.src);
            // Always remove the attribute to force re-attachment
            img.removeAttribute('data-resize-handler-attached');
            // Ensure image is draggable and has proper cursor
            img.draggable = true;
            img.style.cursor = 'grab';
            // Make sure image is visible and in the DOM
            if (!img.offsetParent && img.style.display === 'none') {
                console.warn(`Image ${index + 1} is not visible`);
            }
            // Attach handlers
            attachImageResizeHandler(img);
            const hasHandler = img.hasAttribute('data-resize-handler-attached');
            console.log(`Handler attached to image ${index + 1}, hasAttribute:`, hasHandler, 'hasEventListeners:', img.onclick !== null);

            // Test if click works by adding a test listener
            const testClick = () => {
                console.log(`TEST: Image ${index + 1} click detected!`);
            };
            img.addEventListener('click', testClick, { capture: true, once: true });
        });
    };

    attachToAllImages();

    // Watch for new images and deleted images
    const observer = new MutationObserver((mutations) => {
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

        // Re-attach handlers if images changed
        if (imagesChanged) {
            attachToAllImages();
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
    img.setAttribute('width', Math.round(newWidth).toString());
    img.setAttribute('height', Math.round(newHeight).toString());

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
    let editorRoot = null;
    if (quillInstance.value && quillInstance.value.root) {
        editorRoot = quillInstance.value.root;
    } else if (editorContainerRef.value) {
        editorRoot = editorContainerRef.value.querySelector('.ql-editor');
    }

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
        const updatedContent = editorRoot.innerHTML;
        content.value = updatedContent;

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
    if (!quillInstance.value) return;

    const editorRoot = quillInstance.value.root;

    // Sync table content changes back to Quill
    const syncTableContent = () => {
        if (!isParsing.value) {
            const html = editorRoot.innerHTML;
            if (html !== content.value) {
                content.value = html;
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
            console.log('No cell found');
            // Clear any remaining highlights
            if (dragOverCell) {
                dragOverCell.style.backgroundColor = '';
                dragOverCell.style.userSelect = '';
                dragOverCell.style.webkitUserSelect = '';
                dragOverCell = null;
            }
            return;
        }

        console.log('Cell found:', cell);

        // Check if this is an image drag
        const hasDraggingImage = editorRoot.querySelector('img[data-dragging="true"]');
        const hasHtmlType = e.dataTransfer.types.includes('text/html');
        const hasImageType = e.dataTransfer.types.includes('application/x-image-element');
        const isImageDrag = hasHtmlType && (hasImageType || hasDraggingImage);

        console.log('Image drag check:', { hasDraggingImage: !!hasDraggingImage, hasHtmlType, hasImageType, isImageDrag });

        if (!isImageDrag) {
            console.log('Not an image drag, returning');
            // Clear highlights even if not an image drag
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

// Get Quill instance after component is mounted
onMounted(async () => {
    await nextTick();

    // Try multiple times to get Quill instance (it might not be ready immediately)
    const tryGetQuill = async (attempts = 0) => {
        if (editorRef.value) {
            const editorElement = editorRef.value.$el || editorRef.value;
            if (editorElement) {
                const quillEditor = editorElement.querySelector('.ql-editor');
                if (quillEditor && quillEditor.__quill) {
                    quillInstance.value = quillEditor.__quill;
                    console.log('Quill instance found via __quill');
                    setupQuillListener();
                    setupTableHandlers();

                    // Register clipboard matcher to prevent Quill from wrapping images in <p> tags
                    if (quillInstance.value && quillInstance.value.clipboard) {
                        quillInstance.value.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
                            // If node is an image or contains images, don't wrap in <p>
                            if (node.tagName === 'IMG' || node.querySelector('img') || node.classList.contains('inline-image-wrapper')) {
                                return delta.compose(delta.retain(delta.length()));
                            }
                            return delta;
                        });
                    }

                    // Delay image handlers setup slightly to ensure DOM is ready
                    setTimeout(() => {
                        setupImageHandlers();
                    }, 100);
                    return;
                } else if (editorRef.value.getQuill) {
                    quillInstance.value = editorRef.value.getQuill();
                    console.log('Quill instance found via getQuill');
                    setupQuillListener();
                    setupTableHandlers();
                    // Delay image handlers setup slightly to ensure DOM is ready
                    setTimeout(() => {
                        setupImageHandlers();
                    }, 100);
                    return;
                }
            }
        }

        // Retry if not found and we haven't exceeded attempts
        if (attempts < 5) {
            await nextTick();
            setTimeout(() => tryGetQuill(attempts + 1), 100);
        }
    };

    await tryGetQuill();

    // Function to enforce inline styles on images and remove <p> wrappers
    const enforceImageInlineStyles = () => {
        if (!quillInstance.value || !quillInstance.value.root) return;

        const editorRoot = quillInstance.value.root;

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
            if (!existingStyle.includes('display: block')) {
                img.style.cssText = existingStyle + (existingStyle ? ' ' : '') + 'display: block !important; max-width: 100% !important; height: auto !important; padding: 10px !important;';
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

    // Also set up a periodic check to ensure all images have handlers and inline styles
    // This is especially important for images loaded after initial mount
    const checkImagesInterval = setInterval(() => {
        enforceImageInlineStyles();
        if (quillInstance.value && quillInstance.value.root) {
            const editorRoot = quillInstance.value.root;
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
    }, 1000); // Check every second

    // Store interval for cleanup
    if (quillInstance.value && quillInstance.value.root) {
        quillInstance.value.root._imageCheckInterval = checkImagesInterval;
    }
});

// Cleanup on unmount
onBeforeUnmount(() => {
    hideResizeHandles();

    // Clean up image handler intervals and mutation observer
    if (quillInstance.value && quillInstance.value.root) {
        const editorRoot = quillInstance.value.root;
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

// Handle content update from Editor component
function handleContentUpdate(newValue) {
    if (!isParsing.value && newValue !== content.value) {
        content.value = newValue || '';
    }
}

// Watch for external changes to modelValue
watch(() => props.modelValue, async (newVal) => {
    if (newVal !== content.value && !isParsing.value) {
        isParsing.value = true;

        // Preserve image styles when loading content
        let processedContent = newVal || '';
        if (processedContent) {
            processedContent = preserveImageStyles(processedContent);
        }

        if (quillInstance.value) {
            // Use Quill's paste method to preserve styles better
            quillInstance.value.clipboard.dangerouslyPasteHTML(processedContent);
            await nextTick();

            // Ensure images have their styles after paste
            const editorRoot = quillInstance.value.root;

            // Remove <p> tags around images to keep them inline
            const paragraphs = Array.from(editorRoot.querySelectorAll('p'));
            paragraphs.forEach(p => {
                const images = p.querySelectorAll('img');
                const textContent = p.textContent?.trim() || '';

                // If paragraph only contains images (no text), unwrap to make images inline
                if (images.length > 0 && textContent === '') {
                    // Create a span that allows inline flow with natural wrapping
                    const span = document.createElement('span');
                    span.style.display = 'inline';
                    span.style.whiteSpace = 'normal';
                    while (p.firstChild) {
                        span.appendChild(p.firstChild);
                    }
                    // Replace <p> with inline span
                    if (p.parentNode) {
                        p.parentNode.replaceChild(span, p);
                    }
                }
            });

            // Wrap images in table cells
            wrapImagesInTableCells(editorRoot);

            const images = editorRoot.querySelectorAll('img');
            images.forEach(img => {
                const styleAttr = img.getAttribute('style');
                if (styleAttr) {
                    // Re-apply style to ensure it's preserved
                    img.setAttribute('style', styleAttr);
                }
                // Remove handler attribute to force re-attachment
                img.removeAttribute('data-resize-handler-attached');
            });

            // Update content from the actual DOM
            content.value = editorRoot.innerHTML;
        } else {
            content.value = processedContent;
        }

        isParsing.value = false;

        // Setup image handlers after content is loaded (with multiple delayed attempts)
        // This ensures handlers are attached even if images load asynchronously
        await nextTick();

        // Immediate attempt
        console.log('Setting up image handlers after modelValue load (immediate)');
        setupImageHandlers();

        // Delayed attempts to catch any late-rendered images
        setTimeout(() => {
            console.log('Setting up image handlers after modelValue load (300ms delay)');
            setupImageHandlers();
        }, 300);

        setTimeout(() => {
            console.log('Setting up image handlers after modelValue load (800ms delay)');
            setupImageHandlers();
        }, 800);

        setTimeout(() => {
            console.log('Setting up image handlers after modelValue load (1500ms delay)');
            setupImageHandlers();
        }, 1500);

        setTimeout(() => {
            console.log('Setting up image handlers after modelValue load (2500ms delay)');
            setupImageHandlers();
        }, 2500);
    }
}, { immediate: true });

// Watch content changes and emit
watch(content, (newContent) => {
    if (newContent !== props.modelValue && !isParsing.value) {
        emit('update:modelValue', newContent || '');
    }

    // Re-attach handlers to images when content changes
    if (!isParsing.value) {
        setTimeout(() => {
            setupImageHandlers();
        }, 100);
    }
});

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
watch([content, () => props.routeId], async ([newContent, routeId]) => {
    if (!routeId || !newContent || isParsing.value || !autoParseEnabled.value) {
        return;
    }

    // Skip if this content was already parsed with the same routeId
    if (lastParsedContent.value === newContent && lastRouteId.value === routeId) {
        return;
    }

    // Check if content contains MASL expressions (check both HTML and text content)
    // MASL expressions can appear in HTML like <p>@survey('name')</p> or as plain text
    const maslPattern = /@(survey|point|user|plannedroute|date|beginfor|endfor|mapscreenshot|noteimg|note|pointimg)\s*\([^)]*\)|@date|@beginfor|@endfor/g;

    // Check both HTML content and text content
    const hasMaslInHtml = maslPattern.test(newContent);

    // Also check text content (extract from HTML)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = newContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    const hasMaslInText = maslPattern.test(textContent);

    const hasMaslExpressions = hasMaslInHtml || hasMaslInText;

    if (!hasMaslExpressions) {
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
        const currentContent = quillInstance.value ? quillInstance.value.root.innerHTML : content.value;
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
        const currentContent = quillInstance.value ? quillInstance.value.root.innerHTML : content.value;
        if (currentContent) {
            // Check if content contains MASL expressions
            const maslPattern = /@(survey|point|user|plannedroute|date|beginfor|endfor|mapscreenshot|noteimg|note|pointimg)\s*\([^)]*\)|@date|@beginfor|@endfor/g;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = currentContent;
            const textContent = tempDiv.textContent || tempDiv.innerText || '';
            const hasMaslExpressions = maslPattern.test(currentContent) || maslPattern.test(textContent);

            if (hasMaslExpressions) {
                // Clear any existing timeout
                if (parseTimeout.value) {
                    clearTimeout(parseTimeout.value);
                }
                // Parse immediately when toggle is turned on
                parseMaslContent(currentContent, props.routeId);
            }
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

// Parse MASL content in the editor
async function parseMaslContent(htmlContent, routeId) {
    if (isParsing.value) {
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

        // Setup image handlers after parsing completes with multiple delayed attempts
        console.log('Setting up image handlers after MASL parsing (immediate)');
        setupImageHandlers();

        setTimeout(() => {
            console.log('Setting up image handlers after MASL parsing (300ms delay)');
            setupImageHandlers();
        }, 300);

        setTimeout(() => {
            console.log('Setting up image handlers after MASL parsing (800ms delay)');
            setupImageHandlers();
        }, 800);

        setTimeout(() => {
            console.log('Setting up image handlers after MASL parsing (1500ms delay)');
            setupImageHandlers();
        }, 1500);
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
        // Get width and height from style attribute first, then from width/height attributes
        const styleAttr = img.getAttribute('style') || '';
        let width = null;
        let height = null;

        // Extract from style
        const widthMatch = styleAttr.match(/width\s*:\s*([\d.]+)\s*(px|%)?/i);
        const heightMatch = styleAttr.match(/height\s*:\s*([\d.]+)\s*(px|%)?/i);

        if (widthMatch) {
            width = widthMatch[1];
        } else if (img.hasAttribute('width')) {
            width = img.getAttribute('width');
        }

        if (heightMatch) {
            height = heightMatch[1];
        } else if (img.hasAttribute('height')) {
            height = img.getAttribute('height');
        }

        // Ensure both style and attributes are set
        if (width) {
            img.setAttribute('width', width);
            // Update style to include width
            let style = styleAttr.replace(/width\s*:\s*[^;]+;?/gi, '').trim();
            style = style.replace(/;;+/g, ';').replace(/^;|;$/g, '').trim();
            style += (style ? ' ' : '') + `width: ${width}px;`;
            img.setAttribute('style', style);
        }

        if (height) {
            img.setAttribute('height', height);
            // Update style to include height
            let style = img.getAttribute('style') || '';
            style = style.replace(/height\s*:\s*[^;]+;?/gi, '').trim();
            style = style.replace(/;;+/g, ';').replace(/^;|;$/g, '').trim();
            style += (style ? ' ' : '') + `height: ${height}px;`;
            img.setAttribute('style', style);
        }
    });

    return tempDiv.innerHTML;
}

// Helper to update editor content without triggering watcher
async function updateEditorContent(newContent) {
    await nextTick();

    if (quillInstance.value) {
        // Temporarily disable watcher by setting flag
        isParsing.value = true;

        // Convert any \n to <br /> before pasting
        let contentToPaste = convertNewlinesToBr(newContent);

        // Preserve image styles before pasting
        contentToPaste = preserveImageStyles(contentToPaste);

        // Get editor root - we'll insert directly like tables do
        const editorRootForInsert = quillInstance.value.root;
        if (!editorRootForInsert) {
            isParsing.value = false;
            return;
        }

        // Check if content contains flexbox divs (from grid system) or images
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = contentToPaste;
        const hasImages = tempDiv.querySelector('img');
        const hasFlexboxDivs = tempDiv.querySelector('div[style*="display: flex"]');

        // If content has flexbox divs (grid system) or images, insert directly like tables
        // This preserves the flexbox structure that Quill would otherwise break
        if (hasFlexboxDivs || hasImages) {
            // Insert the entire parsed structure directly into DOM (like tables do)
            // This bypasses Quill's processing which would break flexbox layouts
            const nodesToInsert = Array.from(tempDiv.childNodes);

            nodesToInsert.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Clone the entire element structure (preserves flexbox divs)
                    const clonedNode = node.cloneNode(true);

                    // Ensure flexbox divs maintain their styles
                    if (clonedNode.style && clonedNode.style.display === 'flex') {
                        clonedNode.style.cssText = clonedNode.style.cssText || '';
                        if (!clonedNode.style.cssText.includes('display: flex')) {
                            clonedNode.style.cssText += ' display: flex !important;';
                        }
                    }

                    // Wrap images in inline-image-wrapper if not already in a flexbox div
                    const imagesInNode = clonedNode.querySelectorAll('img');
                    imagesInNode.forEach(img => {
                        if (!img.closest('div[style*="display: flex"]') && !img.closest('.inline-image-wrapper')) {
                            const link = img.closest('a');
                            const container = link || img;
                            const wrapper = document.createElement('span');
                            wrapper.className = 'inline-image-wrapper';
                            wrapper.style.cssText = 'display: inline-block !important; margin: 0 5px !important; vertical-align: middle !important; line-height: 0 !important;';

                            const clonedContainer = container.cloneNode(true);
                            wrapper.appendChild(clonedContainer);
                            container.parentNode?.replaceChild(wrapper, container);
                        }
                    });

                    editorRootForInsert.appendChild(clonedNode);
                } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                    // Insert text nodes
                    editorRootForInsert.appendChild(node.cloneNode(true));
                }
            });
        } else {
            // No flexbox or images, use normal paste
            quillInstance.value.clipboard.dangerouslyPasteHTML(contentToPaste);
        }

        // After paste, process the content to remove <p> tags around images (Quill wraps images in <p> which creates line breaks)
        await nextTick();
        const editorRootAfterPaste = quillInstance.value.root;

        // Wrap images in inline wrappers first
        wrapImagesInTableCells(editorRootAfterPaste);

        // Find paragraphs that only contain images and unwrap them
        const paragraphs = Array.from(editorRootAfterPaste.querySelectorAll('p'));
        paragraphs.forEach(p => {
            const imagesInPara = p.querySelectorAll('img');
            const textContent = p.textContent?.trim() || '';

            // If paragraph only contains images (no text), unwrap to make images inline
            if (imagesInPara.length > 0 && textContent === '') {
                // Preserve all existing styles on images and links before unwrapping
                const styleMap = new Map();
                imagesInPara.forEach((img, idx) => {
                    const imgStyles = img.getAttribute('style') || '';
                    const link = img.closest('a');
                    const linkStyles = link ? (link.getAttribute('style') || '') : '';
                    styleMap.set(idx, { imgStyles, linkStyles, link });
                });

                // Create a span that allows inline flow with natural wrapping
                const span = document.createElement('span');
                span.style.cssText = 'display: inline !important; white-space: normal !important; line-height: 0 !important;';
                while (p.firstChild) {
                    span.appendChild(p.firstChild);
                }

                // Restore all styles after moving to span
                imagesInPara.forEach((img, idx) => {
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

                // Replace <p> with inline span
                if (p.parentNode) {
                    p.parentNode.replaceChild(span, p);
                }
            }
        });

        // Update content ref after processing
        const updatedContent = editorRoot.innerHTML;
        content.value = updatedContent;

        // Ensure images still have their styles and remove handler attributes
        await nextTick();
        const images = editorRoot.querySelectorAll('img');
        images.forEach(img => {
            const styleAttr = img.getAttribute('style');
            if (styleAttr) {
                // Re-apply the style to ensure it's preserved
                img.setAttribute('style', styleAttr);
                // Also set on style object
                const styleObj = styleAttr.split(';').reduce((acc, rule) => {
                    const [prop, value] = rule.split(':').map(s => s.trim());
                    if (prop && value) {
                        acc[prop] = value;
                    }
                    return acc;
                }, {});
                Object.assign(img.style, styleObj);
            }
            // Force inline-block display on links and preserve all existing styles
            if (img.parentElement && img.parentElement.tagName === 'A') {
                const existingLinkStyle = img.parentElement.getAttribute('style') || '';
                img.parentElement.style.cssText = existingLinkStyle + (existingLinkStyle ? ' ' : '') + 'display: inline-block !important; vertical-align: middle !important; line-height: 0 !important; margin: 0 5px !important;';
            }
            // Image itself should be block to respect width/height, preserve existing styles
            const existingImgStyle = img.getAttribute('style') || '';
            img.style.cssText = existingImgStyle + (existingImgStyle ? ' ' : '') + 'display: block !important; max-width: 100% !important; height: auto !important; padding: 10px !important;';
            // Remove handler attribute to force re-attachment
            img.removeAttribute('data-resize-handler-attached');
        });

        // Try to restore cursor position at the end of the content
        await nextTick();
        const newLength = quillInstance.value.getLength();
        // Place cursor at the end
        quillInstance.value.setSelection(newLength - 1, 'user');

        await nextTick();
        isParsing.value = false;

        // Setup image handlers after content is updated with multiple delayed attempts
        console.log('Setting up image handlers after updateEditorContent (immediate)');
        setupImageHandlers();

        setTimeout(() => {
            console.log('Setting up image handlers after updateEditorContent (300ms delay)');
            setupImageHandlers();
        }, 300);

        setTimeout(() => {
            console.log('Setting up image handlers after updateEditorContent (800ms delay)');
            setupImageHandlers();
        }, 800);

        setTimeout(() => {
            console.log('Setting up image handlers after updateEditorContent (1500ms delay)');
            setupImageHandlers();
        }, 1500);
    } else {
        // Convert newlines for non-Quill fallback
        let processedContent = convertNewlinesToBr(newContent);
        processedContent = preserveImageStyles(processedContent);
        content.value = processedContent;

        // Setup image handlers for non-Quill case too with delays
        console.log('Setting up image handlers after updateEditorContent (non-Quill, immediate)');
        setupImageHandlers();

        setTimeout(() => {
            console.log('Setting up image handlers after updateEditorContent (non-Quill, 300ms delay)');
            setupImageHandlers();
        }, 300);

        setTimeout(() => {
            console.log('Setting up image handlers after updateEditorContent (non-Quill, 800ms delay)');
            setupImageHandlers();
        }, 800);
    }
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

    if (event.dataTransfer.types.length > 0) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }
}

function handleDragEnter(event) {
    const blockType = event.dataTransfer.getData('block-type');
    if (blockType === 'variable') {
        event.preventDefault();
    }
}

async function handleDrop(event) {
    // Check if this is an image drag - let table handlers deal with it
    const hasDraggingImage = event.target.closest('.ql-editor')?.querySelector('img[data-dragging="true"]');
    const hasHtmlType = event.dataTransfer.types.includes('text/html');
    const hasImageType = event.dataTransfer.types.includes('application/x-image-element');
    const isImageDrag = hasHtmlType && (hasImageType || hasDraggingImage);

    // If it's an image drag and we're over a table cell, let the table handler deal with it
    if (isImageDrag && event.target.closest('td, th')) {
        return; // Don't handle it here, let table handler process it
    }

    const blockType = event.dataTransfer.getData('block-type');
    const hasVariableData = event.dataTransfer.types.some(type =>
        type.includes('application/json') || type.includes('text/plain')
    );

    // If it's a loop block, emit event to parent to handle it
    if (blockType === 'loop') {
        event.preventDefault();
        event.stopPropagation();

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
            editorElement: editorRef.value?.$el || editorRef.value
        });
        return;
    }

    if (blockType === 'variable' || hasVariableData) {
        event.preventDefault();
        event.stopPropagation();

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
            await nextTick();

            let quill = quillInstance.value;
            if (!quill && editorRef.value) {
                const editorElement = editorRef.value.$el || editorRef.value;
                if (editorElement) {
                    const quillEditor = editorElement.querySelector?.('.ql-editor');
                    if (quillEditor && quillEditor.__quill) {
                        quill = quillEditor.__quill;
                        quillInstance.value = quill;
                    }
                }
                if (!quill && editorRef.value.getQuill) {
                    quill = editorRef.value.getQuill();
                    quillInstance.value = quill;
                }
            }

            if (quill) {
                const range = quill.getSelection(true);
                const currentIndex = range ? range.index : quill.getLength();

                // Insert expression with newlines converted to line breaks
                const newIndex = insertTextWithNewlines(quill, currentIndex, config.value);
                quill.setSelection(newIndex, 'user');

                await nextTick();
                const updatedContent = quill.root.innerHTML;
                content.value = updatedContent;
            } else {
                const currentContent = content.value || '';
                const newContent = currentContent + escapeHtml(config.value);
                content.value = newContent;
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

// Convert text with newlines to Quill-compatible format
function insertTextWithNewlines(quill, index, text) {
    // Split by newlines and insert each part
    const lines = text.split('\n');
    let currentIndex = index;

    for (let i = 0; i < lines.length; i++) {
        if (i > 0) {
            // Insert a newline (Quill handles this as a line break)
            quill.insertText(currentIndex, '\n', 'user');
            currentIndex += 1;
        }
        if (lines[i]) {
            quill.insertText(currentIndex, lines[i], 'user');
            currentIndex += lines[i].length;
        }
    }

    return currentIndex;
}

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

// Close table modal
function closeTableModal() {
    showTableModal.value = false;
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
        if (quillInstance.value && quillInstance.value.root) {
            editorRoot = quillInstance.value.root;
        } else if (editorContainerRef.value) {
            const quillEditor = editorContainerRef.value.querySelector?.('.ql-editor');
            if (quillEditor) {
                editorRoot = quillEditor;
            }
        }
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

// Helper function to get Quill instance or editor root directly
async function getQuillInstanceOrRoot(retries = 5) {
    // First try cached instance
    if (quillInstance.value) {
        return { quill: quillInstance.value, root: quillInstance.value.root };
    }

    // Try to get from editorContainerRef first (most reliable)
    if (editorContainerRef.value) {
        const quillEditor = editorContainerRef.value.querySelector?.('.ql-editor');
        if (quillEditor) {
            if (quillEditor.__quill) {
                quillInstance.value = quillEditor.__quill;
                return { quill: quillInstance.value, root: quillEditor };
            }
            return { quill: null, root: quillEditor };
        }
    }

    // Try to get from editorRef
    for (let attempt = 0; attempt < retries; attempt++) {
        if (editorRef.value) {
            const editorElement = editorRef.value.$el || editorRef.value;
            if (editorElement) {
                // Method 1: Find .ql-editor and get __quill
                const quillEditor = editorElement.querySelector?.('.ql-editor');
                if (quillEditor) {
                    if (quillEditor.__quill) {
                        quillInstance.value = quillEditor.__quill;
                        return { quill: quillInstance.value, root: quillEditor };
                    }
                    // Even if no __quill, return the root element
                    return { quill: null, root: quillEditor };
                }

                // Method 2: Try getQuill method
                if (editorRef.value.getQuill) {
                    const quill = editorRef.value.getQuill();
                    if (quill) {
                        quillInstance.value = quill;
                        return { quill: quillInstance.value, root: quill.root };
                    }
                }
            }
        }

        // Also try editorContainerRef again (in case it wasn't ready)
        if (editorContainerRef.value) {
            const quillEditor = editorContainerRef.value.querySelector?.('.ql-editor');
            if (quillEditor) {
                if (quillEditor.__quill) {
                    quillInstance.value = quillEditor.__quill;
                    return { quill: quillInstance.value, root: quillEditor };
                }
                return { quill: null, root: quillEditor };
            }
        }

        // Wait before retry
        if (attempt < retries - 1) {
            await nextTick();
            await new Promise(resolve => setTimeout(resolve, 100));
        }
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
        const editorInfo = await getQuillInstanceOrRoot(5);

        if (!editorInfo || !editorInfo.root) {
            console.error('Editor root not found after retries');
            // Try one more time with a longer wait
            await nextTick();
            await new Promise(resolve => setTimeout(resolve, 200));
            const retryInfo = await getQuillInstanceOrRoot(3);

            if (!retryInfo || !retryInfo.root) {
                console.error('Editor root still not found. Editor may not be ready.');
                alert('Editor is not ready. Please try again.');
                return;
            }
            editorInfo.root = retryInfo.root;
            editorInfo.quill = retryInfo.quill;
        }

        // Get current HTML BEFORE closing modal
        const editorRoot = editorInfo.root;
        const currentHTML = editorRoot.innerHTML;

        // Get cursor position if we have Quill instance
        let insertIndex = currentHTML.length; // Default to end
        if (editorInfo.quill) {
            try {
                const range = editorInfo.quill.getSelection(true);
                if (range) {
                    insertIndex = range.index;
                }
            } catch (e) {
                console.warn('Could not get selection, using end of content');
            }
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

        // Insert table directly into DOM to bypass Quill's processing
        // This prevents Quill from flattening the table structure
        if (!editorRoot || editorRoot.appendChild === undefined) {
            console.error('Editor root is not a valid DOM element', editorRoot);
            return;
        }

        // Temporarily disable Quill's text-change listener
        isParsing.value = true;

        // Create a wrapper paragraph before the table for proper spacing
        const pBefore = document.createElement('p');
        pBefore.innerHTML = '<br>';
        editorRoot.appendChild(pBefore);

        // Insert table directly into the DOM (clone it first)
        const tableToInsert = table.cloneNode(true);
        editorRoot.appendChild(tableToInsert);

        // Add <br /> after table for spacing
        const brAfter = document.createElement('br');
        editorRoot.appendChild(brAfter);

        // Add paragraph after table for cursor placement
        const pAfter = document.createElement('p');
        pAfter.innerHTML = '<br>';
        editorRoot.appendChild(pAfter);

        // Add an additional paragraph to ensure a new line after the table
        const pAfter2 = document.createElement('p');
        pAfter2.innerHTML = '<br>';
        editorRoot.appendChild(pAfter2);

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
                        if (!editorRootForFix && quillInstance.value && quillInstance.value.root) {
                            editorRootForFix = quillInstance.value.root;
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
    if (quillInstance.value && quillInstance.value.root) {
        quillInstance.value.root.focus();
    } else if (editorRef.value) {
        const editorElement = editorRef.value.$el || editorRef.value;
        const quillEditor = editorElement?.querySelector('.ql-editor');
        if (quillEditor) {
            quillEditor.focus();
        }
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
                if (quillInstance.value) {
                    try {
                        const quillRange = quillInstance.value.getSelection(true);
                        if (quillRange && quillRange.index !== null) {
                            storedInsertionTarget.value = {
                                type: 'index',
                                index: quillRange.index
                            };
                        }
                    } catch (e) {
                        // Fallback: store range
                        storedInsertionTarget.value = {
                            type: 'range',
                            range: range
                        };
                    }
                } else {
                    storedInsertionTarget.value = {
                        type: 'range',
                        range: range
                    };
                }
            }
        } else if (quillInstance.value) {
            // No selection, try to get from Quill
            try {
                const quillRange = quillInstance.value.getSelection(true);
                if (quillRange && quillRange.index !== null) {
                    storedInsertionTarget.value = {
                        type: 'index',
                        index: quillRange.index
                    };
                }
            } catch (e) {
                // Use end of document
                try {
                    storedInsertionTarget.value = {
                        type: 'index',
                        index: quillInstance.value.getLength() || 0
                    };
                } catch (e2) {
                    // Can't determine position
                }
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
    if (!canInsertImage.value) return;

    try {
        let imageUrl = '';

        if (imageMode.value === 'upload') {
            // Upload the file
            const formData = new FormData();
            formData.append('file', selectedFile.value);

            const uploadResult = await FileManagementController.uploadRoutePhoto(formData);
            if (!uploadResult.result) {
                console.error('Failed to upload image:', uploadResult.message);
                return;
            }
            imageUrl = uploadResult.url;
        } else {
            // Use selected survey photo
            const selectedPhoto = surveyPhotos.value[selectedPhotoIndex.value];
            imageUrl = selectedPhoto.url;
        }

        // Build image HTML with size
        let style = '';
        if (imageWidth.value) {
            style += `width: ${imageWidth.value}${widthUnit.value}; `;
        }
        if (imageHeight.value) {
            style += `height: ${imageHeight.value}${heightUnit.value}; `;
        }

        const imgTag = style
            ? `<img src="${imageUrl}" style="${style}" />`
            : `<img src="${imageUrl}" />`;

        // Insert image into editor
        await insertImageIntoEditor(imgTag);

        closeImageModal();
    } catch (error) {
        console.error('Error inserting image:', error);
    }
}

async function insertImageIntoEditor(imgHtml) {
    await nextTick();

    if (!quillInstance.value) {
        const editorInfo = await getQuillInstanceOrRoot(5);
        if (!editorInfo || !editorInfo.root) {
            console.error('Editor root not found');
            return;
        }

        // Insert directly into DOM
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = imgHtml;
        const imgElement = tempDiv.firstElementChild;

        if (editorInfo.root) {
            editorInfo.root.appendChild(imgElement);
            const br = document.createElement('br');
            editorInfo.root.appendChild(br);
            content.value = editorInfo.root.innerHTML;

            // Attach resize handler to newly inserted image
            if (imgElement && imgElement.tagName === 'IMG') {
                setTimeout(() => {
                    attachImageResizeHandler(imgElement);
                }, 50);
            }
        }
        return;
    }

    // Temporarily disable parsing
    isParsing.value = true;

    // Get current cursor position - always use live selection
    let targetCell = null;
    let insertionRange = null;
    let insertionIndex = null;

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
                // Not in a cell, try to get Quill index
                if (quillInstance.value) {
                    try {
                        const quillRange = quillInstance.value.getSelection(true);
                        if (quillRange && quillRange.index !== null) {
                            insertionIndex = quillRange.index;
                        }
                    } catch (e) {
                        // Fallback to range
                        insertionRange = range;
                    }
                } else {
                    insertionRange = range;
                }
            }
        } else if (quillInstance.value) {
            // No selection, try to get from Quill
            try {
                const quillRange = quillInstance.value.getSelection(true);
                if (quillRange && quillRange.index !== null) {
                    insertionIndex = quillRange.index;
                } else {
                    insertionIndex = quillInstance.value.getLength() || 0;
                }
            } catch (e) {
                insertionIndex = quillInstance.value.getLength() || 0;
            }
        }
    } catch (error) {
        console.warn('Error getting cursor position:', error);
        // Fallback to end of document
        if (quillInstance.value) {
            try {
                insertionIndex = quillInstance.value.getLength() || 0;
            } catch (e) {
                insertionIndex = 0;
            }
        }
    }

    // If cursor is in a table cell, insert image directly into the cell at cursor position
    if (targetCell && insertionRange) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = imgHtml;
        const imgElement = tempDiv.firstElementChild;

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

            // Attach resize handler
            setTimeout(() => {
                attachImageResizeHandler(imgElement);
            }, 50);
        }

        // Sync content
        await nextTick();
        const updatedContent = quillInstance.value.root.innerHTML;
        content.value = updatedContent;
        isParsing.value = false;

        // Clear stored target after insertion
        storedInsertionTarget.value = null;
        return;
    }

    // Normal insertion (not in table cell) - use stored index if available
    let index = insertionIndex;
    if (index === null || index === undefined) {
        try {
            const range = quillInstance.value.getSelection(true);
            if (range && range.index !== null && range.index !== undefined) {
                index = range.index;
            } else {
                // If no selection, insert at end
                index = quillInstance.value.getLength() || 0;
            }
        } catch (error) {
            // If getSelection fails, use length or 0
            try {
                index = quillInstance.value.getLength() || 0;
            } catch (e) {
                index = 0;
            }
        }
    }

    // Insert image HTML at cursor position
    quillInstance.value.clipboard.dangerouslyPasteHTML(index, imgHtml);

    // Update content
    await nextTick();
    const updatedContent = quillInstance.value.root.innerHTML;
    content.value = updatedContent;

    // Set cursor after the inserted image
    await nextTick();
    try {
        // Find the inserted image and place cursor after it
        const images = quillInstance.value.root.querySelectorAll('img');
        const insertedImage = images[images.length - 1];

        if (insertedImage && insertedImage.nextSibling) {
            // Try to place cursor after the image
            const range = quillInstance.value.getSelection();
            if (range) {
                // Calculate position after image
                const imageIndex = quillInstance.value.getIndex(insertedImage);
                const imageLength = quillInstance.value.getLength(insertedImage);
                quillInstance.value.setSelection((imageIndex + imageLength) || quillInstance.value.getLength() - 1, 'user');
            } else {
                // Fallback: place at end
                const newLength = quillInstance.value.getLength();
                if (newLength > 0) {
                    quillInstance.value.setSelection(newLength - 1, 'user');
                }
            }
        } else {
            // Fallback: place at end
            const newLength = quillInstance.value.getLength();
            if (newLength > 0) {
                quillInstance.value.setSelection(newLength - 1, 'user');
            }
        }
    } catch (error) {
        // Ignore selection errors - cursor will stay where it is
    }

    // Attach resize handler to newly inserted image
    await nextTick();
    const images = quillInstance.value.root.querySelectorAll('img');
    const lastImage = images[images.length - 1];
    if (lastImage) {
        attachImageResizeHandler(lastImage);
    }

    isParsing.value = false;

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
    if (quillInstance.value) {
        isParsing.value = true;
        const updatedContent = quillInstance.value.root.innerHTML;
        content.value = updatedContent;
        isParsing.value = false;
    } else {
        const editorInfo = await getQuillInstanceOrRoot(3);
        if (editorInfo && editorInfo.root) {
            content.value = editorInfo.root.innerHTML;
        }
    }

    closeImageResizeModal();
}
</script>

<style scoped>
.rich-text-editor {
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--bg-surface);
    overflow: hidden;
}

/* Override PrimeVue Editor styles to match design system */
:deep(.p-editor-container) {
    border: none;
    background: var(--bg-surface);
}

:deep(.p-editor-toolbar) {
    border: none;
    border-bottom: 1px solid var(--border);
    background: var(--bg-surface);
    padding: var(--spacing-xs);
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
    width: 28px;
    height: 28px;
    padding: 0;
    background: transparent;
    border: 1px solid var(--border, #ddd);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--text-secondary, #666);
    user-select: none;
    position: relative;
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

/* Ensure toggle button doesn't interfere with Quill toolbar */
:deep(.ql-toolbar .ql-formats:last-child) {
    margin-right: 0;
}
</style>
