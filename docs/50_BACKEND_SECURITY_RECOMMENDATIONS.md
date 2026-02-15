
### Security Recommendations & Requirements

> [!IMPORTANT]
> The following security improvements are critical for the next backend iteration to support a secure frontend implementation.

### 1. Authentication & MFA Hardening
*   **Remove Client-Side Hashing**: The current login endpoints expect a SHA-256 hashed password. This requires the frontend to handle raw passwords and hash them, which is not ideal.
    *   **Requirement**: Backend should accept raw passwords (over TLS) and handle all hashing/salting internally (e.g., using Argon2 or BCrypt).
*   **Secure MFA Flow (No Password Storage)**:
    *   **Current Issue**: The frontend must store the password in `sessionStorage` to resubmit it with the MFA code. This is a critical XSS vulnerability.
    *   **Requirement**: Refactor `Users/CheckMfaStatus` to return a short-lived `pre_auth_token` (valid for ~5 mins) if MFA is required.
    *   **New Flow**:
        1.  `Login(email, password)` -> Backend checks credentials.
        2.  If MFA enabled -> Backend returns `{ result: false, requiresMfa: true, preAuthToken: "..." }`.
        3.  Frontend prompts for OTP.
        4.  `VerifyMfa(preAuthToken, code)` -> Backend validates and issues final Access/Refresh tokens.
    *   This eliminates the need for the frontend to hold the password.

### 2. Header Security
*   **CSP Compatibility**: The frontend now enforces a strict Content-Security-Policy. Ensure all backend responses include standard security headers:
    *   `Strict-Transport-Security` (HSTS)
    *   `X-Content-Type-Options: nosniff`
    *   `X-Frame-Options: DENY` (or SAMEORIGIN)

### 3. Data Validation
*   **Strict Types**: As noted in gap analysis, move away from `JSON.stringify` blobs and enforce strict DTO validation for all inputs to prevent injection attacks.
