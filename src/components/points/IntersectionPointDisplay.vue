<template>
    <div class="intersection-point-display">
        <!-- Basic Information -->
        <div class="point-info-section">
            <h5 class="section-title">
                <img width="20" height="20" src="@/assets/img/intersection.png" class="me-2">
                Intersection Information
            </h5>

            <div class="info-grid">
                <div class="info-item">
                    <label>Primary Road Address</label>
                    <input v-if="isEdit" v-model="form.primaryRoadAddress" class="form-control" />
                    <div v-else class="info-value">{{ pointData.primaryRoadAddress || 'Not specified' }}</div>
                </div>
                <div class="info-item">
                    <label>Secondary Road</label>
                    <input v-if="isEdit" v-model="form.secondaryRoad" class="form-control" />
                    <div v-else class="info-value">{{ pointData.secondaryRoad || 'Not specified' }}</div>
                </div>
                <div class="info-item full-width">
                    <label>Type of Intersection</label>
                    <div v-if="isEdit" class="intersection-type-selector">
                        <div class="intersection-types-grid">
                            <div v-for="type in intersectionTypes" :key="type.value" class="intersection-type-option"
                                :class="{ active: form.typeOfIntersection === type.value }"
                                @click="form.typeOfIntersection = type.value">
                                <img :src="type.image" :alt="type.label" class="intersection-type-img" />
                                <span class="intersection-type-label">{{ type.label }}</span>
                            </div>
                        </div>
                    </div>
                    <div v-else class="intersection-type-display">
                        <img :src="getIntersectionTypeImage(pointData.typeOfIntersection)"
                            :alt="getIntersectionTypeLabel(pointData.typeOfIntersection)"
                            class="intersection-type-img" />
                        <span class="intersection-type-label">{{ getIntersectionTypeLabel(pointData.typeOfIntersection)
                        }}</span>
                    </div>
                </div>
                <div class="info-item full-width">
                    <label>Point Notes</label>
                    <textarea v-if="isEdit" v-model="form.pointNotes" class="form-control" rows="3"></textarea>
                    <div v-else class="info-value">{{ pointData.pointNotes || 'No notes' }}</div>
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
import type1Dim from '@/assets/img/type_1_dim.png';
import type1Transparent from '@/assets/img/type_1_transparent.png';
import type2Dim from '@/assets/img/type_2_dim.png';
import type2Transparent from '@/assets/img/type_2_transparent.png';
import type3Dim from '@/assets/img/type_3_dim.png';
import type3Transparent from '@/assets/img/type_3_transparent.png';
import type4Dim from '@/assets/img/type_4_dim.png';
import type4Transparent from '@/assets/img/type_4_transparent.png';

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

const emit = defineEmits(['save', 'cancel']);

const { t } = useI18n();
const { showPhoto } = usePhotoViewer();

const setGlobalLoading = inject('setGlobalLoading');
const showMessage = inject('showMessage');

const form = reactive({
    primaryRoadAddress: '',
    secondaryRoad: '',
    typeOfIntersection: 'type_1',
    pointNotes: '',
    media: []
});

const intersectionTypes = [
    { value: 'type_1', label: 'Type 1', image: type1Dim },
    { value: 'type_2', label: 'Type 2', image: type2Dim },
    { value: 'type_3', label: 'Type 3', image: type3Dim },
    { value: 'type_4', label: 'Type 4', image: type4Dim }
];

const pointData = computed(() => {
    if (!props.point || !props.point.data) return {};
    try {
        return JSON.parse(props.point.data);
    } catch (error) {
        console.error('Error parsing point data:', error);
        return {};
    }
});

const getIntersectionTypeLabel = (type) => {
    const typeMap = {
        'type_1': 'Type 1 Intersection',
        'type_2': 'Type 2 Intersection',
        'type_3': 'Type 3 Intersection',
        'type_4': 'Type 4 Intersection'
    };
    return typeMap[type] || type || 'Not specified';
};

const getIntersectionTypeImage = (type) => {
    const imageMap = {
        'type_1': '/src/assets/img/type_1.png',
        'type_2': '/src/assets/img/type_2.png',
        'type_3': '/src/assets/img/type_3.png',
        'type_4': '/src/assets/img/type_4.png'
    };
    return imageMap[type] || '/src/assets/img/type_1.png';
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
            form.primaryRoadAddress = parsedData.primaryRoadAddress || '';
            form.secondaryRoad = parsedData.secondaryRoad || '';
            form.typeOfIntersection = parsedData.typeOfIntersection || 'type_1';
            form.pointNotes = parsedData.pointNotes || '';
            form.media = parsedData.media || [];
        } catch (error) {
            console.error('Error parsing point data:', error);
        }
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
.intersection-point-display {
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

.info-item.full-width {
    grid-column: 1 / -1;
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

.intersection-type-display {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem;
    background: var(--bs-tertiary-bg);
    border-radius: 0.375rem;
    border: 1px solid var(--bs-border-color);
    min-height: 2.5rem;
}

.intersection-type-img {
    width: 40px;
    height: 40px;
    object-fit: contain;
}

.intersection-type-label {
    font-size: 0.9rem;
    color: var(--bs-body-color);
    font-weight: 500;
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

.intersection-type-selector {
    padding: 0.5rem;
    background: var(--bs-tertiary-bg);
    border-radius: 0.375rem;
    border: 1px solid var(--bs-border-color);
}

.intersection-types-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
}

.intersection-type-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem;
    border: 1px solid var(--bs-border-color);
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease;
    background: var(--bs-body-bg);
}

.intersection-type-option:hover {
    border-color: var(--bs-primary);
    background: var(--bs-primary-bg-subtle);
}

.intersection-type-option.active {
    border-color: var(--bs-primary);
    background: var(--bs-primary-bg-subtle);
    box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.25);
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
    .info-grid {
        grid-template-columns: 1fr;
    }

    .photos-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    }

    .intersection-type-display {
        flex-direction: column;
        text-align: center;
    }
}
</style>
