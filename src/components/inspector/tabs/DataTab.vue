<template>
  <div class="data-tab">
    <RoadSection />
    <SchemaFormRenderer />
  </div>
</template>

<script setup lang="ts">
import RoadSection from './RoadSection.vue';
import SchemaFormRenderer from './SchemaFormRenderer.vue';
</script>

<style scoped>
.data-tab {
  padding: 1rem;
}
</style>
