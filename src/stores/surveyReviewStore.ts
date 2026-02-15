/**
 * Survey Review Store (TypeScript)
 *
 * Pinia store for the Survey Review workspace.
 * Uses @routesurvey/survey-core for schema utilities and KPI computation.
 */

import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import {
    type SurveySchemaV1,
    type SurveyPoint,
    type Kpis,
    type SchemaField,
    computeKpis,
    getVisibleDimensionFields,
    getSubtypes,
} from '@routesurvey/survey-core';

// KPI status constants (matching survey-core types)
const KPI_EMPTY = 'empty';
const KPI_PARTIAL = 'partial';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Category = 'obstruction' | 'observation' | 'info';
export type GapFilters = {
    photos: boolean;
    data: boolean;
    notes: boolean;
};

export interface SurveyReviewFilters {
    category: Category | 'all';
    type: string | 'all';
    gaps: GapFilters;
    search: string;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useSurveyReviewStore = defineStore('surveyReview', () => {
    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    const schema = ref<SurveySchemaV1 | null>(null);
    const points = ref<SurveyPoint[]>([]);
    const selectedPointId = ref<string | null>(null);
    const filters = ref<SurveyReviewFilters>({
        category: 'all',
        type: 'all',
        gaps: { photos: false, data: false, notes: false },
        search: '',
    });
    const dirtyDraft = ref<Partial<SurveyPoint> | null>(null);
    const isDirty = ref(false);
    const isLoading = ref(false);

    // -------------------------------------------------------------------------
    // Getters
    // -------------------------------------------------------------------------

    /** Currently selected point (merged with draft if dirty) */
    const selectedPoint = computed<SurveyPoint | null>(() => {
        if (!selectedPointId.value) return null;
        const point = points.value.find((p) => p.id === selectedPointId.value);
        if (!point) return null;
        if (isDirty.value && dirtyDraft.value) {
            return {
                ...point,
                ...dirtyDraft.value,
                dimensions: { ...point.dimensions, ...dirtyDraft.value.dimensions },
            };
        }
        return point;
    });

    /** Compute KPIs for each point by ID */
    const kpisById = computed<Record<string, Kpis>>(() => {
        if (!schema.value) return {};
        const result: Record<string, Kpis> = {};
        for (const p of points.value) {
            result[p.id] = computeKpis(schema.value, p);
        }
        return result;
    });

    /** Filtered and sorted points */
    const visiblePoints = computed<SurveyPoint[]>(() => {
        if (!schema.value) return [];

        let result = [...points.value];

        // Category filter
        if (filters.value.category !== 'all') {
            result = result.filter((p) => p.category === filters.value.category);
        }

        // Type filter
        if (filters.value.type !== 'all') {
            result = result.filter((p) => p.type === filters.value.type);
        }

        // Gap filters
        const { photos, data, notes } = filters.value.gaps;
        if (photos || data || notes) {
            result = result.filter((p) => {
                const k = kpisById.value[p.id];
                if (!k) return false;
                if (photos && k.photos !== KPI_EMPTY) return false;
                if (data && k.data !== KPI_EMPTY && k.data !== KPI_PARTIAL) return false;
                if (notes && k.notes !== KPI_EMPTY && k.notes !== KPI_PARTIAL) return false;
                return true;
            });
        }

        // Search filter
        if (filters.value.search.trim()) {
            const query = filters.value.search.toLowerCase();
            result = result.filter((p) => {
                // Legacy roadName
                const roadName = p.roadName?.toLowerCase() || '';
                // New road identity fields
                const roadDisplay = p.road?.display?.toLowerCase() || '';
                const roadRef = p.road?.refPrimary?.toLowerCase() || '';
                const roadNameNew = p.road?.name?.toLowerCase() || '';
                // Other searchable fields
                const noteText = p.notes?.toLowerCase() || '';
                const subtypeText = p.subtype?.toLowerCase() || '';
                const typeText = p.type?.toLowerCase() || '';
                const idText = p.id.toLowerCase();
                return (
                    roadDisplay.includes(query) ||
                    roadRef.includes(query) ||
                    roadNameNew.includes(query) ||
                    roadName.includes(query) ||
                    noteText.includes(query) ||
                    subtypeText.includes(query) ||
                    typeText.includes(query) ||
                    idText.includes(query)
                );
            });
        }

        // Sort by distance ascending
        result.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

        return result;
    });

    /** Visible dimension fields for the selected point's type/subtype */
    const selectedVisibleDimensionFields = computed<SchemaField[]>(() => {
        if (!schema.value || !selectedPoint.value) return [];
        return getVisibleDimensionFields(
            schema.value,
            selectedPoint.value.type ?? null,
            selectedPoint.value.subtype ?? null
        );
    });

    /** Available types from schema */
    const availableTypes = computed(() => {
        if (!schema.value) return [];
        return schema.value.config.types.map((t) => ({
            id: t.id,
            label: t.label,
            icon: t.icon,
        }));
    });

    /** Available subtypes for current type */
    const availableSubtypes = computed(() => {
        if (!schema.value || !selectedPoint.value?.type) return [];
        return getSubtypes(schema.value, selectedPoint.value.type);
    });

    /** Index of selected point in visible list */
    const selectedIndex = computed(() => {
        if (!selectedPointId.value) return -1;
        return visiblePoints.value.findIndex((p) => p.id === selectedPointId.value);
    });

    /** Next point ID */
    const nextPointId = computed(() => {
        const idx = selectedIndex.value;
        if (idx < 0 || idx >= visiblePoints.value.length - 1) return null;
        return visiblePoints.value[idx + 1].id;
    });

    /** Previous point ID */
    const prevPointId = computed(() => {
        const idx = selectedIndex.value;
        if (idx <= 0) return null;
        return visiblePoints.value[idx - 1].id;
    });

    // -------------------------------------------------------------------------
    // Actions
    // -------------------------------------------------------------------------

    /** Load schema from JSON (call once on mount) */
    async function loadSchema(): Promise<void> {
        try {
            const response = await fetch('/schemas/Schema_SurveyPoint_V1.json');
            if (!response.ok) throw new Error(`Failed to load schema: ${response.status}`);
            schema.value = await response.json();
        } catch (err) {
            console.error('Failed to load survey schema:', err);
            throw err;
        }
    }

    /** Set points from API response */
    function setPoints(newPoints: SurveyPoint[]): void {
        points.value = newPoints;
        // Clear selection if no longer valid
        if (selectedPointId.value && !newPoints.find((p) => p.id === selectedPointId.value)) {
            selectedPointId.value = null;
            dirtyDraft.value = null;
            isDirty.value = false;
        }
    }

    /** Select a point. Returns false if blocked by dirty state (caller should show modal). */
    function selectPoint(pointId: string | null): boolean {
        if (isDirty.value && pointId !== selectedPointId.value) {
            // Caller should handle unsaved changes modal
            return false;
        }
        selectedPointId.value = pointId;
        dirtyDraft.value = null;
        isDirty.value = false;
        return true;
    }

    /** Force select (after user confirms discard) */
    function forceSelectPoint(pointId: string | null): void {
        selectedPointId.value = pointId;
        dirtyDraft.value = null;
        isDirty.value = false;
    }

    /** Update the draft with partial changes */
    function updateDraft(patch: Partial<SurveyPoint>): void {
        if (!dirtyDraft.value) {
            dirtyDraft.value = {};
        }

        // Merge dimensions specially
        if (patch.dimensions) {
            dirtyDraft.value.dimensions = {
                ...(dirtyDraft.value.dimensions || {}),
                ...patch.dimensions,
            };
            delete patch.dimensions;
        }

        Object.assign(dirtyDraft.value, patch);
        isDirty.value = true;
    }

    /** Save the current draft to the point (and call API) */
    async function saveSelected(): Promise<boolean> {
        if (!selectedPointId.value || !dirtyDraft.value) return false;

        const idx = points.value.findIndex((p) => p.id === selectedPointId.value);
        if (idx === -1) return false;

        // Merge draft into point
        const updated = {
            ...points.value[idx],
            ...dirtyDraft.value,
            dimensions: {
                ...points.value[idx].dimensions,
                ...(dirtyDraft.value.dimensions || {}),
            },
        };

        // Update local state optimistically
        points.value[idx] = updated;
        dirtyDraft.value = null;
        isDirty.value = false;

        // TODO: Call API to persist
        // await surveyPointsApi.patch(selectedPointId.value, updated);

        return true;
    }

    /** Discard draft changes */
    function discardDraft(): void {
        dirtyDraft.value = null;
        isDirty.value = false;
    }

    /** Delete the selected point */
    async function deleteSelected(): Promise<boolean> {
        if (!selectedPointId.value) return false;

        const idx = points.value.findIndex((p) => p.id === selectedPointId.value);
        if (idx === -1) return false;

        // Move selection to next or previous
        const nextId = nextPointId.value || prevPointId.value;

        // Remove from local state
        points.value.splice(idx, 1);

        // TODO: Call API to delete
        // await surveyPointsApi.delete(selectedPointId.value);

        // Update selection
        selectedPointId.value = nextId;
        dirtyDraft.value = null;
        isDirty.value = false;

        return true;
    }

    /** Navigate to next point */
    function navigateNext(): void {
        if (nextPointId.value && !isDirty.value) {
            selectedPointId.value = nextPointId.value;
        }
    }

    /** Navigate to previous point */
    function navigatePrev(): void {
        if (prevPointId.value && !isDirty.value) {
            selectedPointId.value = prevPointId.value;
        }
    }

    /** Set filter value */
    function setFilter<K extends keyof SurveyReviewFilters>(
        key: K,
        value: SurveyReviewFilters[K]
    ): void {
        filters.value[key] = value;
    }

    /** Toggle gap filter */
    function toggleGapFilter(gap: keyof GapFilters): void {
        filters.value.gaps[gap] = !filters.value.gaps[gap];
    }

    /** Set search query */
    function setSearch(query: string): void {
        filters.value.search = query;
    }

    /** Reset all filters */
    function resetFilters(): void {
        filters.value = {
            category: 'all',
            type: 'all',
            gaps: { photos: false, data: false, notes: false },
            search: '',
        };
    }

    // -------------------------------------------------------------------------
    // Expose
    // -------------------------------------------------------------------------

    return {
        // State
        schema,
        points,
        selectedPointId,
        filters,
        dirtyDraft,
        isDirty,
        isLoading,

        // Getters
        selectedPoint,
        kpisById,
        visiblePoints,
        selectedVisibleDimensionFields,
        availableTypes,
        availableSubtypes,
        selectedIndex,
        nextPointId,
        prevPointId,

        // Actions
        loadSchema,
        setPoints,
        selectPoint,
        forceSelectPoint,
        updateDraft,
        saveSelected,
        discardDraft,
        deleteSelected,
        navigateNext,
        navigatePrev,
        setFilter,
        toggleGapFilter,
        setSearch,
        resetFilters,
    };
});
