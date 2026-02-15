<template>
    <div class="generic-point-display">
        <!-- Basic Information -->
        <div class="point-info-section">
            <h5 class="section-title">
                <img v-if="pointType === 'road'" width="20" height="20" src="@/assets/img/road.png" class="me-2">
                <img v-else-if="pointType === 'overhead'" width="20" height="20" src="@/assets/img/overhead.png"
                    class="me-2">
                <i v-else-if="pointType === 'railroad'" class="fas fa-train me-2"></i>
                <i v-else class="far fa-question-circle me-2"></i>
                {{ getPointTypeLabel(pointType) }} Information
            </h5>

            <div class="info-grid meta-grid">
                <!-- Metadata Section -->
                <div class="info-item">
                    <label>Severity</label>
                    <select v-if="isEdit" v-model="form.severity" class="form-control" :class="getSeverityClass(form.severity)">
                        <option value="critical">Critical</option>
                        <option value="major">Major</option>
                        <option value="minor">Minor</option>
                        <option value="info">Info</option>
                    </select>
                    <div v-else class="info-value" :class="getSeverityClass(pointData.severity)">
                        {{ pointData.severity ? (pointData.severity.charAt(0).toUpperCase() + pointData.severity.slice(1)) : 'Not specified' }}
                    </div>
                </div>

                <div class="info-item">
                    <label>Status</label>
                    <select v-if="isEdit" v-model="form.status" class="form-control">
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                    <div v-else class="info-value">
                        {{ pointData.status ? (pointData.status.charAt(0).toUpperCase() + pointData.status.slice(1).replace('_', ' ')) : 'Open' }}
                    </div>
                </div>

                <div class="info-item">
                    <label>GPS Accuracy</label>
                    <div class="info-value readonly">
                        {{ pointData.gpsAccuracy ? pointData.gpsAccuracy + ' m' : 'N/A' }}
                    </div>
                </div>

                <div class="info-item">
                    <label>Capture Time</label>
                    <div class="info-value readonly">
                        {{ pointData.timestamp ? new Date(pointData.timestamp).toLocaleString() : 'N/A' }}
                    </div>
                </div>

                <div class="info-item full-width">
                    <label>Created By</label>
                    <div class="info-value readonly">
                        {{ pointData.createdBy || 'Unknown User' }}
                    </div>
                </div>
            </div>

            <div class="info-grid">

                <div class="info-item">
                    <label>Road Address</label>
                    <input v-if="isEdit" v-model="form.roadAddress" class="form-control" />
                    <div v-else class="info-value">{{ pointData.roadAddress || 'Not specified' }}</div>
                </div>

                <!-- Road-specific fields -->
                <template v-if="pointType === 'road'">
                    <div class="info-item">
                        <label>Type of Surface</label>
                        <select v-if="isEdit" v-model="form.typeOfSurface" class="form-control">
                            <option value="asphalt">{{ $t('asphalt') }}</option>
                            <option value="concrete">{{ $t('concrete') }}</option>
                            <option value="gravel">{{ $t('gravel') }}</option>
                            <option value="dirt">{{ $t('dirt') }}</option>
                            <option value="composite">{{ $t('composite') }}</option>
                            <option value="other">{{ $t('other') }}</option>
                        </select>
                        <div v-else class="info-value">{{ getSurfaceTypeLabel(pointData.typeOfSurface) }}</div>
                    </div>
                    <div class="info-item">
                        <label>Number of Lines</label>
                        <input v-if="isEdit" v-model="form.numberOfLines" class="form-control" />
                        <div v-else class="info-value">{{ pointData.numberOfLines || 'Not specified' }}</div>
                    </div>
                    <div class="info-item">
                        <label>Road Width</label>
                        <input v-if="isEdit" v-model="form.roadWidth" class="form-control" />
                        <div v-else class="info-value">{{ pointData.roadWidth || 'Not specified' }}</div>
                    </div>
                </template>

                <!-- Overhead-specific fields -->
                <template v-if="pointType === 'overhead'">
                    <div class="info-item">
                        <label>Type of Obstruction</label>
                        <select v-if="isEdit" v-model="form.typeOfObstruction" class="form-control">
                            <option value="traffic_sign">{{ $t('trafficSign') }}</option>
                            <option value="traffic_light">{{ $t('trafficLight') }}</option>
                            <option value="street_light">{{ $t('streetLight') }}</option>
                            <option value="bridge_underpass">{{ $t('bridgeUnderpass') }}</option>
                            <option value="tunnel">{{ $t('tunnel') }}</option>
                            <option value="gas_line">{{ $t('gasLine') }}</option>
                            <option value="bill_board">{{ $t('billBoard') }}</option>
                            <option value="other">{{ $t('other') }}</option>
                        </select>
                        <div v-else class="info-value">{{ getObstructionTypeLabel(pointData.typeOfObstruction) }}</div>
                    </div>
                    <div class="info-item">
                        <label>Height Above Ground</label>
                        <input v-if="isEdit" v-model="form.heightAboveGround" class="form-control" />
                        <div v-else class="info-value">{{ pointData.heightAboveGround || 'Not specified' }}</div>
                    </div>
                    <div class="info-item">
                        <label>Dismountable</label>
                        <select v-if="isEdit" v-model="form.dismountable" class="form-control">
                            <option :value="true">{{ $t('yes') }}</option>
                            <option :value="false">{{ $t('no') }}</option>
                        </select>
                        <div v-else class="info-value">{{ pointData.dismountable ? $t('yes') : $t('no') }}</div>
                    </div>
                </template>

                <!-- Railroad-specific fields -->
                <template v-if="pointType === 'railroad'">
                    <div class="info-item">
                        <label>Approach</label>
                        <select v-if="isEdit" v-model="form.approach" class="form-control">
                            <option value="zig_zag">{{ $t('zigzag') }}</option>
                            <option value="split">{{ $t('split') }}</option>
                            <option value="right_hand_side">{{ $t('rightHandSide') }}</option>
                            <option value="see_notes">{{ $t('seeNotes') }}</option>
                        </select>
                        <div v-else class="info-value">{{ getApproachLabel(pointData.approach) }}</div>
                    </div>
                    <div class="info-item">
                        <label>Crossing No</label>
                        <input v-if="isEdit" v-model="form.crossingNo" class="form-control" />
                        <div v-else class="info-value">{{ pointData.crossingNo || 'Not specified' }}</div>
                    </div>
                    <div class="info-item">
                        <label>Carrier</label>
                        <input v-if="isEdit" v-model="form.carrier" class="form-control" />
                        <div v-else class="info-value">{{ pointData.carrier || 'Not specified' }}</div>
                    </div>
                    <div class="info-item">
                        <label>Height Restriction</label>
                        <input v-if="isEdit" v-model="form.heightRestriction" class="form-control" />
                        <div v-else class="info-value">{{ pointData.heightRestriction || 'Not specified' }}</div>
                    </div>
                    <div class="info-item">
                        <label>Road Width</label>
                        <input v-if="isEdit" v-model="form.roadWidth" class="form-control" />
                        <div v-else class="info-value">{{ pointData.roadWidth || 'Not specified' }}</div>
                    </div>
                    <div class="info-item">
                        <label>Crossing Width</label>
                        <input v-if="isEdit" v-model="form.crossingWidth" class="form-control" />
                        <div v-else class="info-value">{{ pointData.crossingWidth || 'Not specified' }}</div>
                    </div>
                    <div class="info-item">
                        <label>Slope</label>
                        <input v-if="isEdit" v-model="form.slope" class="form-control" />
                        <div v-else class="info-value">{{ pointData.slope || 'Not specified' }}</div>
                    </div>
                    <div class="info-item">
                        <label>Contact No</label>
                        <input v-if="isEdit" v-model="form.contactNo" class="form-control" />
                        <div v-else class="info-value">{{ pointData.contactNo || 'Not specified' }}</div>
                    </div>
                </template>

                <!-- Custom-specific fields -->
                <template v-if="pointType === 'custom'">
                    <div class="info-item">
                        <label>Description of Obstruction</label>
                        <input v-if="isEdit" v-model="form.descriptionOfObstruction" class="form-control" />
                        <div v-else class="info-value">{{ pointData.descriptionOfObstruction || 'Not specified' }}</div>
                    </div>
                    <div class="info-item">
                        <label>Height Notes</label>
                        <input v-if="isEdit" v-model="form.heightNotes" class="form-control" />
                        <div v-else class="info-value">{{ pointData.heightNotes || 'Not specified' }}</div>
                    </div>
                    <div class="info-item">
                        <label>Width Notes</label>
                        <input v-if="isEdit" v-model="form.widthNotes" class="form-control" />
                        <div v-else class="info-value">{{ pointData.widthNotes || 'Not specified' }}</div>
                    </div>
                    <div class="info-item">
                        <label>Length Notes</label>
                        <input v-if="isEdit" v-model="form.lengthNotes" class="form-control" />
                        <div v-else class="info-value">{{ pointData.lengthNotes || 'Not specified' }}</div>
                    </div>
                    <div class="info-item">
                        <label>Area Notes</label>
                        <input v-if="isEdit" v-model="form.areaNotes" class="form-control" />
                        <div v-else class="info-value">{{ pointData.areaNotes || 'Not specified' }}</div>
                    </div>
                    <div class="info-item">
                        <label>Ground Notes</label>
                        <input v-if="isEdit" v-model="form.groundNotes" class="form-control" />
                        <div v-else class="info-value">{{ pointData.groundNotes || 'Not specified' }}</div>
                    </div>
                    <div class="info-item">
                        <label>Restriction Notes</label>
                        <input v-if="isEdit" v-model="form.restrictionNotes" class="form-control" />
                        <div v-else class="info-value">{{ pointData.restrictionNotes || 'Not specified' }}</div>
                    </div>
                </template>

                <!-- Point Notes (common to all types) -->
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
import PhotoListManager from './PhotoListManager.vue';
import { usePhotoViewer } from '@/composables/usePhotoViewer';
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

const pointType = computed(() => props.point?.type || 'custom');


const form = reactive({
    roadAddress: '',
    typeOfSurface: '',
    numberOfLines: '',
    roadWidth: '',
    typeOfObstruction: '',
    heightAboveGround: '',
    dismountable: false,
    approach: '',
    crossingNo: '',
    carrier: '',
    heightRestriction: '',
    crossingWidth: '',
    slope: '',
    contactNo: '',
    descriptionOfObstruction: '',
    heightNotes: '',
    widthNotes: '',
    lengthNotes: '',
    areaNotes: '',
    groundNotes: '',
    restrictionNotes: '',
    pointNotes: '',
    media: [],
    severity: '',
    status: ''
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

const getPointTypeLabel = (type) => {
    const typeMap = {
        'road': 'Road',
        'overhead': 'Overhead',
        'railroad': 'Railroad',
        'custom': 'Custom'
    };
    return typeMap[type] || type || 'Custom';
};

const getSurfaceTypeLabel = (type) => {
    const typeMap = {
        'asphalt': t('asphalt'),
        'concrete': t('concrete'),
        'gravel': t('gravel'),
        'dirt': t('dirt'),
        'composite': t('composite'),
        'other': t('other')
    };
    return typeMap[type] || type || 'Not specified';
};

const getObstructionTypeLabel = (type) => {
    const typeMap = {
        'traffic_sign': t('trafficSign'),
        'traffic_light': t('trafficLight'),
        'street_light': t('streetLight'),
        'bridge_underpass': t('bridgeUnderpass'),
        'tunnel': t('tunnel'),
        'gas_line': t('gasLine'),
        'bill_board': t('billBoard'),
        'other': t('other')
    };
    return typeMap[type] || type || 'Not specified';
};

const getApproachLabel = (type) => {
    const typeMap = {
        'zig_zag': t('zigzag'),
        'split': t('split'),
        'right_hand_side': t('rightHandSide'),
        'see_notes': t('seeNotes')
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
            form.typeOfSurface = parsedData.typeOfSurface || '';
            form.numberOfLines = parsedData.numberOfLines || '';
            form.roadWidth = parsedData.roadWidth || '';
            form.typeOfObstruction = parsedData.typeOfObstruction || '';
            form.heightAboveGround = parsedData.heightAboveGround || '';
            form.dismountable = parsedData.dismountable || false;
            form.approach = parsedData.approach || '';
            form.crossingNo = parsedData.crossingNo || '';
            form.carrier = parsedData.carrier || '';
            form.heightRestriction = parsedData.heightRestriction || '';
            form.crossingWidth = parsedData.crossingWidth || '';
            form.slope = parsedData.slope || '';
            form.contactNo = parsedData.contactNo || '';
            form.descriptionOfObstruction = parsedData.descriptionOfObstruction || '';
            form.heightNotes = parsedData.heightNotes || '';
            form.widthNotes = parsedData.widthNotes || '';
            form.lengthNotes = parsedData.lengthNotes || '';
            form.areaNotes = parsedData.areaNotes || '';
            form.groundNotes = parsedData.groundNotes || '';
            form.restrictionNotes = parsedData.restrictionNotes || '';
            form.pointNotes = parsedData.pointNotes || '';
            form.media = parsedData.media || [];
            form.severity = parsedData.severity || 'info';
            form.status = parsedData.status || 'open';
        } catch (error) {
            console.error('Error parsing point data:', error);
        }
    } else {
        // Initialize form with empty values if no data
        form.roadAddress = '';
        form.typeOfSurface = '';
        form.numberOfLines = '';
        form.roadWidth = '';
        form.typeOfObstruction = '';
        form.heightAboveGround = '';
        form.dismountable = false;
        form.approach = '';
        form.crossingNo = '';
        form.carrier = '';
        form.heightRestriction = '';
        form.crossingWidth = '';
        form.slope = '';
        form.contactNo = '';
        form.descriptionOfObstruction = '';
        form.heightNotes = '';
        form.widthNotes = '';
        form.lengthNotes = '';
        form.areaNotes = '';
        form.groundNotes = '';
        form.restrictionNotes = '';
        form.pointNotes = '';
        form.media = [];
        form.severity = 'info';
        form.status = 'open';
    }
}, { immediate: true });

const getSeverityClass = (severity) => {
    if (!severity) return '';
    return `severity-${severity.toLowerCase()}`;
};

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
.generic-point-display {
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


.action-buttons {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--bs-border-color);
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

.meta-grid {
    background: var(--bs-tertiary-bg);
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    border: 1px solid var(--bs-border-color);
}

.info-value.readonly {
    background: transparent;
    border-color: transparent;
    padding-left: 0;
    color: var(--bs-secondary);
}

/* Severity Colors */
.severity-critical {
    color: #dc3545;
    font-weight: bold;
    border-color: #dc3545 !important;
}

.severity-major {
    color: #fd7e14;
    font-weight: bold;
    border-color: #fd7e14 !important;
}

.severity-minor {
    color: #ffc107;
    font-weight: bold;
    border-color: #ffc107 !important;
}

.severity-info {
    color: #0dcaf0;
    font-weight: bold;
    border-color: #0dcaf0 !important;
}
</style>