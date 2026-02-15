<template>
    <div 
        class="update-banner" 
        :class="{ 'banner-visible': visible }"
        role="status"
        aria-live="polite"
        aria-atomic="true"
    >
        <div class="banner-content">
            <div class="banner-icon" aria-hidden="true">
                <PhArrowsClockwise :size="24" />
            </div>
            <div class="banner-message">
                <strong>Engineering calculation updated</strong>
                <span class="banner-time">{{ updateTimeText }}</span>
            </div>
            <div class="banner-actions">
                <button 
                    class="btn-view" 
                    @click="$emit('view-changes')"
                    aria-label="View changes in engineering calculation"
                    title="View Changes"
                >
                    <PhArrowsLeftRight :size="14" aria-hidden="true" />
                    View Changes
                </button>
                <button 
                    class="btn-sync" 
                    @click="$emit('sync-now')"
                    aria-label="Sync engineering data now"
                    title="Sync Now"
                >
                    <PhDownloadSimple :size="14" aria-hidden="true" />
                    Sync Now
                </button>
                <button 
                    class="btn-dismiss" 
                    @click="$emit('dismiss')"
                    aria-label="Dismiss update notification"
                    title="Dismiss"
                >
                    <PhX :size="14" aria-hidden="true" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { PhArrowsClockwise, PhArrowsLeftRight, PhDownloadSimple, PhX } from '@phosphor-icons/vue';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    updatedAt: {
        type: String,
        default: null
    }
});

defineEmits(['view-changes', 'sync-now', 'dismiss']);

const updateTimeText = computed(() => {
    if (!props.updatedAt) return '';
    
    const date = new Date(props.updatedAt);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
});
</script>

<style scoped>
.update-banner {
    position: fixed;
    top: -100px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 900;
    transition: top 0.3s ease-out;
    max-width: 600px;
    width: calc(100% - 32px);
}

.banner-visible {
    top: 80px;
}

.banner-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-lg);
    background: linear-gradient(135deg, #FFA726 0%, #FF9800 100%);
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
}

.banner-icon {
    font-size: 24px;
    animation: rotate 2s linear infinite;
}

@keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.banner-message {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.banner-message strong {
    font-size: 14px;
    font-weight: 600;
}

.banner-time {
    font-size: 12px;
    opacity: 0.9;
}

.banner-actions {
    display: flex;
    gap: var(--spacing-xs);
}

.banner-actions button {
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 4px;
}

.btn-view,
.btn-sync {
    background: rgb(255 255 255 / 20%);
    color: white;
    backdrop-filter: blur(10px);
}

.btn-view:hover,
.btn-sync:hover {
    background: rgb(255 255 255 / 30%);
}

.btn-dismiss {
    background: rgb(0 0 0 / 20%);
    color: white;
    width: 32px;
    height: 32px;
    padding: 0;
    justify-content: center;
}

.btn-dismiss:hover {
    background: rgb(0 0 0 / 30%);
}
</style>
