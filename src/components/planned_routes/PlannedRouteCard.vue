<template>
    <div class="route-card">
        <!-- Header Row -->
        <div class="route-header-row">
            <div class="route-title">{{ route.SurveyName || t('untitled') }}</div>
            <div class="route-start">{{ route.ClientName || t('noClientName') }}</div>
            <div class="route-end">{{ formatDate(route.SurveyDate) || t('noDateSet') }}</div>
            <div class="route-time">{{ formatDate(route.createdAt) }}</div>
            <button class="toggle-details-btn" @click="toggleExpanded">
                <span v-if="expanded">{{ t('viewLess') }}</span>
                <span v-else>{{ t('viewMore') }}</span>
            </button>
        </div>

        <!-- Collapsible Details -->
        <transition name="fade">
            <div v-if="expanded" class="route-details">
                <div class="route-summary">
                    <div class="route-summary-col">
                        <span class="badge badge-km">{{ route.CargoType || t('noCargoType') }}</span>
                        <div class="route-address">
                            <strong>{{ t('surveyStart') }}:</strong> {{ formatLocation(route.SurveyStart) ||
                                t('noStartPoint') }}
                        </div>
                    </div>
                    <div class="route-summary-col route-summary-center">
                        <div>{{ t('cargoWeight') }}: {{ route.CargoWeight || t('noDataFound') }}</div>
                        <div>{{ t('cargoLength') }}: {{ route.CargoLength || t('noDataFound') }}</div>
                        <div>{{ t('cargoWidth') }}: {{ route.CargoWidth || t('noDataFound') }}</div>
                        <div>{{ t('cargoHeight') }}: {{ route.CargoHeight || t('noDataFound') }}</div>
                        <div>{{ t('trailerType') }}: {{ route.TrailerType || t('noDataFound') }}</div>
                        <div>{{ t('trailerLength') }}: {{ route.TrailerLength || t('noDataFound') }}</div>
                    </div>
                    <div class="route-summary-col">
                        <span class="badge badge-km">{{ route.TrailerType || t('noTrailerType') }}</span>
                        <div class="route-address">
                            <strong>{{ t('surveyEnd') }}:</strong> {{ formatLocation(route.SurveyEnd) || t('noEndPoint')
                            }}
                        </div>
                    </div>
                </div>
                <div class="route-actions">
                    <button class="btn btn-danger" @click="$emit('delete', route)">{{ t('deletePlannedRoute')
                    }}</button>
                    <button class="btn btn-secondary" @click="viewPlannedRoute">{{ t('viewPlannedRoute') }}</button>
                    <button class="btn btn-primary" @click="editPlannedRoute">{{ t('editPlannedRoute') }}</button>
                </div>
                <div class="route-notes">
                    <div class="notes-section">
                        <h4>{{ t('surveyInstructions') }}</h4>
                        <p>{{ route.SurveyInstructions || t('noDataFound') }}</p>
                    </div>
                    <div class="notes-section">
                        <h4>{{ t('cargoNotes') }}</h4>
                        <p>{{ route.CargoNotes || t('noDataFound') }}</p>
                    </div>
                    <div class="notes-section">
                        <h4>{{ t('trailerNotes') }}</h4>
                        <p>{{ route.TrailerNotes || t('noDataFound') }}</p>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();

const props = defineProps({
    route: { type: Object, required: true }
});

const expanded = ref(false);

const toggleExpanded = () => {
    expanded.value = !expanded.value;
}

const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    } catch {
        return dateString;
    }
};

const formatLocation = (location) => {
    if (!location) return null;

    // Handle string format (legacy)
    if (typeof location === 'string') {
        return location;
    }

    // Handle object format (new)
    if (typeof location === 'object' && location.display_name) {
        return location.display_name;
    }

    return null;
};

const viewPlannedRoute = () => {
    router.push(`/planned-routes/view/${props.route.id}`);
};

const editPlannedRoute = () => {
    router.push(`/planned-routes/edit/${props.route.id}`);
};
</script>

<style scoped>
.route-card {
    background: var(--bs-body-bg);
    border-radius: 18px;
    box-shadow: 0 2px 16px rgb(0 0 0 / 7%);
    margin-bottom: 1.1rem !important;
    padding: 0;
    overflow: hidden;
    transition: box-shadow 0.2s;
    width: 100%;
    box-sizing: border-box;
}

.route-card:hover {
    box-shadow: 0 4px 32px rgb(0 0 0 / 12%);
}

.route-header-row {
    display: flex;
    align-items: center;
    padding: 1.2rem 2rem;
    gap: 1.2rem;
    background: var(--bs-body-bg);
    border-bottom: 1px solid var(--bs-border-color);
    font-weight: 600;
    font-size: 1.13rem;
    color: var(--bs-body-color);
    overflow-x: auto;
}

.route-title {
    flex: 2;
    min-width: 180px;
    font-weight: 700;
}

.route-start,
.route-end {
    flex: 1;
    min-width: 120px;
}

.route-time {
    flex: 1;
    min-width: 120px;
    color: var(--text-secondary);
}

.toggle-details-btn {
    background: #e3e7f0;
    border: none;
    border-radius: 8px;
    padding: 0.6rem 1.4rem;
    font-weight: 600;
    color: #222;
    cursor: pointer;
    transition: background 0.2s;
    white-space: nowrap;
}

.toggle-details-btn:hover {
    background: #d1d8e6;
}

.route-details {
    padding: 1.5rem 2rem;
    background: var(--bs-tertiary-bg);
}

.route-summary {
    display: flex;
    gap: 2rem;
    margin-bottom: 1.5rem;
    align-items: flex-start;
}

.route-summary-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.route-summary-center {
    text-align: center;
}

.badge {
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    text-align: center;
}

.badge-km {
    background: var(--bs-primary);
    color: white;
}

.route-address {
    font-size: 0.95rem;
    color: var(--text-secondary);
    line-height: 1.4;
}

.route-actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
}

.btn {
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.95rem;
}

.btn-primary {
    background: var(--bs-primary);
    color: white;
}

.btn-primary:hover {
    background: var(--bs-primary-dark);
}

.btn-secondary {
    background: var(--bs-secondary);
    color: var(--bs-body-color);
}

.btn-secondary:hover {
    background: var(--bs-secondary-dark);
}

.btn-danger {
    background: var(--bs-danger);
    color: white;
}

.btn-danger:hover {
    background: var(--bs-danger-dark);
}

.route-notes {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.notes-section {
    background: var(--bs-body-bg);
    border-radius: 8px;
    padding: 1rem;
    border: 1px solid var(--bs-border-color);
}

.notes-section h4 {
    margin: 0 0 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: var(--bs-body-color);
}

.notes-section p {
    margin: 0;
    color: var(--text-secondary);
    line-height: 1.5;
    font-size: 0.95rem;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Responsive Styles */
@media (width <= 900px) {
    .route-header-row {
        font-size: 1rem;
        padding: 0.7rem;
        gap: 0.5rem;
    }

    .route-title {
        min-width: 120px;
        font-size: 0.98rem;
    }

    .route-start,
    .route-end,
    .route-time {
        min-width: 90px;
        font-size: 0.98rem;
    }
}

@media (width <= 600px) {
    .route-header-row {
        font-size: 0.95rem;
        padding: 0.5rem 0.3rem;
        gap: 0.3rem;
    }

    .route-title {
        min-width: 90px;
        font-size: 0.93rem;
    }

    .route-start,
    .route-end,
    .route-time {
        min-width: 70px;
        font-size: 0.93rem;
    }

    .toggle-details-btn {
        padding: 0.4rem 0.7rem;
        font-size: 0.95rem;
    }

    .route-details {
        padding: 1rem;
    }

    .route-summary {
        flex-direction: column;
        gap: 1rem;
    }

    .route-actions {
        flex-direction: column;
    }

    .btn {
        width: 100%;
        justify-content: center;
    }
}
</style>