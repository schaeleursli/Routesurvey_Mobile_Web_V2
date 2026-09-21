import axios from "axios";
import Cookies from "js-cookie";

const baseURL = import.meta.env.VITE_CRM_API_URL || import.meta.env.VITE_FASTAPI_URL || "http://localhost:8002";

const crmApiClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json"
  }
});

crmApiClient.interceptors.request.use((config) => {
  const token = Cookies.get("l_t");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

crmApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env.DEV) {
      console.error("[CRM API]", error.response?.status, error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export default crmApiClient;
