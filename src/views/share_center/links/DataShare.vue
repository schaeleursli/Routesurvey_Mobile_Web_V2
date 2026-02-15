<template>
    <div class="data-share-page">
        <div class="page-header">
            <h2 class="page-title">
                <i class="fas fa-database"></i>
                Shared Data
            </h2>
            <p class="page-description">
                Comprehensive survey data with measurements, statistics, and analysis
            </p>
        </div>

        <div class="data-content">
            <div class="data-overview">
                <div class="overview-cards">
                    <div class="overview-card">
                        <div class="card-header">
                            <i class="fas fa-chart-line"></i>
                            <h3>Data Points</h3>
                        </div>
                        <div class="card-value">1,247</div>
                        <div class="card-description">Total measurements collected</div>
                    </div>
                    <div class="overview-card">
                        <div class="card-header">
                            <i class="fas fa-clock"></i>
                            <h3>Collection Time</h3>
                        </div>
                        <div class="card-value">2h 15m</div>
                        <div class="card-description">Active survey duration</div>
                    </div>
                    <div class="overview-card">
                        <div class="card-header">
                            <i class="fas fa-calendar-alt"></i>
                            <h3>Survey Date</h3>
                        </div>
                        <div class="card-value">Dec 15, 2024</div>
                        <div class="card-description">Data collection date</div>
                    </div>
                    <div class="overview-card">
                        <div class="card-header">
                            <i class="fas fa-user"></i>
                            <h3>Surveyor</h3>
                        </div>
                        <div class="card-value">Team A</div>
                        <div class="card-description">Field survey team</div>
                    </div>
                </div>
            </div>

            <div class="data-sections">
                <div class="data-section">
                    <h3 class="section-title">
                        <i class="fas fa-chart-bar"></i>
                        Survey Statistics
                    </h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-header">
                                <span class="stat-label">Average Speed</span>
                                <i class="fas fa-tachometer-alt"></i>
                            </div>
                            <div class="stat-value">65 km/h</div>
                            <div class="stat-trend positive">
                                <i class="fas fa-arrow-up"></i>
                                +5% from baseline
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-header">
                                <span class="stat-label">Surface Quality</span>
                                <i class="fas fa-road"></i>
                            </div>
                            <div class="stat-value">8.5/10</div>
                            <div class="stat-trend positive">
                                <i class="fas fa-arrow-up"></i>
                                +0.3 from last survey
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-header">
                                <span class="stat-label">Traffic Density</span>
                                <i class="fas fa-car"></i>
                            </div>
                            <div class="stat-value">Medium</div>
                            <div class="stat-trend neutral">
                                <i class="fas fa-minus"></i>
                                No change
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-header">
                                <span class="stat-label">Safety Score</span>
                                <i class="fas fa-shield-alt"></i>
                            </div>
                            <div class="stat-value">9.2/10</div>
                            <div class="stat-trend positive">
                                <i class="fas fa-arrow-up"></i>
                                +0.1 improvement
                            </div>
                        </div>
                    </div>
                </div>

                <div class="data-section">
                    <h3 class="section-title">
                        <i class="fas fa-table"></i>
                        Data Categories
                    </h3>
                    <div class="categories-grid">
                        <div class="category-card">
                            <div class="category-icon">
                                <i class="fas fa-road"></i>
                            </div>
                            <div class="category-content">
                                <h4>Road Conditions</h4>
                                <p>Surface quality, potholes, cracks, and wear patterns</p>
                                <div class="category-stats">
                                    <span class="stat-item">342 measurements</span>
                                    <span class="stat-item">15 issues found</span>
                                </div>
                            </div>
                        </div>
                        <div class="category-card">
                            <div class="category-icon">
                                <i class="fas fa-traffic-light"></i>
                            </div>
                            <div class="category-content">
                                <h4>Traffic Analysis</h4>
                                <p>Flow patterns, congestion points, and volume data</p>
                                <div class="category-stats">
                                    <span class="stat-item">156 measurements</span>
                                    <span class="stat-item">8 congestion points</span>
                                </div>
                            </div>
                        </div>
                        <div class="category-card">
                            <div class="category-icon">
                                <i class="fas fa-bridge"></i>
                            </div>
                            <div class="category-content">
                                <h4>Infrastructure</h4>
                                <p>Bridges, tunnels, signage, and safety features</p>
                                <div class="category-stats">
                                    <span class="stat-item">89 measurements</span>
                                    <span class="stat-item">3 structures assessed</span>
                                </div>
                            </div>
                        </div>
                        <div class="category-card">
                            <div class="category-icon">
                                <i class="fas fa-leaf"></i>
                            </div>
                            <div class="category-content">
                                <h4>Environmental</h4>
                                <p>Air quality, noise levels, and environmental factors</p>
                                <div class="category-stats">
                                    <span class="stat-item">234 measurements</span>
                                    <span class="stat-item">Good air quality</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="data-section">
                    <h3 class="section-title">
                        <i class="fas fa-exclamation-triangle"></i>
                        Issues Identified
                    </h3>
                    <div class="issues-list">
                        <div class="issue-item high">
                            <div class="issue-priority">High Priority</div>
                            <div class="issue-content">
                                <h4>Pothole at KM 23.5</h4>
                                <p>Large pothole requiring immediate repair. Located in the right lane.</p>
                                <div class="issue-meta">
                                    <span class="meta-item">
                                        <i class="fas fa-map-marker-alt"></i>
                                        KM 23.5
                                    </span>
                                    <span class="meta-item">
                                        <i class="fas fa-ruler"></i>
                                        40cm diameter
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="issue-item medium">
                            <div class="issue-priority">Medium Priority</div>
                            <div class="issue-content">
                                <h4>Faded Road Markings</h4>
                                <p>Multiple sections with faded lane markings affecting visibility.</p>
                                <div class="issue-meta">
                                    <span class="meta-item">
                                        <i class="fas fa-map-marker-alt"></i>
                                        KM 12-18
                                    </span>
                                    <span class="meta-item">
                                        <i class="fas fa-ruler"></i>
                                        6km affected
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="issue-item low">
                            <div class="issue-priority">Low Priority</div>
                            <div class="issue-content">
                                <h4>Minor Surface Cracking</h4>
                                <p>Surface cracks observed but not affecting structural integrity.</p>
                                <div class="issue-meta">
                                    <span class="meta-item">
                                        <i class="fas fa-map-marker-alt"></i>
                                        Multiple locations
                                    </span>
                                    <span class="meta-item">
                                        <i class="fas fa-ruler"></i>
                                        &lt;5mm width
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="data-actions">
            <button class="action-btn primary">
                <i class="fas fa-download"></i>
                Download Raw Data
            </button>
            <button class="action-btn secondary">
                <i class="fas fa-chart-line"></i>
                View Analytics
            </button>
            <button class="action-btn secondary">
                <i class="fas fa-file-export"></i>
                Export Report
            </button>
        </div>
    </div>
</template>

<script setup>
// DataShare page component for public viewing
</script>

<style scoped>
.data-share-page {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgb(0 0 0 / 10%);
    overflow: hidden;
}

.page-header {
    padding: 2rem;
    background: linear-gradient(135deg, #6f42c1 0%, #8e44ad 100%);
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

.data-content {
    padding: 2rem;
}

.data-overview {
    margin-bottom: 2rem;
}

.overview-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.overview-card {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
    transition: transform 0.2s;
}

.overview-card:hover {
    transform: translateY(-2px);
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    color: #6f42c1;
}

.card-header i {
    font-size: 1.2rem;
}

.card-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
}

.card-value {
    font-size: 2rem;
    font-weight: 700;
    color: #495057;
    margin-bottom: 0.5rem;
}

.card-description {
    font-size: 0.9rem;
    color: #6c757d;
}

.data-sections {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.data-section {
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
    color: #6f42c1;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.stat-card {
    background: white;
    border-radius: 8px;
    padding: 1rem;
    border-left: 4px solid #6f42c1;
}

.stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.stat-label {
    font-size: 0.9rem;
    color: #6c757d;
    font-weight: 500;
}

.stat-header i {
    color: #6f42c1;
    font-size: 1rem;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #495057;
    margin-bottom: 0.25rem;
}

.stat-trend {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.8rem;
    font-weight: 500;
}

.stat-trend.positive {
    color: var(--success);
}

.stat-trend.negative {
    color: var(--error);
}

.stat-trend.neutral {
    color: #6c757d;
}

.categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
}

.category-card {
    background: white;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    gap: 1rem;
    border-left: 4px solid #6f42c1;
}

.category-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6f42c1 0%, #8e44ad 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
    flex-shrink: 0;
}

.category-content h4 {
    margin: 0 0 0.5rem;
    color: #495057;
    font-size: 1.1rem;
}

.category-content p {
    margin: 0 0 0.75rem;
    color: #6c757d;
    font-size: 0.9rem;
    line-height: 1.4;
}

.category-stats {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.stat-item {
    font-size: 0.8rem;
    color: #6f42c1;
    font-weight: 500;
}

.issues-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.issue-item {
    background: white;
    border-radius: 8px;
    padding: 1rem;
    border-left: 4px solid #6c757d;
}

.issue-item.high {
    border-left-color: var(--error);
}

.issue-item.medium {
    border-left-color: var(--warning);
}

.issue-item.low {
    border-left-color: var(--success);
}

.issue-priority {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
}

.issue-item.high .issue-priority {
    background: var(--error);
    color: white;
}

.issue-item.medium .issue-priority {
    background: var(--warning);
    color: #212529;
}

.issue-item.low .issue-priority {
    background: var(--success);
    color: white;
}

.issue-content h4 {
    margin: 0 0 0.5rem;
    color: #495057;
    font-size: 1.1rem;
}

.issue-content p {
    margin: 0 0 0.75rem;
    color: #6c757d;
    line-height: 1.4;
}

.issue-meta {
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

.data-actions {
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
    background: #6f42c1;
    color: white;
}

.action-btn.primary:hover {
    background: #5a32a3;
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

    .data-content {
        padding: 1rem;
    }

    .overview-cards {
        grid-template-columns: 1fr;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    .categories-grid {
        grid-template-columns: 1fr;
    }

    .category-card {
        flex-direction: column;
        text-align: center;
    }

    .issue-meta {
        flex-direction: column;
        gap: 0.5rem;
    }

    .data-actions {
        padding: 1rem;
        flex-direction: column;
    }

    .action-btn {
        width: 100%;
        justify-content: center;
    }
}
</style>