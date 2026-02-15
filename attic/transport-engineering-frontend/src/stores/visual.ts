/**
 * Visual Store - Schematic rendering state
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface HighlightState {
    moduleId?: string
    axleGroupId?: string
}

export const useVisualStore = defineStore('visual', () => {
    // State
    const selectedModule = ref<string | null>(null)
    const selectedAxleGroup = ref<string | null>(null)
    const highlights = ref<HighlightState>({})
    const warningOverlays = ref<Map<string, string[]>>(new Map())

    // Actions
    function selectModule(moduleId: string | null) {
        selectedModule.value = moduleId
    }

    function selectAxleGroup(axleGroupId: string | null) {
        selectedAxleGroup.value = axleGroupId
    }

    function setHighlight(state: HighlightState) {
        highlights.value = state
    }

    function clearHighlight() {
        highlights.value = {}
    }

    function setWarnings(itemId: string, warnings: string[]) {
        warningOverlays.value.set(itemId, warnings)
    }

    function clearWarnings() {
        warningOverlays.value.clear()
    }

    return {
        // State
        selectedModule,
        selectedAxleGroup,
        highlights,
        warningOverlays,
        // Actions
        selectModule,
        selectAxleGroup,
        setHighlight,
        clearHighlight,
        setWarnings,
        clearWarnings,
    }
})
