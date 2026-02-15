<script setup>
import { computed } from 'vue';
import { 
  PhosphorIcons, 
  // We will dynamically import icons or register them globally if bundle size permits, 
  // but for now let's assume we pass the component or name.
  // Actually, @phosphor-icons/vue usually exports components. 
  // A better pattern for a "GlIcon" wrapper with Phosphor is to accept the icon component itself
  // or a string name if we map them.
} from '@phosphor-icons/vue';

const props = defineProps({
  name: {
    type: String, // standardized name if we go that route, or we can use slots/component passing
    required: false
  },
  size: {
    type: [Number, String],
    default: 20
  },
  weight: {
    type: String, // 'regular', 'bold', 'fill', etc.
    default: 'regular'
  },
  spin: {
    type: Boolean,
    default: false
  }
});

// For now, let's just make this a pass-through that ensures consistent sizing/coloring class application
// and allows for future "name" string lookup if we build a registry.
</script>

<template>
  <i class="gl-icon" :style="{ fontSize: size + 'px', display: 'inline-flex', alignItems: 'center' }">
    <!-- Slot for direct component usage (Preferred for tree-shaking) -->
    <slot></slot>
  </i>
</template>

<style scoped>
.gl-icon {
  line-height: 1;
  vertical-align: middle;
}
</style>
