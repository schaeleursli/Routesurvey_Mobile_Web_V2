<template>
    <div class="base-pagination" v-if="totalPages > 1">
        <div class="pagination-controls">
            <!-- Previous Button -->
            <BaseButton :disabled="currentPage === 1" variant="ghost" size="small" @click="goToPrevious">
                <PhCaretLeft :size="16" />
                <span class="pagination-text">Previous</span>
            </BaseButton>

            <!-- Page Numbers -->
            <div class="page-numbers">
                <BaseButton v-for="page in visiblePages" :key="page"
                    :variant="page === currentPage ? 'primary' : 'ghost'" size="small" @click="goToPage(page)">
                    {{ page }}
                </BaseButton>
            </div>

            <!-- Next Button -->
            <BaseButton :disabled="currentPage === totalPages" variant="ghost" size="small" @click="goToNext">
                <span class="pagination-text">Next</span>
                <PhCaretRight :size="16" />
            </BaseButton>
        </div>

        <!-- Page Info -->
        <!-- <div class="pagination-info">
            <span class="page-info-text">
                Showing {{ startItem }}-{{ endItem }} of {{ totalItems }} {{ itemLabel }}
            </span>
        </div> -->
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { PhCaretLeft, PhCaretRight } from '@phosphor-icons/vue';
import { BaseButton } from '@/components/ui'

const props = defineProps({
    currentPage: {
        type: Number,
        required: true
    },
    totalPages: {
        type: Number,
        required: true
    },
    totalItems: {
        type: Number,
        required: true
    },
    itemsPerPage: {
        type: Number,
        required: true
    },
    itemLabel: {
        type: String,
        default: 'items'
    },
    maxVisiblePages: {
        type: Number,
        default: 5
    }
})

const emit = defineEmits(['page-change'])

// Computed properties
const startItem = computed(() => {
    return ((props.currentPage - 1) * props.itemsPerPage) + 1
})

const endItem = computed(() => {
    const end = props.currentPage * props.itemsPerPage
    return Math.min(end, props.totalItems)
})

const visiblePages = computed(() => {
    const pages = []
    const maxVisible = props.maxVisiblePages
    const total = props.totalPages
    const current = props.currentPage

    if (total <= maxVisible) {
        // Show all pages if total is less than max visible
        for (let i = 1; i <= total; i++) {
            pages.push(i)
        }
    } else {
        // Calculate start and end of visible range
        let start = Math.max(1, current - Math.floor(maxVisible / 2))
        const end = Math.min(total, start + maxVisible - 1)

        // Adjust start if we're near the end
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1)
        }

        // Add first page and ellipsis if needed
        if (start > 1) {
            pages.push(1)
            if (start > 2) {
                pages.push('...')
            }
        }

        // Add visible pages
        for (let i = start; i <= end; i++) {
            pages.push(i)
        }

        // Add last page and ellipsis if needed
        if (end < total) {
            if (end < total - 1) {
                pages.push('...')
            }
            pages.push(total)
        }
    }

    return pages
})

// Methods
const goToPage = (page) => {
    if (page !== '...' && page >= 1 && page <= props.totalPages && page !== props.currentPage) {
        emit('page-change', page)
    }
}

const goToPrevious = () => {
    if (props.currentPage > 1) {
        emit('page-change', props.currentPage - 1)
    }
}

const goToNext = () => {
    if (props.currentPage < props.totalPages) {
        emit('page-change', props.currentPage + 1)
    }
}
</script>

<style scoped>
/* Design System CSS Variables */
:root {
    --bg-base: #F9FAFB;
    --bg-surface: #FFF;
    --bg-elevated: #F4F5F6;
    --text-primary: #1F2937;
    --text-secondary: #6B7280;
    --accent: #00A7E1;
    --accent-hover: #0090C9;
    --border: #E5E7EB;
    --success: #00B386;
    --warning: #F39C12;
    --error: #E83E8C;

    /* Spacing Scale */
    --spacing-2xs: 4px;
    --spacing-xs: 8px;
    --spacing-sm: 12px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    --spacing-2xl: 48px;
}

/* Dark mode overrides */
[data-bs-theme="dark"] {
    --bg-base: #0F172A;
    --bg-surface: #1E293B;
    --bg-elevated: #334155;
    --text-primary: #F8FAFC;
    --text-secondary: #94A3B8;
    --border: #475569;
}

/* Dark mode pagination styling - now handled by parent panel footer */

.base-pagination {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    transition: all 0.2s ease;
    position: relative;
}

.base-pagination::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12px;
    background: linear-gradient(135deg, rgb(0 167 225 / 5%) 0%, rgb(0 179 134 / 5%) 100%);
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
}

.base-pagination:hover::before {
    opacity: 1;
}

.pagination-controls {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
    justify-content: center;
}

.page-numbers {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

.pagination-text {
    font-size: 14px;
    font-weight: 500;
}

.pagination-info {
    display: flex;
    align-items: center;
    justify-content: center;
}

.page-info-text {
    font-size: 14px;
    color: var(--text-secondary);
    font-weight: 400;
}

/* Responsive Design */
@media (width <= 768px) {
    .base-pagination {
        padding: var(--spacing-sm);
        gap: var(--spacing-sm);
    }

    .pagination-controls {
        gap: var(--spacing-xs);
    }

    .pagination-text {
        display: none;
    }

    .page-info-text {
        font-size: 13px;
    }
}

@media (width <= 480px) {
    .base-pagination {
        padding: var(--spacing-xs);
    }

    .pagination-controls {
        gap: var(--spacing-2xs);
    }

    .page-numbers {
        gap: var(--spacing-2xs);
    }

    .page-info-text {
        font-size: 12px;
    }
}
</style>
