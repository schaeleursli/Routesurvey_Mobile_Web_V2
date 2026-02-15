<template>
  <OnboardingShell :progress="progress">
      <!-- Steps -->
      <transition name="step-slide" mode="out-in">
          <!-- Step 1: Role -->
          <div v-if="step === 1" key="step1" class="step-content">
              <h2 class="step-title">What's your primary role?</h2>
              <p class="step-desc">This helps us customize your toolset—hiding what you don't need and highlighting what you do.</p>
              
              <div class="options-grid">
                  <button 
                    v-for="role in roles" 
                    :key="role.value"
                    class="option-card"
                    :class="{ selected: form.role === role.value }"
                    @click="form.role = role.value"
                  >
                      <component :is="role.icon" :size="32" />
                      <div class="option-text">
                        <span class="option-label">{{ role.label }}</span>
                        <span class="option-sub">{{ role.desc }}</span>
                      </div>
                  </button>
              </div>
          </div>

          <!-- Step 2: Theme -->
          <div v-else-if="step === 2" key="step2" class="step-content">
              <h2 class="step-title">Choose your look</h2>
              <p class="step-desc">Select the interface theme that best suits your working environment.</p>

              <div class="options-grid">
                  <button 
                    class="option-card"
                    :class="{ selected: uiStore.theme === 'light' }"
                    @click="uiStore.setTheme('light')"
                  >
                      <PhSun :size="32" />
                      <div class="option-text">
                        <span class="option-label">Light Mode</span>
                        <span class="option-sub">Best for office work and bright daylight.</span>
                      </div>
                  </button>
                   <button 
                    class="option-card"
                    :class="{ selected: uiStore.theme === 'dark' }"
                    @click="uiStore.setTheme('dark')"
                  >
                      <PhMoonStars :size="32" />
                      <div class="option-text">
                        <span class="option-label">Dark Mode</span>
                        <span class="option-sub">Reduced eye strain for night shifts.</span>
                      </div>
                  </button>
              </div>
          </div>

          <!-- Step 3: Preferences -->
          <div v-else-if="step === 3" key="step3" class="step-content">
              <h2 class="step-title">Set your preferences</h2>
              <p class="step-desc">Choose how you want to see data. You can mix and match later if needed.</p>
              
              <div class="pref-group">
                <label>Unit System</label>
                <div class="toggle-group">
                    <button 
                        :class="{ active: form.unit_system === 'Metric' }"
                        @click="form.unit_system = 'Metric'"
                    >
                        <span class="toggle-label">Metric</span>
                        <span class="toggle-sub">Meters, km</span>
                    </button>
                    <button 
                        :class="{ active: form.unit_system === 'Imperial' }"
                        @click="form.unit_system = 'Imperial'"
                    >
                        <span class="toggle-label">Imperial</span>
                        <span class="toggle-sub">Feet, miles</span>
                    </button>
                </div>
                
                <!-- Dynamic Data Preview -->
                <div class="data-preview">
                    <div class="preview-card">
                        <label>Max Height</label>
                        <span>{{ previewData.height }}</span>
                    </div>
                     <div class="preview-card">
                        <label>Max Weight</label>
                        <span>{{ previewData.weight }}</span>
                    </div>
                     <div class="preview-card">
                        <label>Speed Limit</label>
                        <span>{{ previewData.speed }}</span>
                    </div>
                </div>

                <p class="input-hint">
                    <PhInfo :size="16" class="me-1" /> Sample data updates as you toggle.
                </p>
              </div>
          </div>

           <!-- Step 4: Obstruction Cards -->
          <div v-else-if="step === 4" key="step4" class="step-content">
               <h2 class="step-title">Prioritize your hazards</h2>
               <p class="step-desc">Drag to reorder the obstruction types you encounter most often.</p>

               <div class="draggable-container">
                   <draggable 
                        v-model="obstructions" 
                        item-key="id"
                        ghost-class="ghost"
                        drag-class="drag"
                    >
                        <template #item="{element}">
                             <div class="sortable-item">
                                <PhDotsSixVertical :size="20" class="handle" />
                                <component :is="element.icon" :size="24" class="item-icon" />
                                <span>{{ element.label }}</span>
                                <div class="toggle-check">
                                    <input type="checkbox" v-model="element.enabled" @click.stop />
                                </div>
                            </div>
                        </template>
                   </draggable>
               </div>
          </div>

          <!-- Step 5: Mobile App -->
          <div v-else-if="step === 5" key="step5" class="step-content">               <h2 class="step-title">Take RouteSurvey with you</h2>
               <p class="step-desc">Download the mobile app to survey offline and sync your data instantly.</p>
               
               <div class="mobile-app-container">
                    <div class="qr-section">
                        <div class="qr-wrapper">
                            <QrcodeVue value="https://routesurvey.app/download" :size="140" level="M" />
                        </div>
                        <span class="qr-caption">Scan to download</span>
                    </div>

                    <div class="app-instructions">
                        <div class="instruction-item">
                            <PhDeviceMobile :size="24" />
                            <div>
                                <strong>Get the App</strong>
                                <p>Available for iOS and Android.</p>
                            </div>
                        </div>
                         <div class="instruction-item">
                            <PhUserCheck :size="24" />
                            <div>
                                <strong>Log In</strong>
                                <p>Use your account to sync effortlessly.</p>
                            </div>
                        </div>
                        
                        <a href="https://routesurvey.app/help/quick-start" target="_blank" class="tutorial-link">
                            <PhPlayCircle :size="20" /> Watch Quick Start Guide
                        </a>
                    </div>
               </div>
          </div>

           <!-- Step 6: First Project -->
          <div v-else-if="step === 6" key="step6" class="step-content">
              <h2 class="step-title">Let's create your first project</h2>
              <p class="step-desc">Projects keep your routes, surveys, and reports organized under one client or job.</p>
              
              <BaseFormField 
                label="Project Name" 
                v-model="form.project_name" 
                placeholder="e.g. Northwind Heavy Haul 2024"
                hint="This will be the default folder for your first surveys."
                class="mb-3"
              />
              <BaseFormField 
                label="Client (Optional)" 
                v-model="form.client"
                placeholder="e.g. Acme Logistics"
                hint="We use this to auto-fill report headers."
              />
          </div>

          <!-- Step 7: Completion & Profile -->
           <div v-else-if="step === 7" key="step7" class="step-content">
              <div class="completion-hero">
                  <PhCheckCircle :size="64" weight="fill" class="success-icon" />
                  <h2 class="step-title">You're all set!</h2>
                  <p class="step-desc">Your workspace is ready. You can access your profile settings at any time to manage your team and subscription.</p>
              </div>

              <div class="profile-links">
                  <a href="#" class="profile-card">
                      <div class="icon-box"><PhUserGear :size="24" weight="duotone" /></div>
                      <div class="text">
                          <strong>User Profile</strong>
                          <span>Manage account</span>
                      </div>
                      <PhCaretRight :size="16" class="arrow" />
                  </a>
                   <a href="#" class="profile-card">
                      <div class="icon-box"><PhBuildings :size="24" weight="duotone" /></div>
                      <div class="text">
                          <strong>Company Profile</strong>
                          <span>Team & Billing</span>
                      </div>
                      <PhCaretRight :size="16" class="arrow" />
                  </a>
              </div>
          </div>
      </transition>

      <template #footer>
          <BaseButton variant="ghost" @click="prevStep" :disabled="step === 1 || step === 7">Back</BaseButton>
          <BaseButton @click="nextStep" :loading="isLoading">
              {{ step === 7 ? 'Go to Dashboard' : 'Continue' }}
          </BaseButton>
      </template>

      <TipsCarousel 
        v-if="showTips" 
        :visible="showTips" 
        pack-id="basic"
        @close="handleTipsClose" 
        @complete="handleTipsComplete"
      />
  </OnboardingShell>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import OnboardingShell from '@/components/onboarding/OnboardingShell.vue';
import TipsCarousel from '@/components/field_guide/TipsCarousel.vue';
import { BaseButton, BaseFormField } from '@/components/ui';
import QrcodeVue from 'qrcode.vue';
import draggable from 'vuedraggable';
import { 
    PhSun, PhMoonStars, PhInfo, PhDotsSixVertical, PhDeviceMobile, 
    PhUserCheck, PhPlayCircle, PhCheckCircle, PhUserGear, PhCaretRight,
    PhBuildings, PhTruck, PhMapPin, PhClipboardText, PhWall,
    PhLightning, PhArrowsInLineHorizontal, PhArrowUUpLeft, PhTrendUp
} from "@phosphor-icons/vue";

const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUIStore();

const step = ref(1);
const isLoading = ref(true);
const showTips = ref(false);

const form = reactive({
    role: '',
    unit_system: 'Metric',
    project_name: '',
    client: ''
});

// Step 4: Obstruction Cards (Default Order)
const obstructions = ref([
    { id: 'bridge', label: 'Bridge', icon: PhWall, enabled: true },
    { id: 'overhead', label: 'Overhead Wire', icon: PhLightning, enabled: true },
    { id: 'road_width', label: 'Road Width', icon: PhArrowsInLineHorizontal, enabled: true },
    { id: 'turn', label: 'Tight Turn', icon: PhArrowUUpLeft, enabled: true },
    { id: 'slope', label: 'Steep Slope', icon: PhTrendUp, enabled: true },
]);

// Step 3: Dynamic Data Preview
const previewData = computed(() => {
    return form.unit_system === 'Metric' 
        ? { height: '4.50 m', weight: '45.0 t', speed: '80 km/h' }
        : { height: '14\' 9"', weight: '99.2 kips', speed: '50 mph' };
});

const roles = [
    { value: 'Transport Engineer', label: 'Transport Engineer', icon: PhTruck, desc: 'Planning feasibility and swept paths.' },
    { value: 'Surveyor', label: 'Surveyor', icon: PhMapPin, desc: 'Collecting field data and observations.' },
    { value: 'Logistics Manager', label: 'Logistics Manager', icon: PhClipboardText, desc: 'Overseeing projects and reports.' },
    { value: 'EPC', label: 'EPC', icon: PhBuildings, desc: 'Managing large-scale infrastructure.' }
];

const progress = computed(() => (step.value / 7) * 100);

const prevStep = () => {
    if (step.value > 1) step.value--;
};

const nextStep = async () => {
    if (step.value < 7) {
        step.value++;
    } else {
        await finishOnboarding();
    }
};

const finishOnboarding = async () => {
    isLoading.value = true;
    try {
        await authStore.completeOnboarding({
            ...form,
            obstruction_order: obstructions.value.map(o => o.id), // Persist preference
            theme: uiStore.theme
        });
        showTips.value = true;
    } catch (error) {
        console.error(error);
    } finally {
        isLoading.value = false;
    }
};

const handleTipsClose = () => {
     showTips.value = false;
     router.push('/dashboard');
};

const handleTipsComplete = () => {
    // maybe mark tips as seen
};
</script>

<style scoped>
.step-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1rem;
    text-align: center;
    color: var(--text-primary);
}
.step-desc {
    color: var(--text-secondary);
    text-align: center;
    margin-bottom: 2rem;
}
.options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 2rem;
    width: 100%;
}
.option-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.75rem;
    padding: 1.5rem;
    border: 1px solid var(--border, #eee);
    border-radius: 12px;
    background: var(--bg-surface, #fff);
    cursor: pointer;
    transition: all 0.2s;
    height: 100%;
}
.option-card:hover {
    border-color: var(--accent, #0f62fe);
    box-shadow: var(--shadow-md, 0 4px 12px rgb(0 0 0 / 5%));
    transform: translateY(-2px);
}
.option-card.selected {
    border-color: var(--accent, #0f62fe);
    background: var(--bg-accent-light, #f0f7ff); /* Check if this var exists or needs fallback */
    color: var(--accent, #0f62fe);
}
/* Ensure selected card background is dark-mode friendly if needed, 
   or stick to accent-light behavior. 
   Usually --bg-accent-light might be too bright in dark mode? 
   Let's check base styling. It doesn't appear in design-system.css.
   I should probably use var(--bg-elevated) or defined color.
   But for now let's use:
*/
.option-card.selected {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 10%, var(--bg-surface)); 
    color: var(--accent);
}

.option-card i {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    color: var(--text-primary); /* Default icon color */
}
.option-card.selected i {
    color: var(--accent);
}

.option-text {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}
.option-label {
    font-weight: 600;
    font-size: 1rem;
    color: var(--text-primary);
}
.option-card.selected .option-label {
    color: var(--accent);
}

.option-sub {
    font-size: 0.8rem;
    color: var(--text-secondary, #888);
    line-height: 1.4;
}
.option-card.selected .option-sub {
    color: var(--accent);
    opacity: 0.8;
}
.toggle-group {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}
.toggle-group button {
    flex: 1;
    padding: 1rem;
    border: 1px solid var(--border, #eee);
    background: var(--bg-surface, #fff);
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    transition: all 0.2s;
}
.toggle-group button:hover {
    border-color: var(--accent, #0f62fe);
}
.toggle-group button.active {
    background: var(--accent, #0f62fe);
    color: white; /* Keep white for accent bg */
    border-color: var(--accent, #0f62fe);
}
/* Ensure active text stays white inside accent bg */
.toggle-group button.active .toggle-label,
.toggle-group button.active .toggle-sub {
    color: white;
}
/* Normal state text colors */
.toggle-label {
    font-weight: 600;
    font-size: 1rem;
    color: var(--text-primary);
}
.toggle-sub {
    font-size: 0.8rem;
    opacity: 0.7;
    color: var(--text-secondary);
}

.input-hint {
    margin-top: 0.75rem;
    font-size: 0.85rem;
    color: var(--text-secondary, #666);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* Mobile App Step */
.mobile-app-container {
    display: flex;
    align-items: center;
    gap: 2rem;
    background: var(--bg-surface, #fff);
    padding: 2rem;
    border-radius: 16px;
    border: 1px solid var(--border, #eee);
}

.qr-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.qr-wrapper {
    padding: 10px;
    background: white; /* QR Code usually needs white bg for contrast reliability */
    border: 1px solid var(--border, #eee);
    border-radius: 8px;
}

.qr-caption {
    font-size: 0.75rem;
    color: var(--text-tertiary, #888);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 0.5rem;
}

.app-instructions {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.instruction-item {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
}

.instruction-item i {
    font-size: 1.25rem;
    color: var(--accent, #0f62fe);
    margin-top: 0.1rem;
}

.instruction-item strong {
    display: block;
    margin-bottom: 0.25rem;
    color: var(--text-primary);
}

.instruction-item p {
    font-size: 0.9rem;
    color: var(--text-secondary, #666);
    margin: 0;
}

.tutorial-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--accent, #0f62fe);
    text-decoration: none;
    font-weight: 500;
    margin-top: 0.5rem;
    padding: 0.5rem 0;
    cursor: pointer;
}
.tutorial-link:hover {
    text-decoration: underline;
}

@media (width <= 600px) {
    .mobile-app-container {
        flex-direction: column;
        text-align: center;
    }
    .instruction-item {
        flex-direction: column;
        align-items: center;
    }
}

/* Data Preview */
.data-preview {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.75rem;
    margin-top: 1.5rem;
}
.preview-card {
    background: var(--bg-elevated, #f9f9f9);
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid var(--border, #eee);
    text-align: center;
}
.preview-card label {
    display: block;
    font-size: 0.7rem;
    text-transform: uppercase;
    color: var(--text-secondary, #888);
    margin-bottom: 0.25rem;
}
.preview-card span {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text-primary, #333);
}

/* Draggable Obstructions */
.draggable-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
}
.sortable-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: var(--bg-surface, #fff);
    border: 1px solid var(--border, #eee);
    border-radius: 8px;
    cursor: grab;
    transition: all 0.2s;
    color: var(--text-primary);
}
.sortable-item:hover {
    border-color: var(--accent, #0f62fe);
}
.sortable-item:active {
    cursor: grabbing;
}
.sortable-item.ghost {
    opacity: 0.5;
    background: var(--bg-elevated);
    border-color: var(--accent);
}
.handle {
    color: var(--text-secondary, #ccc);
    cursor: grab;
}
.item-icon {
    font-size: 1.2rem;
    color: var(--text-secondary, #666);
    width: 24px;
    height: 24px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
}
.toggle-check {
    margin-left: auto;
}

/* Profile Links (Step 7) */
.completion-hero {
    text-align: center;
    margin-bottom: 2rem;
}
.success-icon {
    font-size: 4rem;
    color: var(--success, #28a745);
    margin-bottom: 1rem;
    display: block;
    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.profile-links {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}
.profile-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid var(--border, #eee);
    border-radius: 12px;
    text-decoration: none;
    color: inherit;
    background: var(--bg-surface);
    transition: all 0.2s;
}
.profile-card:hover {
    border-color: var(--accent, #0f62fe);
    background: var(--bg-elevated, #f9f9f9);
}
.icon-box {
    width: 40px;
    height: 40px;
    background: color-mix(in srgb, var(--accent) 10%, var(--bg-surface));
    color: var(--accent, #0f62fe);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
}
.profile-card .text {
    flex: 1;
    display: flex;
    flex-direction: column;
}
.profile-card .text strong {
    font-size: 0.95rem;
    color: var(--text-primary);
}
.profile-card .text span {
    font-size: 0.8rem;
    color: var(--text-secondary, #666);
}
.profile-card .arrow {
    color: var(--text-secondary, #ccc);
}

@keyframes popIn {
    from { opacity: 0; transform: scale(0.5); }
    to { opacity: 1; transform: scale(1); }
}
</style>

