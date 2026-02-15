<template>
  <ReviewWorkspaceLayout :route-name="routeName" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useSurveyReviewStore } from '@/stores/surveyReviewStore';
import { fetchSurveyPoints } from '@/api/surveyPoints';
import ReviewWorkspaceLayout from '@/components/workspace/ReviewWorkspaceLayout.vue';

const route = useRoute();
const store = useSurveyReviewStore();

const routeName = ref('');
const isLoading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  const routeId = route.params.routeId as string;

  try {
    // Load schema first
    await store.loadSchema();

    // Load points
    const points = await fetchSurveyPoints(routeId);
    store.setPoints(points);

    // Set route name from first point or route param
    if (points.length > 0 && points[0].roadName) {
      routeName.value = points[0].roadName;
    } else {
      routeName.value = `Route ${routeId}`;
    }

    // Select first point if any
    if (points.length > 0) {
      store.forceSelectPoint(points[0].id);
    }
  } catch (err) {
    console.error('Failed to load survey data:', err);
    error.value = 'Failed to load survey data. Please try again.';
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
/* Page fills the entire viewport via the layout */
</style>
