<template>
  <svg class="overlay-renderer" viewBox="0 0 100 100" preserveAspectRatio="none">
    <template v-for="(overlay, index) in overlays" :key="index">
      <!-- Arrow overlay -->
      <template v-if="overlay.type === 'arrow'">
        <defs>
          <marker
            :id="`arrowhead-${index}`"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" :fill="overlay.color || '#ff0000'" />
          </marker>
        </defs>
        <line
          :x1="overlay.x1"
          :y1="overlay.y1"
          :x2="overlay.x2"
          :y2="overlay.y2"
          :stroke="overlay.color || '#ff0000'"
          :stroke-width="overlay.strokeWidth || 2"
          :marker-end="`url(#arrowhead-${index})`"
        />
      </template>

      <!-- Line overlay -->
      <template v-else-if="overlay.type === 'line'">
        <line
          :x1="overlay.x1"
          :y1="overlay.y1"
          :x2="overlay.x2"
          :y2="overlay.y2"
          :stroke="overlay.color || '#ff0000'"
          :stroke-width="overlay.strokeWidth || 2"
        />
      </template>

      <!-- Rectangle overlay -->
      <template v-else-if="overlay.type === 'rect'">
        <rect
          :x="overlay.x"
          :y="overlay.y"
          :width="overlay.width"
          :height="overlay.height"
          :stroke="overlay.color || '#ff0000'"
          :stroke-width="overlay.strokeWidth || 2"
          fill="none"
        />
      </template>

      <!-- Circle overlay -->
      <template v-else-if="overlay.type === 'circle'">
        <circle
          :cx="overlay.cx"
          :cy="overlay.cy"
          :r="overlay.r"
          :stroke="overlay.color || '#ff0000'"
          :stroke-width="overlay.strokeWidth || 2"
          fill="none"
        />
      </template>

      <!-- Text overlay -->
      <template v-else-if="overlay.type === 'text'">
        <text
          :x="overlay.x"
          :y="overlay.y"
          :fill="overlay.color || '#ff0000'"
          :font-size="overlay.fontSize || 4"
          font-family="sans-serif"
        >
          {{ overlay.text }}
        </text>
      </template>

      <!-- Freehand path overlay -->
      <template v-else-if="overlay.type === 'path'">
        <path
          :d="overlay.d"
          :stroke="overlay.color || '#ff0000'"
          :stroke-width="overlay.strokeWidth || 2"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </template>
    </template>
  </svg>
</template>

<script setup lang="ts">
// Overlay types (matching mobile app overlay format)
interface Overlay {
  type: 'arrow' | 'line' | 'rect' | 'circle' | 'text' | 'path';
  color?: string;
  strokeWidth?: number;
  // Arrow/Line
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  // Rect
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  // Circle
  cx?: number;
  cy?: number;
  r?: number;
  // Text
  text?: string;
  fontSize?: number;
  // Path
  d?: string;
}

defineProps<{
  overlays: Overlay[];
}>();
</script>

<style scoped>
.overlay-renderer {
  width: 100%;
  height: 100%;
}
</style>
