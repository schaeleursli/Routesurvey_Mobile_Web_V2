import axios from "axios";
import Cookies from "js-cookie";
import tokenManager from "@/utils/token-manager";

class AuthController {
  setAuth(data, remember = false) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    axios.defaults.headers.common["Accept"] = "application/json";

    const isSecure = window.location.protocol === "https:";

    Cookies.set("l_t", data.token, {
      expires: remember ? 7 : 1,
      secure: isSecure,
    });

    Cookies.set("login_user_id", data.uid, {
      expires: remember ? 7 : 1,
      secure: isSecure,
    });
    Cookies.set("login_email", data.email, {
      expires: remember ? 7 : 1,
      secure: isSecure,
    });

    // Store refresh token if provided
    if (data.refreshToken) {
      Cookies.set("refresh_token", data.refreshToken, {
        expires: remember ? 7 : 1,
        secure: isSecure,
      });
    }

    // Initialize token monitoring
    tokenManager.init();
  }

  purgeAuth() {
    Cookies.remove("l_t");
    Cookies.remove("login_user_id");
    Cookies.remove("login_email");
    Cookies.remove("refresh_token");

    // Clear axios headers
    delete axios.defaults.headers.common["Authorization"];

    // Stop token monitoring
    tokenManager.cleanup();
  }

  async refreshToken() {
    try {
      const refreshToken = Cookies.get("refresh_token");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const res = await axios.post("Token/refresh", {
        refreshToken: refreshToken,
      });

      if (res.data.result) {
        const isSecure = window.location.protocol === "https:";
        // Update stored tokens
        Cookies.set("l_t", res.data.accessToken, {
          expires: 1,
          secure: isSecure,
        });
        Cookies.set("refresh_token", res.data.refreshToken, {
          expires: 7,
          secure: isSecure,
        });

        // Update axios headers
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${res.data.accessToken}`;

        return {
          result: true,
          message: "Token refreshed successfully",
        };
      } else {
        throw new Error(res.data.message || "Failed to refresh token");
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      // If refresh fails, logout the user
      this.purgeAuth();
      throw error;
    }
  }

  async logout() {
    try {
      const refreshToken = Cookies.get("refresh_token");

      if (refreshToken) {
        // Revoke the refresh token on the server
        await axios.post("Token/logout", {
          refreshToken: refreshToken,
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local auth data
      this.purgeAuth();
    }
  }

  async revokeAllTokens() {
    try {
      await axios.post("Token/revoke-all");
    } catch (error) {
      console.error("Revoke all tokens error:", error);
    } finally {
      this.purgeAuth();
    }
  }

  async loginWithCredentials(email, password, remember = false) {
    try {
      // Hash the password using SHA-256 before sending
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashedPassword = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      password = hashedPassword;

      const res = await axios.post("Users/LoginMain", {
        Email: String(email).toLowerCase().trim(),
        Password: String(password).trim(),
      });

      // console.log(res.data);

      if (res.data.result) {
        this.setAuth(
          {
            ...res.data,
            email,
          },
          remember
        );

        return {
          result: true,
          message: String(res.data.message),
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  async loginAdmin(email, password, remember = false) {
    try {
      // Hash the password using SHA-256 before sending
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashedPassword = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      password = hashedPassword;

      const res = await axios.post("Users/LoginAdmin", {
        Email: String(email).toLowerCase().trim(),
        Password: String(password).trim(),
      });

      if (res.data.result) {
        this.setAuth(
          {
            ...res.data,
            email,
          },
          remember
        );

        return {
          result: true,
          message: String(res.data.message),
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  async loginWithPhoneNumber(phoneNumber, password, remember = false) {
    try {
      // Hash the password using SHA-256 before sending
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashedPassword = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      password = hashedPassword;

      const res = await axios.post("Users/LoginWithPhoneNumber", {
        PhoneNumber: String(phoneNumber).trim(),
        Password: String(password).trim(),
      });

      if (res.data.result) {
        this.setAuth(
          {
            ...res.data,
            email: res.data.email,
          },
          remember
        );

        return {
          result: true,
          message: String(res.data.message),
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  async getCurrentUserData() {
    try {
      const res = await axios.get(
        "Users/GetUserData/" + Number(Cookies.get("login_user_id"))
      );

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          data: res.data.userData,
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async updateUserInfo(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.UserId = uid;
      data.ActionBy = uid;

      const res = await axios.post("Users/UpdateUserInfo", data);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  async updateCompanyInfo(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.UserId = uid;
      data.ActionBy = uid;

      const res = await axios.post("Users/UpdateCompanyInfo", data);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  async isUserTrailExpired() {
    try {
      const res = await axios.get(
        "Users/IsUserTrailExpired/" + Number(Cookies.get("login_user_id"))
      );

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          data: res.data.data,
          remainingDays: res.data.remainingDays,
          expireDate: res.data.expireDate,
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  async addUser(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;

      const res = await axios.post("Users/AddUser", data);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  async getUsers() {
    try {
      const res = await axios.get("Users/ListAllUsers");

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          data: res.data.data,
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!Cookies.get("l_t");
  }

  // Get current access token
  getAccessToken() {
    return Cookies.get("l_t");
  }

  // Get current refresh token
  getRefreshToken() {
    return Cookies.get("refresh_token");
  }

  async completeOnboarding(data) {
    try {
      const res = await axios.post("Users/CompleteOnboarding", data);
      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }
}

export default new AuthController();
