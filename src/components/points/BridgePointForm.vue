<template>
    <form @submit.prevent="onSave">
        <!-- Photos Section at Top -->
        <div class="photos-section-top">
            <PhotoListManager :is-edit="isEdit" v-model:photos="form.media" />
        </div>

        <!-- Metadata Section -->
        <PointMetadata v-model="form" :point="point" :is-edit="isEdit" />

        <hr v-if="form.media && form.media.length > 0" class="my-4" />
        
        <!-- Section: Location -->
        <h5 class="section-title">{{ $t("location") || 'Location' }}</h5>

        <div class="form-group mb-4">
            <label>{{ $t("roadAddress") }}</label>
            <div class="input-group">
                <input v-model="form.roadAddress" :disabled="!isEdit" class="form-control" />
                <span class="input-group-text"><i class="bi bi-signpost"></i></span>
            </div>
        </div>
        
        <!-- Section: General Information -->
        <h5 class="section-title">{{ $t("generalInfo") || 'General Information' }}</h5>
        <div class="form-row mb-4">
            <div class="form-group">
                <label>{{ $t("bridgeType") }}</label>
                <select v-model="form.bridgeType" :disabled="!isEdit" class="form-control">
                    <option value="beam_bridge">{{ $t("beamBridge") }}</option>
                    <option value="culvert_bridge">{{ $t("culvertBridge") }}</option>
                    <option value="slab_bridge">{{ $t("slabBridge") }}</option>
                    <option value="girder_bridge">{{ $t("girderBridge") }}</option>
                    <option value="truss_bridge">{{ $t("trussBridge") }}</option>
                    <option value="arch_bridge">{{ $t("archBridge") }}</option>
                    <option value="suspension_bridge">{{ $t("suspensionBridge") }}</option>
                    <option value="other">{{ $t("other") }}</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>{{ $t("condition") }}</label>
                <input v-model="form.condition" :disabled="!isEdit" class="form-control" />
            </div>
            
            <div class="form-group">
                <label>{{ $t("numberOfSpans") }}</label>
                <input v-model="form.numberOfSpans" step="any" type="number" :disabled="!isEdit" class="form-control" />
            </div>
        </div>
        
        <!-- Section: Dimensions -->
        <h5 class="section-title">{{ $t("dimensions") || 'Dimensions' }}</h5>
        <div class="form-row mb-4">
             <RsDimensionInput
                v-model="form.overallLength"
                :label="$t('overallLength')"
                :is-imperial="isImperial"
                :max-integer-digits="3" 
                :disabled="!isEdit"
            />
        </div>
        <div class="form-group">
            <label>{{ $t("pointNotes") }}</label>
            <textarea v-model="form.pointNotes" :disabled="!isEdit" class="form-control" rows="3"></textarea>
        </div>

        <!-- Bridge Spans Section -->
        <hr />
        <div class="row">
            <div class="col-md-8 text-left">
                <h4>{{ $t("bridgeSpans") }}</h4>
            </div>
        </div>

        <!-- Spans List -->
        <div v-for="(span, index) in form.spans" :key="index" class="span-item">
            <div class="span-header">
                <h5>{{ $t("spanLabel") }} {{ index + 1 }}</h5>
            </div>

            <div class="row">
                <div class="col-md-6">
                    <RsDimensionInput
                        v-model="span.length"
                        :label="$t('spanLength')"
                        :is-imperial="isImperial"
                        :max-integer-digits="3"
                        :disabled="!isEdit"
                    />
                </div>
                <div class="col-md-6">
                    <RsDimensionInput
                        v-model="span.width"
                        :label="$t('spanWidth')"
                        :is-imperial="isImperial"
                        :max-integer-digits="2"
                        :disabled="!isEdit"
                    />
                </div>
            </div>

            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label>{{ $t("numberOfBeams") }}</label>
                        <input v-model="span.numberOfBeams" :disabled="!isEdit" type="number" class="form-control" />
                    </div>
                </div>
                <div class="col-md-6">
                    <RsDimensionInput
                        v-model="span.beamWidth"
                        :label="$t('beamWidth')"
                        :is-imperial="isImperial"
                        :max-integer-digits="2"
                        :disabled="!isEdit"
                    />
                </div>
            </div>

            <div class="row">
                <div class="col-md-6">
                   <RsDimensionInput
                        v-model="span.beamHeight"
                        :label="$t('beamHeight')"
                        :is-imperial="isImperial"
                        :max-integer-digits="2"
                        :disabled="!isEdit"
                    />
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label>{{ $t("material") }}</label>
                        <select v-model="span.material" :disabled="!isEdit" class="form-control">
                            <option value="">{{ $t("selectType") }}</option>
                            <option value="steel">{{ $t("steel") }}</option>
                            <option value="concrete">{{ $t("concrete") }}</option>
                            <option value="reinforced_concrete">{{ $t("reinforcedConcrete") }}</option>
                            <option value="post_tensioned_concrete">{{ $t("postTensionedConcrete") }}</option>
                            <option value="wood">{{ $t("wood") }}</option>
                            <option value="other">{{ $t("other") }}</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label>{{ $t("spanNotes") }}</label>
                <textarea v-model="span.notes" :disabled="!isEdit" class="form-control" rows="2"></textarea>
            </div>
        </div>

    </form>
</template>
<script setup>
import { reactive, watch, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PhotoListManager from './PhotoListManager.vue';
import PointMetadata from './PointMetadata.vue';
import RsDimensionInput from '@/components/forms/RsDimensionInput.vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const props = defineProps({ point: Object, isEdit: Boolean, isImperial: Boolean });
const emit = defineEmits(['save', 'close']);
const { t } = useI18n();

const currentUserData = ref(null);

const form = reactive({
    roadAddress: '',
    bridgeType: '',
    overallLength: '',
    condition: '',
    numberOfSpans: '',
    spans: [],
    pointNotes: '',
    severity: 'info',
    status: 'open',
    media: [] // Ensure media is initialized as array
});

const fetchCurrentUserData = async () => {
    if (!authStore.user) {
        await authStore.fetchUserProfile();
    }
    if (authStore.user) {
        currentUserData.value = authStore.user;
    }
};

// Watch for changes in numberOfSpans and update spans array accordingly
watch(() => form.numberOfSpans, (newValue) => {
    if (newValue === "") {
        return;
    }
    const numberOfSpans = parseInt(newValue) || 0;
    const currentSpans = form.spans || [];

    if (numberOfSpans > currentSpans.length) {
        // Add new spans while preserving existing data
        for (let i = currentSpans.length; i < numberOfSpans; i++) {
            form.spans.push({
                length: '',
                width: '',
                numberOfBeams: '',
                beamWidth: '',
                beamHeight: '',
                material: '',
                notes: ''
            });
        }
    } else if (numberOfSpans < currentSpans.length) {
        // Remove excess spans from the end, preserving existing data
        form.spans = form.spans.slice(0, numberOfSpans);
    }
}, { immediate: true });

watch(() => props.point, (val, oldVal) => {
    if (val) {
        // Only reset form if this is a different point or if the data has actually changed
        const isDifferentPoint = !oldVal || oldVal.id !== val.id;
        const hasDataChanged = oldVal && oldVal.data !== val.data;

        if (isDifferentPoint || hasDataChanged) {
            if (val.data !== undefined && val.data !== "") {
                try {
                    const parsedData = JSON.parse(val.data);
                    form.roadAddress = parsedData.roadAddress || '';
                    form.bridgeType = parsedData.bridgeType || '';
                    form.overallLength = parsedData.overallLength || '';
                    form.condition = parsedData.condition || '';
                    form.numberOfSpans = parsedData.numberOfSpans || '';
                    form.spans = parsedData.spans || [];
                    form.pointNotes = parsedData.pointNotes || '';
                    form.severity = parsedData.severity || 'info';
                    form.status = parsedData.status || 'open';
                    form.media = Array.isArray(parsedData.media) ? parsedData.media : [];
                } catch (e) {
                    console.error("Error parsing point data", e);
                    form.media = [];
                }
            } else {
                // Initialize default values for new/empty points
                form.media = Array.isArray(val.media) ? val.media : [];
                form.severity = 'info';
                form.status = 'open';
            }
        }
    }
}, { immediate: true });

// Fetch user data on component mount
fetchCurrentUserData();

function onSave() {
    emit('save', { ...form });
}

// Expose onSave method so parent component can call it
defineExpose({
    onSave
});
</script>

<style scoped>
.form-group {
    margin-bottom: var(--spacing-sm, 0.75rem);
}

/* Form row for inline fields */
.form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-sm, 0.75rem) var(--spacing-md, 1rem);
    margin-bottom: var(--spacing-sm, 0.75rem);
}

/* Responsive: Stack on smaller screens */
@media (width <= 768px) {
    .form-row {
        grid-template-columns: 1fr;
        gap: var(--spacing-sm, 0.75rem);
    }

    .form-row .form-group {
        margin-bottom: 0;
    }
}

.form-control {
    width: 100%;
    padding: 0.5rem 0.7rem;
    border-radius: 12px;
    border: 1px solid #444857;
    font-size: 1rem;
    transition: border 0.18s;
}

.form-control:focus {
    border: 1.5px solid #09f;
    outline: none;
}

.input-group {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    width: 100%;
}

.input-group .form-control {
    flex: 1;
    width: auto;
    min-width: 0;
    border-radius: 6px 0 0 6px;
    border-right: none;
}


.input-group-text {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 0.75rem;
    font-size: 14px;
    font-weight: 400;
    color: var(--text-primary);
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-left: none;
    border-radius: 0 6px 6px 0;
    white-space: nowrap;
    flex-shrink: 0;
    text-transform: uppercase;
}

.input-group .form-control:focus {
    border-right: none;
}

.input-group .form-control:focus+.input-group-text {
    border-color: var(--accent);
}

.span-item {
    border: 1px solid #444857;
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: var(--spacing-md, 1rem);
    background-color: rgb(255 255 255 / 2%);
}

.span-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md, 1rem);
    padding-bottom: var(--spacing-sm, 0.75rem);
    border-bottom: 1px solid #444857;
}

.span-header h5 {
    margin: 0;
    color: #09f;
    font-weight: 600;
}

/* Responsive: Stack columns on smaller screens */
@media (width <= 768px) {
    .span-item .row {
        flex-direction: column;
    }

    .span-item .col-md-6 {
        width: 100%;
        max-width: 100%;
    }
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.7rem;
    padding: 1rem 0 0;
    background: transparent;
    border-top: none;
}

.btn {
    border: none;
    border-radius: 22px;
    padding: 0.5rem 1.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.18s, color 0.18s;
}

.btn-primary {
    background: #09f;
    color: #fff;
    box-shadow: 0 1px 4px rgb(0 0 0 / 8%);
}

.btn-secondary {
    background: #2d3748;
    color: #f3f6fa;
}

.btn-danger {
    background: var(--error);
    color: #fff;
}

.btn-primary:hover {
    background: #007ad6;
}

.btn-secondary:hover {
    background: #23272f;
}

.btn-danger:hover {
    background: #c82333;
}

.btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
}

.photos-section-top {
    margin-bottom: var(--spacing-lg, 1.5rem);
}

/* Responsive adjustments for smaller screens */
@media (width <= 768px) {
    .form-control {
        font-size: 0.95rem;
        padding: 0.45rem 0.6rem;
    }

    .input-group-text {
        font-size: 12px;
        padding: 0.45rem 0.6rem;
    }

    .span-item {
        padding: var(--spacing-md, 1rem);
    }
}

.section-title {
    color: var(--accent);
    font-size: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: var(--spacing-md, 1rem);
    border-bottom: 2px solid var(--border);
    padding-bottom: 0.5rem;
}
</style>
