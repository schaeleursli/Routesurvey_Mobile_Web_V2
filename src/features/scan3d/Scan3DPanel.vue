<script setup>
import { computed } from 'vue'
import { validateScanRecord } from './scanRecord.js'
const props = defineProps({
  record: { type: Object, default: null },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['capture', 'open-asset'])
const safeRecord = computed(() => {
  try { return props.record ? validateScanRecord(props.record) : null } catch { return null }
})
</script>

<template>
  <section class="scan3d-panel" aria-label="3D obstruction scan">
    <div class="scan3d-heading">
      <h3>3D Obstruction Capture</h3>
      <button type="button" :disabled="disabled" @click="emit('capture')">Add 3D Scan</button>
    </div>
    <p class="scan3d-muted">Photograph or scan this obstruction on iPhone, then attach the 3D reconstruction to this survey record.</p>
    <template v-if="safeRecord">
      <dl>
        <dt>Scan</dt><dd>{{ safeRecord.scanId }}</dd>
        <dt>Processing</dt><dd>{{ safeRecord.status }}</dd>
        <dt>Measurement evidence</dt><dd>{{ safeRecord.measurementStatus.replace('_', ' ') }}</dd>
        <dt>Reconstruction</dt><dd>{{ safeRecord.reconstructionMethod }}</dd>
      </dl>
      <p v-if="safeRecord.measurementStatus !== 'field_verified'" class="scan3d-warning">
        Visual reconstruction only. Do not use AI-derived dimensions as transport clearance measurements.
      </p>
      <button v-if="safeRecord.asset && safeRecord.status === 'ready'" type="button" @click="emit('open-asset', safeRecord.asset)">
        Open 3D Asset
      </button>
    </template>
    <p v-else class="scan3d-muted">No validated scan attached.</p>
  </section>
</template>

<style scoped>
.scan3d-panel{border:1px solid #cbd5e1;border-radius:12px;padding:16px}
.scan3d-heading{display:flex;align-items:center;justify-content:space-between;gap:12px}
h3{margin:0;font-size:1.05rem}
button{border:0;border-radius:8px;background:#164e63;color:white;padding:10px 14px;cursor:pointer}
button:disabled{opacity:.5;cursor:not-allowed}
.scan3d-muted{color:#64748b}
dl{display:grid;grid-template-columns:max-content 1fr;gap:8px 14px}
dt{font-weight:600}dd{margin:0;overflow-wrap:anywhere}
.scan3d-warning{border-left:3px solid #b45309;padding-left:10px;color:#92400e}
</style>
