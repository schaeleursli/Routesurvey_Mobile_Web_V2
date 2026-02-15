<template>
  <div :class="{ 'dark': isDark }" class="app-container">
    <router-view />
    <RsToast />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import RsToast from '@/components/ui/RsToast.vue'

const appStore = useAppStore()
const isDark = computed(() => appStore.isDark)

onMounted(() => {
  appStore.initTheme()
})
</script>

<style>
.app-container {
  width: 100%;
  min-height: 100vh;
  background: var(--color-background);
  color: var(--color-text);
  transition: background-color 0.3s, color 0.3s;
}
</style>
