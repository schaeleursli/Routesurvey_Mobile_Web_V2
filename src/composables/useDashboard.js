import { ref, computed } from "vue";
import StatsController from "@/controllers/stats/stats_controller";
import { useAuthStore } from '@/stores/auth';
import ReportGenerationsController from "@/controllers/report_generations/report_generations_controller";
import RoutesController from "@/controllers/routes/routes_controller";
import PlannedRoutesController from "@/controllers/planned_routes/planned_routes_controller";

export function useDashboard() {
  const loading = ref(false);
  const error = ref(null);

  // Raw data from stats endpoint
  const statsData = ref({
    plannedRoutes: 0,
    surveyedRoutes: 0,
    reportedRoutes: 0,
    sharedRoutes: 0,
    dashboardRoutes: [],
  });

  // Statistics
  const stats = computed(() => {
    const data = statsData.value;

    return {
      planned: {
        count: data.plannedRoutes,
        change: 0, // Stats endpoint doesn't provide historical data for changes
        changeType: "neutral",
      },
      surveyed: {
        count: data.surveyedRoutes,
        change: 0, // Stats endpoint doesn't provide historical data for changes
        changeType: "neutral",
      },
      reported: {
        count: data.reportedRoutes,
        change: 0, // Stats endpoint doesn't provide historical data for changes
        changeType: "neutral",
      },
      shared: {
        count: data.sharedRoutes,
        change: 0, // Stats endpoint doesn't provide historical data for changes
        changeType: "neutral",
      },
    };
  });

  // Recent routes for the table
  const recentRoutes = computed(() => {
    // console.log("statsData.value", statsData.value);
    const dashboardRoutes = statsData.value.dashboardRoutes || [];

    // Map dashboard routes to the expected format
    const allRoutes = dashboardRoutes.map((route) => ({
      id: route.id,
      name: route.name || route.title || "Unnamed Route",
      startLocation: formatLocation(route.startLocation || route.start),
      endLocation: formatLocation(route.endLocation || route.end),
      distance: route.distance ? Number(route.distance) : 0, // Return raw distance in meters
      status: route.status || "planned",
      updatedAt:
        route.dateUpdated || route.createdAt || new Date().toISOString(),
      type: route.type || "planned",
    }));

    // Sort by updated date (most recent first) and take first 5
    return allRoutes
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);
  });

  // Get all routes (not limited to 5)
  const allDashboardRoutes = computed(() => {
    const dashboardRoutes = statsData.value.dashboardRoutes || [];

    // Map dashboard routes to the expected format
    return dashboardRoutes.map((route) => ({
      id: route.id,
      name: route.name || route.title || "Unnamed Route",
      startLocation: formatLocation(route.startLocation || route.start),
      endLocation: formatLocation(route.endLocation || route.end),
      distance: route.distance ? Number(route.distance) : 0, // Return raw distance in meters
      status: route.status || "planned",
      updatedAt:
        route.dateUpdated || route.createdAt || new Date().toISOString(),
      type: route.type || "planned",
    }));
  });

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    // loading.value = true;
    error.value = null;

    const authStore = useAuthStore();

    try {
      // Ensure user profile is loaded
      if (!authStore.user) {
        await authStore.fetchUserProfile();
      }

      const currentUserData = authStore.user;

      if (currentUserData) {
        // console.log("currentUserData", currentUserData);
        if (currentUserData.type === "Admin") {
          // const statsResponse = await StatsController.getCurrentUserStats();
          const statsResponse = await StatsController.getAllStats();

          if (statsResponse) {
            // Map the response to our expected structure with camelCase properties
            let dashboardRoutes = statsResponse.dashboardRoutes || [];

            // Check each route for generated reports and update status to "Reported" if reports exist
            const reportChecks = dashboardRoutes.map(async (route) => {
              try {
                const reports = await ReportGenerationsController.getReportGenerations(route.id);
                if (reports && reports.length > 0) {
                  // Check if there's at least one successful report
                  const hasSuccessfulReport = reports.some(r => r.status === 'Success');
                  if (hasSuccessfulReport) {
                    route.status = 'Reported';
                  }
                }
              } catch (error) {
                // Silently fail for individual route report checks
                console.debug(`Error checking reports for route ${route.id}:`, error);
              }
            });

            // Wait for all report checks to complete
            await Promise.allSettled(reportChecks);

            statsData.value = {
              plannedRoutes: statsResponse.plannedRoutes || 0,
              surveyedRoutes: statsResponse.surveyedRoutes || 0,
              reportedRoutes: statsResponse.reportedRoutes || 0,
              sharedRoutes: statsResponse.sharedRoutes || 0,
              dashboardRoutes: dashboardRoutes,
            };
          } else {
            // Reset to default values if no data received
            statsData.value = {
              plannedRoutes: 0,
              surveyedRoutes: 0,
              reportedRoutes: 0,
              sharedRoutes: 0,
              dashboardRoutes: [],
            };
          }
        } else if (currentUserData.type === "User") {
          const statsResponse = await StatsController.getCurrentUserStats();
          // const statsResponse = await StatsController.getAllStats();

          if (statsResponse) {
            // ... existing code ...
            // Map the response to our expected structure with camelCase properties
            let dashboardRoutes = statsResponse.dashboardRoutes || [];

            // Check each route for generated reports and update status to "Reported" if reports exist
            const reportChecks = dashboardRoutes.map(async (route) => {
              try {
                const reports = await ReportGenerationsController.getReportGenerations(route.id);
                if (reports && reports.length > 0) {
                  // Check if there's at least one successful report
                  const hasSuccessfulReport = reports.some(r => r.status === 'Success');
                  if (hasSuccessfulReport) {
                    route.status = 'Reported';
                  }
                }
              } catch (error) {
                // Silently fail for individual route report checks
                console.debug(`Error checking reports for route ${route.id}:`, error);
              }
            });

            // Wait for all report checks to complete
            await Promise.allSettled(reportChecks);

            statsData.value = {
              plannedRoutes: statsResponse.plannedRoutes || 0,
              surveyedRoutes: statsResponse.surveyedRoutes || 0,
              reportedRoutes: statsResponse.reportedRoutes || 0,
              sharedRoutes: statsResponse.sharedRoutes || 0,
              dashboardRoutes: dashboardRoutes,
            };

          } else {
            // Reset to default values if no data received
            statsData.value = {
              plannedRoutes: 0,
              surveyedRoutes: 0,
              reportedRoutes: 0,
              sharedRoutes: 0,
              dashboardRoutes: [],
            };
          }
        }
      }
    } catch (err) {
      error.value = err.message || "Failed to fetch dashboard data";
      console.error("Dashboard data fetch error:", err);
    } finally {
      // loading.value = false;
    }
  };

  // Format location for display (handles both string and object formats)
  const formatLocation = (location) => {
    if (!location) return "Unknown";

    // Handle string format (legacy)
    if (typeof location === "string") {
      // Check if it's a JSON string that needs parsing
      try {
        const parsed = JSON.parse(location);
        if (parsed && typeof parsed === "object" && parsed.display_name) {
          return parsed.display_name;
        }
      } catch {
        // Not JSON, return as string
        return location;
      }
      return location;
    }

    // Handle object format (new)
    if (typeof location === "object" && location.display_name) {
      return location.display_name;
    }

    return "Unknown";
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);

    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return `${dateStr}<br/>${timeStr}`;
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case "planned":
        return "planned";
      case "surveyed":
        return "surveyed";
      case "reported":
      case "completed":
        return "reported";
      case "shared":
        return "shared";
      default:
        return "planned";
    }
  };

  // Fetch a route by ID and add it to dashboard routes if not already present
  const fetchAndAddRoute = async (routeId) => {
    if (!routeId) return false;

    // Check if route already exists in dashboard routes
    const existingRoute = statsData.value.dashboardRoutes.find(
      (r) => String(r.id) === String(routeId)
    );
    if (existingRoute) {
      return true; // Route already exists
    }

    try {
      // Try to fetch as surveyed route first
      let routeResponse = await RoutesController.getRoute(routeId);
      let routeData = null;
      let routeType = "surveyed";

      if (routeResponse && routeResponse.result) {
        routeData = routeResponse.data;
      } else {
        // Try planned route
        routeResponse = await PlannedRoutesController.getPlannedRoute(routeId);
        if (routeResponse && routeResponse.result) {
          routeData = routeResponse.data;
          routeType = "planned";
        } else {
        }
      }

      if (routeData) {
        // Transform route data to match dashboard route format
        // Use current date for dateUpdated to ensure it appears in recent routes
        const now = new Date().toISOString();
        const dashboardRoute = {
          id: routeData.id || routeData.Id || routeId,
          name: routeData.name || routeData.title || routeData.Title || "Unnamed Route",
          startLocation: routeData.startLocation || routeData.start || routeData.Start || routeData.SurveyStart,
          endLocation: routeData.endLocation || routeData.end || routeData.End || routeData.SurveyEnd,
          distance: routeData.distance || routeData.Distance || 0,
          status: routeType === "planned" ? "planned" : routeType === "manual" ? "manual" : "surveyed",
          dateUpdated: now, // Always use current date so it appears at the top
          createdAt: routeData.createdAt || routeData.created_at || routeData.CreatedAt || now,
          type: routeType,
        };

        // Check for reports to determine if status should be "Reported"
        try {
          const reports = await ReportGenerationsController.getReportGenerations(dashboardRoute.id);
          if (reports && reports.length > 0) {
            const hasSuccessfulReport = reports.some((r) => r.status === "Success");
            if (hasSuccessfulReport) {
              dashboardRoute.status = "Reported";
            }
          }
        } catch (error) {
          // Silently fail for report check
          console.debug(`Error checking reports for route ${dashboardRoute.id}:`, error);
        }

        // Add route to dashboard routes (prepend to show it first)
        statsData.value.dashboardRoutes = [
          dashboardRoute,
          ...statsData.value.dashboardRoutes,
        ];

        return true;
      }
    } catch (error) {
      console.error(`Error fetching route ${routeId}:`, error);
      return false;
    }

    return false;
  };

  // Check if a route exists in dashboard routes
  const routeExistsInDashboard = (routeId) => {
    if (!routeId) return false;
    return statsData.value.dashboardRoutes.some(
      (r) => String(r.id) === String(routeId)
    );
  };

  return {
    loading,
    error,
    stats,
    recentRoutes,
    allDashboardRoutes,
    fetchDashboardData,
    fetchAndAddRoute,
    routeExistsInDashboard,
    formatLocation,
    formatDate,
    getStatusClass,
  };
}
