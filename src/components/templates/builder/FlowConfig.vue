<template>
    <div class="flow-config">
        <!-- 4. Impact Hint Toast (Positioned Absolute or Fixed relative to container) -->
        <Transition name="toast">
            <div v-if="hintMessage" class="impact-hint-toast bg-dark text-white p-2 rounded small shadow-sm position-fixed start-50 translate-middle-x" style="z-index: 1060; bottom: 20px;">
                <i class="bi bi-info-circle me-2"></i> {{ hintMessage }}
            </div>
        </Transition>
        <h6 class="text-uppercase text-muted mb-3 font-weight-bold" style="font-size: 0.75rem;">Workflow Steps</h6>
        
        <div class="alert alert-info small">
            <i class="bi bi-info-circle me-1"></i>
            Drag steps to reorder the workflow sequence.
        </div>

        <draggable 
            v-model="steps" 
            item-key="id"
            handle=".drag-handle"
            @end="onReorder"
        >
            <template #item="{element: step}">
                <div class="card mb-2 step-card" :class="{ 'opacity-75': !step.enabled }">
                    <div class="card-body p-2 d-flex align-items-center gap-2">
                        <!-- Drag Handle -->
                        <div class="drag-handle text-muted cursor-move px-1" title="Drag to reorder">
                            <i class="bi bi-grip-vertical"></i>
                        </div>

                        <!-- Checkbox -->
                        <div class="form-check m-0">
                            <input class="form-check-input" type="checkbox" 
                                v-model="step.enabled" 
                                :disabled="step.locked"
                                @change="onToggleWithHint(step)"
                            />
                        </div>

                        <!-- Content -->
                        <div class="flex-grow-1">
                            <div class="d-flex align-items-center justify-content-between">
                                <!-- 9. Visual Hierarchy: Bold step name -->
                                <span class="fw-bold text-dark">{{ step.title }}</span>
                                <div class="d-flex gap-1 align-items-center">
                                    <!-- 3. Disabled reason text -->
                                    <span v-if="step.locked" class="text-muted small fst-italic me-2">
                                        Locked for compliance
                                    </span>

                                    <span v-if="step.locked" class="badge bg-light text-secondary border" title="Locked by system">
                                        <i class="bi bi-lock-fill"></i>
                                    </span>
                                    <span v-if="step.required" class="badge bg-danger-subtle text-danger border border-danger-subtle">
                                        Required
                                    </span>
                                </div>
                            </div>
                            <!-- Inline dependency hint could go here -->
                        </div>

                        <!-- Expand/Settings (Mock) -->
                        <BaseButton variant="ghost" size="small" class="text-muted">
                            <i class="bi bi-gear"></i>
                        </BaseButton>
                    </div>
                </div>
            </template>
        </draggable>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import draggable from 'vuedraggable';
import { BaseButton } from '@/components/ui';

// Hint state
const hintMessage = ref(null);
let hintTimeout = null;

function showHint(msg) {
    hintMessage.value = msg;
    if (hintTimeout) clearTimeout(hintTimeout);
    hintTimeout = setTimeout(() => {
        hintMessage.value = null;
    }, 3000);
}

function onToggleWithHint(step) {
    onUpdate();
    if (!step.enabled) {
        showHint(`Disabling this step will remove ${step.title} data from reports.`);
    } else {
        showHint(`This step will be available in all reports using this template.`);
    }
}

const props = defineProps({
    template: Object
});
const emit = defineEmits(['update']);

// Proxy the steps array
const steps = computed({
    get: () => props.template?.snapshot?.steps || [],
    set: (value) => {
        if(props.template && props.template.snapshot) {
            props.template.snapshot.steps = value;
            onUpdate();
        }
    }
});

function onUpdate() {
    emit('update');
}

function onReorder() {
    // Update order property based on index
    steps.value.forEach((step, index) => {
        step.order = index;
    });
    onUpdate();
}
</script>

<style scoped>
.step-card {
    transition: all 0.2s;
}
.cursor-move {
    cursor: grab;
}
.cursor-move:active {
    cursor: grabbing;
}

/* Toast Animations */
.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Bouncy */
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translate(-50%, 20px);
}
</style>
