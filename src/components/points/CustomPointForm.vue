<template>
    <form @submit.prevent="onSave">
        <!-- Photos Section at Top -->
        <div class="photos-section-top">
            <PhotoListManager :is-edit="isEdit" v-model:photos="form.media" />
        </div>

        <!-- Metadata Section -->
        <PointMetadata v-model="form" :point="point" :is-edit="isEdit" />

        <hr v-if="form.media && form.media.length > 0" />

        <div class="form-group">
            <label>{{ $t("roadAddress") }}</label>
            <div class="input-group">
                <input v-model="form.roadAddress" :disabled="!isEdit" class="form-control" />
                <span class="input-group-text"><i class="bi bi-signpost"></i></span>
            </div>
        </div>
        <!-- Compact Obstruction Fields Section -->
        <div class="obstruction-section">
            <div class="form-group">
                <label>{{ $t("descriptionOfObstruction") }}</label>
                <input v-model="form.descriptionOfObstruction" :disabled="!isEdit" class="form-control" />
            </div>
            <div class="obstruction-grid">
                <RsDimensionInput
                    v-model="form.heightNotes"
                    :label="$t('heightNotes')"
                    :is-imperial="isImperial"
                    :max-integer-digits="2"
                    :disabled="!isEdit"
                />
                <RsDimensionInput
                    v-model="form.widthNotes"
                    :label="$t('widthNotes')"
                    :is-imperial="isImperial"
                    :max-integer-digits="2"
                    :disabled="!isEdit"
                />
                <RsDimensionInput
                    v-model="form.lengthNotes"
                    :label="$t('lengthNotes')"
                    :is-imperial="isImperial"
                    :max-integer-digits="3"
                    :disabled="!isEdit"
                />
                <div class="form-group">
                    <label>{{ $t("areaNotes") }}</label>
                    <input v-model="form.areaNotes" :disabled="!isEdit" class="form-control" />
                </div>
                <div class="form-group">
                    <label>{{ $t("groundNotes") }}</label>
                    <input v-model="form.groundNotes" :disabled="!isEdit" class="form-control" />
                </div>
                <div class="form-group">
                    <label>{{ $t("restrictionNotes") }}</label>
                    <input v-model="form.restrictionNotes" :disabled="!isEdit" class="form-control" />
                </div>
            </div>
        </div>
        <div class="form-group">
            <label>{{ $t("pointNotes") }}</label>
            <textarea v-model="form.pointNotes" :disabled="!isEdit" class="form-control" rows="3"></textarea>
        </div>
    </form>
</template>
<script setup>
import { reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import PhotoListManager from './PhotoListManager.vue';
import PointMetadata from './PointMetadata.vue';
import RsDimensionInput from '@/components/forms/RsDimensionInput.vue';

const props = defineProps({ point: Object, isEdit: Boolean, isImperial: Boolean });
const emit = defineEmits(['save', 'close']);
const { t } = useI18n();

const form = reactive({
    roadAddress: '',
    descriptionOfObstruction: '',
    heightNotes: '',
    widthNotes: '',
    lengthNotes: '',
    areaNotes: '',
    groundNotes: '',
    restrictionNotes: '',
    pointNotes: '',
    severity: 'info',
    status: 'open',
    media: [] // Ensure media is initialized as array
});

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
                    form.descriptionOfObstruction = parsedData.descriptionOfObstruction || '';
                    form.heightNotes = parsedData.heightNotes || '';
                    form.widthNotes = parsedData.widthNotes || '';
                    form.lengthNotes = parsedData.lengthNotes || '';
                    form.areaNotes = parsedData.areaNotes || '';
                    form.groundNotes = parsedData.groundNotes || '';
                    form.restrictionNotes = parsedData.restrictionNotes || '';
                    form.pointNotes = parsedData.pointNotes || '';
                    form.severity = parsedData.severity || 'info';
                    form.status = parsedData.status || 'open';
                    form.media = Array.isArray(parsedData.media) ? parsedData.media : [];
                } catch (error) {
                    console.error('Error parsing data in CustomPointForm:', error);
                    form.media = [];
                }
            } else if (val.media) {
                form.media = val.media;
            } else {
                form.media = [];
            }
        }
    }
}, { immediate: true });

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


/* Compact Obstruction Section */
.obstruction-section {
    margin-bottom: var(--spacing-md, 1rem);
}

.obstruction-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm, 0.75rem) var(--spacing-md, 1rem);
}

/* Responsive: Stack on smaller screens */
@media (width <= 768px) {
    .obstruction-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-sm, 0.75rem);
    }
}

/* Medium screens: 2 columns */
@media (width >= 769px) and (width <= 1024px) {
    .obstruction-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Large screens: 3 columns for better space utilization */
@media (width >= 1025px) {
    .obstruction-grid {
        grid-template-columns: repeat(3, 1fr);
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

.btn-primary:hover {
    background: #007ad6;
}

.btn-secondary:hover {
    background: #23272f;
}

.photos-section-top {
    margin-bottom: var(--spacing-lg, 1.5rem);
}

/* Responsive adjustments for smaller screens */
@media (width <= 768px) {
    .form-group {
        margin-bottom: var(--spacing-xs, 0.5rem);
    }

    .form-control {
        font-size: 0.95rem;
        padding: 0.45rem 0.6rem;
    }
}
</style>
