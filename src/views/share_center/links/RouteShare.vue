<template>
    <div class="route-share-page">
        <div class="page-header">
            <h2 class="page-title">
                <i class="fas fa-route"></i>
                Shared Route
            </h2>
            <p class="page-description">
                Detailed route information with waypoints and navigation data
            </p>
        </div>

        <div class="route-content">
            <div class="route-overview">
                <div class="route-stats">
                    <div class="stat-item">
                        <div class="stat-icon">
                            <i class="fas fa-road"></i>
                        </div>
                        <div class="stat-content">
                            <h4>Total Distance</h4>
                            <p class="stat-value">45.2 km</p>
                        </div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-content">
                            <h4>Estimated Time</h4>
                            <p class="stat-value">2h 15m</p>
                        </div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-icon">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <div class="stat-content">
                            <h4>Waypoints</h4>
                            <p class="stat-value">24</p>
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
                </div>
            </div>

            <div class="route-details">
                <div class="detail-section">
                    <h3 class="section-title">Route Information</h3>
                    <div class="route-info-grid">
                        <div class="info-item">
                            <span class="info-label">Route Name:</span>
                            <span class="info-value">Highway Survey – Chile</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Start Point:</span>
                            <span class="info-value">Santiago Central</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">End Point:</span>
                            <span class="info-value">Valparaíso Port</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Route Type:</span>
                            <span class="info-value">Highway Survey</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Surface Type:</span>
                            <span class="info-value">Asphalt</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Lanes:</span>
                            <span class="info-value">4 Lanes</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3 class="section-title">Waypoints</h3>
                    <div class="waypoints-list">
                        <div class="waypoint-item" v-for="(waypoint, index) in waypoints" :key="index">
                            <div class="waypoint-number">{{ index + 1 }}</div>
                            <div class="waypoint-content">
                                <h4>{{ waypoint.name }}</h4>
                                <p>{{ waypoint.description }}</p>
                                <div class="waypoint-meta">
                                    <span class="meta-item">
                                        <i class="fas fa-map-marker-alt"></i>
                                        {{ waypoint.coordinates }}
                                    </span>
                                    <span class="meta-item">
                                        <i class="fas fa-road"></i>
                                        {{ waypoint.distance }}km
                                    </span>
                                </div>
                            </div>
                            <div class="waypoint-status" :class="waypoint.status">
                                <i :class="waypoint.statusIcon"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3 class="section-title">Route Conditions</h3>
                    <div class="conditions-grid">
                        <div class="condition-card good">
                            <div class="condition-icon">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <div class="condition-content">
                                <h4>Road Surface</h4>
                                <p>Good condition with minor wear</p>
                                <div class="condition-rating">
                                    <span class="rating-label">Rating:</span>
                                    <span class="rating-value">8.5/10</span>
                                </div>
                            </div>
                        </div>
                        <div class="condition-card warning">
                            <div class="condition-icon">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div class="condition-content">
                                <h4>Traffic Flow</h4>
                                <p>Moderate congestion during peak hours</p>
                                <div class="condition-rating">
                                    <span class="rating-label">Rating:</span>
                                    <span class="rating-value">6.0/10</span>
                                </div>
                            </div>
                        </div>
                        <div class="condition-card good">
                            <div class="condition-icon">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <div class="condition-content">
                                <h4>Safety Features</h4>
                                <p>Well-maintained barriers and signage</p>
                                <div class="condition-rating">
                                    <span class="rating-label">Rating:</span>
                                    <span class="rating-value">9.0/10</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="route-actions">
            <button class="action-btn primary">
                <i class="fas fa-download"></i>
                Download Route Data
            </button>
            <button class="action-btn secondary">
                <i class="fas fa-external-link-alt"></i>
                Open in Maps
            </button>
            <button class="action-btn secondary">
                <i class="fas fa-share"></i>
                Share Route
            </button>
        </div>
    </div>
</template>

<script setup>
// RouteShare page component for public viewing

const waypoints = [
    {
        name: "Santiago Central",
        description: "Starting point of the survey route",
        coordinates: "-33.4489° S, 70.6693° W",
        distance: "0.0",
        status: "completed",
        statusIcon: "fas fa-check-circle"
    },
    {
        name: "Highway Junction A",
        description: "Major intersection with traffic analysis",
        coordinates: "-33.4567° S, 70.6789° W",
        distance: "12.5",
        status: "completed",
        statusIcon: "fas fa-check-circle"
    },
    {
        name: "Bridge Inspection Point",
        description: "Structural assessment completed",
        coordinates: "-33.4789° S, 70.7123° W",
        distance: "28.3",
        status: "completed",
        statusIcon: "fas fa-check-circle"
    },
    {
        name: "Valparaíso Port",
        description: "Final destination and port area survey",
        coordinates: "-33.0454° S, 71.6203° W",
        distance: "45.2",
        status: "completed",
        statusIcon: "fas fa-check-circle"
    }
]
</script>

<style scoped>
.route-share-page {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgb(0 0 0 / 10%);
    overflow: hidden;
}

.page-header {
    padding: 2rem;
    background: linear-gradient(135deg, #fd7e14 0%, #ff8c42 100%);
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

.route-content {
    padding: 2rem;
}

.route-overview {
    margin-bottom: 2rem;
}

.route-stats {
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
    background: linear-gradient(135deg, #fd7e14 0%, #ff8c42 100%);
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

.route-details {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.detail-section {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
}

.section-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: #495057;
    margin: 0 0 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e9ecef;
}

.route-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
}

.info-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid #e9ecef;
}

.info-item:last-child {
    border-bottom: none;
}

.info-label {
    font-weight: 500;
    color: #6c757d;
}

.info-value {
    color: #495057;
    font-weight: 600;
}

.waypoints-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.waypoint-item {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    border-left: 4px solid var(--success);
}

.waypoint-number {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #fd7e14;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.9rem;
    flex-shrink: 0;
}

.waypoint-content {
    flex: 1;
}

.waypoint-content h4 {
    margin: 0 0 0.25rem;
    color: #495057;
    font-size: 1.1rem;
}

.waypoint-content p {
    margin: 0 0 0.5rem;
    color: #6c757d;
    font-size: 0.9rem;
}

.waypoint-meta {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.8rem;
    color: #6c757d;
}

.waypoint-status {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--success);
    color: white;
    font-size: 1rem;
    flex-shrink: 0;
}

.conditions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
}

.condition-card {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    border-left: 4px solid var(--success);
}

.condition-card.warning {
    border-left-color: var(--warning);
}

.condition-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--success);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1rem;
    flex-shrink: 0;
}

.condition-card.warning .condition-icon {
    background: var(--warning);
}

.condition-content h4 {
    margin: 0 0 0.25rem;
    color: #495057;
    font-size: 1rem;
}

.condition-content p {
    margin: 0 0 0.5rem;
    color: #6c757d;
    font-size: 0.9rem;
}

.condition-rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.rating-label {
    font-size: 0.8rem;
    color: #6c757d;
}

.rating-value {
    font-weight: 600;
    color: #495057;
}

.route-actions {
    padding: 2rem;
    background: #f8f9fa;
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
}

.action-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 1rem;
}

.action-btn.primary {
    background: #fd7e14;
    color: white;
}

.action-btn.primary:hover {
    background: #e8690b;
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

    .route-content {
        padding: 1rem;
    }

    .route-stats {
        grid-template-columns: 1fr;
    }

    .route-info-grid {
        grid-template-columns: 1fr;
    }

    .waypoint-item {
        flex-direction: column;
    }

    .waypoint-meta {
        flex-direction: column;
        gap: 0.5rem;
    }

    .conditions-grid {
        grid-template-columns: 1fr;
    }

    .route-actions {
        padding: 1rem;
        flex-direction: column;
    }

    .action-btn {
        width: 100%;
        justify-content: center;
    }
}
</style>