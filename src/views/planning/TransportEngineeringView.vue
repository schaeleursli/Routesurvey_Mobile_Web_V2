<template>
  <div class="transport-engineering-view">
    <header class="page-header">
      <div class="header-content">
        <h2>Transport Engineering</h2>
        <div class="status-strip">
           <span class="badge" :class="statusClass">
             Calculation: {{ statusLabel }}
           </span>
        </div>
      </div>
       <BaseButton variant="secondary" @click="goToPlanning">
         <i class="bi bi-arrow-left me-2"></i> Back to Planning
      </BaseButton>
    </header>

    <div class="content-scroll">
      <div class="section-card">
        <h3><i class="bi bi-truck me-2"></i> Trailer Configuration</h3>
        <TrailerTab v-model="planningStore.trailer" />
      </div>

      <div class="section-card">
        <h3><i class="bi bi-box-seam me-2"></i> Cargo Configuration</h3>
        <TransportTab v-model="planningStore.cargo" />
      </div>

       <div class="section-card">
        <h3><i class="bi bi-clipboard-check me-2"></i> Pre-Survey Checks</h3>
        <SurveyTab v-model="planningStore.survey" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePlanningStore } from '@/stores/planning';
import TrailerTab from './tabs/TrailerTab.vue';
import TransportTab from './tabs/TransportTab.vue';
import SurveyTab from './tabs/SurveyTab.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

const router = useRouter();
const planningStore = usePlanningStore();

const statusLabel = computed(() => {
  switch (planningStore.calculationStatus) {
    case 'up_to_date': return 'Up to Date';
    case 'out_of_date': return 'Out of Date';
    default: return 'Not Calculated';
  }
});

const statusClass = computed(() => {
  switch (planningStore.calculationStatus) {
    case 'up_to_date': return 'bg-success text-white';
    case 'out_of_date': return 'bg-warning text-dark';
    default: return 'bg-secondary text-white';
  }
});

function goToPlanning() {
  router.push({ name: 'Planning' });
}

</script>

<style scoped>
.transport-engineering-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.page-header {
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h2 {
  margin: 0;
  font-size: 1.5rem;
}

.status-strip {
  margin-top: 0.5rem;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.bg-success { background-color: #2e7d32; }
.bg-warning { background-color: #f57f17; }
.bg-secondary { background-color: #757575; }

.content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.section-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
}

.section-card h3 {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
  color: #333;
}
</style>
