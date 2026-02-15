<template>
  <div id="app-layout" class="app-layout">
    <div id="app-content">
      <router-view />
      <div v-if="uiStore.isLoading" class="loading-wave my-overlay">
        <div class="my-custom-wave"></div>
        <div class="my-custom-wave"></div>
        <div class="my-custom-wave"></div>
        <div class="my-custom-wave"></div>
      </div>
    </div>
    <!-- Global Photo Viewer - Outside app container -->
    <GlobalPhotoViewer />
  </div>
</template>

<style scoped>
#app {
  /* Removed overflow: hidden to prevent photo viewer issues */
}

/* start loader style */
.my-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--bg-base);  /* Using design token */
  opacity: 0.5;
}

.loading-wave {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: transparent;
}

.my-custom-wave {
  display: inline-block;
  margin: 0 var(--spacing-xs);  /* Using spacing token */
  width: 10px;
  height: 30px;
  background-color: var(--accent);  /* Using accent color token */
  animation: my-custom-wave 1.5s ease-in-out infinite;
}

.my-custom-wave:nth-child(2) {
  animation-delay: 0.2s;
}

.my-custom-wave:nth-child(3) {
  animation-delay: 0.4s;
}

.my-custom-wave:nth-child(4) {
  animation-delay: 0.6s;
}

@keyframes my-custom-wave {
  0% {
    transform: scaleY(1);
  }

  50% {
    transform: scaleY(2);
  }

  100% {
    transform: scaleY(1);
  }
}

/* end loader styling */
</style>

<script>
import { defineComponent, onBeforeMount, onMounted } from "vue";
import { RouterView } from "vue-router";
import GlobalPhotoViewer from "@/components/GlobalPhotoViewer.vue";
import { useUIStore } from "@/stores/ui";
import { useTheme } from "@/composables/useTheme";

export default defineComponent({
  name: "app",
  components: {
    RouterView,
    GlobalPhotoViewer,
  },
  setup() {
    const uiStore = useUIStore();
    const { initTheme } = useTheme();

    onBeforeMount(() => {
      // Initialize theme before app renders
      initTheme();
    });

    onMounted(() => {
    });

    return {
        uiStore
    };
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;


}

.swal2-container.swal2-center>.swal2-popup {
  background-color: var(--bg-surface) !important;  /* Using surface token */
}

.swal2-html-container,
.swal2-title {
  color: var(--text-primary) !important;  /* Using text token */
}
</style>

<style lang="scss">
@import "sweetalert2/dist/sweetalert2.css";
</style>
