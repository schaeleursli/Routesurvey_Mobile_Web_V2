<template>
    <div class="quick-start-container">
        <div class="header-section text-center mb-5">
            <h1 class="display-5 fw-bold text-primary mb-3">
                <i class="bi bi-rocket-takeoff me-2"></i>
                {{ $t('quickStart') }}
            </h1>
            <p class="text-muted lead">Master RouteSurvey in 5 simple steps. From download to your first report.</p>
        </div>

        <div class="timeline-wrapper">
            <Timeline :value="steps" align="alternate" class="customized-timeline">
                <template #marker="slotProps">
                    <span class="custom-marker shadow-sm" :style="{ backgroundColor: slotProps.item.color }">
                        <i :class="slotProps.item.icon"></i>
                    </span>
                </template>
                <template #content="slotProps">
                    <Card class="mb-4 step-card transition-all">
                        <template #title>
                            <span class="step-title" :style="{ color: slotProps.item.color }">
                                {{ slotProps.item.title }}
                            </span>
                        </template>
                        <template #subtitle>
                            {{ slotProps.item.subtitle }}
                        </template>
                        <template #content>
                            <p class="m-0 text-secondary mb-3">
                                {{ slotProps.item.description }}
                            </p>
                            <Button 
                                :label="slotProps.item.actionLabel" 
                                :icon="slotProps.item.actionIcon" 
                                size="small" 
                                outlined 
                                @click="handleAction(slotProps.item)"
                                v-if="slotProps.item.actionLabel"
                                :style="{ color: slotProps.item.color, borderColor: slotProps.item.color }"
                            />
                        </template>
                    </Card>
                </template>
            </Timeline>
        </div>

        <div class="text-center mt-5">
            <div class="completion-card p-4 rounded-4 shadow-sm bg-white d-inline-block">
                <div class="mb-3">
                    <i class="bi bi-trophy-fill text-warning" style="font-size: 3rem;"></i>
                </div>
                <h3>Ready to Go?</h3>
                <p class="text-muted mb-4">You have reviewed the basics. It's time to start your first survey.</p>
                <Button label="Start First Survey" icon="bi bi-play-fill" severity="primary" size="large" rounded @click="router.push('/plan-route')" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Timeline from 'primevue/timeline';
import Card from 'primevue/card';
import Button from 'primevue/button';

const router = useRouter();

const steps = ref([
    {
        title: 'Download & Install',
        subtitle: 'Step 1: Mobile App',
        description: 'Get the RouteSurvey mobile app from the App Store or Google Play Store. Log in with your corporate credentials.',
        icon: 'bi bi-phone',
        color: '#007bff',
        actionLabel: 'Get App Links',
        actionIcon: 'bi bi-qr-code'
    },
    {
        title: 'Plan Your Route',
        subtitle: 'Step 2: Desktop Console',
        description: 'Use this console to create a "Planned Route". Define the start/end points and assign a surveyor.',
        icon: 'bi bi-map',
        color: '#6f42c1',
        actionLabel: 'Create Plan',
        actionIcon: 'bi bi-plus-lg',
        route: '/plan-route/add'
    },
    {
        title: 'Execute Survey',
        subtitle: 'Step 3: Field Work',
        description: 'In the mobile app, open the planned route. Drive the path, record obstacles, capturing photos and measurements.',
        icon: 'bi bi-car-front',
        color: '#198754'
    },
    {
        title: 'Review & Edit',
        subtitle: 'Step 4: Quality Control',
        description: 'Back in the console, review the uploaded survey data. Adjust marker positions and refine notes.',
        icon: 'bi bi-check-circle',
        color: '#fd7e14',
        actionLabel: 'Go to Reviews',
        actionIcon: 'bi bi-arrow-right',
        route: '/route-manager'
    },
    {
        title: 'Generate Report',
        subtitle: 'Step 5: Delivberable',
        description: 'Generate a professional PDF report with your branding. Share it directly with your client via a secure link.',
        icon: 'bi bi-file-earmark-pdf',
        color: '#dc3545',
        actionLabel: 'View Templates',
        actionIcon: 'bi bi-file-text',
        route: '/admin/templates'
    }
]);

const handleAction = (item) => {
    if (item.route) {
        router.push(item.route);
    } else {
        // Handle other actions like showing a modal for app links
        console.log('Action clicked:', item.title);
    }
};
</script>

<style scoped>
.quick-start-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem 1rem;
}

.custom-marker {
    display: flex;
    width: 3rem;
    height: 3rem;
    align-items: center;
    justify-content: center;
    color: #fff;
    border-radius: 50%;
    z-index: 1;
    font-size: 1.25rem;
}

.step-card {
    border-radius: 12px;
    border: 1px solid rgb(0 0 0 / 5%);
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 5%);
}

.step-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 10%);
}

.step-title {
    font-weight: 700;
    font-size: 1.1rem;
}

::v-deep(.p-timeline-event-content) {
    line-height: 1.5;
}

::v-deep(.p-card-content) {
    padding-top: 0;
}

@media (width <= 768px) {
    .customized-timeline ::v-deep(.p-timeline-event-opposite) {
        display: none;
    }
}
</style>