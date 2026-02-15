import axios from "axios";
import Cookies from "js-cookie";

class MfaController {
  /**
   * Setup MFA for a user
   */
  async setupMfa(email, password) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashedPassword = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      password = hashedPassword;

      const res = await axios.post("Mfa/Setup", {
        email: email,
        password: password,
      });

      return {
        result: res.data.result,
        message: res.data.message,
        qrCodeUrl: res.data.qrCodeUrl,
        secretKey: res.data.secretKey,
        manualEntryKey: res.data.manualEntryKey,
        userId: res.data.userId,
      };
    } catch (error) {
      console.error("MFA setup failed:", error);
      return {
        result: false,
        message: error.response?.data?.message || "Failed to setup MFA",
      };
    }
  }

  /**
   * Enable MFA after verification
   */
  async enableMfa(userId, mfaCode) {
    try {
      const res = await axios.post("Mfa/Enable", {
        userId: userId,
        mfaCode: mfaCode,
      });

      return {
        result: res.data.result,
        message: res.data.message,
      };
    } catch (error) {
      console.error("MFA enable failed:", error);
      return {
        result: false,
        message: error.response?.data?.message || "Failed to enable MFA",
      };
    }
  }

  /**
   * Login with MFA verification
   */
  async loginWithMfa(email, password, mfaCode, userId = null) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashedPassword = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      password = hashedPassword;

      const requestData = {
        email: email,
        password: password,
        mfaCode: mfaCode,
      };

      // Include userId if provided
      if (userId) {
        requestData.userId = userId;
      }

      const res = await axios.post("Mfa/Login", requestData);

      if (res.data.result) {
        // Set authentication data
        this.setAuth({
          token: res.data.accessToken,
          refreshToken: res.data.refreshToken,
          uid: res.data.userId,
          email: email,
          userType: res.data.userType,
        });

        return {
          result: true,
          message: res.data.message,
          userId: res.data.userId,
          userType: res.data.userType,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
        };
      }
    } catch (error) {
      console.error("MFA login failed:", error);
      return {
        result: false,
        message: error.response?.data?.message || "Failed to login with MFA",
      };
    }
  }

  /**
   * Get MFA status for a user
   */
  async getMfaStatus(userId) {
    try {
      const res = await axios.get(`Mfa/Status/${userId}`);

      return {
        result: res.data.result,
        message: res.data.message,
        isEnabled: res.data.isEnabled,
        backupCodesRemaining: res.data.backupCodesRemaining,
        lastUsedAt: res.data.lastUsedAt,
      };
    } catch (error) {
      console.error("Get MFA status failed:", error);
      return {
        result: false,
        message: error.response?.data?.message || "Failed to get MFA status",
      };
    }
  }

  /**
   * Disable MFA for a user
   */
  async disableMfa(userId, password, mfaCode) {
    try {
      const res = await axios.post("Mfa/Disable", {
        userId: userId,
        password: password,
        mfaCode: mfaCode,
      });

      return {
        result: res.data.result,
        message: res.data.message,
      };
    } catch (error) {
      console.error("MFA disable failed:", error);
      return {
        result: false,
        message: error.response?.data?.message || "Failed to disable MFA",
      };
    }
  }

  /**
   * Generate new backup codes
   */
  async generateBackupCodes(userId, password, mfaCode) {
    try {
      const res = await axios.post("Mfa/GenerateBackupCodes", {
        userId: userId,
        password: password,
        mfaCode: mfaCode,
      });

      return {
        result: res.data.result,
        message: res.data.message,
        backupCodes: res.data.backupCodes,
        remainingCodes: res.data.remainingCodes,
      };
    } catch (error) {
      console.error("Generate backup codes failed:", error);
      return {
        result: false,
        message:
          error.response?.data?.message || "Failed to generate backup codes",
      };
    }
  }

  /**
   * Check MFA status for a user during login
   */
  async checkMfaStatus(email, password) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashedPassword = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      password = hashedPassword;

      const res = await axios.post("Users/CheckMfaStatus", {
        Email: email,
        Password: password,
      });

      return {
        result: res.data.result,
        message: res.data.message,
        hasMfa: res.data.data?.hasMfa || false,
        userId: res.data.data?.userId,
        backupCodesRemaining: res.data.data?.backupCodesRemaining,
        lastUsedAt: res.data.data?.lastUsedAt,
      };
    } catch (error) {
      console.error("Check MFA status failed:", error);
      return {
        result: false,
        message: error.response?.data?.message || "Failed to check MFA status",
        hasMfa: false,
      };
    }
  }

  /**
   * Set authentication data after successful MFA login
   */
  setAuth(data) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    axios.defaults.headers.common["Accept"] = "application/json";

    Cookies.set("l_t", data.token, { expires: 7, secure: true });
    Cookies.set("login_user_id", data.uid, { expires: 7, secure: true });
    Cookies.set("login_email", data.email, { expires: 7, secure: true });

    if (data.refreshToken) {
      Cookies.set("refresh_token", data.refreshToken, {
        expires: 7,
        secure: true,
      });
    }
  }
}

export default new MfaController();
