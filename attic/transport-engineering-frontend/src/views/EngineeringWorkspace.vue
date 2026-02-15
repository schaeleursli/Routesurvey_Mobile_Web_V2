<template>
  <div class="engineering-workspace">
    <div class="workspace-nav">
      <router-link
        :to="`/projects/${projectId}/engineering/library`"
        class="nav-link"
      >
        Equipment Library
      </router-link>
      <router-link
        :to="`/projects/${projectId}/engineering/equipment`"
        class="nav-link"
      >
        Project Equipment
      </router-link>
      <button @click="toggleTheme" class="theme-toggle">
        {{ isDark ? '☀️' : '🌙' }}
      </button>
    </div>
    <div class="workspace-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const appStore = useAppStore()

const projectId = computed(() => route.params.projectId as string)
const isDark = computed(() => appStore.isDark)

function toggleTheme() {
  appStore.toggleTheme()
}
</script>

<style scoped>
.engineering-workspace {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.workspace-nav {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.nav-link {
  padding: var(--spacing-sm) var(--spacing-md);
  text-decoration: none;
  color: var(--color-text);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.nav-link:hover {
  background: var(--color-background);
}

.nav-link.router-link-active {
  background: var(--color-primary);
  color: white;
}

.theme-toggle {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: var(--spacing-sm);
}

.workspace-content {
  flex: 1;
  overflow: auto;
}
</style>
