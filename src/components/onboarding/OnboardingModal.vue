<template>
    <div v-if="isVisible" class="onboarding-overlay">
        <!-- Backdrop -->
        <div class="backdrop"></div>

        <!-- Centered Modal (Steps 0 & Last) -->
        <div v-if="isCenteredStep" class="onboarding-modal fade-in-up">
            <div class="modal-content">
                <div class="modal-header">
                    <img v-if="currentStepData.image" :src="currentStepData.image" class="step-image" />
                    <h2>{{ currentStepData.title }}</h2>
                </div>
                <div class="modal-body">
                    <p>{{ currentStepData.body }}</p>
                </div>
                <div class="modal-footer">
                    <button v-if="!isFirstStep" @click="store.skip" class="btn-ghost">Skip Tour</button>
                    <div class="flex-spacer"></div>
                    <button class="btn-primary" @click="handleNext">
                        {{ isLastStep ? 'Get Started' : 'Start Tour' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Floating Tooltip (Middle Steps) -->
        <div 
            v-else 
            class="onboarding-tooltip fade-in"
            :style="tooltipStyle"
            ref="tooltipRef"
        >
            <div class="tooltip-arrow" :class="tooltipPlacement"></div>
            <div class="tooltip-content">
                <div class="tooltip-header">
                    <h4>{{ currentStepData.title }}</h4>
                    <span class="step-counter">{{ store.currentStep }} / {{ totalSteps - 1 }}</span>
                </div>
                <p>{{ currentStepData.body }}</p>
                <div class="tooltip-footer">
                    <button @click="store.prevStep" class="btn-sm-ghost">Back</button>
                    <button @click="handleNext" class="btn-sm-primary">Next</button>
                </div>
            </div>
        </div>

        <!-- Pulsing Beacon -->
        <div 
            v-if="!isCenteredStep" 
            class="beacon"
            :style="beaconStyle"
        ></div>

        <!-- Highlight Cutout (Optional, simple implementation using box-shadow on target or overlay) -->
        <!-- For MVP, we'll just highlight the target via a class added to body or similar, 
             but here we can just rely on the tooltip being prominent. -->
    </div>
</template>

<script setup>
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useOnboardingStore } from '@/stores/onboarding';

const store = useOnboardingStore();

// Configuration
const steps = [
    {
        title: "Welcome to the new Console",
        body: "We've updated the experience to help you plan surveys faster. Let's take a quick tour.",
        centered: true,
        // image: '/assets/welcome-illustration.png' // Add if available
    },
    {
        title: "Navigation",
        body: "Access your Dashboard, Planned Routes, and Surveys from the sidebar. You can collapse it to save space.",
        target: '#sidebar-nav',
        placement: 'right'
    },
    {
        title: "Quick Actions",
        body: "Create new routes, import KMLs, or manage permits directly from the admin tools.",
        target: '.admin-title', // Generic fallback, we'll add specific data-tour later
        placement: 'right'
    },
    {
        title: "Help & Profile",
        body: "Need help? Click the AI Assistant icon. Manage your account from the user menu.",
        target: '.navbar-right',
        placement: 'bottom-left'
    },
    {
        title: "You're All Set!",
        body: "You can revisit these tips via the Help Center. Happy surveying!",
        centered: true
    }
];

const totalSteps = steps.length;
const tooltipRef = ref(null);
const targetRect = ref(null);

const isVisible = computed(() => store.isVisible);
const currentStepData = computed(() => steps[store.currentStep]);
const isCenteredStep = computed(() => currentStepData.value.centered);
const isFirstStep = computed(() => store.currentStep === 0);
const isLastStep = computed(() => store.currentStep === steps.length - 1);

// Tooltip Positioning Logic
const tooltipStyle = ref({});
const beaconStyle = ref({});
const tooltipPlacement = ref('left');

const updatePosition = () => {
    if (isCenteredStep.value || !isVisible.value) return;

    const targetSelector = currentStepData.value.target;
    // Try to find target by selector
    let el = document.querySelector(targetSelector);
    
    // Fallback if specific data-tour not found, try generic
    if (!el && currentStepData.value.tourKey) {
        el = document.querySelector(`[data-tour="${currentStepData.value.tourKey}"]`);
    }

    if (el) {
        const rect = el.getBoundingClientRect();
        targetRect.value = rect;
        
        // Simple positioning logic
        const placement = currentStepData.value.placement || 'right';
        tooltipPlacement.value = placement;
        
        const padding = 12;
        
        if (placement === 'right') {
            tooltipStyle.value = {
                top: `${rect.top + rect.height / 2}px`,
                left: `${rect.right + padding}px`,
                transform: 'translateY(-50%)' // Center vertically
            };
        } else if (placement === 'bottom') {
             tooltipStyle.value = {
                top: `${rect.bottom + padding}px`,
                left: `${rect.left + rect.width / 2}px`,
                transform: 'translateX(-50%)'
            };
        } else if (placement === 'bottom-left') {
             tooltipStyle.value = {
                top: `${rect.bottom + padding}px`,
                left: `${rect.right - 20}px`, // Slight offset from right edge
                transform: 'translateX(-100%)'
            };
        }

        // Beacon Position (Center of target)
        beaconStyle.value = {
            top: `${rect.top + rect.height / 2}px`,
            left: `${rect.left + rect.width / 2}px`
        };
    }
};

const handleNext = () => {
    if (isLastStep.value) {
        store.completeOnboarding();
    } else {
        store.nextStep();
    }
};

// Watch for step changes to update position
watch(() => store.currentStep, async () => {
    await nextTick();
    updatePosition();
});

// Watch window resize
onMounted(() => {
    window.addEventListener('resize', updatePosition);
    // Initial check
    if (store.isVisible) {
        updatePosition();
    }
});

onUnmounted(() => {
    window.removeEventListener('resize', updatePosition);
});
</script>

<style scoped>
.onboarding-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 11000; /* Above everything */
    pointer-events: none; /* Let clicks pass unless on interactive elements */
}

.backdrop {
    position: absolute;
    inset: 0;
    background: rgb(0 0 0 / 40%);
    pointer-events: auto; /* Block clicks on page while modal/tour is active */
}

.onboarding-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    max-width: 480px;
    pointer-events: auto;
    z-index: 11002;
}

.modal-content {
    background: var(--bg-surface, #fff);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 10%), 0 10px 10px -5px rgb(0 0 0 / 4%);
}

.modal-header {
    text-align: center;
    margin-bottom: 1.5rem;
}

.modal-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-top: 1rem;
    color: var(--text-primary, #333);
}

.modal-body {
    text-align: center;
    margin-bottom: 2rem;
    color: var(--text-secondary, #666);
    line-height: 1.6;
}

.modal-footer {
    display: flex;
    align-items: center;
}

.onboarding-tooltip {
    position: fixed;
    width: 300px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 12px;
    padding: 1.25rem;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 10%), 0 0 0 1px rgb(0 0 0 / 5%);
    pointer-events: auto;
    z-index: 11002;
    transition: all 0.3s ease;
}

.tooltip-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
}

.tooltip-header h4 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
}

.step-counter {
    font-size: 0.75rem;
    color: var(--text-tertiary, #999);
}

.tooltip-content p {
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.5;
    margin-bottom: 1.25rem;
}

.tooltip-footer {
    display: flex;
    justify-content: space-between;
}

/* Buttons */
.btn-primary, .btn-sm-primary {
    background: var(--accent, #0f62fe);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: filter 0.2s;
}

.btn-primary { padding: 0.75rem 1.5rem; }
.btn-sm-primary { padding: 0.5rem 1rem; font-size: 0.875rem; }
.btn-primary:hover { filter: brightness(1.1); }

.btn-ghost, .btn-sm-ghost {
    background: transparent;
    color: var(--text-secondary);
    border: none;
    cursor: pointer;
    font-weight: 500;
}
.btn-ghost:hover, .btn-sm-ghost:hover { color: var(--text-primary); }

.flex-spacer { flex: 1; }

/* Animation */
@keyframes fadeInUp {
    from { opacity: 0; transform: translate(-50%, -45%); }
    to { opacity: 1; transform: translate(-50%, -50%); }
}
.fade-in-up { animation: fadeInUp 0.3s ease-out forwards; }

.fade-in { animation: fadeIn 0.3s ease-out; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* Tooltip Arrows (Simple CSS - refine as needed) */
.tooltip-arrow {
    position: absolute;
    width: 12px;
    height: 12px;
    background: var(--bg-surface, #fff);
    transform: rotate(45deg);
}

.tooltip-arrow.right {
    top: 50%;
    left: -6px;
    margin-top: -6px;
}
.tooltip-arrow.bottom {
    top: -6px;
    left: 50%;
    margin-left: -6px;
}
.tooltip-arrow.bottom-left {
    top: -6px;
    right: 20px;
}

/* Pulsing Beacon */
.beacon {
    position: fixed;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--accent);
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 11001; /* Above overlay, below tooltip */
    box-shadow: 0 0 0 0 rgba(15, 98, 254, 0.7);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        transform: translate(-50%, -50%) scale(0.95);
        box-shadow: 0 0 0 0 rgba(15, 98, 254, 0.7);
    }
    70% {
        transform: translate(-50%, -50%) scale(1);
        box-shadow: 0 0 0 20px rgba(15, 98, 254, 0);
    }
    100% {
        transform: translate(-50%, -50%) scale(0.95);
        box-shadow: 0 0 0 0 rgba(15, 98, 254, 0);
    }
}
</style>
