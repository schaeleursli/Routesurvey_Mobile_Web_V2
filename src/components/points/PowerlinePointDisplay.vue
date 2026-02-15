<template>
    <div class="powerline-point-display">
        <!-- Basic Information -->
        <div class="point-info-section">
            <h5 class="section-title">
                <img width="20" height="20" src="@/assets/img/electric-tower_old_delete.png" class="me-2">
                Powerline Information
            </h5>

            <div class="info-grid">
                <div class="info-item">
                    <label>Road Address</label>
                    <input v-if="isEdit" v-model="form.roadAddress" class="form-control" />
                    <div v-else class="info-value">{{ pointData.roadAddress || 'Not specified' }}</div>
                </div>
                <div class="info-item">
                    <label>Type of Powerline</label>
                    <select v-if="isEdit" v-model="form.typeOfPowerline" class="form-control">
                        <option value="low_voltage_line">{{ $t('lowVoltageLine') }}</option>
                        <option value="medium_voltage_line">{{ $t('mediumVoltageLine') }}</option>
                        <option value="high_voltage_line">{{ $t('highVoltageLine') }}</option>
                        <option value="extreme_high_voltage_line">{{ $t('extremeHighVoltageLine') }}</option>
                        <option value="residential_power_line">{{ $t('residentalPowerLine') }}</option>
                        <option value="rail_overhead_line">{{ $t('railOverheadPowerLine') }}</option>
                        <option value="other">{{ $t('other') }}</option>
                    </select>
                    <div v-else class="info-value">{{ getPowerlineTypeLabel(pointData.typeOfPowerline) }}</div>
                </div>
                <div class="info-item">
                    <label>Voltage</label>
                    <input v-if="isEdit" v-model="form.voltage" class="form-control" />
                    <div v-else class="info-value">{{ pointData.voltage || 'Not specified' }}</div>
                </div>
                <div class="info-item">
                    <label>Height Above Ground</label>
                    <input v-if="isEdit" v-model="form.heightAboveGround" class="form-control" />
                    <div v-else class="info-value">{{ pointData.heightAboveGround || 'Not specified' }}</div>
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
    roadAddress: '',
    typeOfPowerline: '',
    voltage: '',
    heightAboveGround: '',
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

const getPowerlineTypeLabel = (type) => {
    const typeMap = {
        'low_voltage_line': t('lowVoltageLine'),
        'medium_voltage_line': t('mediumVoltageLine'),
        'high_voltage_line': t('highVoltageLine'),
        'extreme_high_voltage_line': t('extremeHighVoltageLine'),
        'residential_power_line': t('residentalPowerLine'),
        'rail_overhead_line': t('railOverheadPowerLine'),
        'other': t('other')
    };
    return typeMap[type] || type || 'Not specified';
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
            form.typeOfPowerline = parsedData.typeOfPowerline || '';
            form.voltage = parsedData.voltage || '';
            form.heightAboveGround = parsedData.heightAboveGround || '';
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
.powerline-point-display {
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
    .info-grid {
        grid-template-columns: 1fr;
    }

    .photos-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    }
}
</style>
