<script setup lang="ts">
import { computed } from 'vue'
import { useSurveyReviewStore } from '@/stores/surveyReviewStore'
const store = useSurveyReviewStore()
const sections = computed(() => store.selectedPointId
  ? (store.scanEvidenceByPoint[store.selectedPointId] ?? []) : [])
</script>
<template>
  <section v-if="store.selectedPointId" aria-label="3D scan evidence" class="scan-evidence">
    <h3>3D scan evidence</h3>
    <p v-if="sections.length === 0">No authorized 3D evidence loaded for this survey point.</p>
    <div v-for="(section, index) in sections" :key="index">
      <p>Scan evidence section {{ index + 1 }} — source records available for report integration</p>
    </div>
    <p class="warning">3D reconstruction is visual evidence only. Verify clearances independently.</p>
  </section>
</template>
<style scoped>
.scan-evidence{padding:12px;border-top:1px solid #cbd5e1}
.scan-evidence h3{font-size:1rem}
.warning{font-size:.85rem;color:#92400e}
</style>
