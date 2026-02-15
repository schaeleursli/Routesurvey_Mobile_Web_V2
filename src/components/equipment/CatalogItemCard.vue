<template>
  <div 
    class="catalog-item-card" 
    :class="{ 'is-selected': selected, 'is-compact': compact, [`category-${item.category}`]: true }"
    @click="$emit('select', item)"
  >
    <div class="card-header">
      <div class="badges">
        <span class="badge badge-category" :class="`badge-${item.category}`">
          {{ categoryLabel }}
        </span>
        <span v-if="regionBadge" class="badge badge-region" :title="regionBadge">
          {{ regionFlag }}
        </span>
      </div>
      <div v-if="selected" class="selected-indicator">
        <i class="icon-check-circle"></i>
      </div>
    </div>
    
    <div class="card-body">
      <h4 class="item-name">{{ item.name }}</h4>
      
      <div v-if="!compact" class="item-meta">
        <div v-if="item.manufacturer || item.model" class="manufacturer">
          {{ item.manufacturer }} {{ item.model }}
        </div>
        
        <!-- Specs preview based on category -->
        <div class="specs-preview">
          <template v-if="item.category === 'tractor'">
            <div class="spec-item">
              <span class="spec-label">Config:</span>
              <span class="spec-value">{{ item.spec?.axleConfig || 'N/A' }}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Wheelbase:</span>
              <span class="spec-value">{{ formatLength(item.spec?.wheelbaseM) }}</span>
            </div>
          </template>
          
          <template v-else-if="item.category === 'module'">
            <div class="spec-item">
              <span class="spec-label">Type:</span>
              <span class="spec-value">{{ item.spec?.kind || 'N/A' }}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Length:</span>
              <span class="spec-value">{{ formatLength(item.spec?.lengthM) }}</span>
            </div>
            <div v-if="item.spec?.axles?.length" class="spec-item">
              <span class="spec-label">Axles:</span>
              <span class="spec-value">{{ item.spec.axles.length }}</span>
            </div>
          </template>
          
          <template v-else-if="item.category === 'spmt'">
            <div class="spec-item">
              <span class="spec-label">Lines:</span>
              <span class="spec-value">{{ item.spec?.lineCount || 'N/A' }}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Capacity:</span>
              <span class="spec-value">{{ formatWeight(item.spec?.capacity_kg) }}</span>
            </div>
          </template>
          
          <template v-else-if="item.category === 'assembly_preset'">
            <div class="spec-item">
              <span class="spec-label">Components:</span>
              <span class="spec-value">{{ item.spec?.refs?.length || 0 }}</span>
            </div>
            <div v-if="item.spec?.assist" class="spec-item spec-highlight">
              <span class="spec-value">🔄 Push-Pull</span>
            </div>
          </template>
        </div>
      </div>
    </div>
    
    <div v-if="!compact" class="card-footer">
      <button class="btn-select" @click.stop="$emit('select', item)">
        {{ selected ? 'Selected' : 'Select' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  },
  compact: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['select']);

const categoryLabel = computed(() => {
  const labels = {
    'tractor': 'Tractor',
    'module': 'Module',
    'spmt': 'SPMT',
    'assembly_preset': 'Preset'
  };
  return labels[props.item.category] || props.item.category;
});

const regionBadge = computed(() => {
  return props.item.tags?.region || null;
});

const regionFlag = computed(() => {
  const flags = {
    'US': '🇺🇸',
    'EU': '🇪🇺',
    'Global': '🌍'
  };
  return flags[regionBadge.value] || '';
});

const formatLength = (meters) => {
  if (!meters) return 'N/A';
  return `${meters.toFixed(1)}m`;
};

const formatWeight = (kg) => {
  if (!kg) return 'N/A';
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)}t`;
  }
  return `${kg}kg`;
};
</script>

<style scoped>
.catalog-item-card {
  background: var(--surface-secondary, #fff);
  border: 2px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.catalog-item-card:hover {
  border-color: var(--primary-color, #3b82f6);
  box-shadow: 0 4px 12px rgb(59 130 246 / 10%);
  transform: translateY(-2px);
}

.catalog-item-card.is-selected {
  border-color: var(--primary-color, #3b82f6);
  background: var(--primary-bg-subtle, #eff6ff);
}

.catalog-item-card.is-compact {
  padding: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.badge-category {
  background: var(--badge-bg, #f3f4f6);
  color: var(--badge-color, #374151);
}

.badge-tractor {
  background: #e3f2fd;
  color: #1976d2;
}

.badge-module {
  background: #f3e5f5;
  color: #7b1fa2;
}

.badge-spmt {
  background: #fff3e0;
  color: #e65100;
}

.badge-assembly_preset {
  background: #e8f5e9;
  color: #388e3c;
}

.badge-region {
  background: transparent;
  padding: 2px 6px;
  font-size: 16px;
}

.selected-indicator {
  color: var(--primary-color, #3b82f6);
  font-size: 20px;
}

.card-body {
  margin-bottom: 12px;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #111827);
  margin: 0 0 8px;
  line-height: 1.4;
}

.item-meta {
  font-size: 13px;
  color: var(--text-secondary, #6b7280);
}

.manufacturer {
  margin-bottom: 8px;
  font-weight: 500;
}

.specs-preview {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.spec-item {
  display: flex;
  gap: 6px;
}

.spec-label {
  color: var(--text-tertiary, #9ca3af);
  min-width: 80px;
}

.spec-value {
  color: var(--text-secondary, #6b7280);
  font-weight: 500;
}

.spec-highlight .spec-value {
  color: var(--primary-color, #3b82f6);
  font-weight: 600;
}

.card-footer {
  padding-top: 12px;
  border-top: 1px solid var(--border-color-light, #f3f4f6);
}

.btn-select {
  width: 100%;
  padding: 8px 16px;
  background: var(--primary-color, #3b82f6);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-select:hover {
  background: var(--primary-color-hover, #2563eb);
}

.is-selected .btn-select {
  background: var(--success-color, #10b981);
}

.is-selected .btn-select:hover {
  background: var(--success-color-hover, #059669);
}

.is-compact .card-body {
  margin-bottom: 0;
}

.is-compact .item-name {
  font-size: 14px;
  margin-bottom: 4px;
}
</style>
