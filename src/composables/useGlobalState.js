import { ref, provide } from "vue";

export const useGlobalState = () => {
  const globalLoading = ref(false);
  const messageBox = ref({ visible: false, status: "info", message: "" });
  let messageTimeout = null;

  const setGlobalLoading = (val) => {
    globalLoading.value = val;
  };

  const showMessage = ({ status = "info", message = "", duration = 3000 }) => {
    messageBox.value = { visible: true, status, message };
    if (messageTimeout) clearTimeout(messageTimeout);
    messageTimeout = setTimeout(() => {
      messageBox.value.visible = false;
    }, duration);
  };

  // Provide these values globally
  provide("setGlobalLoading", setGlobalLoading);
  provide("showMessage", showMessage);

  return {
    globalLoading,
    messageBox,
    setGlobalLoading,
    showMessage,
  };
};
