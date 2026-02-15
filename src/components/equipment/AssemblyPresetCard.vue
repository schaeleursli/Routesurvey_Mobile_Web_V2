<template>
  <div 
    class="assembly-preset-card" 
    :class="{ 'is-compact': compact, 'has-assist': hasAssist }"
    @click="$emit('apply', preset)"
  >
    <div class="preset-header">
      <h4 class="preset-name">{{ preset.name }}</h4>
      <span v-if="regionBadge" class="region-badge" :title="regionBadge">
        {{ regionFlag }}
      </span>
    </div>
    
    <div v-if="!compact && preset.description" class="preset-description">
      {{ preset.description }}
    </div>
    
    <div class="preset-visual">
      <!-- Simplified diagram showing components -->
      <div class="component-chain">
        <div v-for="(ref, index) in componentRefs" :key="index" class="component-block" :class="`role-${ref.role}`">
          <div class="block-icon">
            {{ getBlockIcon(ref.role) }}
          </div>
          <div class="block-label">{{ ref.role === 'tractor' ? 'T' : 'M' }}</div>
        </div>
        
        <div v-if="hasAssist" class="assist-indicator">
          <div class="component-block role-assist">
            <div class="block-icon">🔄</div>
            <div class="block-label">P</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="preset-meta">
      <div class="component-count">
        <span class="meta-label">Components:</span>
        <span class="meta-value">{{ componentCount }}</span>
      </div>
      
      <div v-if="useCaseTags.length > 0" class="use-case-tags">
        <span v-for="tag in useCaseTags" :key="tag" class="use-case-tag">
          {{ tag }}
        </span>
      </div>
      
      <div v-if="hasAssist" class="assist-badge">
        <span class="icon">🔄</span>
        <span>Push-Pull</span>
      </div>
    </div>
    
    <button class="btn-apply" @click.stop="$emit('apply', preset)">
     Apply Preset
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  preset: {
    type: Object,
    required: true
  },
  compact: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['apply']);

const componentRefs = computed(() => {
  return props.preset.spec?.refs || [];
});

const componentCount = computed(() => {
  return componentRefs.value.length;
});

const hasAssist = computed(() => {
  return Boolean(props.preset.spec?.assist);
});

const regionBadge = computed(() => {
  return props.preset.tags?.region || null;
});

const regionFlag = computed(() => {
  const flags = {
    'US': '🇺🇸',
    'EU': '🇪🇺',
    'Global': '🌍'
  };
  return flags[regionBadge.value] || '';
});

const useCaseTags = computed(() => {
  const tags = props.preset.tags?.use_case || [];
  if (Array.isArray(tags)) return tags.slice(0, 3);
  if (typeof tags === 'string') return [tags];
  return [];
});

const getBlockIcon = (role) => {
  const icons = {
    'tractor': '🚛',
    'module': '▬',
    'gooseneck': '◢',
    'bogie': '⚙',
    'deck': '▭'
  };
  return icons[role] || '▬';
};
</script>

<style scoped>
.assembly-preset-card {
  background: linear-gradient(135deg, var(--surface-secondary, #fff) 0%, var(--surface-tertiary, #f9fafb) 100%);
  border: 2px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.assembly-preset-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.assembly-preset-card:hover::before {
  opacity: 1;
}

.assembly-preset-card:hover {
  border-color: var(--primary-color, #3b82f6);
  box-shadow: 0 8px 24px rgb(59 130 246 / 15%);
  transform: translateY(-4px);
}

.assembly-preset-card.has-assist {
  border-color: #8b5cf6;
}

.assembly-preset-card.has-assist::before {
  background: linear-gradient(90deg, #8b5cf6, #ec4899);
}

.assembly-preset-card.is-compact {
  padding: 16px;
}

.preset-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.preset-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary, #111827);
  margin: 0;
  flex: 1;
  line-height: 1.3;
}

.region-badge {
  font-size: 20px;
  line-height: 1;
}

.preset-description {
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
  margin-bottom: 16px;
  line-height: 1.5;
}

.preset-visual {
  background: var(--surface-primary, #f9fafb);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.component-chain {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.component-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: var(--surface-secondary, #fff);
  border: 2px solid var(--border-color-light, #e5e7eb);
  border-radius: 6px;
  min-width: 50px;
}

.role-tractor {
  border-color: #3b82f6;
  background: #eff6ff;
}

.role-module,
.role-gooseneck,
.role-deck,
.role-bogie {
  border-color: #7b1fa2;
  background: #f3e5f5;
}

.role-assist {
  border-color: #8b5cf6;
  background: #f5f3ff;
}

.block-icon {
  font-size: 20px;
  line-height: 1;
}

.block-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-tertiary, #9ca3af);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.assist-indicator {
  position: relative;
  padding-left: 16px;
}

.assist-indicator::before {
  content: '→';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary, #9ca3af);
  font-size: 16px;
}

.preset-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 13px;
}

.component-count {
  display: flex;
  gap: 6px;
}

.meta-label {
  color: var(--text-tertiary, #9ca3af);
  font-weight: 500;
}

.meta-value {
  color: var(--text-secondary, #6b7280);
  font-weight: 600;
}

.use-case-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.use-case-tag {
  display: inline-block;
  padding: 4px 10px;
  background: var(--info-bg, #e0f2fe);
  color: var(--info-color, #0369a1);
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
}

.assist-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  border: 1px solid #c4b5fd;
  border-radius: 8px;
  color: #7c3aed;
  font-weight: 700;
  font-size: 12px;
  align-self: flex-start;
}

.assist-badge .icon {
  font-size: 14px;
}

.btn-apply {
  width: 100%;
  padding: 12px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgb(59 130 246 / 20%);
}

.btn-apply:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 12px rgb(59 130 246 / 30%);
  transform: translateY(-1px);
}

.btn-apply:active {
  transform: translateY(0);
}

.has-assist .btn-apply {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.has-assist .btn-apply:hover {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
}

.is-compact .preset-visual {
  padding: 12px;
  margin-bottom: 12px;
}

.is-compact .component-block {
  padding: 6px 10px;
  min-width: 40px;
}

.is-compact .btn-apply {
  padding: 10px 16px;
  font-size: 14px;
}
</style>
