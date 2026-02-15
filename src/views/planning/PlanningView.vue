<template>
  <div class="planning-view-wizard">
    <!-- Header / Steps -->
    <header class="wizard-header">
      <div class="container-fluid d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
             <h4 class="mb-0 me-4">Transport Engineer</h4>
             <div class="steps-indicator">
                 <div class="step-item" :class="{ active: currentStep >= 1, current: currentStep === 1 }">
                     <span class="step-num">1</span> Context
                 </div>
                 <div class="step-line" :class="{ active: currentStep >= 2 }"></div>
                 <div class="step-item" :class="{ active: currentStep >= 2, current: currentStep === 2 }">
                     <span class="step-num">2</span> Cargo
                 </div>
                 <div class="step-line" :class="{ active: currentStep >= 3 }"></div>
                 <div class="step-item" :class="{ active: currentStep >= 3, current: currentStep === 3 }">
                     <span class="step-num">3</span> Equipment
                 </div>
                  <div class="step-line" :class="{ active: currentStep >= 4 }"></div>
                 <div class="step-item" :class="{ active: currentStep >= 4, current: currentStep === 4 }">
                     <span class="step-num">4</span> Route
                 </div>
                  <div class="step-line" :class="{ active: currentStep >= 5 }"></div>
                 <div class="step-item" :class="{ active: currentStep >= 5, current: currentStep === 5 }">
                     <span class="step-num">5</span> Review
                 </div>
             </div>
        </div>
        
        <div class="actions">
             <BaseButton variant="secondary" class="ms-2" @click="store.resetPlan()">New Plan</BaseButton>
        </div>
      </div>
    </header>

    <!-- Main Content Grid -->
    <div class="wizard-content">
        <!-- Setup Area (Steps 1, 2, 3) -->
        <div v-show="currentStep <= 5" class="content-stage">
            
            <!-- Step 1: Project Context -->
             <div v-if="currentStep === 1" class="step-panel animate-fade">
                 <div class="center-card">
                     <h3>Project Context</h3>
                     <p class="text-muted">Start by defining the project reference.</p>
                     
                     <div class="form-group mb-3">
                         <label class="form-label">Client Name</label>
                         <input v-model="project.clientName" type="text" class="form-control" placeholder="e.g. Shell" autofocus />
                     </div>
                     <div class="form-group mb-3">
                         <label class="form-label">Job Reference</label>
                         <input v-model="project.jobReference" type="text" class="form-control" placeholder="e.g. TR-2024-558" />
                     </div>
                     <div class="form-group mb-3">
                         <label class="form-label">Date</label>
                         <input v-model="project.date" type="date" class="form-control" />
                     </div>
                 </div>
             </div>

             <!-- Step 2: Cargo -->
             <div v-if="currentStep === 2" class="step-panel animate-fade">
                 <CargoDesigner v-model="cargo" />
             </div>

             <!-- Step 3: Equipment -->
             <div v-if="currentStep === 3" class="step-panel animate-fade">
                 <EquipmentBuilder v-model="equipment" />
             </div>

             <!-- Step 4: Route -->
             <div v-show="currentStep === 4" class="step-panel animate-fade h-100">
                 <!-- We use v-show for map to preserve state/tiles -->
                 <div class="map-wrapper h-100">
                     <PlannedRouteMapRefactored 
                        v-model="routeData" 
                        :editing="true" 
                        height="100%" 
                     />
                 </div>
             </div>

             <!-- Step 5: Review & Validate -->
             <div v-if="currentStep === 5" class="step-panel animate-fade">
                 <div class="review-dashboard">
                     <div class="row">
                         <div class="col-md-8">
                            <h4 class="mb-4">Engineering Summary</h4>
                             
                             <div class="card mb-4">
                                 <div class="card-header">Configuration</div>
                                 <div class="card-body">
                                     <table class="table table-sm">
                                         <tbody>
                                             <tr>
                                                 <td width="30%" class="text-muted">Transport</td>
                                                 <td><strong>{{ equipment.primeMover.name }}</strong> + <strong>{{ equipment.trailer.name }}</strong></td>
                                             </tr>
                                              <tr>
                                                 <td class="text-muted">Cargo</td>
                                                 <td>{{ cargo.name }} ({{ (cargo.weight_kg/1000).toFixed(1) }}t)</td>
                                             </tr>
                                             <tr>
                                                 <td class="text-muted">Route</td>
                                                 <td>
                                                     <span v-if="routeData.routeInfo">
                                                         {{ (routeData.routeInfo.distance / 1000).toFixed(1) }} km
                                                     </span>
                                                     <span v-else class="text-warning">Route not defined</span>
                                                 </td>
                                             </tr>
                                         </tbody>
                                     </table>
                                 </div>
                             </div>

                             <div class="d-flex gap-2">
                                 <BaseButton variant="primary" size="large" @click="savePlan">
                                     <PhCheckCircle size="20" class="me-2" /> Confirm Plan
                                 </BaseButton>
                                  <BaseButton variant="secondary" size="large">
                                     <PhFilePdf size="20" class="me-2" /> Export PDF
                                 </BaseButton>
                             </div>
                         </div>
                         <div class="col-md-4">
                             <EngineeringValidator :result="store.validationResult" />
                         </div>
                     </div>
                 </div>
             </div>

        </div>
    </div>

    <!-- Footer Controls -->
    <footer class="wizard-footer">
        <div class="container-fluid d-flex justify-content-between align-items-center">
            <div class="validation-summary">
                <!-- Mini validator for steps 2-4 -->
                <div v-if="currentStep > 1 && currentStep < 5" class="d-flex align-items-center">
                    <EngineeringValidator :result="store.validationResult" class="mini-validator" />
                </div>
            </div>
            
            <div class="nav-buttons">
                <BaseButton 
                    v-if="currentStep > 1" 
                    variant="secondary" 
                    @click="prevStep"
                    class="me-2"
                >
                    Back
                </BaseButton>
                
                <BaseButton 
                    v-if="currentStep < 5" 
                    variant="primary" 
                    @click="nextStep"
                    :disabled="isNextDisabled"
                >
                    Next Step <PhArrowRight size="16" class="ms-2" />
                </BaseButton>
            </div>
        </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router'; // Add router import
import { usePlanningStore } from '@/stores/planning';
import { useNotifications } from '@/composables/useNotifications.js';

// Components
import CargoDesigner from './components/CargoDesigner.vue';
import EquipmentBuilder from './components/EquipmentBuilder.vue';
import EngineeringValidator from './components/EngineeringValidator.vue';
import PlannedRouteMapRefactored from '@/components/planned_routes/PlannedRouteMapRefactored.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { PhCheckCircle, PhFilePdf, PhArrowRight } from "@phosphor-icons/vue";

// Initialize router
const router = useRouter();

const store = usePlanningStore();
const { currentStep, project, cargo, equipment, routeData } = storeToRefs(store);

// Navigation Logic
function nextStep() {
    if (currentStep.value < 5) currentStep.value++;
}

function prevStep() {
    if (currentStep.value > 1) currentStep.value--;
}

const isNextDisabled = computed(() => {
    if (currentStep.value === 1 && !project.value.clientName) return true;
    if (currentStep.value === 2 && !cargo.value.weight_kg) return true;
    // can add more strict checks
    return false;
});

// Watchers
watch([cargo, equipment], () => {
    store.runValidation();
}, { deep: true });

// Notification system
const { sendSingleNotification } = useNotifications();

// State for saving
const isSaving = ref(false);

async function savePlan() {
    isSaving.value = true;
    try {
        const res = await store.savePlan();
        if (res.result) {
           await sendSingleNotification({
               message: 'Transport Plan confirmed and saved successfully!',
               type: 'success',
               timeout: 5000
           });
           
           // Small delay to let user see feedback before navigation
           setTimeout(() => {
               router.push({ name: 'PlannedRoutes' });
           }, 1000);
        } else {
           await sendSingleNotification({
               message: 'Failed to save plan: ' + res.message,
               type: 'error',
               timeout: 5000
           });
        }
    } catch (e) {
        console.error(e);
        await sendSingleNotification({
            message: 'An unexpected error occurred while saving.',
            type: 'error',
            timeout: 5000
        });
    } finally {
        isSaving.value = false;
    }
}
</script>

<style scoped>
.planning-view-wizard {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: var(--bg-base);
    overflow: hidden;
}

.wizard-header {
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border);
    padding: 0.75rem 0;
    flex-shrink: 0;
}

.steps-indicator {
    display: flex;
    align-items: center;
}

.step-item {
    display: flex;
    align-items: center;
    color: var(--text-tertiary);
    font-weight: 500;
    font-size: 0.9rem;
}

.step-item.active {
    color: var(--text-secondary);
}

.step-item.current {
    color: var(--accent);
    font-weight: 700;
}

.step-num {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--border);
    color: var(--text-tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    font-size: 0.8rem;
}

.step-item.active .step-num {
    background: var(--accent-surface); /* Light primary */
    color: var(--accent);
}

.step-item.current .step-num {
    background: var(--accent);
    color: white;
}

.step-line {
    width: 40px;
    height: 2px;
    background: var(--border);
    margin: 0 12px;
}

.step-line.active {
    background: var(--accent-surface);
}

/* Content Area */
.wizard-content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    position: relative;
    /* max-width: 1400px;
    margin: 0 auto;
    width: 100%; */
}

.content-stage {
    height: 100%;
}

.step-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.animate-fade {
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
}

.center-card {
    background: var(--bg-surface);
    padding: 3rem;
    border-radius: 12px;
    border: 1px solid var(--border);
    max-width: 500px;
    margin: 4rem auto;
    width: 100%;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 10%);
}

.map-wrapper {
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--border);
    background: var(--bg-surface);
}

.mini-validator {
    /* Scale down Validator for footer */
    transform: scale(0.8);
    transform-origin: left center;
    width: 500px;
    background: transparent !important;
}

.mini-validator :deep(.card) { 
    background: transparent !important; 
    box-shadow: none !important; 
    border: none !important;
}
.mini-validator :deep(.metric-box) { padding: 4px 8px; }
.mini-validator :deep(.value) { font-size: 0.9rem; }
.mini-validator :deep(.label) { font-size: 0.6rem; }
.mini-validator :deep(.card-header) { display: none; }


.wizard-footer {
    background: var(--bg-surface);
    border-top: 1px solid var(--border);
    padding: 1rem 0;
    flex-shrink: 0;
}
</style>
