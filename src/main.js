import { createApp } from "vue";
import { createPinia } from 'pinia';
// import "./style.css";
import App from "./App.vue";
import router from "./router";

// Import global design system
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.css";

// Import global design system (Must be after frameworks to override)
import "./assets/css/design-system.css";
import "./assets/css/utilities.css";

import "viewerjs/dist/viewer.css";
import VueViewer from "v-viewer";
import PhosphorIcons from "@/plugins/phosphor";

// Import PrimeVue
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import "primeicons/primeicons.css";

import axios from "axios";
import VueAxios from "vue-axios";
import Cookies from "js-cookie";
import i18n from "@/core/plugins/i18n";

// Import axios interceptors for automatic token refresh
import "@/utils/axios-interceptors";

// Import token manager for monitoring token expiration
import tokenManager from "@/utils/token-manager";

// Import CSRF manager for CSRF protection
import csrfManager from "@/utils/csrf-manager";

const app = createApp(App);

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

// Initialize authentication and CSRF protection
const initializeSecurity = async () => {
  // Initialize CSRF protection first
  try {
    await csrfManager.init();
    console.log("CSRF protection initialized");
  } catch (error) {
    console.warn("CSRF protection not available:", error);
  }

  // Initialize authentication if user is logged in
  if (Cookies.get("l_t")) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${Cookies.get(
      "l_t"
    )}`;
    axios.defaults.headers.common["Accept"] = "application/json";

    // Initialize token monitoring if user is authenticated
    tokenManager.init();
  }
};

// Initialize security before mounting the app
const mountApp = () => {
  initializeSecurity().finally(() => {

    // Initialize theme from localStorage or default to light
    const initializeTheme = () => {
      const savedTheme = localStorage.getItem("theme") || "light";
      document.documentElement.setAttribute("data-bs-theme", savedTheme);
      return savedTheme;
    };

    // Initialize theme before PrimeVue setup
    initializeTheme();

    app.use(PrimeVue, {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '[data-bs-theme="dark"]',
        },
      },
    });

    app.use(i18n);

    app.use(VueAxios, axios);

    app.use(VueViewer);
    app.use(PhosphorIcons);

    app.use(createPinia());

    app.use(router);

    // Provide global helpers to prevent injection warnings/errors
    app.provide('showMessage', (options) => console.log('Global Message:', options));
    app.provide('setGlobalLoading', (isLoading) => console.log('Global Loading:', isLoading));

    app.mount("#app");
  });
};

mountApp();
