<template>
    <img 
        :src="iconSrc" 
        :alt="alt" 
        :width="size" 
        :height="size"
        class="rs-icon"
        :class="[`rs-icon--${variant}`]"
        :style="colorStyle"
    />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RsIcons, type RsIconName } from './rsIcons';

const props = defineProps<{
    /** Icon name from RsIcons token */
    name: RsIconName;
    /** Size in pixels (default: 24) */
    size?: number;
    /** Semantic label for accessibility */
    alt?: string;
    /** Color variant for theming */
    variant?: 'default' | 'muted' | 'primary' | 'success' | 'warning' | 'error';
    /** Custom color override (CSS color value) */
    color?: string;
}>();

const iconSrc = computed(() => {
    return RsIcons[props.name] || RsIcons.other;
});

const size = computed(() => props.size || 24);
const alt = computed(() => props.alt || props.name);
const variant = computed(() => props.variant || 'default');

const colorStyle = computed(() => {
    if (props.color) {
        return { filter: `drop-shadow(0 0 0 ${props.color})` };
    }
    return {};
});
</script>

<style scoped>
.rs-icon {
    display: inline-block;
    flex-shrink: 0;
    vertical-align: middle;
}

.rs-icon--default {
    /* Uses SVG's native colors */
}

.rs-icon--muted {
    opacity: 0.5;
}

.rs-icon--primary {
    filter: brightness(0) saturate(100%) invert(49%) sepia(94%) saturate(1436%) hue-rotate(169deg) brightness(99%) contrast(101%);
}

.rs-icon--success {
    filter: brightness(0) saturate(100%) invert(60%) sepia(47%) saturate(544%) hue-rotate(112deg) brightness(92%) contrast(88%);
}

.rs-icon--warning {
    filter: brightness(0) saturate(100%) invert(73%) sepia(76%) saturate(682%) hue-rotate(359deg) brightness(103%) contrast(104%);
}

.rs-icon--error {
    filter: brightness(0) saturate(100%) invert(28%) sepia(96%) saturate(2035%) hue-rotate(342deg) brightness(89%) contrast(96%);
}
</style>
