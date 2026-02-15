<template>
    <div class="bridge-point-display">
        <!-- Basic Information -->
        <div class="point-info-section">
            <h5 class="section-title">
                <img width="20" height="20" src="@/assets/img/bridge.png" class="me-2">
                Bridge Information
            </h5>

            <div class="info-grid">
                <div class="info-item">
                    <label>Road Address</label>
                    <input v-if="isEdit" v-model="form.roadAddress" class="form-control" />
                    <div v-else class="info-value">{{ pointData.roadAddress || 'Not specified' }}</div>
                </div>
                <div class="info-item">
                    <label>Bridge Type</label>
                    <select v-if="isEdit" v-model="form.bridgeType" class="form-control">
                        <option value="beam_bridge">{{ $t('beamBridge') }}</option>
                        <option value="culvert_bridge">{{ $t('culvertBridge') }}</option>
                        <option value="slab_bridge">{{ $t('slabBridge') }}</option>
                        <option value="girder_bridge">{{ $t('girderBridge') }}</option>
                        <option value="truss_bridge">{{ $t('trussBridge') }}</option>
                        <option value="arch_bridge">{{ $t('archBridge') }}</option>
                        <option value="suspension_bridge">{{ $t('suspensionBridge') }}</option>
                        <option value="other">{{ $t('other') }}</option>
                    </select>
                    <div v-else class="info-value">{{ getBridgeTypeLabel(pointData.bridgeType) }}</div>
                </div>
                <div class="info-item">
                    <label>Overall Length</label>
                    <input v-if="isEdit" v-model="form.overallLength" class="form-control" />
                    <div v-else class="info-value">{{ pointData.overallLength || 'Not specified' }}</div>
                </div>
                <div class="info-item">
                    <label>Condition</label>
                    <input v-if="isEdit" v-model="form.condition" class="form-control" />
                    <div v-else class="info-value">{{ pointData.condition || 'Not specified' }}</div>
                </div>
                <div class="info-item">
                    <label>Number of Spans</label>
                    <input v-if="isEdit" v-model="form.numberOfSpans" type="number" class="form-control" />
                    <div v-else class="info-value">{{ pointData.numberOfSpans || 'Not specified' }}</div>
                </div>
                <div class="info-item full-width">
                    <label>Point Notes</label>
                    <textarea v-if="isEdit" v-model="form.pointNotes" class="form-control" rows="3"></textarea>
                    <div v-else class="info-value">{{ pointData.pointNotes || 'No notes' }}</div>
                </div>
            </div>
        </div>

        <!-- Bridge Spans -->
        <div v-if="form.spans && form.spans.length > 0" class="spans-section">
            <h5 class="section-title">Bridge Spans</h5>
            <div v-for="(span, index) in form.spans" :key="index" class="span-item">
                <h6 class="span-title">Span {{ index + 1 }}</h6>
                <div class="span-grid">
                    <div class="span-info">
                        <label>Length</label>
                        <input v-if="isEdit" v-model="span.length" type="number" class="form-control" />
                        <div v-else class="info-value">{{ span.length || 'Not specified' }}</div>
                    </div>
                    <div class="span-info">
                        <label>Width</label>
                        <input v-if="isEdit" v-model="span.width" type="number" class="form-control" />
                        <div v-else class="info-value">{{ span.width || 'Not specified' }}</div>
                    </div>
                    <div class="span-info">
                        <label>Number of Beams</label>
                        <input v-if="isEdit" v-model="span.numberOfBeams" type="number" class="form-control" />
                        <div v-else class="info-value">{{ span.numberOfBeams || 'Not specified' }}</div>
                    </div>
                    <div class="span-info">
                        <label>Beam Width</label>
                        <input v-if="isEdit" v-model="span.beamWidth" type="number" class="form-control" />
                        <div v-else class="info-value">{{ span.beamWidth || 'Not specified' }}</div>
                    </div>
                    <div class="span-info">
                        <label>Beam Height</label>
                        <input v-if="isEdit" v-model="span.beamHeight" type="number" class="form-control" />
                        <div v-else class="info-value">{{ span.beamHeight || 'Not specified' }}</div>
                    </div>
                    <div class="span-info">
                        <label>Material</label>
                        <select v-if="isEdit" v-model="span.material" class="form-control">
                            <option value="">{{ $t('selectType') }}</option>
                            <option value="steel">{{ $t('steel') }}</option>
                            <option value="concrete">{{ $t('concrete') }}</option>
                            <option value="reinforced_concrete">{{ $t('reinforcedConcrete') }}</option>
                            <option value="post_tensioned_concrete">{{ $t('postTensionedConcrete') }}</option>
                            <option value="wood">{{ $t('wood') }}</option>
                            <option value="other">{{ $t('other') }}</option>
                        </select>
                        <div v-else class="info-value">{{ getMaterialLabel(span.material) }}</div>
                    </div>
                </div>
                <div class="span-notes">
                    <label>Span Notes</label>
                    <textarea v-if="isEdit" v-model="span.notes" class="form-control" rows="2"></textarea>
                    <div v-else class="info-value">{{ span.notes || 'No notes' }}</div>
                </div>
            </div>
        </div>

        <!-- Photos Section -->
        <div class="photos-section">
            <div class="photos-header">
                <h5 class="section-title">Photos</h5>
                <button v-if="isEdit" type="button" class="btn btn-primary btn-sm" @click="triggerPhotoUploadInput">
                    <i class="bi bi-plus"></i> Add Photo
                </button>
                <input id="photoUploadInput" type="file" accept="image/*" style="display: none;"
                    @change="onPhotoUploadInputChanged">
            </div>
            <PhotoListManager :is-edit="isEdit" v-model:photos="form.media" />
        </div>



    </div>
</template>

<script setup>
import { ref, computed, reactive, watch, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePhotoViewer } from '@/composables/usePhotoViewer';
import PhotoListManager from './PhotoListManager.vue';
import FileManagementController from '@/controllers/file_management/file_management_controller';

const props = defineProps({
    point: {
        type: Object,
        required: true
    },
    isEdit: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['save']);

const { t } = useI18n();
const { showPhoto } = usePhotoViewer();

const setGlobalLoading = inject('setGlobalLoading');
const showMessage = inject('showMessage');

const form = reactive({
    roadAddress: '',
    bridgeType: '',
    overallLength: '',
    condition: '',
    numberOfSpans: '',
    spans: [],
    pointNotes: '',
    media: []
});

const pointData = computed(() => {
    if (!props.point || !props.point.data) return {};
    try {
        return JSON.parse(props.point.data);
    } catch (error) {
        console.error('Error parsing point data:', error);
        return {};
    }
});

const getBridgeTypeLabel = (type) => {
    const typeMap = {
        'beam_bridge': t('beamBridge'),
        'culvert_bridge': t('culvertBridge'),
        'slab_bridge': t('slabBridge'),
        'girder_bridge': t('girderBridge'),
        'truss_bridge': t('trussBridge'),
        'arch_bridge': t('archBridge'),
        'suspension_bridge': t('suspensionBridge'),
        'other': t('other')
    };
    return typeMap[type] || type || 'Not specified';
};

const getMaterialLabel = (material) => {
    const materialMap = {
        'steel': t('steel'),
        'concrete': t('concrete'),
        'reinforced_concrete': t('reinforcedConcrete'),
        'post_tensioned_concrete': t('postTensionedConcrete'),
        'wood': t('wood'),
        'other': t('other')
    };
    return materialMap[material] || material || 'Not specified';
};

const getPhotoUrl = (url) => {
    return String(url).replace('10.0.2.2', 'localhost');
};

const viewPhoto = (url) => {
    showPhoto(getPhotoUrl(url), 'Point photo');
};

// Watch for changes in point data and update form
watch(() => props.point, (val) => {
    if (val && val.data) {
        try {
            const parsedData = JSON.parse(val.data);
            form.roadAddress = parsedData.roadAddress || '';
            form.bridgeType = parsedData.bridgeType || '';
            form.overallLength = parsedData.overallLength || '';
            form.condition = parsedData.condition || '';
            form.numberOfSpans = parsedData.numberOfSpans || '';
            form.spans = parsedData.spans || [];
            form.pointNotes = parsedData.pointNotes || '';
            form.media = parsedData.media || [];
        } catch (error) {
            console.error('Error parsing point data:', error);
        }
    }
}, { immediate: true });

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

const triggerPhotoUploadInput = () => {
    const element = document.getElementById("photoUploadInput");
    if (element) {
        element.click();
    }
};

const onPhotoUploadInputChanged = async (e) => {
    setGlobalLoading(true);

    try {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            const res = await FileManagementController.uploadRoutePhoto(formData);
            if (res.result) {
                form.media = [...form.media, { url: res.url, note: file.name, type: 'photo' }];
            } else {
                showMessage({ status: 'error', message: res.message });
            }
        }
    } catch (error) {
        console.log(error);
        showMessage({ status: 'error', message: t('somethingWentWrong') });
    }

    setGlobalLoading(false);
};

const saveChanges = () => {
    emit('save', { ...form });
};

// Expose the saveChanges method to parent components
defineExpose({
    saveChanges
});
</script>

<style scoped>
.bridge-point-display {
    padding: 1rem 0;
}

.section-title {
    display: flex;
    align-items: center;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--bs-primary);
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--bs-border-color);
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.info-item {
    display: flex;
    flex-direction: column;
}

.info-item label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--bs-secondary);
    margin-bottom: 0.25rem;
}

.info-value {
    font-size: 0.9rem;
    color: var(--bs-body-color);
    padding: 0.5rem;
    background: var(--bs-tertiary-bg);
    border-radius: 0.375rem;
    border: 1px solid var(--bs-border-color);
    min-height: 2.5rem;
    display: flex;
    align-items: center;
}

.spans-section {
    margin-bottom: 1.5rem;
}

.span-item {
    background: var(--bs-tertiary-bg);
    border: 1px solid var(--bs-border-color);
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1rem;
}

.span-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--bs-primary);
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--bs-border-color);
}

.span-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
}

.span-info {
    display: flex;
    flex-direction: column;
}

.span-info label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--bs-secondary);
    margin-bottom: 0.25rem;
}

.span-notes {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--bs-border-color);
}

.photos-section {
    margin-bottom: 1.5rem;
}

.photos-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.photos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
}

.photo-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.photo-thumbnail {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 0.5rem;
    border: 2px solid var(--bs-primary);
    cursor: pointer;
    transition: all 0.2s ease;
}

.photo-thumbnail:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgb(0 0 0 / 20%);
}

.photo-note {
    font-size: 0.8rem;
    color: var(--bs-secondary);
    margin-top: 0.5rem;
    word-break: break-word;
}


.form-control {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--bs-border-color);
    border-radius: 0.375rem;
    font-size: 0.9rem;
    background: var(--bs-body-bg);
    color: var(--bs-body-color);
}

.form-control:focus {
    border-color: var(--bs-primary);
    outline: none;
    box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.25);
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--bs-border-color);
}

.photo-note-edit {
    margin-top: 0.5rem;
    width: 100%;
}

.photo-note-input {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
}


.btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-primary {
    background-color: var(--bs-primary);
    color: white;
}

.btn-primary:hover {
    background-color: var(--bs-primary-dark);
}

.btn-secondary {
    background-color: var(--bs-secondary);
    color: white;
}

.btn-secondary:hover {
    background-color: var(--bs-secondary-dark);
}

@media (width <= 768px) {
    .info-grid,
    .span-grid {
        grid-template-columns: 1fr;
    }

    .photos-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    }
}
</style>
