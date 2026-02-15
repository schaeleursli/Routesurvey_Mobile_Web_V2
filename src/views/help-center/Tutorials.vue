<template>
  <div class="tutorials-container">
    <div class="header-section text-center mb-5">
        <h1 class="display-5 fw-bold text-primary mb-3">{{ $t('tutorials') }}</h1>
        <p class="text-muted lead">Step-by-step video guides to become a pro.</p>
        
        <!-- Filter Tabs -->
        <div class="d-flex justify-content-center gap-2 mt-4 flex-wrap">
            <Button 
                v-for="cat in categories" 
                :key="cat.id"
                :label="cat.label" 
                :outlined="selectedCategory !== cat.id" 
                severity="secondary" 
                rounded 
                size="small"
                @click="selectedCategory = cat.id"
            />
        </div>
    </div>

    <div class="tutorials-grid">
      <div v-for="tutorial in filteredTutorials" :key="tutorial.id" class="tutorial-item">
        <div class="video-thumbnail">
           <!-- Mock Video Thumbnail -->
           <div class="thumbnail-placeholder" :style="{ backgroundColor: tutorial.color }">
              <i :class="tutorial.icon" class="category-icon"></i>
              <div class="play-btn">
                  <i class="bi bi-play-fill"></i>
              </div>
              <span class="duration-badge">{{ tutorial.duration }}</span>
           </div>
        </div>
        
        <div class="content p-3">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <Tag :value="tutorial.categoryLabel" :severity="getSeverity(tutorial.category)" class="text-xs"></Tag>
                <span class="text-muted text-xs ms-2">{{ tutorial.views }} views</span>
            </div>
            <h5 class="fw-bold mb-2">{{ tutorial.title }}</h5>
            <p class="text-muted small mb-3">{{ tutorial.description }}</p>
            <Button label="Watch Now" icon="bi bi-play-circle" size="small" outlined class="w-100" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Button from 'primevue/button';
import Tag from 'primevue/tag';

const selectedCategory = ref('all');

const categories = [
    { id: 'all', label: 'All Videos' },
    { id: 'basics', label: 'Basics' },
    { id: 'survey', label: 'Field Survey' },
    { id: 'reporting', label: 'Reporting' },
    { id: 'admin', label: 'Admin & Team' }
];

const tutorials = ref([
  {
    id: 1,
    title: 'Create a New Survey Plan',
    description: 'Learn how to map out a route, set start/end points, and assign it to a driver.',
    category: 'basics',
    categoryLabel: 'Basics',
    duration: '3:45',
    views: '1.2k',
    color: '#e0f2fe',
    icon: 'bi bi-map'
  },
  {
    id: 2,
    title: 'Mobile App: capturing Obstacles',
    description: 'Master the art of quick capturing using the mobile app. Photos, voice notes, and measurements.',
    category: 'survey',
    categoryLabel: 'Field Survey',
    duration: '5:12',
    views: '856',
    color: '#dcfce7',
    icon: 'bi bi-phone'
  },
  {
    id: 3,
    title: 'Generating Client Reports',
    description: 'How to customize and export PDF reports that look professional and include all data.',
    category: 'reporting',
    categoryLabel: 'Reporting',
    duration: '4:20',
    views: '2.1k',
    color: '#fee2e2',
    icon: 'bi bi-file-pdf'
  },
  {
    id: 4,
    title: 'Offline Mode Explained',
    description: 'Working in remote areas? Here is how to ensure your data is safe and syncs correctly.',
    category: 'basics',
    categoryLabel: 'Basics',
    duration: '2:15',
    views: '543',
    color: '#f3e8ff',
    icon: 'bi bi-cloud-slash'
  },
  {
    id: 5,
    title: 'Team Management & Permissions',
    description: 'Adding users, setting roles, and managing subscription limits for your organization.',
    category: 'admin',
    categoryLabel: 'Admin',
    duration: '6:30',
    views: '320',
    color: '#ffedd5',
    icon: 'bi bi-people'
  },
  {
    id: 6,
    title: 'Advanced Map Layers',
    description: 'Using satellite view, street view, and imported KML layers for better context.',
    category: 'survey',
    categoryLabel: 'Field Survey',
    duration: '4:50',
    views: '900',
    color: '#dcfce7',
    icon: 'bi bi-layers'
  }
]);

const filteredTutorials = computed(() => {
    if (selectedCategory.value === 'all') return tutorials.value;
    return tutorials.value.filter(t => t.category === selectedCategory.value);
});

function getSeverity(category) {
    switch(category) {
        case 'basics': return 'info';
        case 'survey': return 'success';
        case 'reporting': return 'danger';
        case 'admin': return 'warn';
        default: return 'secondary';
    }
}
</script>

<style scoped>
.tutorials-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.tutorials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.tutorial-item {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #f0f0f0;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgb(0 0 0 / 3%);
}

.tutorial-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgb(0 0 0 / 8%);
}

.video-thumbnail {
    position: relative;
    padding-top: 56.25%; /* 16:9 */
    background: #000;
}

.thumbnail-placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.category-icon {
    font-size: 4rem;
    opacity: 0.15;
    color: #000;
}

.play-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50px;
    height: 50px;
    background: rgb(255 255 255 / 90%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-color);
    font-size: 1.5rem;
    box-shadow: 0 4px 10px rgb(0 0 0 / 20%);
    transition: transform 0.2s;
}

.tutorial-item:hover .play-btn {
    transform: translate(-50%, -50%) scale(1.1);
    background: white;
}

.duration-badge {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: rgb(0 0 0 / 70%);
    color: white;
    padding: 2px 6px;
    font-size: 0.75rem;
    border-radius: 4px;
    font-weight: 500;
}
</style>