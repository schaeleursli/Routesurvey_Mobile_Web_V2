import { ref, computed } from "vue";
import notificationsController from "@/controllers/notifications/notifications_controller";

export function useNotifications() {
  const notifications = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const activeNotifications = computed(() =>
    notifications.value.filter((notification) => notification.active)
  );

  const fetchNotifications = async (userId = null) => {
    loading.value = true;
    error.value = null;

    try {
      let response;
      if (userId) {
        response = await notificationsController.getNotificationsForUser(
          userId
        );
      } else {
        response = await notificationsController.getCurrentUserNotifications();
      }

      if (response.result) {
        notifications.value = response.data || [];
        // filteredNotifications.value = response.data || [];
      } else {
        error.value = response.message || "Failed to load notifications";
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      error.value = "Failed to load notifications";
    } finally {
      loading.value = false;
    }
  };

  const sendSingleNotification = async (data) => {
    try {
      const response = await notificationsController.sendSingleNotification(
        data
      );
      if (response.result) {
        // Refresh notifications after sending
        await fetchNotifications();
      }
      return response;
    } catch (err) {
      console.error("Error sending single notification:", err);
      return {
        result: false,
        message: "Failed to send notification",
      };
    }
  };

  const sendMultiNotification = async (data) => {
    try {
      const response = await notificationsController.sendMultiNotification(
        data
      );
      if (response.result) {
        // Refresh notifications after sending
        await fetchNotifications();
      }
      return response;
    } catch (err) {
      console.error("Error sending multi notification:", err);
      return {
        result: false,
        message: "Failed to send notification",
      };
    }
  };

  const logNotification = async (data) => {
    try {
      const response = await notificationsController.logNotification(data);
      if (response.result) {
        // Refresh notifications after logging
        await fetchNotifications();
      }
      return response;
    } catch (err) {
      console.error("Error logging notification:", err);
      return {
        result: false,
        message: "Failed to log notification",
      };
    }
  };

  return {
    notifications,
    loading,
    error,
    activeNotifications,
    fetchNotifications,
    sendSingleNotification,
    sendMultiNotification,
    logNotification,
  };
}
