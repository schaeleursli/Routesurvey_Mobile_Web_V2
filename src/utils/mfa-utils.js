/**
 * MFA Utility Functions
 */

/**
 * Clear all stored MFA credentials from session storage
 */
export const clearMfaCredentials = () => {
  sessionStorage.removeItem("mfa_login_email");
  sessionStorage.removeItem("mfa_login_password");
  sessionStorage.removeItem("mfa_user_id");
};

/**
 * Store MFA credentials in session storage
 */
export const storeMfaCredentials = (email, password, userId = null) => {
  sessionStorage.setItem("mfa_login_email", email);
  sessionStorage.setItem("mfa_login_password", password);
  if (userId) {
    sessionStorage.setItem("mfa_user_id", userId);
  }
};

/**
 * Get stored MFA credentials from session storage
 */
export const getMfaCredentials = () => {
  const email = sessionStorage.getItem("mfa_login_email");
  const password = sessionStorage.getItem("mfa_login_password");
  const userId = sessionStorage.getItem("mfa_user_id");

  return {
    email,
    password,
    userId,
    hasCredentials: !!(email && password),
  };
};

/**
 * Validate MFA code format (6 digits)
 */
export const validateMfaCode = (code) => {
  return /^\d{6}$/.test(code);
};

/**
 * Validate backup code format (8 characters, alphanumeric)
 */
export const validateBackupCode = (code) => {
  return /^[A-Z0-9]{8}$/.test(code.toUpperCase());
};

/**
 * Format MFA code for display (add spaces every 3 digits)
 */
export const formatMfaCode = (code) => {
  return code.replace(/(\d{3})(?=\d)/g, "$1 ");
};

/**
 * Check if user has MFA enabled based on stored credentials
 */
export const hasMfaEnabled = async (mfaController, email, password) => {
  try {
    const status = await mfaController.checkMfaStatus(email, password);
    return status.result && status.hasMfa;
  } catch (error) {
    console.error("Failed to check MFA status:", error);
    return false;
  }
};

/**
 * Reset MFA warning dismissed state (call when MFA is enabled)
 */
export const resetMfaWarningDismissed = () => {
  localStorage.removeItem("mfa_warning_dismissed");
};

/**
 * Check if MFA warning has been dismissed
 */
export const isMfaWarningDismissed = () => {
  return localStorage.getItem("mfa_warning_dismissed") === "true";
};

/**
 * MFA Event System
 */
const mfaEventListeners = [];

export const emitMfaStatusChange = (enabled) => {
  mfaEventListeners.forEach((listener) => {
    try {
      listener(enabled);
    } catch (error) {
      console.error("MFA event listener error:", error);
    }
  });
};

export const onMfaStatusChange = (callback) => {
  mfaEventListeners.push(callback);
  return () => {
    const index = mfaEventListeners.indexOf(callback);
    if (index > -1) {
      mfaEventListeners.splice(index, 1);
    }
  };
};
