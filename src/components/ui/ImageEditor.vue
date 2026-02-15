<template>
    <div class="image-editor">
        <div class="editor-toolbar">
            <div class="toolbar-group">
                <button v-for="tool in tools" :key="tool.id" :class="['tool-btn', { active: activeTool === tool.id }]"
                    @click="setActiveTool(tool.id)" :title="tool.label">
                    <component :is="tool.icon" :size="18" />
                </button>
            </div>
            <div class="toolbar-group">
                <button class="tool-btn" @click="undo" :disabled="!canUndo" title="Undo">
                    <PhArrowCounterClockwise :size="18" />
                </button>
                <button class="tool-btn" @click="redo" :disabled="!canRedo" title="Redo">
                    <PhArrowClockwise :size="18" />
                </button>
                <button class="tool-btn" @click="clear" title="Clear All">
                    <PhTrash :size="18" />
                </button>
            </div>
        </div>
        <div class="editor-canvas-container">
            <canvas ref="canvasRef" :width="canvasWidth" :height="canvasHeight"></canvas>
        </div>
        <div v-if="activeTool === 'crop'" class="crop-controls">
            <button @click="applyCrop" class="btn btn-primary btn-sm">Apply Crop</button>
            <button @click="cancelCrop" class="btn btn-secondary btn-sm">Cancel</button>
        </div>
        <div v-if="activeTool === 'text'" class="text-controls">
            <input v-model="textInput" type="text" placeholder="Enter text..." class="form-control"
                @keyup.enter="addText" />
            <input v-model.number="textSize" type="number" min="12" max="72" class="form-control" placeholder="Size" />
            <input v-model="textColor" type="color" class="form-control color-input" />
            <button @click="addText" class="btn btn-primary btn-sm">Add Text</button>
        </div>
        <div v-if="activeTool === 'draw'" class="draw-controls">
            <input v-model.number="brushWidth" type="range" min="1" max="50" class="form-range" />
            <input v-model="brushColor" type="color" class="form-control color-input" />
            <span>Width: {{ brushWidth }}px</span>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, markRaw } from 'vue';
import {
    PhArrowCounterClockwise, PhArrowClockwise, PhTrash,
    PhCursor, PhPencil, PhTextT, PhSquare, PhCircle, PhArrowRight, PhCrop
} from '@phosphor-icons/vue';
// Import fabric.js - v7 uses namespace export
import * as fabric from 'fabric';


const props = defineProps({
    imageUrl: {
        type: String,
        required: true
    },
    width: {
        type: Number,
        default: 800
    },
    height: {
        type: Number,
        default: 600
    }
});

const emit = defineEmits(['ready', 'change']);

const canvasRef = ref(null);
const canvas = ref(null);
const activeTool = ref('select');
const canUndo = ref(false);
const canRedo = ref(false);
const textInput = ref('');
const textSize = ref(24);
const textColor = ref('#000000');
const brushWidth = ref(5);
const brushColor = ref('#000000');
const isDrawing = ref(false);
const cropRect = ref(null);
const history = ref([]);
const historyStep = ref(-1);
const baseImageRef = ref(null); // Store reference to the base image
const isRestoring = ref(false); // Flag to prevent saving during restore

const canvasWidth = ref(props.width);
const canvasHeight = ref(props.height);

// Update canvas size to match container
const updateCanvasSize = () => {
    if (!canvasRef.value || !canvas.value) return;

    const container = canvasRef.value.parentElement;
    if (container) {
        const containerWidth = container.clientWidth - 32; // Account for padding
        const containerHeight = container.clientHeight - 32;

        if (containerWidth > 0 && containerHeight > 0) {
            canvasWidth.value = containerWidth;
            canvasHeight.value = containerHeight;
            canvas.value.setDimensions({
                width: containerWidth,
                height: containerHeight
            });
            // Recalculate offset after dimension change
            canvas.value.calcOffset();
            canvas.value.renderAll();
        }
    }
};

const tools = [
    { id: 'select', label: 'Select', icon: markRaw(PhCursor) },
    { id: 'draw', label: 'Draw', icon: markRaw(PhPencil) },
    { id: 'text', label: 'Text', icon: markRaw(PhTextT) },
    { id: 'rectangle', label: 'Rectangle', icon: markRaw(PhSquare) },
    { id: 'circle', label: 'Circle', icon: markRaw(PhCircle) },
    { id: 'arrow', label: 'Arrow', icon: markRaw(PhArrowRight) },
    { id: 'crop', label: 'Crop', icon: markRaw(PhCrop) }
];

onMounted(async () => {
    await nextTick();

    // Wait for the canvas ref to be available
    let retries = 0;
    while (!canvasRef.value && retries < 10) {
        await new Promise(resolve => setTimeout(resolve, 50));
        retries++;
    }

    if (!canvasRef.value) {
        console.error('Canvas ref not available after waiting');
        return;
    }

    // Initialize Fabric.js canvas
    await nextTick();

    // Update canvas size to match container
    updateCanvasSize();

    canvas.value = new fabric.Canvas(canvasRef.value, {
        width: canvasWidth.value,
        height: canvasHeight.value,
        backgroundColor: '#ffffff',
        isDrawingMode: false,
        preserveObjectStacking: true,
        skipTargetFind: false,
        allowTouchScrolling: false,
        renderOnAddRemove: true
    });

    // Ensure canvas offset is calculated correctly
    canvas.value.calcOffset();

    console.log('Canvas created:', {
        width: canvasWidth.value,
        height: canvasHeight.value,
        isDrawingMode: canvas.value.isDrawingMode
    });

    // Initialize free drawing brush - Fabric.js v7
    // The brush is created automatically when isDrawingMode is enabled
    // We just need to configure it when needed

    // Wait a bit more for canvas to be fully initialized
    await new Promise(resolve => setTimeout(resolve, 200));

    // Update canvas size again after a delay to ensure container is sized
    setTimeout(() => {
        updateCanvasSize();
        if (props.imageUrl) {
            loadImageIntoCanvas();
        }
    }, 500);

    // Set up event listeners
    setupEventListeners();
});

const loadImageIntoCanvas = () => {
    if (!canvas.value) {
        console.warn('Canvas not available');
        return;
    }

    if (!props.imageUrl) {
        console.warn('imageUrl not available');
        return;
    }

    console.log('Loading image into editor, URL type:', props.imageUrl.substring(0, 20));
    console.log('Canvas dimensions:', canvasWidth.value, 'x', canvasHeight.value);

    try {
        // Try using the new Fabric.js v7 API
        const loadImage = async () => {
            try {
                // For Fabric.js v7, we might need to use a different approach
                const imgElement = document.createElement('img');
                imgElement.crossOrigin = 'anonymous';

                imgElement.onload = () => {
                    console.log('Image element loaded, dimensions:', imgElement.width, 'x', imgElement.height);
                    console.log('Canvas dimensions:', canvasWidth.value, 'x', canvasHeight.value);

                    const fabricImage = new fabric.Image(imgElement, {
                        left: 0,
                        top: 0,
                        selectable: false,
                        evented: false
                    });

                    // Scale image to fill canvas while maintaining aspect ratio
                    const scale = Math.min(
                        canvasWidth.value / fabricImage.width,
                        canvasHeight.value / fabricImage.height
                    );
                    console.log('Image scale:', scale);

                    const scaledWidth = fabricImage.width * scale;
                    const scaledHeight = fabricImage.height * scale;

                    fabricImage.scale(scale);
                    fabricImage.set({
                        left: (canvasWidth.value - scaledWidth) / 2,
                        top: (canvasHeight.value - scaledHeight) / 2,
                        selectable: false,
                        evented: false,
                        hoverCursor: 'default',
                        moveCursor: 'default',
                        originX: 'left',
                        originY: 'top',
                        excludeFromExport: false
                    });

                    console.log('Image positioned at:', fabricImage.left, fabricImage.top, 'Size:', scaledWidth, 'x', scaledHeight);

                    console.log('Adding image to canvas at:', fabricImage.left, fabricImage.top);
                    canvas.value.add(fabricImage);
                    // Store reference to base image
                    baseImageRef.value = fabricImage;
                    // Send image to back so drawing appears on top
                    canvas.value.sendObjectToBack(fabricImage);
                    canvas.value.renderAll();
                    console.log('Canvas rendered, objects count:', canvas.value.getObjects().length);
                    // Initialize history with the initial state (image only, no annotations)
                    initializeHistory();
                    emit('ready');
                };

                imgElement.onerror = (error) => {
                    console.error('Error loading image element:', error);
                    // Fallback to fromURL
                    console.log('Trying fallback method with fromURL...');
                    fabric.Image.fromURL(
                        props.imageUrl,
                        (img) => {
                            if (!img) {
                                console.error('Failed to load image - img is null');
                                return;
                            }
                            console.log('Image loaded via fromURL, dimensions:', img.width, 'x', img.height);

                            const scale = Math.min(
                                canvasWidth.value / img.width,
                                canvasHeight.value / img.height
                            );

                            const scaledWidth = img.width * scale;
                            const scaledHeight = img.height * scale;

                            img.scale(scale);
                            img.set({
                                left: (canvasWidth.value - scaledWidth) / 2,
                                top: (canvasHeight.value - scaledHeight) / 2,
                                selectable: false,
                                evented: false,
                                originX: 'left',
                                originY: 'top'
                            });

                            canvas.value.add(img);
                            // Store reference to base image
                            baseImageRef.value = img;
                            // Send image to back so drawing appears on top
                            canvas.value.sendObjectToBack(img);
                            canvas.value.renderAll();
                            console.log('Canvas rendered, objects count:', canvas.value.getObjects().length);
                            // Initialize history with the initial state (image only, no annotations)
                            initializeHistory();
                            emit('ready');
                        },
                        {
                            crossOrigin: 'anonymous'
                        }
                    );
                };

                imgElement.src = props.imageUrl;
            } catch (error) {
                console.error('Error in loadImage:', error);
            }
        };

        loadImage();
    } catch (error) {
        console.error('Error loading image:', error);
    }
};

// Watch brush properties and update brush when they change
watch([brushWidth, brushColor], () => {
    if (canvas.value && canvas.value.freeDrawingBrush && activeTool.value === 'draw') {
        canvas.value.freeDrawingBrush.width = brushWidth.value;
        canvas.value.freeDrawingBrush.color = brushColor.value;
        console.log('Brush updated:', {
            width: brushWidth.value,
            color: brushColor.value
        });
    }
});

onUnmounted(() => {
    if (canvas.value) {
        canvas.value.dispose();
    }
});

watch(() => props.imageUrl, async (newUrl, oldUrl) => {
    console.log('ImageUrl watch triggered:', {
        newUrl: newUrl ? newUrl.substring(0, 50) + '...' : null,
        oldUrl: oldUrl ? oldUrl.substring(0, 50) + '...' : null,
        hasCanvas: !!canvas.value
    });

    // Only load if URL actually changed and canvas is ready
    if (newUrl && newUrl !== oldUrl && canvas.value) {
        console.log('Image URL changed, will reload after delay');

        // Wait for canvas to be ready
        await nextTick();
        await new Promise(resolve => setTimeout(resolve, 500));

        // Clear existing content
        const objects = canvas.value.getObjects();
        if (objects.length > 0) {
            console.log('Clearing', objects.length, 'existing objects');
            canvas.value.clear();
        }

        loadImageIntoCanvas();
    } else if (newUrl && !oldUrl && canvas.value) {
        // Initial load when URL becomes available
        console.log('Image URL became available, will load after delay');
        await nextTick();
        await new Promise(resolve => setTimeout(resolve, 500));
        loadImageIntoCanvas();
    } else if (newUrl && !canvas.value) {
        console.warn('ImageUrl available but canvas not ready yet');
    }
}, { immediate: true });

// Store shape drawing state
const shapeDrawingState = ref({
    isDrawing: false,
    currentShape: null,
    startX: 0,
    startY: 0,
    moveHandler: null,
    upHandler: null
});

const setupEventListeners = () => {
    if (!canvas.value) return;

    // Remove any existing handlers to avoid duplicates
    canvas.value.off('mouse:down');
    canvas.value.off('mouse:move');
    canvas.value.off('mouse:up');

    // Drawing mode - don't interfere with drawing, just handle other tools
    canvas.value.on('mouse:down', (options) => {
        // Don't interfere with drawing mode - let Fabric.js handle it
        if (activeTool.value === 'draw') {
            return; // Let Fabric.js handle drawing
        }

        // If clicking on an existing object in select mode, let Fabric.js handle it
        if (activeTool.value === 'select' && options.target) {
            return; // Let Fabric.js handle selection
        }

        // Handle other tools
        if (activeTool.value === 'crop') {
            startCrop(options);
        } else if (activeTool.value === 'rectangle') {
            startRectangle(options);
        } else if (activeTool.value === 'circle') {
            startCircle(options);
        } else if (activeTool.value === 'arrow') {
            startArrow(options);
        }
    });

    canvas.value.on('mouse:move', (options) => {
        // Only handle crop in the main mouse:move handler
        // Shape drawing has its own handlers
        if (activeTool.value === 'crop' && cropRect.value) {
            updateCrop(options);
        }
    });

    canvas.value.on('mouse:up', () => {
        // Don't interfere with drawing mode - let it stay enabled when draw tool is active
        if (activeTool.value === 'draw') {
            isDrawing.value = false;
            // Keep drawing mode enabled for continuous drawing
            canvas.value.isDrawingMode = true;
        } else if (activeTool.value === 'crop') {
            // Crop rect is already created
        }
        // Only disable drawing mode if not in draw tool
        if (activeTool.value !== 'draw' && activeTool.value !== 'rectangle' && activeTool.value !== 'circle' && activeTool.value !== 'arrow') {
            canvas.value.isDrawingMode = false;
        }
        saveState();
        emit('change');
    });

    // Listen for path creation during drawing
    canvas.value.on('path:created', (e) => {
        console.log('Path created during drawing');
        saveState();
        emit('change');
    });

    canvas.value.on('object:added', () => {
        saveState();
        emit('change');
    });

    canvas.value.on('object:modified', () => {
        saveState();
        emit('change');
    });

    // Ensure controls are visible when objects are selected
    canvas.value.on('selection:created', (e) => {
        if (e.selected && e.selected.length > 0) {
            e.selected.forEach((obj) => {
                if (obj.type !== 'image') {
                    obj.set({
                        hasControls: true,
                        hasBorders: true,
                        borderColor: '#3b82f6',
                        cornerColor: '#3b82f6',
                        cornerSize: 10,
                        transparentCorners: false
                    });
                    obj.setCoords();
                }
            });
            canvas.value.renderAll();
        }
    });

    canvas.value.on('selection:updated', (e) => {
        if (e.selected && e.selected.length > 0) {
            e.selected.forEach((obj) => {
                if (obj.type !== 'image') {
                    obj.set({
                        hasControls: true,
                        hasBorders: true,
                        borderColor: '#3b82f6',
                        cornerColor: '#3b82f6',
                        cornerSize: 10,
                        transparentCorners: false
                    });
                    obj.setCoords();
                }
            });
            canvas.value.renderAll();
        }
    });

    canvas.value.on('object:removed', () => {
        saveState();
        emit('change');
    });
};

const setActiveTool = (toolId) => {
    activeTool.value = toolId;
    if (canvas.value) {
        // Set drawing mode and selection
        canvas.value.isDrawingMode = toolId === 'draw';
        canvas.value.selection = toolId === 'select';
        canvas.value.defaultCursor = toolId === 'select' ? 'default' : 'crosshair';

        // Initialize and configure free drawing brush when switching to draw mode
        if (toolId === 'draw') {
            // Enable drawing mode first - this should create the brush in Fabric.js v7
            canvas.value.isDrawingMode = true;
            console.log('Drawing mode enabled, isDrawingMode:', canvas.value.isDrawingMode);
            console.log('Available fabric properties:', Object.keys(fabric).filter(k => k.includes('Brush') || k.includes('brush')));

            // In Fabric.js v7, the brush should be created automatically
            // But we need to wait a bit and then configure it
            const configureBrush = () => {
                try {
                    // Check if brush exists
                    if (canvas.value.freeDrawingBrush) {
                        canvas.value.freeDrawingBrush.width = brushWidth.value;
                        canvas.value.freeDrawingBrush.color = brushColor.value;
                        console.log('Brush configured successfully:', {
                            width: canvas.value.freeDrawingBrush.width,
                            color: canvas.value.freeDrawingBrush.color,
                            brushType: canvas.value.freeDrawingBrush.constructor?.name || 'unknown'
                        });
                        return true;
                    } else {
                        // Try to manually create the brush if it doesn't exist
                        // In Fabric.js v7, try different brush classes
                        let BrushClass = null;
                        if (fabric.PencilBrush) {
                            BrushClass = fabric.PencilBrush;
                        } else if (fabric.BaseBrush) {
                            // Try to create a custom brush
                            BrushClass = fabric.BaseBrush;
                        }

                        if (BrushClass) {
                            try {
                                canvas.value.freeDrawingBrush = new BrushClass(canvas.value);
                                canvas.value.freeDrawingBrush.width = brushWidth.value;
                                canvas.value.freeDrawingBrush.color = brushColor.value;
                                console.log('Created brush manually:', BrushClass.name);
                                return true;
                            } catch (e) {
                                console.warn('Failed to create brush manually:', e);
                            }
                        }
                        return false;
                    }
                } catch (error) {
                    console.error('Error configuring brush:', error);
                    return false;
                }
            };

            // Try immediately
            if (!configureBrush()) {
                // Try after a short delay to let drawing mode initialize
                setTimeout(() => {
                    if (!configureBrush()) {
                        // Try one more time after a longer delay
                        setTimeout(() => {
                            if (!configureBrush()) {
                                console.error('Failed to configure brush. Canvas state:', {
                                    isDrawingMode: canvas.value.isDrawingMode,
                                    hasFreeDrawingBrush: !!canvas.value.freeDrawingBrush,
                                    canvasMethods: Object.keys(canvas.value).filter(k => k.includes('brush') || k.includes('draw'))
                                });
                            }
                        }, 300);
                    }
                }, 100);
            }
        } else {
            // Disable drawing mode for other tools
            canvas.value.isDrawingMode = false;
            console.log('Drawing mode disabled');
        }

        // Clear crop rect if switching tools
        if (toolId !== 'crop' && cropRect.value) {
            canvas.value.remove(cropRect.value);
            cropRect.value = null;
        }
    }
};

const startRectangle = (options) => {
    // In Fabric.js v7, the event might be in options.e or options.pointer
    const event = options.e || options.pointer?.e || options;
    const pointer = canvas.value.getScenePoint(event);
    const startX = pointer.x;
    const startY = pointer.y;

    const rect = new fabric.Rect({
        left: startX,
        top: startY,
        width: 0,
        height: 0,
        fill: 'transparent',
        stroke: brushColor.value,
        strokeWidth: brushWidth.value,
        selectable: false,
        evented: false,
        originX: 'center',
        originY: 'center'
    });
    canvas.value.add(rect);
    canvas.value.setActiveObject(rect);

    let isDown = true;

    const moveHandler = (opts) => {
        if (!isDown || !rect) return;
        const event = opts.e || opts.pointer?.e || opts;
        const pointer = canvas.value.getScenePoint(event);
        const width = Math.abs(pointer.x - startX);
        const height = Math.abs(pointer.y - startY);
        const centerX = (startX + pointer.x) / 2;
        const centerY = (startY + pointer.y) / 2;
        rect.set({
            width: width || 1,  // Ensure minimum width
            height: height || 1, // Ensure minimum height
            left: centerX,
            top: centerY,
            originX: 'center',
            originY: 'center'
        });
        // Force coordinate update - must recalculate after setting properties
        rect.setCoords();
        canvas.value.renderAll();
    };

    const upHandler = () => {
        if (!isDown) return;
        isDown = false;
        if (rect && rect.width > 0 && rect.height > 0) {
            // Make it selectable and ensure coordinates are correct
            rect.set({
                selectable: true,
                evented: true,
                hasControls: true,
                hasBorders: true,
                borderColor: '#3b82f6',
                cornerColor: '#3b82f6',
                cornerSize: 10,
                transparentCorners: false,
                originX: 'center',
                originY: 'center',
                strokeWidth: brushWidth.value,
                stroke: brushColor.value
            });

            // Force coordinate recalculation - must be done after all properties are set
            rect.setCoords();
            canvas.value.renderAll();

            // Use nextTick to ensure render is complete, then recalculate
            nextTick(() => {
                // Recalculate coordinates after render
                rect.setCoords();
                canvas.value.setActiveObject(rect);
                // Force a full render to update control positions
                canvas.value.calcOffset();
                canvas.value.renderAll();
            });

            // Switch back to select tool so user can interact with the shape
            activeTool.value = 'select';
            canvas.value.selection = true;
            canvas.value.isDrawingMode = false;
        } else if (rect) {
            // Remove if too small
            canvas.value.remove(rect);
        }
        canvas.value.off('mouse:move', moveHandler);
        canvas.value.off('mouse:up', upHandler);
        saveState();
        emit('change');
    };

    canvas.value.on('mouse:move', moveHandler);
    canvas.value.on('mouse:up', upHandler);
};

const startCircle = (options) => {
    const event = options.e || options.pointer?.e || options;
    const pointer = canvas.value.getScenePoint(event);
    const startX = pointer.x;
    const startY = pointer.y;

    const circle = new fabric.Circle({
        left: startX,
        top: startY,
        radius: 0,
        fill: 'transparent',
        stroke: brushColor.value,
        strokeWidth: brushWidth.value,
        selectable: false,
        evented: false,
        originX: 'center',
        originY: 'center'
    });
    canvas.value.add(circle);
    canvas.value.setActiveObject(circle);

    let isDown = true;

    const moveHandler = (opts) => {
        if (!isDown || !circle) return;
        const event = opts.e || opts.pointer?.e || opts;
        const pointer = canvas.value.getScenePoint(event);
        const radius = Math.sqrt(
            Math.pow(pointer.x - startX, 2) + Math.pow(pointer.y - startY, 2)
        );
        // Circle center stays at start position (default center origin)
        circle.set({
            radius: radius || 1,  // Ensure minimum radius
            left: startX,
            top: startY
        });
        // Force coordinate update
        circle.setCoords();
        canvas.value.renderAll();
    };

    const upHandler = () => {
        if (!isDown) return;
        isDown = false;
        if (circle && circle.radius > 0) {
            circle.set({
                selectable: true,
                evented: true,
                hasControls: true,
                hasBorders: true,
                borderColor: '#3b82f6',
                cornerColor: '#3b82f6',
                cornerSize: 10,
                transparentCorners: false,
                originX: 'center',
                originY: 'center',
                strokeWidth: brushWidth.value,
                stroke: brushColor.value
            });
            // Force coordinate recalculation
            circle.setCoords();
            canvas.value.renderAll();
            nextTick(() => {
                circle.setCoords();
                canvas.value.setActiveObject(circle);
                canvas.value.calcOffset();
                canvas.value.renderAll();
            });
            // Switch back to select tool
            activeTool.value = 'select';
            canvas.value.selection = true;
            canvas.value.isDrawingMode = false;
        } else if (circle) {
            canvas.value.remove(circle);
        }
        canvas.value.off('mouse:move', moveHandler);
        canvas.value.off('mouse:up', upHandler);
        canvas.value.renderAll();
        saveState();
        emit('change');
    };

    canvas.value.on('mouse:move', moveHandler);
    canvas.value.on('mouse:up', upHandler);
};

const startArrow = (options) => {
    const event = options.e || options.pointer?.e || options;
    const pointer = canvas.value.getScenePoint(event);
    const startX = pointer.x;
    const startY = pointer.y;

    let isDown = true;
    let line = null;

    const moveHandler = (opts) => {
        if (!isDown) return;
        const event = opts.e || opts.pointer?.e || opts;
        const pointer = canvas.value.getScenePoint(event);

        if (line) {
            canvas.value.remove(line);
        }

        // Create arrow using Path
        const dx = pointer.x - startX;
        const dy = pointer.y - startY;
        const angle = Math.atan2(dy, dx);
        const arrowHeadLength = 20;
        const arrowHeadAngle = Math.PI / 6;

        const path = `M ${startX} ${startY} L ${pointer.x} ${pointer.y} M ${pointer.x} ${pointer.y} L ${pointer.x - arrowHeadLength * Math.cos(angle - arrowHeadAngle)} ${pointer.y - arrowHeadLength * Math.sin(angle - arrowHeadAngle)} M ${pointer.x} ${pointer.y} L ${pointer.x - arrowHeadLength * Math.cos(angle + arrowHeadAngle)} ${pointer.y - arrowHeadLength * Math.sin(angle + arrowHeadAngle)}`;

        line = new fabric.Path(path, {
            stroke: brushColor.value,
            strokeWidth: brushWidth.value,
            fill: '',
            selectable: false,
            evented: false
            // Use default center origin for v7
        });
        canvas.value.add(line);
        canvas.value.renderAll();
    };

    const upHandler = () => {
        if (!isDown) return;
        isDown = false;
        if (line) {
            line.set({
                selectable: true,
                evented: true,
                hasControls: true,
                hasBorders: true,
                borderColor: '#3b82f6',
                cornerColor: '#3b82f6',
                cornerSize: 10,
                transparentCorners: false,
                strokeWidth: brushWidth.value,
                stroke: brushColor.value
            });
            // Force coordinate recalculation
            line.setCoords();
            canvas.value.renderAll();
            nextTick(() => {
                line.setCoords();
                canvas.value.setActiveObject(line);
                canvas.value.calcOffset();
                canvas.value.renderAll();
            });
            // Switch back to select tool
            activeTool.value = 'select';
            canvas.value.selection = true;
            canvas.value.isDrawingMode = false;
        }
        canvas.value.off('mouse:move', moveHandler);
        canvas.value.off('mouse:up', upHandler);
        canvas.value.renderAll();
        saveState();
        emit('change');
    };

    canvas.value.on('mouse:move', moveHandler);
    canvas.value.on('mouse:up', upHandler);
};

const startCrop = (options) => {
    const event = options.e || options.pointer?.e || options;
    const pointer = canvas.value.getScenePoint(event);
    cropRect.value = new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
        width: 0,
        height: 0,
        fill: 'rgba(0,0,0,0.3)',
        stroke: '#000000',
        strokeWidth: 2,
        selectable: false,
        evented: false,
        originX: 'left',
        originY: 'top'
    });
    canvas.value.add(cropRect.value);
};

const updateCrop = (options) => {
    if (!cropRect.value) return;
    const event = options.e || options.pointer?.e || options;
    const pointer = canvas.value.getScenePoint(event);
    const startX = cropRect.value.left;
    const startY = cropRect.value.top;
    cropRect.value.set({
        width: Math.abs(pointer.x - startX),
        height: Math.abs(pointer.y - startY),
        left: Math.min(startX, pointer.x),
        top: Math.min(startY, pointer.y)
    });
    canvas.value.renderAll();
};

const applyCrop = () => {
    if (!cropRect.value || !canvas.value) return;

    const objects = canvas.value.getObjects();
    const image = objects.find(obj => obj.type === 'image');
    if (!image) return;

    const cropBounds = cropRect.value.getBoundingRect();

    // Create a new canvas for cropping
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropBounds.width;
    cropCanvas.height = cropBounds.height;
    const ctx = cropCanvas.getContext('2d');

    // Draw the cropped area
    canvas.value.renderAll();
    const dataURL = canvas.value.toDataURL({
        left: cropBounds.left,
        top: cropBounds.top,
        width: cropBounds.width,
        height: cropBounds.height
    });

    // Clear and reload with cropped image
    canvas.value.clear();
    fabric.Image.fromURL(dataURL, (img) => {
        const scale = Math.min(
            canvasWidth.value / img.width,
            canvasHeight.value / img.height
        );
        img.scale(scale);
        img.set({
            left: (canvasWidth.value - img.width * scale) / 2,
            top: (canvasHeight.value - img.height * scale) / 2,
            selectable: false,
            evented: false
        });
        canvas.value.add(img);
        canvas.value.renderAll();
        cropRect.value = null;
        activeTool.value = 'select';
        saveState();
        emit('change');
    });
};

const cancelCrop = () => {
    if (cropRect.value) {
        canvas.value.remove(cropRect.value);
        cropRect.value = null;
    }
    activeTool.value = 'select';
};

const addText = () => {
    if (!textInput.value.trim() || !canvas.value) return;

    const text = new fabric.Text(textInput.value, {
        left: canvasWidth.value / 2,
        top: canvasHeight.value / 2,
        fontSize: textSize.value,
        fill: textColor.value,
        fontFamily: 'Arial',
        hasControls: true,
        hasBorders: true,
        borderColor: '#3b82f6',
        cornerColor: '#3b82f6',
        cornerSize: 10,
        transparentCorners: false
    });
    canvas.value.add(text);
    canvas.value.setActiveObject(text);
    textInput.value = '';
    saveState();
    emit('change');
};

const undo = () => {
    if (historyStep.value > 0) {
        historyStep.value--;
        restoreState();
    }
};

const redo = () => {
    if (historyStep.value < history.value.length - 1) {
        historyStep.value++;
        restoreState();
    }
};

const clear = () => {
    if (confirm('Clear all annotations? This cannot be undone.')) {
        if (canvas.value) {
            const objects = canvas.value.getObjects();
            const image = objects.find(obj => obj.type === 'image');
            canvas.value.clear();
            if (image) {
                canvas.value.add(image);
            }
            canvas.value.renderAll();
            saveState();
            emit('change');
        }
    }
};

const initializeHistory = () => {
    if (!canvas.value || !baseImageRef.value) return;

    // Create initial state with empty objects array (just the canvas structure)
    const canvasJSON = canvas.value.toJSON();
    canvasJSON.objects = []; // No annotations initially
    const json = JSON.stringify(canvasJSON);

    history.value = [json];
    historyStep.value = 0;
    canUndo.value = false;
    canRedo.value = false;
};

const saveState = () => {
    // Don't save during restore operations
    if (isRestoring.value) return;
    if (!canvas.value || !baseImageRef.value) return;

    // Get all objects except the base image
    const objects = canvas.value.getObjects();
    const objectsToSave = objects.filter(obj => obj !== baseImageRef.value);

    // Create JSON with only non-image objects
    const canvasJSON = canvas.value.toJSON();
    canvasJSON.objects = objectsToSave.map(obj => obj.toObject());
    const json = JSON.stringify(canvasJSON);

    // Remove any future states if we're not at the end
    history.value = history.value.slice(0, historyStep.value + 1);
    history.value.push(json);
    historyStep.value = history.value.length - 1;
    canUndo.value = historyStep.value > 0;
    canRedo.value = historyStep.value < history.value.length - 1;

    console.log('State saved. History length:', history.value.length, 'Step:', historyStep.value, 'Can undo:', canUndo.value);
};

const restoreState = () => {
    if (!canvas.value || historyStep.value < 0 || !baseImageRef.value) return;

    console.log('Restoring state. Step:', historyStep.value, 'History length:', history.value.length);

    // Set flag to prevent saving during restore
    isRestoring.value = true;

    // Preserve base image reference and properties
    const imageToPreserve = baseImageRef.value;
    const imageProps = {
        left: imageToPreserve.left,
        top: imageToPreserve.top,
        scaleX: imageToPreserve.scaleX || 1,
        scaleY: imageToPreserve.scaleY || 1,
        width: imageToPreserve.width,
        height: imageToPreserve.height
    };

    // Remove all non-image objects first
    const objectsToRemove = canvas.value.getObjects().filter(obj => obj !== imageToPreserve);
    objectsToRemove.forEach(obj => canvas.value.remove(obj));

    // Parse the JSON state
    const stateJSON = JSON.parse(history.value[historyStep.value]);

    // Add objects from the state (excluding any images)
    if (stateJSON.objects && Array.isArray(stateJSON.objects)) {
        fabric.util.enlivenObjects(stateJSON.objects, (objects) => {
            objects.forEach((obj) => {
                // Skip if it's an image type
                if (obj.type === 'image') return;

                // Ensure controls are enabled
                obj.set({
                    hasControls: true,
                    hasBorders: true,
                    borderColor: '#3b82f6',
                    cornerColor: '#3b82f6',
                    cornerSize: 10,
                    transparentCorners: false
                });

                // Ensure coordinates are set correctly
                obj.setCoords();
                canvas.value.add(obj);
            });

            // Ensure the base image is present and at the back
            const objectsAfterRestore = canvas.value.getObjects();
            const imageExists = objectsAfterRestore.some(obj => obj === imageToPreserve);

            if (!imageExists) {
                // Re-add the image with preserved properties
                imageToPreserve.set({
                    left: imageProps.left,
                    top: imageProps.top,
                    scaleX: imageProps.scaleX,
                    scaleY: imageProps.scaleY
                });
                imageToPreserve.setCoords();
                canvas.value.add(imageToPreserve);
            }

            // Always send image to back
            canvas.value.sendObjectToBack(imageToPreserve);

            // Render first, then update coordinates
            canvas.value.renderAll();

            // Update coordinates for all objects after render
            setTimeout(() => {
                canvas.value.getObjects().forEach(obj => {
                    if (obj !== imageToPreserve) {
                        obj.setCoords();
                    }
                });
                canvas.value.renderAll();
            }, 50);

            canUndo.value = historyStep.value > 0;
            canRedo.value = historyStep.value < history.value.length - 1;
            console.log('State restored. Can undo:', canUndo.value, 'Can redo:', canRedo.value);

            // Clear restore flag after a short delay to allow render to complete
            setTimeout(() => {
                isRestoring.value = false;
            }, 200);

            emit('change');
        });
        return; // Early return since enlivenObjects is async
    }

    // Fallback if no objects to restore
    // Ensure the base image is present and at the back
    const objectsAfterRestore = canvas.value.getObjects();
    const imageExists = objectsAfterRestore.some(obj => obj === imageToPreserve);

    if (!imageExists) {
        // Re-add the image with preserved properties
        imageToPreserve.set({
            left: imageProps.left,
            top: imageProps.top,
            scaleX: imageProps.scaleX,
            scaleY: imageProps.scaleY
        });
        imageToPreserve.setCoords();
        canvas.value.add(imageToPreserve);
    }

    // Always send image to back
    canvas.value.sendObjectToBack(imageToPreserve);

    // Update coordinates for all objects
    canvas.value.getObjects().forEach(obj => {
        obj.setCoords();
    });

    canvas.value.renderAll();

    canUndo.value = historyStep.value > 0;
    canRedo.value = historyStep.value < history.value.length - 1;
    console.log('State restored. Can undo:', canUndo.value, 'Can redo:', canRedo.value);

    // Clear restore flag after a short delay to allow render to complete
    setTimeout(() => {
        isRestoring.value = false;
    }, 100);

    emit('change');
};

const getImageDataURL = () => {
    if (!canvas.value) return null;
    return canvas.value.toDataURL('image/png');
};

const getImageBlob = async () => {
    if (!canvas.value) return null;
    return new Promise((resolve) => {
        canvas.value.toBlob((blob) => {
            resolve(blob);
        }, 'image/jpeg', 0.9);
    });
};

// Expose methods
defineExpose({
    getImageDataURL,
    getImageBlob,
    undo,
    redo,
    clear
});
</script>

<style scoped>
.image-editor {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background: var(--bg-base);
    color: var(--text-primary);
}

.editor-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm);
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border);
    gap: var(--spacing-md);
}

.toolbar-group {
    display: flex;
    gap: 0.25rem;
}

.tool-btn {
    padding: var(--spacing-sm);
    border: 1px solid var(--border);
    background: var(--bg-surface);
    color: var(--text-primary);
    border-radius: var(--radius-md);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 36px;
    transition: all var(--transition-normal);
}

.tool-btn:hover:not(:disabled) {
    background: var(--bg-elevated);
    border-color: var(--text-secondary);
}

.tool-btn.active {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
}

.tool-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.editor-canvas-container {
    flex: 1;
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-md);
    background: var(--bg-elevated);
    min-height: 0;
    position: relative;
    width: 100%;
    height: 100%;
}

.editor-canvas-container canvas {
    box-shadow: var(--shadow-md);
    background: var(--bg-surface);

    /* Don't force 100% width/height as it causes coordinate mismatches */

    /* Let Fabric.js handle the actual dimensions */
    display: block;
}

/* Ensure Fabric.js controls are visible */
.editor-canvas-container :deep(.upper-canvas) {
    z-index: 10;
    pointer-events: auto;
}

.editor-canvas-container :deep(.canvas-container) {
    position: relative;
}

/* Style for selection controls - ensure they're visible */
.editor-canvas-container :deep(.canvas-container canvas) {
    display: block;
}

.crop-controls,
.text-controls,
.draw-controls {
    display: flex;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    background: var(--bg-surface);
    border-top: 1px solid var(--border);
    align-items: center;
}

.text-controls input[type="text"],
.text-controls input[type="number"] {
    flex: 1;
    max-width: 200px;
}

.color-input {
    width: 50px;
    height: 36px;
    padding: 2px;
}

.form-range {
    flex: 1;
    max-width: 200px;
}

.btn {
    padding: 0.375rem 0.75rem;
    border-radius: 4px;
    border: 1px solid;
    cursor: pointer;
    font-size: 0.875rem;
}

.btn-primary {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
}

.btn-primary:hover {
    background: var(--accent-hover);
    border-color: var(--accent-hover);
}

.btn-secondary {
    background: var(--text-secondary);
    color: white;
    border-color: var(--text-secondary);
}

.btn-secondary:hover {
    background: var(--text-primary);
    border-color: var(--text-primary);
}

.btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
}

.form-control {
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    background: var(--bg-surface);
    color: var(--text-primary);
}

.form-control:focus {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
    border-color: var(--accent);
}
</style>
