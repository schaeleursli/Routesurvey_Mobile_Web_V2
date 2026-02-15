<template>
    <div class="tui-image-editor-wrapper">
        <tui-image-editor ref="tuiImageEditorRef" :use-default-ui="false" :options="editorOptions"
            @addText="handleChange" @objectMoved="handleChange" @objectScaled="handleChange"
            @objectActivated="handleChange" @undoStackChanged="handleChange" @redoStackChanged="handleChange" />
    </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import 'tui-color-picker/dist/tui-color-picker.css';
import 'tui-image-editor/dist/tui-image-editor.css';
import TuiImageEditor from '@tudan110/vue3-image-editor';

const props = defineProps({
    imageUrl: {
        type: String,
        required: true
    },
    width: {
        type: Number,
        default: 1200
    },
    height: {
        type: Number,
        default: 800
    }
});

const emit = defineEmits(['ready', 'change']);

const tuiImageEditorRef = ref(null);
const isReady = ref(false);

// Detect current app theme
const isDarkMode = computed(() => {
    const html = document.documentElement;
    return html.getAttribute('data-bs-theme') === 'dark';
});

// Get theme colors based on app theme
const getThemeColors = () => {
    if (isDarkMode.value) {
        // Dark theme - matching app dark mode
        return {
            'common.bi.image': 'https://uicdn.toast.com/toastui/img/tui-image-editor-bi.png',
            'common.bisize.width': '251px',
            'common.bisize.height': '21px',
            'common.backgroundImage': 'none',
            'common.backgroundColor': '#1e1e1e',
            'common.border': '0px',

            // header
            'header.backgroundImage': 'none',
            'header.backgroundColor': '#1E293B',
            'header.border': '0px',

            // load button (hidden but styled)
            'loadButton.backgroundColor': '#FFFFFF',
            'loadButton.border': '1px solid #E5E7EB',
            'loadButton.color': '#1F2937',
            'loadButton.fontFamily': "'Noto Sans', sans-serif",
            'loadButton.fontSize': '12px',

            // download button - using accent color
            'downloadButton.backgroundColor': '#00A7E1',
            'downloadButton.border': '1px solid #00A7E1',
            'downloadButton.color': '#fff',
            'downloadButton.fontFamily': "'Noto Sans', sans-serif",
            'downloadButton.fontSize': '12px',

            // main icons
            'menu.normalIcon.color': '#8a8a8a',
            'menu.activeIcon.color': '#e9e9e9',
            'menu.disabledIcon.color': '#434343',
            'menu.hoverIcon.color': '#e9e9e9',

            // submenu icons
            'submenu.normalIcon.color': '#8a8a8a',
            'submenu.activeIcon.color': '#e9e9e9',

            'menu.iconSize.width': '24px',
            'menu.iconSize.height': '24px',

            'submenu.iconSize.width': '32px',
            'submenu.iconSize.height': '32px',

            // submenu primary color
            'submenu.backgroundColor': '#1e1e1e',
            'submenu.partition.color': '#3c3c3c',

            // submenu labels
            'submenu.normalLabel.color': '#8a8a8a',
            'submenu.normalLabel.fontWeight': 'lighter',
            'submenu.activeLabel.color': '#fff',
            'submenu.activeLabel.fontWeight': 'lighter',

            // checkbox style
            'checkbox.border': '0px',
            'checkbox.backgroundColor': '#fff',

            // range style
            'range.pointer.color': '#fff',
            'range.bar.color': '#666',
            'range.subbar.color': '#d1d1d1',

            'range.disabledPointer.color': '#414141',
            'range.disabledBar.color': '#282828',
            'range.disabledSubbar.color': '#414141',

            'range.value.color': '#fff',
            'range.value.fontWeight': 'lighter',
            'range.value.fontSize': '11px',
            'range.value.border': '1px solid #353535',
            'range.value.backgroundColor': '#151515',
            'range.title.color': '#fff',
            'range.title.fontWeight': 'lighter',

            // colorpicker style
            'colorpicker.button.border': '1px solid #1e1e1e',
            'colorpicker.title.color': '#fff',
        };
    } else {
        // Light theme - matching app light mode
        return {
            'common.bi.image': 'https://uicdn.toast.com/toastui/img/tui-image-editor-bi.png',
            'common.bisize.width': '251px',
            'common.bisize.height': '21px',
            'common.backgroundImage': 'none',
            'common.backgroundColor': '#F9FAFB',
            'common.border': '0px',

            // header
            'header.backgroundImage': 'none',
            'header.backgroundColor': '#FFFFFF',
            'header.border': '0px',

            // load button (hidden but styled)
            'loadButton.backgroundColor': '#FFFFFF',
            'loadButton.border': '1px solid #E5E7EB',
            'loadButton.color': '#1F2937',
            'loadButton.fontFamily': "'Noto Sans', sans-serif",
            'loadButton.fontSize': '12px',

            // download button - using accent color
            'downloadButton.backgroundColor': '#00A7E1',
            'downloadButton.border': '1px solid #00A7E1',
            'downloadButton.color': '#fff',
            'downloadButton.fontFamily': "'Noto Sans', sans-serif",
            'downloadButton.fontSize': '12px',

            // main icons
            'menu.normalIcon.color': '#6B7280',
            'menu.activeIcon.color': '#1F2937',
            'menu.disabledIcon.color': '#9CA3AF',
            'menu.hoverIcon.color': '#1F2937',

            // submenu icons
            'submenu.normalIcon.color': '#6B7280',
            'submenu.activeIcon.color': '#1F2937',

            'menu.iconSize.width': '24px',
            'menu.iconSize.height': '24px',

            'submenu.iconSize.width': '32px',
            'submenu.iconSize.height': '32px',

            // submenu primary color
            'submenu.backgroundColor': '#FFFFFF',
            'submenu.partition.color': '#E5E7EB',

            // submenu labels
            'submenu.normalLabel.color': '#6B7280',
            'submenu.normalLabel.fontWeight': 'normal',
            'submenu.activeLabel.color': '#1F2937',
            'submenu.activeLabel.fontWeight': '500',

            // checkbox style
            'checkbox.border': '1px solid #E5E7EB',
            'checkbox.backgroundColor': '#FFFFFF',

            // range style
            'range.pointer.color': '#00A7E1',
            'range.bar.color': '#E5E7EB',
            'range.subbar.color': '#00A7E1',

            'range.disabledPointer.color': '#9CA3AF',
            'range.disabledBar.color': '#F4F5F6',
            'range.disabledSubbar.color': '#9CA3AF',

            'range.value.color': '#1F2937',
            'range.value.fontWeight': 'normal',
            'range.value.fontSize': '11px',
            'range.value.border': '1px solid #E5E7EB',
            'range.value.backgroundColor': '#FFFFFF',
            'range.title.color': '#1F2937',
            'range.title.fontWeight': 'normal',

            // colorpicker style
            'colorpicker.button.border': '1px solid #E5E7EB',
            'colorpicker.title.color': '#1F2937',
        };
    }
};

// Editor options - minimal configuration
const editorOptions = computed(() => {
    return {
        includeUI: {
            loadImage: {
                path: props.imageUrl,
                name: 'Screenshot'
            },
            theme: getThemeColors(),
            menu: ['crop', 'flip', 'rotate', 'draw', 'shape', 'icon', 'text', 'mask', 'filter'],
            initMenu: 'draw',
            uiSize: {
                width: '100%',
                height: '700px'
            },
            menuBarPosition: 'bottom'
        },
        cssMaxWidth: 700,
        cssMaxHeight: 500,
        selectionStyle: {
            cornerSize: 20,
            rotatingPointOffset: 70
        }
    };
});

// Handle all change events
const handleChange = () => {
    emit('change');
};

// Watch for theme changes and update editor theme
watch(isDarkMode, () => {
    if (tuiImageEditorRef.value?.invoke && isReady.value) {
        try {
            // Try to update theme dynamically
            const newTheme = getThemeColors();
            tuiImageEditorRef.value.invoke('changeTheme', newTheme);
        } catch (error) {
            // If changeTheme is not available, the editor will use the computed options on next render
            console.warn('Could not update theme dynamically:', error);
        }
    }
});

// Initialize editor
onMounted(async () => {
    await nextTick();

    // Wait for editor to be ready
    const checkEditor = setInterval(() => {
        if (tuiImageEditorRef.value?.getRootElement?.()) {
            clearInterval(checkEditor);
            isReady.value = true;

            // Load image if URL is provided
            if (props.imageUrl && tuiImageEditorRef.value?.invoke) {
                try {
                    // tuiImageEditorRef.value.invoke('loadImageFromURL', props.imageUrl, 'Screenshot');
                    // console.log(tuiImageEditorRef.value);
                    // tuiImageEditorRef.value.addImageObject(props.imageUrl).then(() => {
                    //     console.log('Image loaded');
                    // });

                    const headerButtons = tuiImageEditorRef.value.getRootElement().querySelector('.tui-image-editor-header-buttons');
                    headerButtons.style.display = 'none';
                    const logoArea = tuiImageEditorRef.value.getRootElement().querySelector('.tui-image-editor-header-logo');
                    logoArea.style.display = 'none';
                } catch (error) {
                    console.error('Error loading image:', error);
                }
            }
        }
    }, 100);

    // Timeout after 5 seconds
    setTimeout(() => {
        clearInterval(checkEditor);
        if (!isReady.value) {
            console.warn('Editor did not initialize');
            emit('ready');
        }
    }, 5000);
});

// Expose methods
const getImageDataURL = () => {
    if (!tuiImageEditorRef.value?.invoke) return null;
    try {
        return tuiImageEditorRef.value.invoke('toDataURL');
    } catch (error) {
        console.error('Error getting image data URL:', error);
        return null;
    }
};

const getImageBlob = async () => {
    const dataURL = getImageDataURL();
    if (!dataURL) return null;

    try {
        const response = await fetch(dataURL);
        return await response.blob();
    } catch (error) {
        console.error('Error converting to blob:', error);
        return null;
    }
};

defineExpose({
    getImageDataURL,
    getImageBlob
});
</script>

<style scoped>
.tui-image-editor-wrapper {
    width: 100%;
    height: 100%;
}

/* Hide load button */
.tui-image-editor-wrapper :deep(.tui-image-editor-header-buttons .tui-image-editor-load-btn),
.tui-image-editor-wrapper :deep(.tui-image-editor-header-buttons button[title*="Load"]),
.tui-image-editor-wrapper :deep(.tui-image-editor-header-buttons button[title*="load"]) {
    display: none !important;
    visibility: hidden !important;
}

/* Style download button to match design guidelines */
.tui-image-editor-wrapper :deep(.tui-image-editor-header-buttons .tui-image-editor-download-btn),
.tui-image-editor-wrapper :deep(.tui-image-editor-header-buttons button[title*="Download"]),
.tui-image-editor-wrapper :deep(.tui-image-editor-header-buttons button[title*="download"]) {
    background: var(--accent, #00A7E1) !important;
    color: white !important;
    border: none !important;
    border-radius: var(--radius-md, 6px) !important;
    padding: var(--spacing-sm, 12px) var(--spacing-md, 16px) !important;
    font-weight: var(--font-weight-medium, 500) !important;
    transition: all 0.2s ease !important;
}

.tui-image-editor-wrapper :deep(.tui-image-editor-header-buttons .tui-image-editor-download-btn:hover),
.tui-image-editor-wrapper :deep(.tui-image-editor-header-buttons button[title*="Download"]:hover),
.tui-image-editor-wrapper :deep(.tui-image-editor-header-buttons button[title*="download"]:hover) {
    background: var(--accent-hover, #0090C9) !important;
}

/* Style toolbar/menu to match app theme */
.tui-image-editor-wrapper :deep(.tui-image-editor-menu) {
    background: var(--bg-surface, #FFF) !important;
    border-bottom: 1px solid var(--border, #E5E7EB) !important;
}

/* Dark mode toolbar */
[data-bs-theme="dark"] .tui-image-editor-wrapper :deep(.tui-image-editor-menu) {
    background: var(--bg-surface, #1E293B) !important;
    border-bottom: 1px solid var(--border, #475569) !important;
}

/* Menu items */
.tui-image-editor-wrapper :deep(.tui-image-editor-menu-item) {
    color: var(--text-secondary, #6B7280) !important;
}

[data-bs-theme="dark"] .tui-image-editor-wrapper :deep(.tui-image-editor-menu-item) {
    color: var(--text-secondary, #94A3B8) !important;
}

/* Active menu item */
.tui-image-editor-wrapper :deep(.tui-image-editor-menu-item.active) {
    color: var(--text-primary, #1F2937) !important;
}

[data-bs-theme="dark"] .tui-image-editor-wrapper :deep(.tui-image-editor-menu-item.active) {
    color: var(--text-primary, #F8FAFC) !important;
}

/* Menu item hover */
.tui-image-editor-wrapper :deep(.tui-image-editor-menu-item:hover) {
    background: var(--bg-elevated, #F4F5F6) !important;
    color: var(--text-primary, #1F2937) !important;
}

[data-bs-theme="dark"] .tui-image-editor-wrapper :deep(.tui-image-editor-menu-item:hover) {
    background: var(--bg-elevated, #334155) !important;
    color: var(--text-primary, #F8FAFC) !important;
}
</style>
