<template>
  <div ref="root" class="pdf-canvas-root">
    <canvas ref="canvas" class="pdf-canvas"></canvas>
    <div v-if="showSkeleton" class="pdf-skeleton"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";

const props = defineProps<{
  page: number;
  enabled: boolean; // virtualization/lazy flag
  render: (page: number, canvas: HTMLCanvasElement) => Promise<void>;
  skeleton?: boolean;
  renderKey?: number; // Forces re-render when changed
}>();

const root = ref<HTMLElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const showSkeleton = ref(!!props.skeleton);

let cancelled = false;

async function doRender() {
  if (!props.enabled || !canvas.value) return;
  showSkeleton.value = !!props.skeleton;
  cancelled = false;
  try {
    await props.render(props.page, canvas.value);
    if (!cancelled) showSkeleton.value = false;
  } catch {
    // ignore
  }
}

watch(() => props.enabled, () => doRender());
watch(() => props.page, () => doRender());
watch(() => props.renderKey, () => {
    if (props.enabled) doRender();
});

onMounted(() => doRender());
onUnmounted(() => { cancelled = true; });
</script>

<style scoped>
.pdf-canvas-root { position: relative; width: 100%; }
.pdf-canvas { display: block; width: 100%; height: auto; }
.pdf-skeleton {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgb(0 0 0 / 5%), rgb(0 0 0 / 12%), rgb(0 0 0 / 5%));
  animation: shimmer 1.2s infinite;
  border-radius: 6px;
}

@keyframes shimmer {
  0% { transform: translateX(-20%); }
  100% { transform: translateX(20%); }
}
</style>
