<template>
  <div class="engineering-schematic">
    <svg
      :width="svgWidth"
      :height="svgHeight"
      viewBox="0 0 1200 400"
      class="schematic-svg"
    >
      <!-- Ground line -->
      <line
        x1="0"
        y1="350"
        x2="1200"
        y2="350"
        stroke="var(--color-border)"
        stroke-width="2"
      />

      <!-- Render based on assembly_type -->
      <g v-if="isOpenDeckTrain">
        <rect
  x="50"
          y="250"
          width="200"
          height="100"
          fill="var(--color-surface)"
          stroke="var(--color-primary)"
          stroke-width="2"
          class="clickable"
          @click="selectModule('tractor')"
        />
        <text x="150" y="305" text-anchor="middle" fill="var(--color-text)">
          Tractor
        </text>

        <!-- Trailer -->
        <rect
          x="300"
          y="270"
          width="600"
          height="80"
          fill="var(--color-surface)"
          stroke="var(--color-primary)"
          stroke-width="2"
          class="clickable"
          @click="selectModule('trailer')"
        />
        <text x="600" y="315" text-anchor="middle" fill="var(--color-text)">
          Trailer Deck
        </text>

        <!-- Cargo -->
        <rect
          x="400"
          y="170"
          width="400"
          height="100"
          fill="var(--color-warning)"
          fill-opacity="0.3"
          stroke="var(--color-warning)"
          stroke-width="2"
          stroke-dasharray="5,5"
        />
        <text x="600" y="225" text-anchor="middle" fill="var(--color-text)">
          Cargo
        </text>

        <!-- Wheels (simplified) -->
        <circle cx="100" cy="350" r="20" fill="black" />
        <circle cx="200" cy="350" r="20" fill="black" />
        <circle cx="850" cy="350" r="20" fill="black" />
        <circle cx="900" cy="350" r="20" fill="black" />
      </g>

      <g v-else-if="isSPMT">
        <!-- SPMT Platform -->
        <rect
          x="100"
          y="250"
          width="1000"
          height="60"
          fill="var(--color-surface)"
          stroke="var(--color-primary)"
          stroke-width="2"
        />
        <text x="600" y="285" text-anchor="middle" fill="var(--color-text)">
          SPMT Platform
        </text>

        <!-- Cargo -->
        <rect
          x="200"
          y="150"
          width="800"
          height="100"
          fill="var(--color-warning)"
          fill-opacity="0.3"
          stroke="var(--color-warning)"
          stroke-width="2"
          stroke-dasharray="5,5"
        />
        <text x="600" y="205" text-anchor="middle" fill="var(--color-text)">
          Cargo
        </text>

        <!-- Axle lines (simplified) -->
        <circle cx="200" cy="350" r="15" fill="black" />
        <circle cx="400" cy="350" r="15" fill="black" />
        <circle cx="600" cy="350" r="15" fill="black" />
        <circle cx="800" cy="350" r="15" fill="black" />
        <circle cx="1000" cy="350" r="15" fill="black" />
      </g>

      <g v-else>
        <text x="600" y="200" text-anchor="middle" fill="var(--color-text-secondary)">
          No valid specification
        </text>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  spec: Record<string, unknown>
}>()

const emit = defineEmits<{
  selectModule: [moduleId: string]
}>()

const svgWidth = 1200
const svgHeight = 400

const isOpenDeckTrain = computed(() => {
  return props.spec?.assembly_type === 'open_deck_train'
})

const isSPMT = computed(() => {
  return props.spec?.assembly_type === 'spmt'
})

function selectModule(moduleId: string) {
  emit('selectModule', moduleId)
}
</script>

<style scoped>
.engineering-schematic {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.schematic-svg {
  max-width: 100%;
  height: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: white;
}

.dark .schematic-svg {
  background: #1a1a1a;
}

.clickable {
  cursor: pointer;
  transition: opacity 0.2s;
}

.clickable:hover {
  opacity: 0.8;
}
</style>
