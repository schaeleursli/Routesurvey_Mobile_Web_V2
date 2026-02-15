import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { validateTransport } from '@/utils/planning_validation';
import PlannedRoutesController from '@/controllers/planned_routes/planned_routes_controller';

export const usePlanningStore = defineStore('planning', () => {
    // --- STATE ---

    // 1. Project Context
    const project = ref({
        clientName: '',
        jobReference: '',
        date: new Date().toISOString().split('T')[0]
    });

    // 2. Cargo
    // Future support for multiple items, currently single active item for MVP
    const cargo = ref({
        name: '',
        weight_kg: null,
        length_m: null,
        width_m: null,
        height_m: null,
        cog_x: 0, // Longitudinal
        cog_y: 0, // Transverse
        cog_z: 0, // Vertical
        notes: ''
    });

    // 3. Equipment
    const equipment = ref({
        primeMover: {
            name: '',
            registration: '',
            tare_weight_kg: 8000 // default assumption
        },
        trailer: {
            name: '',
            type: 'Modular', // Modular, Lowbed, SPMT
            num_axles: 6,
            width_m: 2.5,
            length_m: 12.0, // Total trailer length
            deck_length_m: 10.0,
            deck_height_m: 0.9,
            tare_weight_kg: 12000
        }
    });

    // 4. Route (Matches PlannedRouteMapRefactored structure)
    const routeData = ref({
        startPoint: null,
        endPoint: null,
        waypoints: [],
        routePath: [],
        routeInfo: null // { distance, duration }
    });

    // 5. App State
    const currentStep = ref(1); // 1=Concept, 2=Cargo, 3=Equip, 4=Route, 5=Review
    const validationResult = ref({ isValid: true, status: 'valid', messages: [], metrics: {} });

    // --- COMPUTED ---

    // Real-time metrics from validation
    const totalWeight = computed(() => {
        // Calculate based on store state if validation hasn't run, or use validation result
        const cargoW = cargo.value.weight_kg || 0;
        const trailerW = equipment.value.trailer?.tare_weight_kg || 0;
        const primeW = equipment.value.primeMover?.tare_weight_kg || 0;
        return cargoW + trailerW; // Trailer Load
    });
    const totalHeight = computed(() => validationResult.value.metrics?.totalHeight_m || 0);
    const totalLength = computed(() => validationResult.value.metrics?.totalLength_m || 0);
    const totalWidth = computed(() => validationResult.value.metrics?.totalWidth_m || 0);
    const axleLoad = computed(() => validationResult.value.metrics?.axleLoad_kg || 0);

    const hasCriticalErrors = computed(() => {
        return validationResult.value.status === 'error';
    });

    // --- ACTIONS ---

    function runValidation() {
        validationResult.value = validateTransport(cargo.value, equipment.value);
    }

    function resetPlan() {
        project.value = { clientName: '', jobReference: '', date: new Date().toISOString().split('T')[0] };
        cargo.value = { name: '', weight_kg: null, length_m: null, width_m: null, height_m: null, cog_x: 0, cog_y: 0, cog_z: 0, notes: '' };
        // Reset to sensible defaults for equipment
        equipment.value.trailer = {
            name: 'Generic 6-Axle',
            type: 'Modular',
            num_axles: 6,
            width_m: 2.5,
            length_m: 12.0,
            deck_length_m: 10.0,
            deck_height_m: 0.9,
            tare_weight_kg: 12000
        };
        currentStep.value = 1;
        runValidation();
    }

    // --- PERSISTENCE ---
    const STORAGE_KEY = 'rs_planning_v2_draft'; // Version 2

    function loadFromStorage() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.project) project.value = parsed.project;
                if (parsed.cargo) cargo.value = parsed.cargo;
                if (parsed.equipment) equipment.value = parsed.equipment;
                if (parsed.routeData) routeData.value = parsed.routeData;
            } catch (e) {
                console.error('Failed to load planning draft', e);
            }
        }
    }

    // Load immediately
    loadFromStorage();
    // Run initial validation
    runValidation();

    // Auto-save & Auto-validate
    watch([project, cargo, equipment, routeData], () => {
        runValidation();

        const stateToSave = {
            project: project.value,
            cargo: cargo.value,
            equipment: equipment.value,
            routeData: routeData.value
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }, { deep: true });

    // --- API INTEGRATION ---

    // Map Store State to API Payload
    function mapStateToApiPayload() {
        return {
            SurveyName: (project.value.clientName || 'Untitled Project') + (project.value.jobReference ? ` - ${project.value.jobReference}` : ''),
            SurveyDate: project.value.date,
            ClientName: project.value.clientName,
            SurveyInstructions: 'Generated via Transport Engineer',
            SurveyStart: routeData.value.startPoint?.address || 'Unknown Start',
            SurveyEnd: routeData.value.endPoint?.address || 'Unknown End',

            // Cargo
            CargoType: cargo.value.name || 'General Cargo',
            CargoWeight: cargo.value.weight_kg,
            CargoLength: cargo.value.length_m,
            CargoWidth: cargo.value.width_m,
            CargoHeight: cargo.value.height_m,
            CargoNotes: cargo.value.notes,

            // Equipment
            TrailerType: equipment.value.trailer.type,
            TrailerLength: equipment.value.trailer.length_m,
            TrailerNotes: `${equipment.value.trailer.num_axles}-Axle ${equipment.value.trailer.name}`,

            // Route
            Distance: routeData.value.routeInfo?.distance || 0,

            // Map Data
            RouteData: JSON.stringify({
                pointsData: [
                    ...(routeData.value.startPoint ? [{ ...routeData.value.startPoint, id: 'start', type: 'start' }] : []),
                    ...routeData.value.waypoints.map((wp, i) => ({ ...wp, id: `wp${i}`, type: 'waypoint' })),
                    ...(routeData.value.endPoint ? [{ ...routeData.value.endPoint, id: 'end', type: 'end' }] : [])
                ]
            }),

            // Legacy Fields for view compatibility
            startLocation: routeData.value.startPoint ? { ...routeData.value.startPoint, display_name: routeData.value.startPoint.address } : null,
            endLocation: routeData.value.endPoint ? { ...routeData.value.endPoint, display_name: routeData.value.endPoint.address } : null,
            routePath: routeData.value.routePath || []
        };
    }

    async function savePlan() {
        const payload = mapStateToApiPayload();
        try {
            const res = await PlannedRoutesController.addPlannedRoute(payload);
            return res;
        } catch (error) {
            console.error('Failed to save plan:', error);
            return { result: false, message: error.message || 'Unknown error occurred' };
        }
    }

    return {
        // State
        project,
        cargo,
        equipment,
        routeData,
        currentStep,
        validationResult,

        // Metrics
        totalWeight,
        totalHeight,
        totalLength,
        totalWidth,
        axleLoad,
        hasCriticalErrors,

        // Actions
        runValidation,
        resetPlan,
        savePlan
    };
});
