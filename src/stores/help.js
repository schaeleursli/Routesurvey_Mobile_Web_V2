import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export const useHelpStore = defineStore('help', () => {
    const isOpen = ref(false);
    const route = useRoute();
    const router = useRouter();

    // Knowledge Base Data
    // In a real AI app, this would be vector embeddings. We mock it with structured tags.
    const articles = ref([
        {
            id: 'getting-started',
            title: 'Getting Started with RouteSurvey',
            content: 'RouteSurvey is your all-in-one tool for heavy-haul logistics. Start by creating a planned route or syncing offline data.',
            category: 'basics',
            context: ['dashboard', 'home'],
            icon: 'bi-rocket-takeoff',
            actions: [
                { label: 'Create First Route', route: '/plan-route/new' }
            ]
        },
        {
            id: 'create-route',
            title: 'How to Plan a Route',
            content: 'Go to the "Planned Routes" section. Click "New Route". Enter your Start and End points.',
            category: 'planning',
            context: ['plan-route', 'planned-routes'],
            icon: 'bi-map',
            video: 'planning_demo.mp4' // Mock
        },
        {
            id: 'survey-mode',
            title: 'Using Survey Mode',
            content: 'When in the field, switch to "Survey Mode" to capture POIs. Ensure GPS is enabled. You can drop pins for obstacles, bridges, and utilities.',
            category: 'survey',
            context: ['route-viewer', 'survey-execution'],
            icon: 'bi-phone',
            important: true
        },
        {
            id: 'export-report',
            title: 'Exporting PDF Reports',
            summary: 'Generate professional PDFs for your clients.',
            content: 'Navigate to the "Report" tab of any surveyed route. Select "Generate PDF". You can customize logos and data fields. Templates can be managed in Admin settings.',
            category: 'reporting',
            context: ['reporting', 'survey-report'],
            icon: 'bi-file-pdf'
        },
        {
            id: 'share-link',
            title: 'Sharing Live Links',
            content: 'You can share a live, read-only link of the route with your client. Go to the "Share" tab and click "Create Public Link". You can set expiration dates and password protection.',
            category: 'collaboration',
            context: ['share-center', 'survey-share'],
            icon: 'bi-share'
        },
        {
            id: 'manage-users',
            title: 'Managing Team Members',
            content: 'Admins can invite users in the "Organization" settings. Rolls include: Admin, Surveyor, and Viewer.',
            category: 'admin',
            context: ['organization-users', 'organization-manage'],
            icon: 'bi-people'
        },
        {
            id: 'offline-sync',
            title: 'Offline Syncing',
            content: 'RouteSurvey works offline. content is saved locally and syncs when a connection is restored. Look for the "Sync Cloud" icon.',
            category: 'troubleshooting',
            context: ['global'],
            icon: 'bi-cloud-check'
        }
    ]);

    const searchQuery = ref('');

    // Logic to determine current context from route
    const currentContext = computed(() => {
        const name = route.name || '';
        const path = route.path || '';

        if (path.includes('plan')) return 'plan-route';
        if (path.includes('surveys') || path.includes('routes')) return 'route-viewer';
        if (path.includes('report')) return 'reporting';
        if (path.includes('dashboard')) return 'dashboard';

        return 'global';
    });

    // Smart Recommendations based on Context
    const activeContextArticles = computed(() => {
        const ctx = currentContext.value;
        return articles.value.filter(a =>
            a.context.includes(ctx) || a.context.includes('global')
        ).sort((a, b) => {
            // Priority: Specific Context > Global
            const aIsSpecific = a.context.includes(ctx);
            const bIsSpecific = b.context.includes(ctx);
            return bIsSpecific - aIsSpecific;
        });
    });

    // Full Search Logic (The "AI" Brain)
    const searchResults = computed(() => {
        if (!searchQuery.value || searchQuery.value.length < 2) return [];
        const query = searchQuery.value.toLowerCase();

        return articles.value.filter(article => {
            return article.title.toLowerCase().includes(query) ||
                article.content.toLowerCase().includes(query) ||
                article.category.toLowerCase().includes(query);
        });
    });

    function toggle(state) {
        if (typeof state === 'boolean') {
            isOpen.value = state;
        } else {
            isOpen.value = !isOpen.value;
        }
    }

    function openArticle(id) {
        // In future: Open detailed view
        console.log('Opening article', id);
    }

    return {
        isOpen,
        toggle,
        articles,
        currentContext,
        activeContextArticles,
        searchQuery,
        searchResults,
        openArticle
    };
});
