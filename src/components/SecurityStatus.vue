<template>
    <div v-if="true" class="security-status" :class="{ 'minimized': isMinimized }">
        <div class="security-status-header">
            <h6 v-if="!isMinimized">Security Status</h6>
            <div v-if="isMinimized" class="minimized-indicator">
                <span class="status-dot" :class="getOverallStatusClass()"></span>
                <span class="minimized-text">Security</span>
            </div>
            <div class="header-actions">
                <button v-if="!isMinimized" @click="toggleDetails" class="btn btn-sm btn-outline-secondary">
                    {{ showDetails ? 'Hide' : 'Show' }} Details
                </button>
                <button @click="toggleMinimize" class="btn btn-sm btn-outline-secondary minimize-btn">
                    {{ isMinimized ? '🔽' : '🔼' }}
                </button>
            </div>
        </div>

        <div v-if="showDetails && !isMinimized" class="security-status-details">
            <div class="status-item">
                <span class="status-label">CSRF Protection:</span>
                <span :class="['status-value', isCsrfAvailable ? 'status-success' : 'status-error']">
                    {{ isCsrfAvailable ? 'Active' : 'Inactive' }}
                </span>
            </div>

            <div class="status-item">
                <span class="status-label">Authentication:</span>
                <span :class="['status-value', isAuthenticated ? 'status-success' : 'status-warning']">
                    {{ isAuthenticated ? 'Authenticated' : 'Not Authenticated' }}
                </span>
            </div>

            <div v-if="csrfError" class="status-item">
                <span class="status-label">CSRF Error:</span>
                <span class="status-value status-error">{{ csrfError }}</span>
            </div>

            <div class="status-actions">
                <button @click="handleRefreshCsrfToken" class="btn btn-sm btn-primary" :disabled="isRefreshing">
                    {{ isRefreshing ? 'Refreshing...' : 'Refresh CSRF Token' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCsrf } from '@/composables/useCsrf';
import Cookies from 'js-cookie';

// Props
const props = defineProps({
    showSecurityStatus: {
        type: Boolean,
        default: false
    }
});

// Composables
const {
    isCsrfAvailable,
    isCsrfInitialized,
    csrfError,
    refreshCsrfToken,
    checkCsrfAvailability
} = useCsrf();

// Local state
const showDetails = ref(false);
const isRefreshing = ref(false);
const isMinimized = ref(false);

// Computed
const isAuthenticated = computed(() => {
    return !!Cookies.get('l_t');
});

// Development mode check
const isDevelopment = computed(() => {
    return import.meta.env.DEV;
});

// Methods
const toggleDetails = () => {
    showDetails.value = !showDetails.value;
};

const toggleMinimize = () => {
    isMinimized.value = !isMinimized.value;
    // Auto-hide details when minimizing
    if (isMinimized.value) {
        showDetails.value = false;
    }
};

const getOverallStatusClass = () => {
    if (!isCsrfAvailable) return 'status-error';
    if (!isAuthenticated.value) return 'status-warning';
    return 'status-success';
};

const handleRefreshCsrfToken = async () => {
    isRefreshing.value = true;
    try {
        await refreshCsrfToken();
    } catch (error) {
        console.error('Failed to refresh CSRF token:', error);
    } finally {
        isRefreshing.value = false;
    }
};

// Watch for CSRF availability changes
const checkAvailability = () => {
    checkCsrfAvailability();
};

onMounted(() => {
    // Check availability every 30 seconds
    setInterval(checkAvailability, 30000);
});
</script>

<style scoped>
.security-status {
    position: fixed;
    bottom: 80px;
    right: 20px;
    background: rgb(33 37 41 / 95%);
    color: #e9ecef;
    padding: 15px;
    border-radius: 12px;
    font-size: 12px;
    z-index: 9999;
    max-width: 300px;
    backdrop-filter: blur(10px);
    border: 1px solid rgb(255 255 255 / 10%);
    box-shadow: 0 8px 32px rgb(0 0 0 / 30%);
    transition: all 0.3s ease;
}

.security-status.minimized {
    max-width: 120px;
    padding: 10px;
}

.security-status:hover {
    background: rgb(33 37 41 / 98%);
    box-shadow: 0 12px 40px rgb(0 0 0 / 40%);
    transform: translateY(-2px);
}

.security-status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.security-status.minimized .security-status-header {
    margin-bottom: 0;
}

.security-status-header h6 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    letter-spacing: 0.5px;
}

.header-actions {
    display: flex;
    gap: 8px;
    align-items: center;
}

.minimize-btn {
    padding: 4px 8px;
    font-size: 10px;
    min-width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.minimized-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
}

.status-dot.status-success {
    background-color: var(--success);
    box-shadow: 0 0 6px rgb(40 167 69 / 60%);
}

.status-dot.status-warning {
    background-color: var(--warning);
    box-shadow: 0 0 6px rgb(255 193 7 / 60%);
}

.status-dot.status-error {
    background-color: var(--error);
    box-shadow: 0 0 6px rgb(220 53 69 / 60%);
}

.minimized-text {
    font-size: 11px;
    font-weight: 500;
    color: #e9ecef;
}

.security-status-details {
    border-top: 1px solid rgb(255 255 255 / 10%);
    padding-top: 12px;
}

.status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding: 4px 0;
}

.status-label {
    font-weight: 500;
    color: #adb5bd;
    font-size: 11px;
}

.status-value {
    font-weight: 600;
    font-size: 11px;
}

.status-success {
    color: var(--success);
    font-weight: 600;
}

.status-warning {
    color: var(--warning);
    font-weight: 600;
}

.status-error {
    color: var(--error);
    font-weight: 600;
}

.status-actions {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgb(255 255 255 / 10%);
}

.btn {
    font-size: 11px;
    padding: 6px 12px;
    border-radius: 6px;
    transition: all 0.2s ease;
}

.btn-primary {
    background: linear-gradient(135deg, var(--accent), #0056b3);
    border: none;
    color: white;
}

.btn-primary:hover {
    background: linear-gradient(135deg, #0056b3, #004085);
    transform: translateY(-1px);
}

.btn-outline-secondary {
    background: transparent;
    border: 1px solid rgb(255 255 255 / 30%);
    color: #e9ecef;
}

.btn-outline-secondary:hover {
    background: rgb(255 255 255 / 10%);
    border-color: rgb(255 255 255 / 50%);
}

@media (width <= 768px) {
    .security-status {
        bottom: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
    }

    .security-status.minimized {
        max-width: 100px;
        left: auto;
    }
}
</style>