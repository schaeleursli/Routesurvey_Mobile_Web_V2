# JWT Refresh Token Implementation

This document describes the implementation of JWT refresh tokens in the RouteSurvey application.

## Overview

The application now supports automatic token refresh using JWT refresh tokens. This provides better security and user experience by:

- Automatically refreshing expired access tokens
- Maintaining user sessions without requiring re-authentication
- Properly revoking tokens on logout
- Handling token expiration gracefully

## Backend Implementation

The backend provides the following endpoints for token management:

### Token Endpoints

1. **POST /api/Token/refresh**
   - Refreshes an expired access token using a valid refresh token
   - Returns new access and refresh tokens
   - Invalidates the old refresh token

2. **POST /api/Token/revoke**
   - Revokes a specific refresh token
   - Requires authentication

3. **POST /api/Token/revoke-all**
   - Revokes all refresh tokens for the current user
   - Requires authentication

4. **POST /api/Token/logout**
   - Logs out the user by revoking the current refresh token
   - Blacklists the current access token
   - Requires authentication

## Frontend Implementation

### Key Components

#### 1. Auth Controller (`src/controllers/auth/auth_controller.js`)

Enhanced with refresh token functionality:

```javascript
// Store refresh tokens
setAuth(data, remember = false) {
  // ... existing code ...
  if (data.refreshToken) {
    Cookies.set("refresh_token", data.refreshToken, { expires: remember ? 7 : 1 });
  }
  tokenManager.init();
}

// Refresh token method
async refreshToken() {
  const refreshToken = Cookies.get("refresh_token");
  const res = await axios.post("Token/refresh", { refreshToken });
  // Update stored tokens and headers
}

// Proper logout with token revocation
async logout() {
  const refreshToken = Cookies.get("refresh_token");
  if (refreshToken) {
    await axios.post("Token/logout", { refreshToken });
  }
  this.purgeAuth();
}
```

#### 2. Axios Interceptors (`src/utils/axios-interceptors.js`)

Automatic token refresh on 401 errors:

```javascript
// Response interceptor
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      // Attempt token refresh
      await auth_controller.refreshToken();
      // Retry original request
    }
    return Promise.reject(error);
  }
);
```

#### 3. Token Manager (`src/utils/token-manager.js`)

Proactive token expiration monitoring:

```javascript
// Monitor token expiration
startTokenMonitoring() {
  this.checkInterval = setInterval(() => {
    this.checkTokenExpiration();
  }, 60000); // Check every minute
}

// Refresh token before it expires
async checkTokenExpiration() {
  const payload = this.decodeJWT(token);
  const timeUntilExpiry = (payload.exp - now) * 1000;
  
  if (timeUntilExpiry <= this.refreshThreshold) {
    await auth_controller.refreshToken();
  }
}
```

## Token Flow

### 1. Login Process
1. User submits credentials
2. Backend validates and returns access + refresh tokens
3. Frontend stores both tokens
4. Token monitoring starts

### 2. Automatic Refresh
1. Token manager checks expiration every minute
2. If token expires within 5 minutes, refresh is triggered
3. New tokens are stored and headers updated
4. User session continues seamlessly

### 3. Request Interception
1. API request fails with 401 (expired token)
2. Axios interceptor catches the error
3. Refresh token is used to get new access token
4. Original request is retried with new token
5. User sees no interruption

### 4. Logout Process
1. User clicks logout
2. Frontend calls logout endpoint with refresh token
3. Backend revokes refresh token and blacklists access token
4. Frontend clears all stored tokens
5. User is redirected to login

## Security Features

### Token Storage
- Access tokens: Stored in cookies with short expiration (1 day)
- Refresh tokens: Stored in cookies with longer expiration (7 days)
- Secure cookie settings prevent XSS attacks

### Token Validation
- Backend validates refresh tokens against database
- Revoked tokens are tracked
- Expired tokens are automatically cleaned up

### Automatic Cleanup
- Expired refresh tokens are removed from database
- Blacklisted tokens are cleaned up after expiration
- Frontend stops monitoring when no valid token exists

## Configuration

### Token Expiration Times
- Access tokens: 30 minutes (backend configurable)
- Refresh tokens: 7 days (backend configurable)
- Refresh threshold: 5 minutes before expiry

### Monitoring Intervals
- Token expiration check: Every 60 seconds
- Database cleanup: Scheduled task (backend)

## Error Handling

### Refresh Token Failure
1. User is automatically logged out
2. All stored tokens are cleared
3. User is redirected to login page
4. Error is logged for debugging

### Network Errors
1. Failed requests are retried once after token refresh
2. If refresh fails, user is logged out
3. Graceful degradation ensures good UX

## Usage Examples

### Login
```javascript
const result = await auth_controller.loginWithCredentials(email, password, remember);
if (result.result) {
  // User is logged in with automatic token management
}
```

### Logout
```javascript
await auth_controller.logout();
// User is logged out and tokens are revoked
```

### Manual Token Refresh
```javascript
try {
  await auth_controller.refreshToken();
  // Token refreshed successfully
} catch (error) {
  // Handle refresh failure
}
```

## Testing

### Manual Testing
1. Login and check that tokens are stored
2. Wait for token expiration or manually expire token
3. Make API request and verify automatic refresh
4. Test logout and verify token revocation

### Automated Testing
- Unit tests for token manager
- Integration tests for axios interceptors
- E2E tests for complete authentication flow

## Troubleshooting

### Common Issues

1. **Token refresh fails**
   - Check if refresh token is valid
   - Verify backend token endpoints
   - Check network connectivity

2. **User logged out unexpectedly**
   - Check token expiration times
   - Verify refresh token storage
   - Check for server errors

3. **Multiple refresh attempts**
   - Ensure refresh flag prevents duplicate requests
   - Check for race conditions in interceptors

### Debug Information
- Token expiration times are logged
- Refresh attempts are logged
- Failed requests are logged with details

## Future Enhancements

1. **Token Rotation**: Implement refresh token rotation for enhanced security
2. **Concurrent Session Management**: Allow multiple active sessions per user
3. **Device Tracking**: Track and manage tokens per device
4. **Offline Support**: Cache tokens for offline functionality
5. **Biometric Authentication**: Integrate with device biometrics

## Security Considerations

1. **HTTPS Only**: All token transmission must use HTTPS
2. **Secure Cookies**: Implement secure and httpOnly cookie flags
3. **Token Validation**: Always validate tokens on the server
4. **Rate Limiting**: Implement rate limiting on token endpoints
5. **Audit Logging**: Log all token operations for security monitoring 