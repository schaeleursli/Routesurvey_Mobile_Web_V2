<template>
  <div class="help-center-layout">
    <HelpCenterNav />
    <main class="help-center-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import HelpCenterNav from './HelpCenterNav.vue'
</script>

<style scoped>
.help-center-layout {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem;
}

.help-center-content {
  max-width: 1200px;
  margin: 0 auto;
}

@media (width <= 640px) {
  .help-center-layout {
    padding: 1rem;
  }
}
</style>