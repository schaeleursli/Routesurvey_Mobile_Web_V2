<template>
    <div class="us-permits-overview">
        <div class="page-header">
            <div>
                <h1>US DOT & State Permits</h1>
                <p class="text-secondary">
                    Manage compliance with US federal and state permit requirements for oversize/overweight loads
                </p>
            </div>
        </div>

        <div class="overview-content">
            <div class="info-card card">
                <div class="card-body">
                    <h3><i class="bi bi-info-circle"></i> About US Permit Compliance</h3>
                    <p>
                        This module helps you prepare permit applications for oversize and overweight loads
                        traveling across US states. The system automatically:
                    </p>
                    <ul>
                        <li>Detects which states your route crosses</li>
                        <li>Identifies federal (US DOT) and state-specific requirements</li>
                        <li>Rolls up requirements when multiple jurisdictions apply</li>
                        <li>Detects conflicts (e.g., incompatible travel windows)</li>
                        <li>Validates your submission readiness</li>
                    </ul>
                </div>
            </div>

            <div class="cta-section">
                <router-link :to="{ name: 'PermitsHome' }" class="btn btn-primary btn-lg">
                    <i class="bi bi-arrow-left"></i>
                    Back to All Permit Cases
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
</script>

<style scoped>
.us-permits-overview {
    padding: 2rem;
    max-width: 900px;
    margin: 0 auto;
}

.page-header {
    margin-bottom: 2rem;
}

.page-header h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.overview-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.info-card h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.info-card ul {
    margin: 1rem 0;
    padding-left: 1.5rem;
}

.info-card li {
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
}

.cta-section {
    display: flex;
    justify-content: center;
}
</style>
