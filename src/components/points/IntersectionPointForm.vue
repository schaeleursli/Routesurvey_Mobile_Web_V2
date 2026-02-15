<template>
    <form @submit.prevent="onSave">
        <!-- Photos Section at Top -->
        <div class="photos-section-top">
            <PhotoListManager :is-edit="isEdit" v-model:photos="form.media" />
        </div>

        <!-- Metadata Section -->
        <PointMetadata v-model="form" :point="point" :is-edit="isEdit" />

        <hr v-if="form.media && form.media.length > 0" />

        <div class="form-row">
            <div class="form-group">
                <label>{{ $t("primaryRoadAddress") }}</label>
                <div class="input-group">
                    <input v-model="form.primaryRoadAddress" :disabled="!isEdit" class="form-control" />
                    <span class="input-group-text"><i class="bi bi-signpost"></i></span>
                </div>
            </div>
            <div class="form-group">
                <label>{{ $t("secondaryRoad") }}</label>
                <div class="input-group">
                    <input v-model="form.secondaryRoad" :disabled="!isEdit" class="form-control" />
                    <span class="input-group-text"><i class="bi bi-signpost"></i></span>
                </div>
            </div>
        </div>
        <div class="form-group">
            <label>{{ $t("typeOfIntersection") }}</label>
            <div class="row">
                <div class="col-md-3 text-center">
                    <img :src="form.typeOfIntersection === 'type_1' ? type1Dim : type1Transparent" alt="Intersection 1"
                        class="img-fluid" @click="onTypeClick('type_1')">
                </div>
                <div class="col-md-3 text-center">
                    <img :src="form.typeOfIntersection === 'type_2' ? type2Dim : type2Transparent" alt="Intersection 2"
                        class="img-fluid" @click="onTypeClick('type_2')">
                </div>
                <div class="col-md-3 text-center">
                    <img :src="form.typeOfIntersection === 'type_3' ? type3Dim : type3Transparent" alt="Intersection 3"
                        class="img-fluid" @click="onTypeClick('type_3')">
                </div>
                <div class="col-md-3 text-center">
                    <img :src="form.typeOfIntersection === 'type_4' ? type4Dim : type4Transparent" alt="Intersection 4"
                        class="img-fluid" @click="onTypeClick('type_4')">
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
import type1Dim from '@/assets/img/type_1_dim.png';
import type1Transparent from '@/assets/img/type_1_transparent.png';
import type2Dim from '@/assets/img/type_2_dim.png';
import type2Transparent from '@/assets/img/type_2_transparent.png';
import type3Dim from '@/assets/img/type_3_dim.png';
import type3Transparent from '@/assets/img/type_3_transparent.png';
import type4Dim from '@/assets/img/type_4_dim.png';
import type4Transparent from '@/assets/img/type_4_transparent.png';

const props = defineProps({ point: Object, isEdit: Boolean, isImperial: Boolean });
const emit = defineEmits(['save', 'close']);
const { t } = useI18n();

const form = reactive({
    primaryRoadAddress: '',
    secondaryRoad: '',
    typeOfIntersection: 'type_1',
    pointNotes: '',
    severity: 'info',
    status: 'open',
    media: [] // Ensure media is initialized as array
});

const onTypeClick = (type) => {
    if (props.isEdit) {
        form.typeOfIntersection = type;
    }
}

watch(() => props.point, (val, oldVal) => {
    if (val) {
        // Only reset form if this is a different point or if the data has actually changed
        const isDifferentPoint = !oldVal || oldVal.id !== val.id;
        const hasDataChanged = oldVal && oldVal.data !== val.data;

        if (isDifferentPoint || hasDataChanged) {
            if (val.data !== undefined && val.data !== "") {
                try {
                    const parsedData = JSON.parse(val.data);
                    form.primaryRoadAddress = parsedData.primaryRoadAddress || '';
                    form.secondaryRoad = parsedData.secondaryRoad || '';
                    form.typeOfIntersection = parsedData.typeOfIntersection || 'type_1';
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

    /* background: #23272f; */

    /* color: #f3f6fa; */
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
}

.input-group .form-control:focus {
    border-right: none;
}

.input-group .form-control:focus+.input-group-text {
    border-color: var(--accent);
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

    /* font-size: 1.08rem; */
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

    /* Stack intersection type images on mobile */
    .form-group .row {
        flex-direction: column;
    }

    .form-group .col-md-3 {
        width: 100%;
        max-width: 100%;
        margin-bottom: var(--spacing-xs, 0.5rem);
    }
}
</style>
