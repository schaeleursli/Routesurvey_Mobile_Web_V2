<template>
  <div class="route-list-item" :class="{ 'selected': isSelected }" @click="emit('navigate', route)">
    <!-- Left: Route Info -->
    <div class="route-info">
      <h4 class="route-title">{{ route.name }}</h4>
      <span class="route-date">
        <PhClock :size="12" /> {{ formatTimeAgo(route.updatedAt) }}
      </span>
    </div>

    <!-- Center: A→B Location Timeline -->
    <div class="route-locations">
      <div class="location-row">
        <div class="point-badge start-badge">A</div>
        <span class="location-address" :title="getTooltip(route.startLocation)">{{ formatAddress(route.startLocation) }}</span>
      </div>
      <div class="connector-line"></div>
      <div class="location-row">
        <div class="point-badge end-badge">B</div>
        <span class="location-address" :title="getTooltip(route.endLocation)">{{ formatAddress(route.endLocation) }}</span>
      </div>
    </div>

    <!-- Distance -->
    <div class="route-distance">
      <div class="distance-pill">
        <PhSignpost :size="12" />
        {{ displayDistance }}
      </div>
    </div>

    <!-- Status Badge -->
    <div class="route-status">
      <div class="status-badge" :class="statusClass">
        {{ formattedStatus }}
      </div>
    </div>

    <!-- Actions -->
    <div class="route-actions" @click.stop>
      <button class="action-btn" @click="emit('action', { route, step: 'view' })" title="View">
        <PhEye :size="16" />
      </button>
      <button class="action-btn" @click="emit('action', { route, step: 'edit' })" title="Edit">
        <PhPencil :size="16" />
      </button>
      <button class="action-btn action-btn--danger" @click="emit('action', { route, step: 'delete' })" title="Delete">
        <PhTrash :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { PhClock, PhSignpost, PhEye, PhPencil, PhTrash } from '@phosphor-icons/vue';
import { useUnits } from '@/composables/useUnits'
import routeUtils from '@/utils/route_utils'

const props = defineProps({
  route: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['navigate', 'action', 'select'])

const { formatDistance } = useUnits()

const displayDistance = computed(() => {
  if (props.route.distance && props.route.distance > 0) {
    return formatDistance(props.route.distance)
  }
  return '—'
})

const statusClass = computed(() => {
  const s = String(props.route.status).toLowerCase();
  switch (s) {
    case 'planned': return 'status-planned';
    case 'surveyed': return 'status-surveyed';
    case 'manual': return 'status-manual';
    case 'reported': return 'status-reported';
    case 'completed': return 'status-reported';
    case 'shared': return 'status-shared';
    default: return 'status-planned';
  }
})

const formattedStatus = computed(() => {
  if (!props.route.status) return 'Planned';
  return props.route.status.charAt(0).toUpperCase() + props.route.status.slice(1);
})

const formatAddress = (addr) => {
  const address = routeUtils.getShortAddress(addr)
  return address || 'Unknown Location'
}

const formatTimeAgo = (dateLink) => {
  if (!dateLink) return 'Recently';
  const date = new Date(dateLink);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return date.toLocaleDateString(); 
}

const getTooltip = (addr) => {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  if (addr.display_name) return addr.display_name;
  return '';
}
</script>

<style scoped>
.route-list-item {
  display: grid;
  grid-template-columns: 1.5fr 2.5fr 0.8fr 0.8fr 1fr;
  gap: 1rem;
  align-items: center;
  padding: 0.875rem 1.25rem;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  transition: all 0.2s ease;
  cursor: pointer;
}

.route-list-item:hover {
  background: var(--bg-elevated);
}

.route-list-item.selected {
  background: rgb(0 167 225 / 8%);
  border-left: 3px solid var(--accent);
}

.route-list-item:last-child {
  border-bottom: none;
}

/* Route Info */
.route-info {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between; /* Push date to the right */
  gap: 1rem;
  padding-right: 1rem; /* Add some padding from the next column */
}

.route-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.route-date {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: var(--text-secondary);
  gap: 0.35rem;
  flex-shrink: 0; /* Prevent date from shrinking */
  background: var(--bg-elevated); /* Optional: add subtle background pill? User said "better dynamic alignment" */
  padding: 2px 8px;
  border-radius: 6px;
}

.route-date i {
  font-size: 0.7rem;
}

/* Location Timeline */
.route-locations {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.location-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  flex: 1;
}

.point-badge {
  width: 24px;
  height: 24px;
  min-width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 50%;
  color: white;
  box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
}

.start-badge {
  background: linear-gradient(135deg, #00B48A 0%, #00A7E1 100%);
}

.end-badge {
  background: linear-gradient(135deg, #DC3545 0%, #FF6B6B 100%);
}

.connector-line {
  width: 32px;
  height: 2px;
  background: linear-gradient(to right, #00B48A, #DC3545);
  border-radius: 2px;
  flex-shrink: 0;
  opacity: 0.4;
}

.location-address {
  font-size: 0.85rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

/* Distance */
.route-distance {
  display: flex;
  justify-content: center;
}

.distance-pill {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
}

.distance-pill i {
  font-size: 0.7rem;
  color: var(--accent);
  opacity: 1;
}

/* Status */
.route-status {
  display: flex;
  justify-content: center;
}

.status-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.status-planned { background: var(--bg-elevated); color: var(--text-secondary); border: 1px solid var(--border); }
.status-surveyed { background: rgb(0 167 225 / 10%); color: var(--accent); border: 1px solid rgb(0 167 225 / 20%); }
.status-manual { background: rgb(255 193 7 / 10%); color: #ffc107; border: 1px solid rgb(255 193 7 / 20%); }
.status-reported { background: rgb(0 180 138 / 10%); color: var(--success); border: 1px solid rgb(0 180 138 / 20%); }
.status-shared { background: rgb(111 66 193 / 10%); color: #6f42c1; border: 1px solid rgb(111 66 193 / 20%); }

/* Actions */
.route-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.action-btn {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--bg-elevated);
  color: var(--accent);
  border-color: var(--border);
}

.action-btn--danger:hover {
  background: rgb(220 53 69 / 10%);
  color: var(--error);
  border-color: rgb(220 53 69 / 20%);
}

/* Responsive */
@media (width <= 1200px) {
  .route-list-item {
    grid-template-columns: 1.5fr 2fr 1fr 1fr;
  }
  
  .route-actions {
    display: none;
  }
}

@media (width <= 768px) {
  .route-list-item {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 1rem;
  }
  
  .route-locations {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .connector-line {
    width: 2px;
    height: 16px;
    margin-left: 11px;
    background: linear-gradient(to bottom, #00B48A, #DC3545);
  }
}
</style>
