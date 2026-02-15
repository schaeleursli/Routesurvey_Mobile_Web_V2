<template>
    <div class="content-config">
        <!-- 4. Impact Hint Toast -->
        <Transition name="toast">
            <div v-if="hintMessage" class="impact-hint-toast bg-dark text-white p-2 rounded small shadow-sm position-fixed start-50 translate-middle-x" style="z-index: 1060; bottom: 20px;">
                <i class="bi bi-info-circle me-2"></i> {{ hintMessage }}
            </div>
        </Transition>
        <h6 class="text-uppercase text-muted mb-3 font-weight-bold" style="font-size: 0.75rem;">Report Sections</h6>
        
        <div v-if="sections.length === 0" class="text-muted small">No sections defined</div>

        <draggable 
            v-model="sections" 
            item-key="id"
            handle=".drag-handle"
            @end="onReorder"
        >
            <template #item="{element: section}">
                <div class="card mb-2 section-card" :class="{ 'opacity-75': !section.enabled }">
                    <div class="card-body p-2 d-flex align-items-center gap-2">
                        <!-- Drag Handle -->
                        <div class="drag-handle text-muted cursor-move px-1">
                            <i class="bi bi-grip-vertical"></i>
                        </div>

                        <!-- Checkbox -->
                        <div class="form-check m-0">
                            <input class="form-check-input" type="checkbox" 
                                v-model="section.enabled"
                                :disabled="section.locked" 
                                @change="onToggleSection(section)"
                            />
                        </div>

                        <!-- Details -->
                        <div class="flex-grow-1">
                            <div class="d-flex align-items-center justify-content-between">
                                <!-- 9. Visual Hierarchy -->
                                <span class="fw-bold text-dark">{{ section.title }}</span>
                                <div class="d-flex gap-1 align-items-center">
                                    <!-- 3. Disabled reason -->
                                    <span v-if="section.locked" class="text-muted small fst-italic me-2">
                                        Required by system
                                    </span>

                                    <span v-if="section.locked" class="badge bg-light text-secondary border" title="Locked">
                                        <i class="bi bi-lock-fill"></i>
                                    </span>
                                </div>
                            </div>
                        </div>

                         <!-- Toggle Required -->
                         <div class="form-check form-switch" title="Mark as Required" v-if="section.enabled">
                            <input class="form-check-input" type="checkbox" 
                                v-model="section.required"
                                @change="onToggleRequired(section)"
                            >
                        </div>
                    </div>
                </div>
            </template>
        </draggable>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import draggable from 'vuedraggable';

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

function onToggleSection(section) {
    onUpdate();
    if (!section.enabled) {
        showHint(`Removing ${section.title} from the report structure.`);
    } else {
        showHint(`${section.title} added to report structure.`);
    }
}

function onToggleRequired(section) {
    onUpdate();
    if (section.required) {
        showHint(`This section will be required in all reports using this template.`);
    } else {
        showHint(`This section is now optional for report authors.`);
    }
}

const props = defineProps({
    template: Object
});
const emit = defineEmits(['update']);

const sections = computed({
    get: () => props.template?.snapshot?.sections || [],
    set: (value) => {
        if(props.template && props.template.snapshot) {
            props.template.snapshot.sections = value;
            onUpdate();
        }
    }
});

function onUpdate() {
    emit('update');
}

function onReorder() {
     sections.value.forEach((sec, index) => {
        sec.order = index;
    });
    onUpdate();
}
</script>

<style scoped>
.cursor-move { cursor: grab; }

/* Toast Animations */
.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translate(-50%, 20px);
}
</style>
