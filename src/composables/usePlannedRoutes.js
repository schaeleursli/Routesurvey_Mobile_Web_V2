import { ref } from "vue";
import PlannedRoutesController from "@/controllers/planned_routes/planned_routes_controller";

// Select the appropriate backend based on environment toggle
const Backend = PlannedRoutesController;

export function usePlannedRoutes() {
  const plannedRoutes = ref([]);
  const archivedPlannedRoutes = ref([]);
  const selectedPlannedRoute = ref(null);
  const selectedPlannedRouteId = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Form state for add planned route
  const addForm = ref({
    SurveyName: "",
    SurveyDate: "",
    SurveyStart: null, // String for location display name
    SurveyEnd: null, // String for location display name
    ClientName: "",
    SurveyInstructions: "",
    CargoType: "",
    CargoWeight: "",
    CargoLength: "",
    CargoWidth: "",
    CargoHeight: "",
    CargoNotes: "",
    TrailerType: "",
    TrailerLength: "",
    TrailerNotes: "",
    SurveyType: "Route Survey", // Default to Route Survey
    ToolsUsed: "",
    PrimeMoverType: "",
    PrimeMoverLength: "",
    PrimeMoverNotes: "",
    RouteData: null, // New field for route data
  });

  // Form state for edit planned route
  const editForm = ref({
    SurveyName: "",
    SurveyDate: "",
    SurveyStart: null, // String for location display name
    SurveyEnd: null, // String for location display name
    ClientName: "",
    SurveyInstructions: "",
    CargoType: "",
    CargoWeight: "",
    CargoLength: "",
    CargoWidth: "",
    CargoHeight: "",
    CargoNotes: "",
    TrailerType: "",
    TrailerLength: "",
    TrailerNotes: "",
    SurveyType: "",
    ToolsUsed: "",
    PrimeMoverType: "",
    PrimeMoverLength: "",
    PrimeMoverNotes: "",
    RouteData: null, // New field for route data
  });

  // Validation for add form
  const validateAddForm = () => {
    if (!addForm.value.SurveyName)
      return {
        valid: false,
        field: "SurveyName",
        message: "Survey name is required",
      };
    // if (!addForm.value.SurveyDate)
    //   return {
    //     valid: false,
    //     field: "SurveyDate",
    //     message: "Survey date is required",
    //   };
    // if (!addForm.value.ClientName)
    //   return {
    //     valid: false,
    //     field: "ClientName",
    //     message: "Client name is required",
    //   };
    // if (!addForm.value.SurveyInstructions)
    //   return {
    //     valid: false,
    //     field: "SurveyInstructions",
    //     message: "Survey instructions are required",
    //   };
    // if (!addForm.value.CargoType)
    //   return {
    //     valid: false,
    //     field: "CargoType",
    //     message: "Cargo type is required",
    //   };
    // if (!addForm.value.CargoWeight)
    //   return {
    //     valid: false,
    //     field: "CargoWeight",
    //     message: "Cargo weight is required",
    //   };
    // if (!addForm.value.CargoLength)
    //   return {
    //     valid: false,
    //     field: "CargoLength",
    //     message: "Cargo length is required",
    //   };
    // if (!addForm.value.CargoWidth)
    //   return {
    //     valid: false,
    //     field: "CargoWidth",
    //     message: "Cargo width is required",
    //   };
    // if (!addForm.value.CargoHeight)
    //   return {
    //     valid: false,
    //     field: "CargoHeight",
    //     message: "Cargo height is required",
    //   };
    // if (!addForm.value.CargoNotes)
    //   return {
    //     valid: false,
    //     field: "CargoNotes",
    //     message: "Cargo notes are required",
    //   };
    // if (!addForm.value.TrailerType)
    //   return {
    //     valid: false,
    //     field: "TrailerType",
    //     message: "Trailer type is required",
    //   };
    // if (!addForm.value.TrailerLength)
    //   return {
    //     valid: false,
    //     field: "TrailerLength",
    //     message: "Trailer length is required",
    //   };
    // if (!addForm.value.TrailerNotes)
    //   return {
    //     valid: false,
    //     field: "TrailerNotes",
    //     message: "Trailer notes are required",
    //   };
    return { valid: true };
  };

  // Validation for edit form
  const validateEditForm = () => {
    if (!editForm.value.SurveyName)
      return {
        valid: false,
        field: "SurveyName",
        message: "Survey name is required",
      };
    // if (!editForm.value.SurveyDate)
    //   return {
    //     valid: false,
    //     field: "SurveyDate",
    //     message: "Survey date is required",
    //   };
    // if (!editForm.value.ClientName)
    //   return {
    //     valid: false,
    //     field: "ClientName",
    //     message: "Client name is required",
    //   };
    // if (!editForm.value.SurveyInstructions)
    //   return {
    //     valid: false,
    //     field: "SurveyInstructions",
    //     message: "Survey instructions are required",
    //   };
    // if (!editForm.value.CargoType)
    //   return {
    //     valid: false,
    //     field: "CargoType",
    //     message: "Cargo type is required",
    //   };
    // if (!editForm.value.CargoWeight)
    //   return {
    //     valid: false,
    //     field: "CargoWeight",
    //     message: "Cargo weight is required",
    //   };
    // if (!editForm.value.CargoLength)
    //   return {
    //     valid: false,
    //     field: "CargoLength",
    //     message: "Cargo length is required",
    //   };
    // if (!editForm.value.CargoWidth)
    //   return {
    //     valid: false,
    //     field: "CargoWidth",
    //     message: "Cargo width is required",
    //   };
    // if (!editForm.value.CargoHeight)
    //   return {
    //     valid: false,
    //     field: "CargoHeight",
    //     message: "Cargo height is required",
    //   };
    // if (!editForm.value.CargoNotes)
    //   return {
    //     valid: false,
    //     field: "CargoNotes",
    //     message: "Cargo notes are required",
    //   };
    // if (!editForm.value.TrailerType)
    //   return {
    //     valid: false,
    //     field: "TrailerType",
    //     message: "Trailer type is required",
    //   };
    // if (!editForm.value.TrailerLength)
    //   return {
    //     valid: false,
    //     field: "TrailerLength",
    //     message: "Trailer length is required",
    //   };
    // if (!editForm.value.TrailerNotes)
    //   return {
    //     valid: false,
    //     field: "TrailerNotes",
    //     message: "Trailer notes are required",
    //   };
    return { valid: true };
  };

  // Clear form methods
  const clearAddForm = () => {
    addForm.value = {
      SurveyName: "",
      SurveyDate: "",
      SurveyStart: null,
      SurveyEnd: null,
      ClientName: "",
      SurveyInstructions: "",
      CargoType: "",
      CargoWeight: "",
      CargoLength: "",
      CargoWidth: "",
      CargoHeight: "",
      CargoNotes: "",
      TrailerType: "",
      TrailerLength: "",
      TrailerNotes: "",
      SurveyType: "Route Survey",
      ToolsUsed: "",
      PrimeMoverType: "",
      PrimeMoverLength: "",
      PrimeMoverNotes: "",
      RouteData: null,
    };
  };

  const clearEditForm = () => {
    editForm.value = {
      SurveyName: "",
      SurveyDate: "",
      SurveyStart: null,
      SurveyEnd: null,
      ClientName: "",
      SurveyInstructions: "",
      CargoType: "",
      CargoWeight: "",
      CargoLength: "",
      CargoWidth: "",
      CargoHeight: "",
      CargoNotes: "",
      TrailerType: "",
      TrailerLength: "",
      TrailerNotes: "",
      SurveyType: "",
      ToolsUsed: "",
      PrimeMoverType: "",
      PrimeMoverLength: "",
      PrimeMoverNotes: "",
      RouteData: null,
    };
    selectedPlannedRouteId.value = null;
  };

  // Set edit form data from selected route
  const setEditFormData = (route) => {
    if (route) {
      editForm.value = {
        SurveyName: route.SurveyName || "",
        SurveyDate: route.SurveyDate ? route.SurveyDate.split("T")[0] : "",
        SurveyStart: route.SurveyStart || null,
        SurveyEnd: route.SurveyEnd || null,
        ClientName: route.ClientName || "",
        SurveyInstructions: route.SurveyInstructions || "",
        CargoType: route.CargoType || "",
        CargoWeight: route.CargoWeight || "",
        CargoLength: route.CargoLength || "",
        CargoWidth: route.CargoWidth || "",
        CargoHeight: route.CargoHeight || "",
        CargoNotes: route.CargoNotes || "",
        TrailerType: route.TrailerType || "",
        TrailerLength: route.TrailerLength || "",
        TrailerNotes: route.TrailerNotes || "",
        SurveyType: route.SurveyType || "Route Survey",
        ToolsUsed: route.ToolsUsed || "",
        PrimeMoverType: route.PrimeMoverType || "",
        PrimeMoverLength: route.PrimeMoverLength || "",
        PrimeMoverNotes: route.PrimeMoverNotes || "",
        RouteData: route.RouteData || null,
      };
      selectedPlannedRouteId.value = route.id;
    }
  };

  // Fetch all planned routes
  const fetchPlannedRoutes = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await Backend.getCurrentUserPlannedRoutes();
      plannedRoutes.value = res || [];

      if (plannedRoutes.value.length === 0) {
        plannedRoutes.value = [];
      }

      // Auto-select the first route if available
      if (plannedRoutes.value.length > 0 && !selectedPlannedRouteId.value) {
        selectedPlannedRouteId.value = plannedRoutes.value[0].id;
        await fetchPlannedRoute(selectedPlannedRouteId.value);
      }
    } catch (e) {
      error.value = e;
    } finally {
      loading.value = false;
    }
  };

  // Fetch archived planned routes
  const fetchArchivedPlannedRoutes = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await Backend.getArchivedPlannedRoutes();
      archivedPlannedRoutes.value = res || [];
    } catch (e) {
      error.value = e;
    } finally {
      loading.value = false;
    }
  };

  // Fetch a specific planned route
  const fetchPlannedRoute = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      selectedPlannedRouteId.value = id;

      const res = await Backend.getPlannedRoute(id);
      if (res.result) {
        const parsedData = JSON.parse(res.data.data);
        selectedPlannedRoute.value = {
          ...res.data,
          ...parsedData,
        };
      } else {
        selectedPlannedRoute.value = null;
        error.value = res.message;
      }
    } catch (e) {
      error.value = e;
      selectedPlannedRoute.value = null;
    } finally {
      loading.value = false;
    }
  };

  // Fetch current user's planned routes
  const fetchCurrentUserPlannedRoutes = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await Backend.getCurrentUserPlannedRoutes();
      plannedRoutes.value = res || [];

      if (plannedRoutes.value.length === 0) {
        plannedRoutes.value = [];
      }

      // Auto-select the first route if available
      if (plannedRoutes.value.length > 0 && !selectedPlannedRouteId.value) {
        selectedPlannedRouteId.value = plannedRoutes.value[0].id;
        await fetchPlannedRoute(selectedPlannedRouteId.value);
      }
    } catch (e) {
      error.value = e;
    } finally {
      loading.value = false;
    }
  };

  // Add a new planned route
  const addPlannedRoute = async (data) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await Backend.addPlannedRoute(data);
      // console.log(res);
      if (res.result) {
        await fetchPlannedRoutes(); // Refresh the list
        return { success: true, message: res.message, data: res.data };
      } else {
        error.value = res.message;
        return { success: false, message: res.message };
      }
    } catch (e) {
      console.log(e);
      error.value = e;
      return { success: false, message: "Failed to add planned route" };
    } finally {
      loading.value = false;
    }
  };

  // Update a planned route
  const updatePlannedRoute = async (id, data) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await Backend.updatePlannedRoute(id, data);
      if (res.result) {
        await fetchPlannedRoutes(); // Refresh the list
        return { success: true, message: res.message };
      } else {
        error.value = res.message;
        return { success: false, message: res.message };
      }
    } catch (e) {
      console.log(e);
      error.value = e;
      return { success: false, message: "Failed to update planned route" };
    } finally {
      loading.value = false;
    }
  };

  // Delete a planned route
  const deletePlannedRoute = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await Backend.deletePlannedRoute(id);
      if (res.result) {
        await fetchPlannedRoutes(); // Refresh the list
        return { success: true, message: res.message };
      } else {
        error.value = res.message;
        return { success: false, message: res.message };
      }
    } catch (e) {
      console.log(e);
      error.value = e;
      return { success: false, message: "Failed to delete planned route" };
    } finally {
      loading.value = false;
    }
  };

  // Archive a planned route
  const archivePlannedRoute = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await Backend.archivePlannedRoute(id);
      if (res.result) {
        await fetchPlannedRoutes(); // Refresh the list
        return { success: true, message: res.message };
      } else {
        error.value = res.message;
        return { success: false, message: res.message };
      }
    } catch (e) {
      console.log(e);
      error.value = e;
      return { success: false, message: "Failed to archive planned route" };
    } finally {
      loading.value = false;
    }
  };

  // Unarchive a planned route
  const unarchivePlannedRoute = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await Backend.unarchivePlannedRoute(id);
      if (res.result) {
        await fetchPlannedRoutes(); // Refresh the list
        return { success: true, message: res.message };
      } else {
        error.value = res.message;
        return { success: false, message: res.message };
      }
    } catch (e) {
      console.log(e);
      error.value = e;
      return { success: false, message: "Failed to unarchive planned route" };
    } finally {
      loading.value = false;
    }
  };

  // Update route data
  const updateRouteData = async (routeId, data) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await Backend.updateRouteData(routeId, data);
      if (res.result) {
        if (selectedPlannedRouteId.value === routeId) {
          await fetchPlannedRoute(routeId); // Refresh the selected route
        }
        return { success: true, message: res.message };
      } else {
        error.value = res.message;
        return { success: false, message: res.message };
      }
    } catch (e) {
      error.value = e;
      return { success: false, message: "Failed to update route data" };
    } finally {
      loading.value = false;
    }
  };

  // Get route data
  const getRouteData = async (routeId) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await Backend.getRouteData(routeId);
      if (res.result) {
        return { success: true, message: res.message, data: res.data };
      } else {
        error.value = res.message;
        return { success: false, message: res.message };
      }
    } catch (e) {
      error.value = e;
      return { success: false, message: "Failed to get route data" };
    } finally {
      loading.value = false;
    }
  };

  // Select a planned route
  const selectPlannedRoute = async (id) => {
    await fetchPlannedRoute(id);
  };

  // Clear selected route
  const clearSelectedRoute = () => {
    selectedPlannedRouteId.value = null;
    selectedPlannedRoute.value = null;
  };

  // Clear error
  const clearError = () => {
    error.value = null;
  };

  return {
    plannedRoutes,
    archivedPlannedRoutes,
    selectedPlannedRoute,
    selectedPlannedRouteId,
    loading,
    error,
    addForm,
    editForm,
    validateAddForm,
    validateEditForm,
    clearAddForm,
    clearEditForm,
    setEditFormData,
    fetchPlannedRoutes,
    fetchArchivedPlannedRoutes,
    fetchPlannedRoute,
    fetchCurrentUserPlannedRoutes,
    addPlannedRoute,
    updatePlannedRoute,
    deletePlannedRoute,
    archivePlannedRoute,
    unarchivePlannedRoute,
    updateRouteData,
    getRouteData,
    selectPlannedRoute,
    clearSelectedRoute,
    clearError,
  };
}
