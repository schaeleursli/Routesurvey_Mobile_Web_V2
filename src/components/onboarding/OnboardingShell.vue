<template>
  <div class="onboarding-shell">
    <EngineeringBackground />
    
    <div class="progress-bar-container">
        <div class="progress-bar" :style="{ width: progress + '%' }"></div>
    </div>
    
    <div class="content-wrapper">
        <slot></slot>
    </div>

    <!-- Navigation Slot (Buttons usually) -->
    <div class="footer-nav" v-if="$slots.footer">
        <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import EngineeringBackground from './EngineeringBackground.vue';

defineProps({
    progress: {
        type: Number,
        default: 0
    }
});
</script>

<style scoped>
.onboarding-shell {
    min-height: 100vh;
    /* background: var(--bg-base, #f8f9fa); Remove bg to show animation */
    display: flex;
    flex-direction: column;
    position: relative;
    overflow-x: hidden;
}

.progress-bar-container {
    height: 4px;
    background: var(--bg-alt, #e2e8f0);
    width: 100%;
    position: relative;
    z-index: 10;
}

.progress-bar {
    height: 100%;
    background: var(--accent, #0f62fe);
    transition: width 0.3s ease;
}

.content-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
    position: relative;
    z-index: 10;
}

.footer-nav {
    padding: 2rem;
    background: var(--bg-surface, #fff);
    border-top: 1px solid var(--border, #e2e8f0);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 10;
}
</style>
