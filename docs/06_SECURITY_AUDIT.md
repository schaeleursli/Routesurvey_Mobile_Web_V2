# Security Audit Report & Cybersecurity Concept

> [!IMPORTANT]
> This audit identifies critical security vulnerabilities in the current Authentication and MFA implementation that require immediate attention.

## Executive Summary
The `RouteSurvey` application (Console V3) has a foundation for security (JWT, CSRF protection, MFA), but suffers from significant implementation flaws that expose user credentials and session data to high risk. The most critical issue is the handling of passwords in `sessionStorage` during the MFA flow.

## 1. Critical Vulnerabilities (Immediate Action Required)

### 1.1 Credential Exposure in MFA Flow (High Severity)
**Location:** `src/controllers/auth/mfa_controller.js`, `src/utils/mfa-utils.js`
**Issue:** The current MFA workflow requires the frontend to store the user's plaintext password in `sessionStorage` (`mfa_login_password`) after the initial "Check MFA" step, so it can be re-submitted with the OTP code.
**Risk:**
*   **XSS Vulnerability:** Any Cross-Site Scripting (XSS) vulnerability would allow an attacker to read the `sessionStorage` and steal the user's password in plain text.
*   **Session Leaks:** If the user fails to close the tab, the password remains in browser storage.
**Remediation:**
*   **Refactor Backend:** The `Users/CheckMfaStatus` endpoint (or a login endpoint) should validate credentials *once* and return a **temporary, short-lived "pre-auth" token** (valid for ~5 mins, scope: `mfa_verification`).
*   **Refactor Frontend:** discard the password immediately after the first request. Use the `pre_auth_token` to submit the MFA code.

### 1.2 Deprecated & Vulnerable Dependencies (High Severity)
**Location:** `index.html`
**Issue:** The application loads **jQuery 1.12.1** and **jQuery UI 1.12.1** from `cdnjs`.
**Risk:** jQuery 1.x line has known XSS vulnerabilities that are publicly documented.
**Remediation:**
*   Remove jQuery entirely if possible (Vue.js renders it redundant).
*   If strictly needed for legacy plugins, upgrade to the latest 3.x version.

### 1.3 Missing Content Security Policy (High Severity)
**Location:** `index.html`
**Issue:** No `Content-Security-Policy` (CSP) meta tag or header is present.
**Risk:** The application is wide open to XSS, data exfiltration, and malicious frame injection.
**Remediation:**
*   Implement a strict CSP. Example:
    ```html
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://unpkg.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; connect-src 'self' https://api.routesurvey.app;">
    ```

### 1.4 Client-Side Password Hashing (Medium/High Severity)
**Location:** `src/controllers/auth/auth_controller.js` (Lines 123-132)
**Issue:** The frontend hashes the password with SHA-256 before sending it to the backend.
**Risk:**
*   If the backend expects this hash and stores this hash, then the **hash is effectively the password**. If the database leaks, these "hashes" are usable immediately without cracking.
*   It creates a false sense of security.
**Remediation:**
*   Send the password over HTTPS (TLS).
*   The **Backend** must handle salting and hashing (e.g., using Argon2 or BCrypt).

## 2. Architecture & Data Protection

### 2.1 Token Storage
**Current State:**
*   Access Token (`l_t`) and Refresh Token (`refresh_token`) are stored in **Cookies** via `js-cookie`.
*   They are **accessible to JavaScript**, meaning they are NOT `HttpOnly`.
**Risk:** Vulnerable to token theft via XSS.
**Recommendation:**
*   **Best Practice:** Store the `refresh_token` in an **HttpOnly, Secure, SameSite=Strict** cookie. This must be set by the *Backend* response, not partial frontend code.
*   The Access Token can remain in memory (Pinia store) or a cookie, but `refresh_token` security is paramount.

### 2.2 Offline Data Security
**Observation:** The app is "Offline-first".
**Risk:** If the app stores sensitive route data (photos, maps) in `IndexedDB` or `localStorage`, it is unencrypted on the device.
**Recommendation:**
*   Ensure that any "Logout" action explicitly **wipes** sensitive offline data from the browser.
*   For enterprise compliance, consider using the Web Crypto API to encrypt sensitive fields in IndexedDB using a key derived from the user's session (though this means data is lost if session is lost while offline—a trade-off).

## 3. Implementation Plan (Cybersecurity Hardening)

### Phase 1: Authentication Refactor (Immediate)
1.  [ ] **Remove Client-Side Hashing**: Update `auth_controller.js` to send raw password.
2.  [ ] **Secure MFA Flow**:
    *   Update Backend API to return `pre_auth_token`.
    *   Update Frontend `mfa_controller.js` to use token, stop storing password.
    *   Remove `src/utils/mfa-utils.js` password storage logic.
3.  [ ] **CSP Implementation**: Add CSP meta tag to `index.html`.

### Phase 2: Dependency Cleanup
1.  [ ] Audit usage of `jQuery` in the project.
2.  [ ] Remove `jQuery` script tags from `index.html`.
3.  [ ] Replace any jQuery dependencies with Vue native alternatives.

### Phase 3: Input & file Validation
1.  [ ] **File Uploads**: Update `BaseImageUpload.vue` and `FileManagementController`.
    *   Enforce max file size (e.g., 10MB) *before* upload.
    *   Validate MIME types against a strict whitelist (image/jpeg, image/png).
2.  [ ] **Sanitization**: Ensure all `v-html` directives (if any) use a sanitizer library like `DOMPurify`.

## 4. API Security Note
(Based on `docs/05_BACKEND_API.md`)
*   **Type Safety Gap**: The API relies on JSON strings inside fields (`Data: JSON.stringify(...)`). This bypasses backend schema validation.
    *   **Fix**: Define strict DTOs for `PlannedRoute` data on the backend.
*   **Privilege Escalation**: Ensure `UsersAdmin` endpoints check for `Admin` role on the *backend* for every request, not just relying on the frontend hiding the buttons.
