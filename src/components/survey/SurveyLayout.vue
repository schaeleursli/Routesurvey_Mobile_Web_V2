<template>
    <div class="survey-layout" @mouseup="stopResize" @mouseleave="stopResize">
        <!-- Main Content Split -->
        <div class="split-container" @mousemove="resize">
            
            <!-- LEFT PANEL (List) -->
            <div 
                class="panel-sidebar panel-left" 
                :style="{ width: `${leftWidth}px` }"
                v-if="showLeft"
            >
                <slot name="list"></slot>
            </div>

            <!-- Left Resize Handle -->
            <div 
                class="resize-handle" 
                @mousedown="(e) => startResize(e, 'left')"
                v-if="showLeft"
            ></div>

            <!-- CENTER PANEL (Map) -->
            <div class="panel-map">
                <slot name="map"></slot>
            </div>

            <!-- Right Resize Handle -->
            <div 
                class="resize-handle" 
                @mousedown="(e) => startResize(e, 'right')"
                v-if="showRight"
            ></div>

            <!-- RIGHT PANEL (Details) -->
            <div 
                class="panel-sidebar panel-right" 
                :style="{ width: `${rightWidth}px` }"
                v-if="showRight"
            >
                <div class="sidebar-content">
                    <slot name="details"></slot>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
    showLeft: { type: Boolean, default: true },
    showRight: { type: Boolean, default: false }
});

const MIN_WIDTH = 250;
const MAX_WIDTH = 600;

const leftWidth = ref(350);
const rightWidth = ref(400);

const resizingSide = ref(null); // 'left' | 'right' | null

onMounted(() => {
    const savedLeft = localStorage.getItem('survey-layout-left');
    const savedRight = localStorage.getItem('survey-layout-right');
    
    if (savedLeft) leftWidth.value = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, parseInt(savedLeft, 10)));
    if (savedRight) rightWidth.value = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, parseInt(savedRight, 10)));
});

const startResize = (e, side) => {
    resizingSide.value = side;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
};

const stopResize = () => {
    if (!resizingSide.value) return;
    
    // Save state
    if (resizingSide.value === 'left') localStorage.setItem('survey-layout-left', leftWidth.value);
    if (resizingSide.value === 'right') localStorage.setItem('survey-layout-right', rightWidth.value);

    resizingSide.value = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
};

const resize = (e) => {
    if (!resizingSide.value) return;
    
    if (resizingSide.value === 'left') {
        // Left width is just the mouse X position (relative to screen, assuming full width layout)
        // Adjust for any sidebar navigation if necessary. 
        // For simplicity, we use e.clientX minus standard main nav width if it exists, 
        // OR better: use movementX or clientX directly if this component spans full width.
        // Let's assume this component starts at x=width_of_main_nav (e.g. 260px).
        // A robust way is to clamp delta.
        // Let's rely on absolute position if MainLayout is fixed.
        
        // We'll calculate width change based on movement
        const newWidth = leftWidth.value + e.movementX;
         if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
            leftWidth.value = newWidth;
        }
    } else if (resizingSide.value === 'right') {
        // Right width grows as mouse moves left
        const newWidth = rightWidth.value - e.movementX;
        if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
            rightWidth.value = newWidth;
        }
    }
};
</script>

<style scoped>
.survey-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background-color: var(--bg-base, #f8f9fa);
}

.split-container {
    display: flex;
    flex: 1;
    overflow: hidden;
    position: relative;
    height: 100%;
}

.panel-sidebar {
    flex-shrink: 0;
    background-color: var(--bg-surface, #fff);
    display: flex;
    flex-direction: column;
    height: 100%;
    z-index: 10;
}

.panel-left {
    border-right: 1px solid var(--border, #e0e0e0);
}

.panel-right {
    border-left: 1px solid var(--border, #e0e0e0);
}

.panel-map {
    flex: 1;
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    min-width: 0; /* Prevent flex overflow */
}

.resize-handle {
    width: 4px;
    height: 100%;
    background-color: var(--border, #e0e0e0);
    cursor: col-resize;
    flex-shrink: 0;
    transition: background-color 0.2s;
    z-index: 20;
}

.resize-handle:hover, .resize-handle:active {
    background-color: var(--accent, #0F62FE);
}

.sidebar-content {
    flex: 1;
    overflow: hidden auto;
    position: relative;
}

/* Responsive adjustments */
@media (width <= 1024px) {
    /* Tablet/Mobile behavior */
    /* For now, just simplistic collapse or stacking */
    .split-container {
        position: relative; 
    }
    
    .panel-left, .panel-right {
        position: absolute;
        top: 0;
        bottom: 0;
        z-index: 30;
        background: var(--bg-surface);
        width: 100% !important; /* Full width drawer style? or fixed? */
        max-width: 400px;
    }

    .panel-left { left: 0; box-shadow: 2px 0 10px rgb(0 0 0 / 10%); }
    .panel-right { right: 0; box-shadow: -2px 0 10px rgb(0 0 0 / 10%); }
    
    .resize-handle { display: none; }
}
</style>
