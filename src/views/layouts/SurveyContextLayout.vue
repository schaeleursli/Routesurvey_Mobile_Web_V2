<template>
    <div class="survey-context-layout">
        <!-- Survey Context Header -->
        <div class="survey-context-header" v-if="routeTitle">
            <div class="header-content">
                <div class="survey-info">
                    <span class="context-label">{{ $t('survey') }}</span>
                    <h2 class="survey-title">{{ routeTitle }}</h2>
                </div>
                <!-- <div class="survey-actions">
                    <button class="btn btn-outline-secondary btn-sm" @click="exitContext">
                        <i class="bi bi-box-arrow-right"></i> {{ $t('exitSurvey') }}
                    </button>
                </div> -->
            </div>
            
            <!-- Context Navigation Tabs -->
            <div class="survey-tabs">
                <router-link 
                    :to="{ name: 'SurveyExecution', params: { id: routeId } }" 
                    class="survey-tab" 
                    active-class="active"
                >
                    <i class="bi bi-map"></i>
                    <span>{{ $t('overview') || 'Overview' }}</span>
                </router-link>
                
                <router-link 
                    :to="{ name: 'SurveyReport', params: { id: routeId } }" 
                    class="survey-tab" 
                    active-class="active"
                >
                    <i class="bi bi-file-earmark-text"></i>
                    <span>{{ $t('report') }}</span>
                </router-link>
                
                <router-link 
                    :to="{ name: 'SurveyShare', params: { id: routeId } }" 
                    class="survey-tab" 
                    active-class="active"
                >
                    <i class="bi bi-share"></i>
                    <span>{{ $t('share') }}</span>
                </router-link>
            </div>
        </div>

        <!-- Content Area -->
        <div class="survey-content">
            <router-view v-slot="{ Component }">
                <keep-alive include="RouteViewer">
                    <component :is="Component" :route-id="routeId" />
                </keep-alive>
            </router-view>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import RoutesController from '@/controllers/routes/routes_controller';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const routeId = computed(() => route.params.id);
const routeTitle = ref('');

// Fetch route details to display title
const fetchRouteDetails = async () => {
    if (!routeId.value) return;
    
    try {
        // We'll try to get the route details. 
        // This might be redundant if the child components also fetch it, 
        // but we need it for the header.
        const res = await RoutesController.getRoute(routeId.value);
        if (res && res.result) {
            routeTitle.value = res.data.title || res.data.Title || t('untitledSurvey');
        }
    } catch (error) {
        console.error('Error fetching survey details for header:', error);
    }
};

const exitContext = () => {
    router.push({ name: 'Dashboard' });
};

watch(() => routeId.value, () => {
    fetchRouteDetails();
});

onMounted(() => {
    fetchRouteDetails();
});
</script>

<style scoped>
.survey-context-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--bg-base);
}

.survey-context-header {
    background-color: var(--bg-surface);
    border-bottom: 1px solid var(--border);
    padding: 0;
    flex-shrink: 0;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem 0.5rem;
}

.survey-info {
    display: flex;
    flex-direction: column;
}

.context-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-secondary);
    font-weight: 600;
}

.survey-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: var(--text-primary);
}

.survey-tabs {
    display: flex;
    padding: 0 1.5rem;
    gap: 2rem;
}

.survey-tab {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 0;
    color: var(--text-secondary);
    text-decoration: none;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    font-weight: 500;
}

.survey-tab:hover {
    color: var(--text-primary);
}

.survey-tab.active {
    color: var(--primary);
    border-bottom-color: var(--primary);
}

.survey-content {
    flex: 1;
    overflow: hidden;
    position: relative;

    /* padding: 1rem; */
}
</style>
