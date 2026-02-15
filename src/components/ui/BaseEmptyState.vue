<template>
  <div class="base-empty-state" :class="[`base-empty-state--${variant}`, { 'base-empty-state--compact': compact }]">
    <div class="base-empty-state__icon">
      <component v-if="isIconComponent" :is="iconComponent" :size="48" />
      <i v-else-if="isIconString" :class="iconComponent" class="base-empty-state__icon-class"></i>
    </div>
    
    <div class="base-empty-state__content">
      <h4 v-if="title" class="base-empty-state__title">{{ title }}</h4>
      <p v-if="message" class="base-empty-state__message">{{ message }}</p>
      <div v-if="$slots.default" class="base-empty-state__slot">
         <slot></slot>
      </div>
      <div v-if="$slots.actions" class="base-empty-state__actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { PhWarning, PhMagnifyingGlass, PhTray } from '@phosphor-icons/vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'error', 'search'].includes(value)
  },
  icon: {
    type: [Object, String],
    default: null
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  compact: {
    type: Boolean,
    default: false
  }
});

const iconComponent = computed(() => {
  if (props.icon) return props.icon;
  switch (props.variant) {
    case 'error':
      return PhWarning;
    case 'search':
      return PhMagnifyingGlass;
    default:
      return PhTray;
  }
});

const isIconComponent = computed(() => {
  const icon = iconComponent.value;
  return icon && typeof icon === 'object';
});

const isIconString = computed(() => {
  const icon = iconComponent.value;
  return icon && typeof icon === 'string';
});
</script>

<style scoped>
.base-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--text-secondary);
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--border);
  min-height: 200px;
}

.base-empty-state--compact {
  padding: var(--spacing-lg);
  min-height: auto;
  border: none;
  background: transparent;
}

.base-empty-state__icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
  color: var(--text-tertiary);
}

.base-empty-state__icon-class {
  font-size: 3rem;
}

.base-empty-state__content {
  max-width: 400px;
}

.base-empty-state__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs);
}

.base-empty-state__message {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-md);
  line-height: 1.5;
}

.base-empty-state__actions {
  margin-top: var(--spacing-md);
  display: flex;
  gap: var(--spacing-sm);
  justify-content: center;
}

/* Error Variant */
.base-empty-state--error .base-empty-state__icon {
  color: var(--error);
  opacity: 0.8;
}

.base-empty-state--error {
  border-color: var(--error);
  background: var(--bg-surface); 
}
</style>
