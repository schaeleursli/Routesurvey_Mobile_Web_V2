<template>
  <component :is="iconComponent" :size="size" :weight="weight" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  PhNavigationArrow,
  PhBridge,
  PhTrain,
  PhTrafficSign,
  PhLightning,
  PhArrowsDownUp,
  PhWarningCircle,
  PhMagnifyingGlass,
  PhInfo,
  PhDotsThree,
  PhCrosshair,
} from '@phosphor-icons/vue';

const props = withDefaults(
  defineProps<{
    type?: string | null;
    size?: number;
    weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  }>(),
  {
    type: null,
    size: 18,
    weight: 'regular',
  }
);

const iconMap: Record<string, any> = {
  // Road types
  road: PhNavigationArrow,
  intersection: PhCrosshair,
  roundabout: PhCrosshair,
  sharp_turn: PhNavigationArrow,
  ramp: PhNavigationArrow,
  left_turn: PhNavigationArrow,
  right_turn: PhNavigationArrow,
  curvy: PhNavigationArrow,
  narrow: PhNavigationArrow,
  straight: PhNavigationArrow,

  // Structures
  bridge: PhBridge,
  tunnel: PhBridge,
  gantry: PhBridge,
  underpass: PhBridge,

  // Rail
  rail_crossing: PhTrain,

  // Overhead
  powerline: PhLightning,
  powerlines: PhLightning,
  overhead: PhArrowsDownUp,
  overhead_obstruction: PhArrowsDownUp,
  traffic_signal: PhTrafficSign,
  pipe_rack: PhArrowsDownUp,
  sign: PhTrafficSign,

  // General
  obstruction: PhWarningCircle,
  observation: PhMagnifyingGlass,
  info: PhInfo,
  other: PhDotsThree,
};

const iconComponent = computed(() => {
  if (!props.type) return PhInfo;
  const key = props.type.toLowerCase();
  return iconMap[key] || PhInfo;
});
</script>
