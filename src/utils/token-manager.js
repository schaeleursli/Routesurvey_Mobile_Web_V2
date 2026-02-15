import Cookies from "js-cookie";
import { useAuthStore } from "@/stores/auth";

class TokenManager {
  constructor() {
    this.refreshThreshold = 5 * 60 * 1000; // 5 minutes before expiry
    this.checkInterval = null;
  }

  // Start monitoring token expiration
  startTokenMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.checkTokenExpiration();
    }, 60000); // Check every minute
  }

  // Stop monitoring token expiration
  stopTokenMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Check if token is about to expire and refresh if needed
  async checkTokenExpiration() {
    const token = Cookies.get("l_t");
    if (!token) {
      this.stopTokenMonitoring();
      return;
    }

    try {
      // Decode JWT token to get expiration time
      const payload = this.decodeJWT(token);
      if (!payload || !payload.exp) {
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = (payload.exp - now) * 1000; // Convert to milliseconds

      // If token expires within the threshold, refresh it
      if (timeUntilExpiry <= this.refreshThreshold) {
        console.log("Token expiring soon, refreshing...");
        const authStore = useAuthStore();
        await authStore.refreshToken();
      }
    } catch (error) {
      console.error("Error checking token expiration:", error);
    }
  }

  // Decode JWT token (without verification)
  decodeJWT(token) {
    try {
      if (!token || typeof token !== 'string') {
        return null;
      }
      const base64Url = token.split(".")[1];
      if (!base64Url) return null; // Handle malformed tokens
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  }

  // Check if token is expired
  isTokenExpired(token) {
    try {
      const payload = this.decodeJWT(token);
      if (!payload || !payload.exp) {
        return true;
      }

      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return true;
    }
  }

  // Get token expiration time
  getTokenExpiration(token) {
    try {
      const payload = this.decodeJWT(token);
      if (!payload || !payload.exp) {
        return null;
      }

      return new Date(payload.exp * 1000);
    } catch (error) {
      console.error("Error getting token expiration:", error);
      return null;
    }
  }

  // Initialize token monitoring
  init() {
    const token = Cookies.get("l_t");
    if (token && !this.isTokenExpired(token)) {
      this.startTokenMonitoring();
    }
  }

  // Cleanup
  cleanup() {
    this.stopTokenMonitoring();
  }
}

export default new TokenManager();
