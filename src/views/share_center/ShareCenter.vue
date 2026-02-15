<template>
    <div class="share-center-wrapper">
        <!-- New Document Architecture -->
        <component 
            :is="activeView" 
            v-bind="activeProps"
            @select-document="handleDocumentSelect"
            @back="handleBack"
        />
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DocumentLibrary from './DocumentLibrary.vue'
import DocumentDetail from './DocumentDetail.vue'

const router = useRouter()
const route = useRoute()

const props = defineProps({
    routeId: {
        type: [String, Number],
        default: null
    }
})

// State for local navigation if not using URL params (e.g. within same route)
// However, recommended approach is to use URL to maintain history
const selectedDocumentId = ref(props.routeId || null)

const activeView = computed(() => {
    return selectedDocumentId.value ? DocumentDetail : DocumentLibrary
})

const activeProps = computed(() => {
    return selectedDocumentId.value ? { routeId: selectedDocumentId.value } : {}
})

const handleDocumentSelect = (doc) => {
    selectedDocumentId.value = doc.id
    // Update URL without reloading to keep deep linking working
    // If we are on /user/share_center, we can push /user/share_center?routeId=xyz 
    // or rely on a proper sub-route structure if router allows.
    // For now, simpler to just update local state or query param.
    router.push({ query: { ...route.query, routeId: doc.id } })
}

const handleBack = () => {
    selectedDocumentId.value = null
    const query = { ...route.query }
    delete query.routeId
    router.push({ query })
}

// Watch for URL changes (PopState / Back Button)
watch(() => route.query.routeId, (newId) => {
    selectedDocumentId.value = newId || props.routeId || null
}, { immediate: true })

// Also watch prop if used as a child component (e.g. in SurveyContextLayout)
watch(() => props.routeId, (newId) => {
    if (newId) selectedDocumentId.value = newId
}, { immediate: true })

</script>

<style scoped>
.share-center-wrapper {
    height: 93vh;
    overflow: hidden;
    padding: 1rem;
    max-width: 1800px;
    margin: 0 auto;
}
</style>