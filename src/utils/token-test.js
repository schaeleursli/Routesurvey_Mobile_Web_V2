import auth_controller from "@/controllers/auth/auth_controller";
import tokenManager from "@/utils/token-manager";
import Cookies from "js-cookie";

class TokenTest {
  // Test token expiration
  testTokenExpiration() {
    const token = Cookies.get("l_t");
    if (!token) {
      console.log("No token found");
      return;
    }

    const expiration = tokenManager.getTokenExpiration(token);
    const isExpired = tokenManager.isTokenExpired(token);

    console.log("Token Info:");
    console.log("- Expiration:", expiration);
    console.log("- Is Expired:", isExpired);
    console.log(
      "- Time until expiry:",
      expiration
        ? Math.floor((expiration - new Date()) / 1000 / 60) + " minutes"
        : "Unknown"
    );
  }

  // Test manual token refresh
  async testManualRefresh() {
    try {
      console.log("Attempting manual token refresh...");
      await auth_controller.refreshToken();
      console.log("✅ Token refresh successful");
      this.testTokenExpiration();
    } catch (error) {
      console.error("❌ Token refresh failed:", error);
    }
  }

  // Test logout
  async testLogout() {
    try {
      console.log("Testing logout...");
      await auth_controller.logout();
      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Logout failed:", error);
    }
  }

  // Test authentication status
  testAuthStatus() {
    console.log("Authentication Status:");
    console.log("- Is Authenticated:", auth_controller.isAuthenticated());
    console.log("- Has Access Token:", !!auth_controller.getAccessToken());
    console.log("- Has Refresh Token:", !!auth_controller.getRefreshToken());
  }

  // Test token monitoring
  testTokenMonitoring() {
    console.log("Token Monitoring:");
    console.log("- Monitoring Active:", !!tokenManager.checkInterval);
    console.log(
      "- Refresh Threshold:",
      tokenManager.refreshThreshold / 1000 / 60,
      "minutes"
    );
  }

  // Run all tests
  runAllTests() {
    console.log("=== Token Test Suite ===");
    this.testAuthStatus();
    this.testTokenExpiration();
    this.testTokenMonitoring();
    console.log("=== End Tests ===");
  }

  // Simulate token expiration (for testing)
  simulateTokenExpiration() {
    const token = Cookies.get("l_t");
    if (!token) {
      console.log("No token to simulate expiration");
      return;
    }

    try {
      // Decode token and modify expiration to be in the past
      const parts = token.split(".");
      const payload = JSON.parse(atob(parts[1]));
      payload.exp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago

      // Create new token with expired payload
      const newPayload = btoa(JSON.stringify(payload));
      const expiredToken = `${parts[0]}.${newPayload}.${parts[2]}`;

      // Store expired token
      Cookies.set("l_t", expiredToken, { expires: 1, secure: true });

      console.log("✅ Token expiration simulated");
      this.testTokenExpiration();
    } catch (error) {
      console.error("❌ Failed to simulate token expiration:", error);
    }
  }

  // Clear all tokens (for testing)
  clearAllTokens() {
    auth_controller.purgeAuth();
    console.log("✅ All tokens cleared");
  }
}

// Export for use in browser console
if (typeof window !== "undefined") {
  window.tokenTest = new TokenTest();
}

export default new TokenTest();
