import { defineStore } from 'pinia';
import routeUtils from '@/utils/route_utils';
import { POINT_CATEGORIES, POINT_WORKFLOW_STATUS, ROUTE_POINT_TYPE } from '@/logic/logicIds';
import { normalizeRoutePoints } from '@/utils/routeDataNormalizer';

export const CANONICAL_TYPES = {
    geometry: { label: 'Geometry & Junctions', types: ['intersection', 'roundabout', 'sharp_turn', 'ramp'] },
    rail: { label: 'Rail', types: ['rail_crossing'] },
    structures: { label: 'Structures', types: ['bridge', 'tunnel', 'gantry', 'underpass'] },
    road: { label: 'Road & Surface', types: ['road_condition', 'narrow_section', 'slope', 'camber', 'speed_bump', 'flooding', 'roadworks', 'lane_closure'] },
    overhead: { label: 'Overhead & Utilities', types: ['powerlines', 'overhead_obstruction', 'traffic_signal', 'overhead_sign', 'tree_vegetation'] },
    custom: { label: 'Custom', types: ['custom'] }
};

export const useSurveyStore = defineStore('survey', {
    state: () => ({
        points: [], // Array of SurveyPoint
        activePointId: null,
        interactionMode: 'list', // 'list' | 'edit'
        filters: {
            category: null, // POINT_CATEGORIES.* | null (all)
            status: null,    // POINT_WORKFLOW_STATUS.* | null (all)
            search: '',
            sortBy: 'distance' // 'distance' | 'severity' | 'updated'
        },
        isLoading: false,
        error: null
    }),

    getters: {
        // Returns true if specific point filters are active
        hasActiveFilters: (state) => !!state.filters.category || !!state.filters.status,

        // Returns points sorted by distance
        sortedPoints: (state) => {
            if (!state.points || state.points.length === 0) return [];
            // Ensure points have distance calculated
            // We clone to avoid mutating state directly in getter if calc modifies it
            const pointsWithDist = routeUtils.calculateRoutePointsDistances([...state.points]);
            // Sort by distance ascending
            return pointsWithDist.sort((a, b) => (a.distance_m || 0) - (b.distance_m || 0));
        },

        // Returns points after applying filters, search, and sort
        filteredPoints: (state) => {
            let result = state.points;

            // 1. Filter out raw route points (only keep POIs)
            result = result.filter(p => p.type !== ROUTE_POINT_TYPE);

            // 2. Apply Category Filter
            if (state.filters.category) {
                result = result.filter(p => p.category === state.filters.category);
            }

            // 3. Apply Status Filter
            if (state.filters.status) {
                result = result.filter(p => p.workflowStatus === state.filters.status);
            }

            // 4. Apply Search
            if (state.filters.search) {
                const q = state.filters.search.toLowerCase();
                result = result.filter(p =>
                    (p.type && p.type.toLowerCase().includes(q)) ||
                    (p.notes && p.notes.toLowerCase().includes(q)) ||
                    (p.address && p.address.toLowerCase().includes(q))
                );
            }

            // 5. Calculate Distances 
            const withDist = routeUtils.calculateRoutePointsDistances(result);

            // 6. Apply Sort
            const sortBy = state.filters.sortBy || 'distance';
            return withDist.sort((a, b) => {
                if (sortBy === 'distance') {
                    return (a.distance_m || 0) - (b.distance_m || 0);
                } else if (sortBy === 'severity') {
                    // Critical > High > Medium > Low
                    const severityMap = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
                    return (severityMap[b.severity] || 0) - (severityMap[a.severity] || 0);
                } else if (sortBy === 'updated') {
                    return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
                }
                return 0;
            });
        },

        activePoint: (state) => {
            return state.points.find(p => p.id === state.activePointId);
        },

        // Navigation Getters
        nextPointId: (state) => {
            const list = state.filteredPoints; // Navigation respects filters
            const currentIndex = list.findIndex(p => p.id === state.activePointId);
            if (currentIndex === -1 || currentIndex === list.length - 1) return null;
            return list[currentIndex + 1].id;
        },

        prevPointId: (state) => {
            const list = state.filteredPoints;
            const currentIndex = list.findIndex(p => p.id === state.activePointId);
            if (currentIndex <= 0) return null;
            return list[currentIndex - 1].id;
        },

        // Stats for Dashboard/Header
        stats: (state) => {
            const all = state.points.filter(p => p.type !== ROUTE_POINT_TYPE);
            return {
                total: all.length,
                draft: all.filter(p => !p.workflowStatus || p.workflowStatus === POINT_WORKFLOW_STATUS.DRAFT).length,
                surveyed: all.filter(p => p.workflowStatus === POINT_WORKFLOW_STATUS.SURVEYED).length,
                reviewed: all.filter(p => p.workflowStatus === POINT_WORKFLOW_STATUS.REVIEWED).length,
                ready: all.filter(p => p.workflowStatus === POINT_WORKFLOW_STATUS.READY).length,
                obstructions: all.filter(p => p.category === POINT_CATEGORIES.OBSTRUCTION).length,
                observations: all.filter(p => p.category === POINT_CATEGORIES.OBSERVATION).length
            };
        },

        // Helper: Get all known types flattened
        allKnownTypes: () => {
            return Object.values(CANONICAL_TYPES).flatMap(g => g.types);
        }
    },

    actions: {
        setPoints(points) {
            const normalized = normalizeRoutePoints(points);
            // Initialize points with default structure if missing
            this.points = normalized.map(p => ({
                ...p,
                category: p.category || this._inferCategory(p),
                workflowStatus: p.workflowStatus || POINT_WORKFLOW_STATUS.DRAFT
            }));
        },

        setActivePoint(pointId) {
            this.activePointId = pointId;
            // Auto-switch to edit mode when a point is selected
            if (pointId) {
                this.interactionMode = 'edit';
            }
        },

        setInteractionMode(mode) {
            this.interactionMode = mode;
            if (mode === 'list') {
                this.activePointId = null;
            }
        },

        setFilter(key, value) {
            if (key in this.filters) {
                this.filters[key] = value;
            }
        },

        updatePointCategory(pointId, category) {
            const point = this.points.find(p => p.id === pointId);
            if (point) {
                point.category = category;
                this._validateStatus(point);
            }
        },

        updatePointStatus(pointId, status) {
            const point = this.points.find(p => p.id === pointId);
            if (point) {
                // Check guards
                if (status === POINT_WORKFLOW_STATUS.SURVEYED && !point.category) {
                    console.error('Category is required before marking as Surveyed');
                    return; // Fail silently or throw? Better to UI handle validation.
                }
                point.workflowStatus = status;
            }
        },

        navigateNext() {
            const next = this.nextPointId;
            if (next) this.activePointId = next;
        },

        navigatePrev() {
            const prev = this.prevPointId;
            if (prev) this.activePointId = prev;
        },

        updatePoint(pointId, data) {
            const point = this.points.find(p => p.id === pointId);
            if (point) {
                // Merge data
                Object.assign(point, data);
                this._validateStatus(point);
            }
        },

        // Internal Helper: Infer category from explicit type
        _inferCategory(point) {
            // Known obstruction types
            const obstructions = ['bridge', 'powerline', 'overhead', 'intersection', 'railroad'];
            if (obstructions.includes(point.type)) return POINT_CATEGORIES.OBSTRUCTION;

            // If it has notes but no type, maybe observation? 
            // For now default to null to force user review as per requirements
            return null;
        },

        // Internal Helper: Ensure status is valid for current data
        _validateStatus(point) {
            // If category is removed (set to null), downgrade status from Surveyed
            if (!point.category && point.workflowStatus !== POINT_WORKFLOW_STATUS.DRAFT) {
                point.workflowStatus = POINT_WORKFLOW_STATUS.DRAFT;
            }
        },

        // Helper to check completion (can be used by components)
        isPointComplete(point) {
            return point && point.workflowStatus === POINT_WORKFLOW_STATUS.SURVEYED;
        },

        setSearchQuery(query) {
            this.filters.search = query;
        },

        setSort(sortBy) {
            this.filters.sortBy = sortBy;
        }
    }
});
