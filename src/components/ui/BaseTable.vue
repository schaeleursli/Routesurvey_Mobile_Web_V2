<template>
    <div class="base-table">
        <div class="base-table__header">
            <div v-for="column in columns" :key="column.key" :class="[
                'base-table__header-cell',
                { 'base-table__header-cell--sortable': column.sortable },
                { 'base-table__header-cell--active': sortColumn === column.key }
            ]" @click="column.sortable ? handleSort(column.key) : null">
                <span>{{ column.label }}</span>
                <component :is="getSortIcon(column.key)" v-if="column.sortable" size="16" />
            </div>
        </div>

        <div class="base-table__body">
            <div v-if="items.length === 0" class="base-table__empty">
                <slot name="empty">
                    <div class="base-table__empty-content">
                        <!-- <PhInbox size="48" /> -->
                        <span>No data available</span>
                        <p>There are no items to display</p>
                    </div>
                </slot>
            </div>

            <div v-else>
                <div v-for="(item, index) in sortedItems" :key="getItemKey(item, index)" :class="[
                    'base-table__row',
                    { 'base-table__row--clickable': clickable },
                    getRowClass ? getRowClass(item, index) : null
                ]" @click="handleRowClick(item, index)">
                    <div v-for="column in columns" :key="column.key" class="base-table__cell">
                        <slot :name="`cell-${column.key}`" :item="item" :value="getItemValue(item, column.key)"
                            :column="column">
                            {{ formatCellValue(getItemValue(item, column.key), column) }}
                        </slot>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { PhCaretUp, PhCaretDown, PhCaretUpDown } from "@phosphor-icons/vue";

const props = defineProps({
    items: {
        type: Array,
        default: () => []
    },
    columns: {
        type: Array,
        required: true,
        validator: (columns) => {
            return columns.every(col =>
                col.key && col.label &&
                typeof col.key === 'string' &&
                typeof col.label === 'string'
            )
        }
    },
    sortColumn: {
        type: String,
        default: ''
    },
    sortDirection: {
        type: String,
        default: 'asc',
        validator: (value) => ['asc', 'desc'].includes(value)
    },
    clickable: {
        type: Boolean,
        default: false
    },
    itemKey: {
        type: [String, Function],
        default: 'id'
    },
    disableInternalSorting: {
        type: Boolean,
        default: false
    },
    getRowClass: {
        type: Function,
        default: null
    }
})

const emit = defineEmits(['sort', 'row-click'])

const sortedItems = computed(() => {
    // If internal sorting is disabled, return items as-is
    if (props.disableInternalSorting) return props.items

    if (!props.sortColumn) return props.items

    return [...props.items].sort((a, b) => {
        let aValue = getItemValue(a, props.sortColumn)
        let bValue = getItemValue(b, props.sortColumn)

        // Handle different data types
        if (aValue instanceof Date && bValue instanceof Date) {
            aValue = aValue.getTime()
            bValue = bValue.getTime()
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
            // Handle distance strings (e.g., "5.2 km" -> 5.2)
            if (aValue.includes('km') || aValue.includes('mi')) {
                aValue = parseFloat(aValue.replace(/[^\d.]/g, '')) || 0
                bValue = parseFloat(bValue.replace(/[^\d.]/g, '')) || 0
            } else {
                aValue = aValue.toLowerCase()
                bValue = bValue.toLowerCase()
            }
        }

        if (aValue < bValue) return props.sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return props.sortDirection === 'asc' ? 1 : -1
        return 0
    })
})

const getItemKey = (item, index) => {
    if (typeof props.itemKey === 'function') {
        return props.itemKey(item, index)
    }
    return item[props.itemKey] || index
}

const getItemValue = (item, key) => {
    return key.split('.').reduce((obj, k) => obj?.[k], item)
}

const formatCellValue = (value, column) => {
    if (column.formatter && typeof column.formatter === 'function') {
        return column.formatter(value)
    }
    return value
}

const getSortIcon = (columnKey) => {
    if (props.sortColumn !== columnKey) return PhCaretUpDown
    return props.sortDirection === 'asc' ? PhCaretUp : PhCaretDown
}

const handleSort = (columnKey) => {
    emit('sort', columnKey)
}

const handleRowClick = (item, index) => {
    if (props.clickable) {
        emit('row-click', item, index)
    }
}
</script>

<style scoped>
/* Design System variables are now global - see /src/assets/css/design-system.css */

.base-table {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: box-shadow var(--transition-normal);
}

.base-table:hover {
    box-shadow: var(--shadow-md);
}

.base-table__header {
    display: grid;
    grid-template-columns: 2fr 2fr 1fr 1fr 1.5fr;
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-lg);
    background: var(--bg-elevated);
    border-bottom: 1px solid var(--border);
    font-weight: 600;
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
}

.base-table__header-cell {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

.base-table__header-cell--sortable {
    cursor: pointer;
    user-select: none;
    transition: color var(--transition-fast);
}

.base-table__header-cell--sortable:hover {
    color: var(--accent);
}

.base-table__header-cell--active {
    color: var(--accent);
    font-weight: 700;
}

.base-table__body {
    display: flex;
    flex-direction: column;
}

.base-table__row {
    display: grid;
    grid-template-columns: 2fr 2fr 1fr 1fr 1.5fr;
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--border);
    transition: background-color var(--transition-fast), transform var(--transition-fast);
    align-items: center;
}

.base-table__row:hover {
    background: var(--bg-elevated);
}

.base-table__row:nth-child(even) {
    background: rgba(0, 0, 0, 0.005); /* Very subtle zebra striping */
}

.base-table__row--clickable {
    cursor: pointer;
}

.base-table__row--clickable:hover {
    background: var(--accent-surface);
    /* transform: translateX(2px); removed for cleaner table experience */
    border-left-color: var(--accent);
}

.base-table__row--last-viewed {
    background: var(--accent-surface) !important;
    position: relative;
}

.base-table__row--last-viewed::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--accent);
}

.base-table__row:last-child {
    border-bottom: none;
}

.base-table__cell {
    display: flex;
    align-items: center;
    font-size: var(--font-size-base);
    color: var(--text-primary);
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.base-table__empty {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 240px;
    padding: var(--spacing-xl);
    background: var(--bg-surface);
}

.base-table__empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
    color: var(--text-tertiary);
    text-align: center;
}

.base-table__empty-content :deep(svg) {
    font-size: 48px;
    margin-bottom: var(--spacing-sm);
    opacity: 0.5;
}

.base-table__empty-content span {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--text-primary);
}

.base-table__empty-content p {
    font-size: var(--font-size-base);
    margin: 0;
    color: var(--text-secondary);
}

/* Responsive Design */
@media (width <= 768px) {
    .base-table__header {
        display: none; /* Hide header on mobile for card-like layout */
    }

    .base-table__row {
        grid-template-columns: 1fr;
        gap: var(--spacing-sm);
        padding: var(--spacing-md);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        margin-bottom: var(--spacing-md);
        background: var(--bg-surface);
    }
    
    .base-table__body {
        padding: var(--spacing-sm);
        background: var(--bg-base); /* Contrast for card items */
        gap: var(--spacing-sm);
    }

    .base-table {
        background: transparent;
        border: none;
        box-shadow: none;
    }

    .base-table__cell {
        padding: var(--spacing-xs) 0;
        flex-direction: row;
        justify-content: space-between;
        width: 100%;
        border-bottom: 1px dashed var(--border);
    }
    
    .base-table__cell:last-child {
        border-bottom: none;
    }

    .base-table__cell::before {
        content: attr(data-label);
        font-weight: 600;
        font-size: 0.75rem;
        text-transform: uppercase;
        color: var(--text-tertiary);
        margin-right: auto;
    }
}
</style>
