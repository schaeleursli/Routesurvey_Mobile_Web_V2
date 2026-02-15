import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import templateService from '@/services/templateService';

export const useTemplateStore = defineStore('template', () => {
    // State
    const currentTemplate = ref(null);
    const loading = ref(false);
    const saving = ref(false);
    const error = ref(null);
    const isDirty = ref(false); // Track unsaved changes via simplified flag for now

    // Getters
    const validationErrors = computed(() => {
        const errors = [];
        if (!currentTemplate.value) return errors;

        const { snapshot } = currentTemplate.value;
        if (!snapshot) return errors;

        // 1. Flow Validation: Dependencies
        // Example: If 'Review' step is enabled, 'Survey' must be enabled
        // (Mock logic for demonstration)
        const surveyStep = snapshot.steps?.find(s => s.id === 'step_survey');
        const reviewStep = snapshot.steps?.find(s => s.id === 'step_review');

        if (reviewStep?.enabled && surveyStep && !surveyStep.enabled) {
            errors.push({
                mode: 'flow',
                message: "Step 'Review' depends on 'Survey Data' — cannot disable Survey Data.",
                fixAction: () => { surveyStep.enabled = true; }
            });
        }

        // 2. Branding Validation
        if (!snapshot.branding?.coverPreset) {
            errors.push({
                mode: 'branding',
                message: "A cover preset must be selected.",
                fixAction: null // User must select manually
            });
        }

        return errors;
    });

    const isValid = computed(() => validationErrors.value.length === 0);

    // Actions
    async function loadTemplate(id) {
        loading.value = true;
        error.value = null;
        try {
            const res = await templateService.getTemplate(id);
            if (res.success) {
                currentTemplate.value = res.data;
                isDirty.value = false;
            } else {
                error.value = res.message;
            }
        } catch (e) {
            error.value = "Failed to load template";
            console.error(e);
        } finally {
            loading.value = false;
        }
    }

    async function createTemplate(initialData) {
        loading.value = true;
        try {
            // Apply baseline if no snapshot provided
            if (!initialData.snapshot) {
                initialData.snapshot = await templateService.getBaselineSnapshot();
            }

            const res = await templateService.createTemplate(initialData);
            if (res.success) {
                currentTemplate.value = res.data;
                isDirty.value = false;
                return res.data;
            } else {
                throw new Error(res.message);
            }
        } catch (e) {
            error.value = e.message;
            throw e;
        } finally {
            loading.value = false;
        }
    }

    async function saveDraft() {
        if (!currentTemplate.value) return;

        saving.value = true;
        try {
            const res = await templateService.updateTemplate(currentTemplate.value.id, {
                ...currentTemplate.value,
                // Ensure status remains draft on regular save if not publishing
            });

            if (res.success) {
                currentTemplate.value = res.data;
                isDirty.value = false;
            }
        } catch (e) {
            error.value = "Failed to save draft";
        } finally {
            saving.value = false;
        }
    }

    async function publish() {
        if (!currentTemplate.value) return;
        if (!isValid.value) {
            error.value = "Cannot publish invalid template.";
            return;
        }

        saving.value = true;
        try {
            const res = await templateService.publishTemplate(currentTemplate.value.id);
            if (res.success) {
                currentTemplate.value = res.data;
                isDirty.value = false;
            }
        } catch (e) {
            error.value = "Publish failed";
        } finally {
            saving.value = false;
        }
    }

    // Mutation helpers (to be called from components)
    function updateSnapshot(mode, key, value) {
        if (!currentTemplate.value) return;

        if (mode === 'branding') {
            currentTemplate.value.snapshot.branding[key] = value;
        } else {
            // Flow or Content (Arrays)
            // This is a naive implementation; specialized helpers might be better
        }
        isDirty.value = true;
    }

    function markDirty() {
        isDirty.value = true;
    }

    return {
        currentTemplate,
        loading,
        saving,
        error,
        isDirty,
        validationErrors,
        isValid,
        loadTemplate,
        createTemplate,
        saveDraft,
        publish,
        updateSnapshot,
        markDirty
    };
});
