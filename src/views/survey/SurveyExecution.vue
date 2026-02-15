<template>
    <div class="survey-execution-layout" :class="{ 'is-mobile': isMobile }">
        <!-- Mobile Header Controls -->
        <div class="mobile-controls" v-if="isMobile">
            <div class="view-toggles">
                <button 
                    class="toggle-btn" 
                    :class="{ active: mobileView === 'map' }"
                    @click="mobileView = 'map'"
                >
                    <i class="bi bi-map"></i> Map
                </button>
                <button 
                    class="toggle-btn" 
                    :class="{ active: mobileView === 'list' }"
                    @click="mobileView = 'list'"
                >
                    <i class="bi bi-list-ul"></i> List
                    <span class="badge-count" v-if="store.filteredPoints.length">{{ store.filteredPoints.length }}</span>
                </button>
            </div>
            <div class="header-actions">
                 <!-- Place for other actions if needed -->
            </div>
        </div>

        <!-- Left Pane: List -->
        <div class="pane-left" v-show="!isMobile || mobileView === 'list'">
            <PointListPanel />
        </div>

        <!-- Center Pane: Map -->
        <!-- On mobile, we keep map mounted/visible behind or controlled by z-index to prevent reload, 
             but we use v-show to hide interaction if list is top -->
        <div class="pane-center" v-show="!isMobile || mobileView === 'map'">
            <SurveyMap />
        </div>

        <!-- Right Pane: Details (Drawer) -->
        <div 
            class="pane-right" 
            :class="{ 'mobile-overlay': isMobile }"
            v-if="store.activePointId"
        >
            <PointDetailDrawer />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useSurveyStore } from '@/stores/surveyStore';
import { useRoute } from 'vue-router';
import RoutesController from '@/controllers/routes/routes_controller';
import { normalizeRouteData } from '@/utils/routeDataNormalizer';
import PointListPanel from '@/components/survey/PointListPanel.vue';
import PointDetailDrawer from '@/components/survey/PointDetailDrawer.vue';
import SurveyMap from '@/components/survey/SurveyMap.vue';

const store = useSurveyStore();
const route = useRoute();

// -- Mobile Responsiveness --
const isMobile = ref(false);
const mobileView = ref('map'); // 'map' | 'list'

const checkResponsive = () => {
    isMobile.value = window.innerWidth <= 900;
    if (!isMobile.value) {
        // Reset to default desktop state if needed, or keep logic simple
        mobileView.value = 'map'; 
    }
};

// -- Keyboard Nav --
const handleKeydown = (e) => {
    // Ignore input fields
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

    if (e.key === 'j' || e.key === 'ArrowDown') {
        store.navigateNext();
    } else if (e.key === 'k' || e.key === 'ArrowUp') {
        store.navigatePrev();
    }
};

onMounted(async () => {
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('resize', checkResponsive);
    checkResponsive();
    
    // Load data if not already loaded or if route ID changes
    // Assuming route.params.id is the survey/route ID
    if (route.params.id) {
        try {
            // Fetch points via controller
            // This logic might need to be adapted based on actual controller method signature
            const res = await RoutesController.getRoute(route.params.id);
            if (res && res.result && res.data) {
                const routeData = normalizeRouteData(res.data);
                const points = routeData.pointsData || routeData.points || [];
                store.setPoints(points);
            }
        } catch (error) {
            console.error('Failed to load survey points', error);
        }
    }
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('resize', checkResponsive);
});
</script>

<style scoped>
.survey-execution-layout {
    display: flex;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background-color: var(--bg-base);
    position: relative;
    flex-direction: row; /* Default desktop */
}

.pane-left {
    width: 350px;
    flex-shrink: 0;
    z-index: 10;
    box-shadow: 2px 0 5px rgb(0 0 0 / 5%);
    background: var(--bg-surface);
}

.pane-center {
    flex: 1;
    position: relative;
    z-index: 1;
}

.pane-right {
    width: 400px;
    flex-shrink: 0;
    z-index: 12;
    box-shadow: -2px 0 5px rgb(0 0 0 / 5%);
    background-color: var(--bg-surface);
}

/* -- Mobile Styles -- */
.survey-execution-layout.is-mobile {
    flex-direction: column;
}

.mobile-controls {
    flex-shrink: 0;
    height: 50px;
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1rem;
    z-index: 20;
}

.view-toggles {
    display: flex;
    gap: 0;
    background: var(--bg-surface-2);
    border-radius: 8px;
    padding: 3px;
    border: 1px solid var(--border);
}

.toggle-btn {
    padding: 6px 16px;
    border: none;
    background: transparent;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
}

.toggle-btn.active {
    background: var(--bg-surface);
    color: var(--primary);
    box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
    font-weight: 600;
}

.badge-count {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    padding: 1px 6px;
    border-radius: 10px;
    font-size: 0.75rem;
    margin-left: 2px;
}

/* Mobile Panes */
.survey-execution-layout.is-mobile .pane-left {
    width: 100%;
    flex: 1;
    border-right: none;
    box-shadow: none;
}

.survey-execution-layout.is-mobile .pane-center {
    width: 100%;
    flex: 1;
}

/* Drawer overlay for responsive mode */
.survey-execution-layout.is-mobile .pane-right.mobile-overlay {
    position: absolute;
    inset: 50px 0 0; /* Below mobile controls header */
    width: 100%;
    z-index: 30; /* Above everything */
    animation: slideUp 0.3s ease;
}

/* Responsive Breakpoint Logic */
/* We still keep some media queries for intermediate refinements if needed */
@media (width <= 1200px) {
    /* If not mobile mode yet but cramped */
    .pane-left { width: 300px; }
    .pane-right { width: 350px; }
}

@keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
}
</style>
