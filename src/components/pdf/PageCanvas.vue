<template>
  <div class="page-wrap" :id="`page-${page}`" ref="wrap" :style="wrapperStyle">
    <canvas ref="canvas" class="page-canvas"></canvas>
    <!-- Optional: Text Layer could go here later -->
    <div v-if="!rendered" class="loading-placeholder">
        <div class="spinner-sm"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";

const props = defineProps<{
  page: number;
  render: (page: number, canvas: HTMLCanvasElement) => Promise<void>;
  scale: number; // Trigger re-render on scale change
  enabled: boolean;
}>();

const canvas = ref<HTMLCanvasElement | null>(null);
const rendered = ref(false);

async function doRender() {
  if (!props.enabled || !canvas.value) return;
  // If we are already rendered at this scale, skip? 
  // No, the parent might manage invalidation, but checking here helps.
  // Actually, 'render' function handles cancellation and fresh render.
  
  await props.render(props.page, canvas.value);
  rendered.value = true;
}

watch(() => props.enabled, (val) => {
    if (val) doRender();
});
watch(() => props.scale, () => {
    if (props.enabled) doRender();
});

onMounted(() => {
    if (props.enabled) doRender();
});

const wrapperStyle = computed(() => {
    return {
        // We let the canvas set the dimensions, but we can set min-height to reduce jumping
        // Assumption: A4 ratio approx 1.414
        // minHeight: `${800 * props.scale}px` // Rough approximation
    }
});
</script>

<style scoped>
.page-wrap { 
    background: white; 
    box-shadow: 0 4px 8px rgb(0 0 0 / 20%); 
    display: inline-block;
    position: relative;
    min-height: 200px;
}
.page-canvas { 
    display: block; 
    /* Size is set via JS style property */
}
.loading-placeholder {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
}
.spinner-sm {
    width: 24px;
    height: 24px;
    border: 3px solid rgb(0 0 0 / 10%);
    border-top: 3px solid var(--accent, #007bff);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin { from {transform: rotate(0deg)} to {transform: rotate(360deg)} }
</style>
