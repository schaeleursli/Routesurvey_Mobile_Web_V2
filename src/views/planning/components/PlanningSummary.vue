<template>
  <div class="planning-summary-panel">
    <div class="metrics-row">
      <div class="metric-item">
        <label>Height (H)</label>
        <span class="value">{{ formattedHeight }} <span class="unit">m</span></span>
      </div>
      <div class="metric-item">
        <label>Width (W)</label>
        <span class="value">{{ formattedWidth }} <span class="unit">m</span></span>
      </div>
      <div class="metric-item">
        <label>Length (L) <small class="text-muted">(Deck vs Cargo)</small></label>
        <span class="value">{{ formattedLength }} <span class="unit">m</span></span>
      </div>
      <div class="metric-item">
        <label>Total Weight</label>
        <span class="value">{{ formattedGVW }} <span class="unit">kg</span></span>
      </div>
      
      <div class="action-wrapper">
         <BaseButton 
          :disabled="!canCalculate" 
          @click="onCalculate"
          variant="primary"
          class="calculate-btn"
          :class="{ 'pulse-animation': localIsOutOfDate }"
        >
          <i class="bi bi-calculator me-2"></i>
          {{ localIsOutOfDate ? 'Recalculate' : 'Calculate' }}
        </BaseButton>
         <div v-if="localIsOutOfDate" class="badge-warning floating-badge">
            <i class="bi bi-exclamation-circle-fill me-1"></i> Out of date
         </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import BaseButton from '@/components/ui/BaseButton.vue';

const props = defineProps({
  metrics: {
    type: Object,
    default: () => ({ h: 0, w: 0, l: 0, gvw: 0 })
  },
  isOutOfDate: {
    type: Boolean,
    default: false
  },
  canCalculate: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['calculate']);

const localIsOutOfDate = computed(() => props.isOutOfDate);

const formattedHeight = computed(() => (props.metrics?.h || 0).toFixed(2));
const formattedWidth = computed(() => (props.metrics?.w || 0).toFixed(2));
const formattedLength = computed(() => (props.metrics?.l || 0).toFixed(2));
const formattedGVW = computed(() => (props.metrics?.gvw || 0).toLocaleString());

function onCalculate() {
  emit('calculate');
}
</script>

<style scoped>
.planning-summary-panel {
  padding: 1.5rem 2rem;
  background: white;
  border-top: 1px solid #E5E7EB;
  box-shadow: 0 -4px 6px -1px rgb(0 0 0 / 5%);
}

.metrics-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metric-item label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6B7280; /* Neutral-500 */
  font-weight: 600;
}

.metric-item .value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827; /* Gray-900 */
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.metric-item .unit {
  font-size: 0.875rem;
  color: #9CA3AF;
  font-weight: 500;
  margin-left: 2px;
}

.text-muted {
  font-size: 0.7em;
  color: #9CA3AF;
  text-transform: none;
  font-weight: 400;
}

.action-wrapper {
  margin-left: auto;
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.calculate-btn {
  min-width: 140px;
  height: 48px;
  font-size: 1rem;
  font-weight: 600;
}

.floating-badge {
    position: absolute;
    top: -12px;
    right: -10px;
    background: #F59E0B;
    color: white;
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 600;
    box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
    white-space: nowrap;
}

.pulse-animation {
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0% { box-shadow: 0 0 0 0 rgb(0 167 225 / 70%); }
  70% { box-shadow: 0 0 0 10px rgb(0 167 225 / 0%); }
  100% { box-shadow: 0 0 0 0 rgb(0 167 225 / 0%); }
}
</style>
