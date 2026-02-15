<template>
    <div class="photos-share-page">
        <div class="page-header">
            <h2 class="page-title">
                <i class="fas fa-image"></i>
                Shared Photos
            </h2>
            <p class="page-description">
                Visual documentation of survey findings and route conditions
            </p>
        </div>

        <div class="photos-content">
            <div class="photos-overview">
                <div class="overview-stats">
                    <div class="stat-item">
                        <div class="stat-icon">
                            <i class="fas fa-camera"></i>
                        </div>
                        <div class="stat-content">
                            <h4>Total Photos</h4>
                            <p class="stat-value">156</p>
                        </div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-icon">
                            <i class="fas fa-calendar"></i>
                        </div>
                        <div class="stat-content">
                            <h4>Survey Date</h4>
                            <p class="stat-value">Dec 15, 2024</p>
                        </div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-icon">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <div class="stat-content">
                            <h4>Locations</h4>
                            <p class="stat-value">24</p>
                        </div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-icon">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="stat-content">
                            <h4>Photographer</h4>
                            <p class="stat-value">Team A</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="photos-sections">
                <div class="photos-section">
                    <h3 class="section-title">
                        <i class="fas fa-filter"></i>
                        Photo Categories
                    </h3>
                    <div class="category-filters">
                        <button class="filter-btn active" @click="activeFilter = 'all'">
                            <i class="fas fa-images"></i>
                            All Photos (156)
                        </button>
                        <button class="filter-btn" @click="activeFilter = 'road'">
                            <i class="fas fa-road"></i>
                            Road Conditions (89)
                        </button>
                        <button class="filter-btn" @click="activeFilter = 'issues'">
                            <i class="fas fa-exclamation-triangle"></i>
                            Issues Found (34)
                        </button>
                        <button class="filter-btn" @click="activeFilter = 'infrastructure'">
                            <i class="fas fa-bridge"></i>
                            Infrastructure (23)
                        </button>
                        <button class="filter-btn" @click="activeFilter = 'general'">
                            <i class="fas fa-camera"></i>
                            General Views (10)
                        </button>
                    </div>
                </div>

                <div class="photos-section">
                    <h3 class="section-title">
                        <i class="fas fa-images"></i>
                        Photo Gallery
                    </h3>
                    <div class="photo-grid">
                        <div class="photo-item" v-for="(photo, index) in filteredPhotos" :key="index"
                            @click="openPhotoModal(photo)">
                            <div class="photo-container">
                                <img :src="photo.thumbnail" :alt="photo.description" class="photo-image" />
                                <div class="photo-overlay">
                                    <div class="photo-info">
                                        <h4>{{ photo.title }}</h4>
                                        <p>{{ photo.description }}</p>
                                        <div class="photo-meta">
                                            <span class="meta-item">
                                                <i class="fas fa-map-marker-alt"></i>
                                                {{ photo.location }}
                                            </span>
                                            <span class="meta-item">
                                                <i class="fas fa-clock"></i>
                                                {{ photo.time }}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="photo-actions">
                                        <button class="action-btn" @click.stop="downloadPhoto(photo)">
                                            <i class="fas fa-download"></i>
                                        </button>
                                        <button class="action-btn" @click.stop="sharePhoto(photo)">
                                            <i class="fas fa-share"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="photos-section">
                    <h3 class="section-title">
                        <i class="fas fa-chart-pie"></i>
                        Photo Analysis
                    </h3>
                    <div class="analysis-grid">
                        <div class="analysis-card">
                            <div class="analysis-icon">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <div class="analysis-content">
                                <h4>Good Condition</h4>
                                <p class="analysis-value">57%</p>
                                <p class="analysis-description">Photos showing good road conditions</p>
                            </div>
                        </div>
                        <div class="analysis-card">
                            <div class="analysis-icon warning">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div class="analysis-content">
                                <h4>Issues Found</h4>
                                <p class="analysis-value">22%</p>
                                <p class="analysis-description">Photos documenting problems</p>
                            </div>
                        </div>
                        <div class="analysis-card">
                            <div class="analysis-icon">
                                <i class="fas fa-info-circle"></i>
                            </div>
                            <div class="analysis-content">
                                <h4>Documentation</h4>
                                <p class="analysis-value">15%</p>
                                <p class="analysis-description">General documentation photos</p>
                            </div>
                        </div>
                        <div class="analysis-card">
                            <div class="analysis-icon">
                                <i class="fas fa-bridge"></i>
                            </div>
                            <div class="analysis-content">
                                <h4>Infrastructure</h4>
                                <p class="analysis-value">6%</p>
                                <p class="analysis-description">Infrastructure assessment photos</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Photo Modal -->
        <div v-if="selectedPhoto" class="photo-modal" @click="closePhotoModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>{{ selectedPhoto.title }}</h3>
                    <button class="close-btn" @click="closePhotoModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <img :src="selectedPhoto.fullSize" :alt="selectedPhoto.description" class="modal-image" />
                    <div class="modal-info">
                        <p>{{ selectedPhoto.description }}</p>
                        <div class="modal-meta">
                            <span class="meta-item">
                                <i class="fas fa-map-marker-alt"></i>
                                {{ selectedPhoto.location }}
                            </span>
                            <span class="meta-item">
                                <i class="fas fa-clock"></i>
                                {{ selectedPhoto.time }}
                            </span>
                            <span class="meta-item">
                                <i class="fas fa-camera"></i>
                                {{ selectedPhoto.camera }}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="action-btn primary" @click="downloadPhoto(selectedPhoto)">
                        <i class="fas fa-download"></i>
                        Download
                    </button>
                    <button class="action-btn secondary" @click="sharePhoto(selectedPhoto)">
                        <i class="fas fa-share"></i>
                        Share
                    </button>
                </div>
            </div>
        </div>

        <div class="photos-actions">
            <button class="action-btn primary">
                <i class="fas fa-download"></i>
                Download All Photos
            </button>
            <button class="action-btn secondary">
                <i class="fas fa-images"></i>
                View Slideshow
            </button>
            <button class="action-btn secondary">
                <i class="fas fa-share"></i>
                Share Gallery
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// PhotosShare page component for public viewing

const activeFilter = ref('all')
const selectedPhoto = ref(null)

const photos = [
    {
        id: 1,
        title: "Road Surface Quality",
        description: "Good condition asphalt surface with minor wear patterns",
        location: "KM 12.5",
        time: "09:30 AM",
        camera: "Canon EOS R5",
        category: "road",
        thumbnail: "/placeholder-thumbnail-1.jpg",
        fullSize: "/placeholder-full-1.jpg"
    },
    {
        id: 2,
        title: "Pothole Detection",
        description: "Large pothole requiring immediate repair",
        location: "KM 23.5",
        time: "10:15 AM",
        camera: "Canon EOS R5",
        category: "issues",
        thumbnail: "/placeholder-thumbnail-2.jpg",
        fullSize: "/placeholder-full-2.jpg"
    },
    {
        id: 3,
        title: "Bridge Inspection",
        description: "Structural assessment of main bridge",
        location: "KM 28.3",
        time: "11:00 AM",
        camera: "Canon EOS R5",
        category: "infrastructure",
        thumbnail: "/placeholder-thumbnail-3.jpg",
        fullSize: "/placeholder-full-3.jpg"
    },
    {
        id: 4,
        title: "Traffic Flow",
        description: "Moderate traffic during peak hours",
        location: "KM 15.2",
        time: "08:45 AM",
        camera: "Canon EOS R5",
        category: "general",
        thumbnail: "/placeholder-thumbnail-4.jpg",
        fullSize: "/placeholder-full-4.jpg"
    },
    {
        id: 5,
        title: "Road Markings",
        description: "Faded lane markings affecting visibility",
        location: "KM 16.8",
        time: "09:20 AM",
        camera: "Canon EOS R5",
        category: "issues",
        thumbnail: "/placeholder-thumbnail-5.jpg",
        fullSize: "/placeholder-full-5.jpg"
    },
    {
        id: 6,
        title: "Safety Barriers",
        description: "Well-maintained safety barriers",
        location: "KM 20.1",
        time: "10:30 AM",
        camera: "Canon EOS R5",
        category: "infrastructure",
        thumbnail: "/placeholder-thumbnail-6.jpg",
        fullSize: "/placeholder-full-6.jpg"
    }
]

const filteredPhotos = computed(() => {
    if (activeFilter.value === 'all') {
        return photos
    }
    return photos.filter(photo => photo.category === activeFilter.value)
})

const openPhotoModal = (photo) => {
    selectedPhoto.value = photo
}

const closePhotoModal = () => {
    selectedPhoto.value = null
}

const downloadPhoto = (photo) => {
    // Implementation for downloading photo
    console.log('Downloading photo:', photo.title)
}

const sharePhoto = (photo) => {
    // Implementation for sharing photo
    console.log('Sharing photo:', photo.title)
}
</script>

<style scoped>
.photos-share-page {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgb(0 0 0 / 10%);
    overflow: hidden;
}

.page-header {
    padding: 2rem;
    background: linear-gradient(135deg, #e91e63 0%, #f06292 100%);
    color: white;
}

.page-title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.page-title i {
    font-size: 1.8rem;
}

.page-description {
    font-size: 1.1rem;
    margin: 0;
    opacity: 0.9;
}

.photos-content {
    padding: 2rem;
}

.photos-overview {
    margin-bottom: 2rem;
}

.overview-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
}

.stat-item {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: transform 0.2s;
}

.stat-item:hover {
    transform: translateY(-2px);
}

.stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e91e63 0%, #f06292 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
}

.stat-content h4 {
    margin: 0 0 0.25rem;
    font-size: 0.9rem;
    color: #6c757d;
    font-weight: 500;
}

.stat-value {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #495057;
}

.photos-sections {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.photos-section {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
}

.section-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: #495057;
    margin: 0 0 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e9ecef;
}

.section-title i {
    color: #e91e63;
}

.category-filters {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.filter-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    color: #495057;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.filter-btn.active {
    background: #e91e63;
    color: white;
    border-color: #e91e63;
}

.filter-btn:hover:not(.active) {
    background: #f8f9fa;
    border-color: #e91e63;
}

.photo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.photo-item {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
    transition: transform 0.2s;
    cursor: pointer;
}

.photo-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgb(0 0 0 / 15%);
}

.photo-container {
    position: relative;
    aspect-ratio: 16/9;
    overflow: hidden;
}

.photo-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: #f8f9fa;
}

.photo-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgb(0 0 0 / 80%));
    color: white;
    padding: 1rem;
    transform: translateY(100%);
    transition: transform 0.3s;
}

.photo-item:hover .photo-overlay {
    transform: translateY(0);
}

.photo-info h4 {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
}

.photo-info p {
    margin: 0 0 0.75rem;
    font-size: 0.9rem;
    opacity: 0.9;
}

.photo-meta {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.75rem;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.8rem;
    opacity: 0.8;
}

.photo-actions {
    display: flex;
    gap: 0.5rem;
}

.action-btn {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    border: none;
    background: rgb(255 255 255 / 20%);
    color: white;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.action-btn:hover {
    background: rgb(255 255 255 / 30%);
}

.analysis-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
}

.analysis-card {
    background: white;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border-left: 4px solid #e91e63;
}

.analysis-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e91e63 0%, #f06292 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
    flex-shrink: 0;
}

.analysis-icon.warning {
    background: linear-gradient(135deg, var(--warning) 0%, #ffca2c 100%);
}

.analysis-content h4 {
    margin: 0 0 0.25rem;
    color: #495057;
    font-size: 1rem;
}

.analysis-value {
    margin: 0 0 0.25rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: #e91e63;
}

.analysis-description {
    margin: 0;
    font-size: 0.8rem;
    color: #6c757d;
}

/* Photo Modal */
.photo-modal {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 90%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 2rem;
}

.modal-content {
    background: white;
    border-radius: 12px;
    max-width: 90vw;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
    margin: 0;
    color: #495057;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #6c757d;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: background 0.2s;
}

.close-btn:hover {
    background: #f8f9fa;
}

.modal-body {
    flex: 1;
    overflow: auto;
    padding: 1.5rem;
}

.modal-image {
    width: 100%;
    max-height: 60vh;
    object-fit: contain;
    border-radius: 8px;
    margin-bottom: 1rem;
}

.modal-info p {
    margin: 0 0 1rem;
    color: #495057;
    line-height: 1.5;
}

.modal-meta {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.modal-actions {
    padding: 1.5rem;
    border-top: 1px solid #e9ecef;
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.photos-actions {
    padding: 2rem;
    background: #f8f9fa;
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
}

.action-btn.primary {
    background: #e91e63;
    color: white;
}

.action-btn.primary:hover {
    background: #c2185b;
}

.action-btn.secondary {
    background: white;
    color: #495057;
    border: 1px solid #dee2e6;
}

.action-btn.secondary:hover {
    background: #e9ecef;
}

@media (width <= 768px) {
    .page-header {
        padding: 1.5rem;
    }

    .page-title {
        font-size: 1.5rem;
    }

    .photos-content {
        padding: 1rem;
    }

    .overview-stats {
        grid-template-columns: 1fr;
    }

    .category-filters {
        flex-direction: column;
    }

    .photo-grid {
        grid-template-columns: 1fr;
    }

    .analysis-grid {
        grid-template-columns: 1fr;
    }

    .modal-content {
        max-width: 95vw;
        max-height: 95vh;
    }

    .modal-body {
        padding: 1rem;
    }

    .modal-meta {
        flex-direction: column;
        gap: 0.5rem;
    }

    .photos-actions {
        padding: 1rem;
        flex-direction: column;
    }

    .action-btn {
        width: 100%;
        justify-content: center;
    }
}
</style>