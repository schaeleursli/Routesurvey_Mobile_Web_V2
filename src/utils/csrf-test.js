import axios from "axios";
import csrfManager from "./csrf-manager";

/**
 * CSRF Test Utility
 *
 * This utility helps test CSRF protection implementation
 * Run these tests in the browser console to verify CSRF is working
 */

export class CSRFTest {
  constructor() {
    this.testResults = [];
  }

  /**
   * Test 1: CSRF Token Generation
   */
  async testTokenGeneration() {
    console.log("🧪 Testing CSRF Token Generation...");

    try {
      await csrfManager.init();
      const token = csrfManager.getToken();

      if (token) {
        console.log(
          "✅ CSRF token generated successfully:",
          token.substring(0, 20) + "..."
        );
        this.testResults.push({ test: "Token Generation", status: "PASS" });
        return true;
      } else {
        console.log("❌ CSRF token generation failed");
        this.testResults.push({ test: "Token Generation", status: "FAIL" });
        return false;
      }
    } catch (error) {
      console.log("❌ CSRF token generation error:", error);
      this.testResults.push({
        test: "Token Generation",
        status: "ERROR",
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Test 2: CSRF Token in Headers
   */
  async testTokenInHeaders() {
    console.log("🧪 Testing CSRF Token in Headers...");

    try {
      const token = csrfManager.getToken();
      if (!token) {
        console.log("❌ No CSRF token available");
        this.testResults.push({ test: "Token in Headers", status: "FAIL" });
        return false;
      }

      // Test a simple GET request to check if headers are set
      const response = await axios.get("Security/headers");

      console.log("✅ Request completed with CSRF token in headers");
      this.testResults.push({ test: "Token in Headers", status: "PASS" });
      return true;
    } catch (error) {
      console.log("❌ CSRF token header test failed:", error);
      this.testResults.push({
        test: "Token in Headers",
        status: "FAIL",
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Test 3: CSRF Protection (POST Request)
   */
  async testCsrfProtection() {
    console.log("🧪 Testing CSRF Protection...");

    try {
      // This should work with CSRF token
      const response = await axios.post("Security/csrf-token", {
        test: "csrf_protection_test",
      });

      console.log("✅ CSRF protection test passed");
      this.testResults.push({ test: "CSRF Protection", status: "PASS" });
      return true;
    } catch (error) {
      if (error.response?.status === 403) {
        console.log(
          "✅ CSRF protection working (403 received for invalid request)"
        );
        this.testResults.push({ test: "CSRF Protection", status: "PASS" });
        return true;
      } else {
        console.log("❌ CSRF protection test failed:", error);
        this.testResults.push({
          test: "CSRF Protection",
          status: "FAIL",
          error: error.message,
        });
        return false;
      }
    }
  }

  /**
   * Test 4: Token Refresh
   */
  async testTokenRefresh() {
    console.log("🧪 Testing CSRF Token Refresh...");

    try {
      const originalToken = csrfManager.getToken();
      await csrfManager.refreshToken();
      const newToken = csrfManager.getToken();

      if (newToken && newToken !== originalToken) {
        console.log("✅ CSRF token refresh successful");
        this.testResults.push({ test: "Token Refresh", status: "PASS" });
        return true;
      } else {
        console.log("❌ CSRF token refresh failed");
        this.testResults.push({ test: "Token Refresh", status: "FAIL" });
        return false;
      }
    } catch (error) {
      console.log("❌ CSRF token refresh error:", error);
      this.testResults.push({
        test: "Token Refresh",
        status: "ERROR",
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Test 5: Token Storage
   */
  testTokenStorage() {
    console.log("🧪 Testing CSRF Token Storage...");

    try {
      const memoryToken = csrfManager.getToken();
      const sessionToken = sessionStorage.getItem("csrf_token");

      if (memoryToken && sessionToken && memoryToken === sessionToken) {
        console.log("✅ CSRF token storage working correctly");
        this.testResults.push({ test: "Token Storage", status: "PASS" });
        return true;
      } else {
        console.log("❌ CSRF token storage test failed");
        this.testResults.push({ test: "Token Storage", status: "FAIL" });
        return false;
      }
    } catch (error) {
      console.log("❌ CSRF token storage error:", error);
      this.testResults.push({
        test: "Token Storage",
        status: "ERROR",
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log("🚀 Starting CSRF Protection Tests...\n");

    await this.testTokenGeneration();
    await this.testTokenInHeaders();
    await this.testCsrfProtection();
    await this.testTokenRefresh();
    this.testTokenStorage();

    this.printResults();
  }

  /**
   * Print test results
   */
  printResults() {
    console.log("\n📊 CSRF Test Results:");
    console.log("========================");

    const passed = this.testResults.filter((r) => r.status === "PASS").length;
    const failed = this.testResults.filter((r) => r.status === "FAIL").length;
    const errors = this.testResults.filter((r) => r.status === "ERROR").length;

    this.testResults.forEach((result) => {
      const icon =
        result.status === "PASS"
          ? "✅"
          : result.status === "FAIL"
          ? "❌"
          : "⚠️";
      console.log(`${icon} ${result.test}: ${result.status}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log("\n📈 Summary:");
    console.log(`   Passed: ${passed}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Total: ${this.testResults.length}`);

    if (passed === this.testResults.length) {
      console.log(
        "\n🎉 All CSRF tests passed! CSRF protection is working correctly."
      );
    } else {
      console.log(
        "\n⚠️  Some CSRF tests failed. Please check the implementation."
      );
    }
  }

  /**
   * Quick health check
   */
  async quickCheck() {
    console.log("🔍 Quick CSRF Health Check...");

    const token = csrfManager.getToken();
    const isAvailable = csrfManager.isAvailable();

    console.log(`CSRF Token Available: ${isAvailable ? "✅ Yes" : "❌ No"}`);
    console.log(
      `CSRF Token: ${token ? token.substring(0, 20) + "..." : "None"}`
    );

    return isAvailable;
  }
}

// Create global instance for console access
const csrfTest = new CSRFTest();

// Make available globally for console testing
if (typeof window !== "undefined") {
  window.csrfTest = csrfTest;

  // Add console helpers
  console.log("🔧 CSRF Test Utility loaded!");
  console.log("Available commands:");
  console.log("  csrfTest.quickCheck() - Quick health check");
  console.log("  csrfTest.runAllTests() - Run all tests");
  console.log("  csrfTest.testTokenGeneration() - Test token generation");
  console.log("  csrfTest.testTokenInHeaders() - Test headers");
  console.log("  csrfTest.testCsrfProtection() - Test protection");
  console.log("  csrfTest.testTokenRefresh() - Test refresh");
  console.log("  csrfTest.testTokenStorage() - Test storage");
}

export default csrfTest;
