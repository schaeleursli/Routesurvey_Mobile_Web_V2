# CSRF Protection Implementation

This document describes the comprehensive CSRF (Cross-Site Request Forgery) protection implementation for the RouteSurvey application.

## Overview

The CSRF protection system provides defense against cross-site request forgery attacks by:

- **Token-based Protection**: Each state-changing request requires a valid CSRF token
- **Automatic Token Management**: Tokens are automatically fetched, stored, and refreshed
- **Seamless Integration**: Works with existing authentication system
- **Error Handling**: Graceful handling of token expiration and validation failures
- **Security Headers**: Additional security headers for enhanced protection

## Architecture

### Frontend Components

1. **CSRF Manager** (`src/utils/csrf-manager.js`)
   - Singleton class for CSRF token management
   - Automatic token fetching and refresh
   - Memory and sessionStorage storage
   - Periodic token refresh (every 30 minutes)

2. **Axios Interceptors** (`src/utils/axios-interceptors.js`)
   - Automatically adds CSRF tokens to state-changing requests
   - Handles CSRF token expiration and refresh
   - Integrates with existing authentication token handling

3. **Vue Composable** (`src/composables/useCsrf.js`)
   - Reactive CSRF state management
   - Provides CSRF methods to Vue components
   - Automatic initialization on component mount

4. **Security Status Component** (`src/components/SecurityStatus.vue`)
   - Development debugging tool
   - Shows CSRF protection status
   - Manual token refresh capability

### Backend Components

1. **Security Controller** (`/api/Security/`)
   - CSRF token generation endpoint
   - Security headers testing
   - Rate limiting tests
   - Health checks

2. **Antiforgery Middleware**
   - Built-in ASP.NET Core CSRF protection
   - Token validation and generation
   - Cookie-based token storage

3. **Custom Validation Attributes**
   - `ValidateCsrfTokenAttribute` for controller methods
   - Automatic CSRF validation for POST/PUT/DELETE requests

## Implementation Details

### Token Flow

1. **Initialization**: App starts → CSRF token fetched from `/api/Security/csrf-token`
2. **Storage**: Token stored in memory and sessionStorage
3. **Usage**: Automatically added to all POST/PUT/DELETE requests via `X-CSRF-Token` header
4. **Refresh**: Tokens refreshed every 30 minutes or on 403 errors
5. **Cleanup**: Tokens cleared on logout

### Security Features

- **HttpOnly Cookies**: CSRF tokens stored in HttpOnly cookies on backend
- **SameSite Policy**: Strict SameSite cookie policy
- **Secure Headers**: Comprehensive security headers
- **Rate Limiting**: Protection against token abuse
- **Error Handling**: Graceful degradation when CSRF is unavailable

## Usage

### Automatic Usage

The CSRF protection works automatically for all API requests:

```javascript
// CSRF token automatically added to this request
const response = await axios.post('/api/Users/LoginMain', {
  email: 'user@example.com',
  password: 'password'
});
```

### Manual Usage

For custom requests or debugging:

```javascript
import { useCsrf } from '@/composables/useCsrf';

const { getCsrfToken, refreshCsrfToken } = useCsrf();

// Get current token
const token = getCsrfToken();

// Manually refresh token
await refreshCsrfToken();
```

### Component Integration

```vue
<template>
  <div>
    <p>CSRF Protection: {{ isCsrfAvailable ? 'Active' : 'Inactive' }}</p>
    <button @click="refreshToken" :disabled="isRefreshing">
      Refresh CSRF Token
    </button>
  </div>
</template>

<script setup>
import { useCsrf } from '@/composables/useCsrf';

const { isCsrfAvailable, refreshCsrfToken, isRefreshing } = useCsrf();

const refreshToken = async () => {
  await refreshCsrfToken();
};
</script>
```

## Configuration

### Frontend Configuration

The CSRF protection is automatically initialized in `main.js`:

```javascript
// Initialize CSRF protection
const initializeSecurity = async () => {
  try {
    await csrfManager.init();
    console.log("CSRF protection initialized");
  } catch (error) {
    console.warn("CSRF protection not available:", error);
  }
};
```

### Backend Configuration

See `BACKEND_CSRF_CONFIGURATION.md` for complete backend setup.

## Security Considerations

### Token Storage
- **Memory**: Primary storage for active tokens
- **SessionStorage**: Backup storage for page reloads
- **HttpOnly Cookies**: Backend token storage (not accessible via JavaScript)

### Token Refresh
- **Automatic**: Every 30 minutes
- **On Error**: When 403 CSRF errors occur
- **Manual**: Via SecurityStatus component (development only)

### Error Handling
- **Graceful Degradation**: App continues working if CSRF is unavailable
- **Automatic Retry**: Failed requests with expired tokens are retried
- **User Feedback**: Clear error messages for CSRF failures

## Testing

### Development Testing

1. **Security Status Component**: Shows real-time CSRF status
2. **Browser DevTools**: Check Network tab for `X-CSRF-Token` headers
3. **Console Logs**: CSRF events logged to console

### Manual Testing

```bash
# Test CSRF token generation
curl -X GET "http://localhost:5000/api/Security/csrf-token" \
  -H "Accept: application/json"

# Test CSRF protection (should fail without token)
curl -X POST "http://localhost:5000/api/Users/LoginMain" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test with CSRF token (should succeed)
curl -X POST "http://localhost:5000/api/Users/LoginMain" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: YOUR_TOKEN_HERE" \
  -d '{"email":"test@example.com","password":"password"}'
```

## Troubleshooting

### Common Issues

1. **CSRF Token Not Available**
   - Check if backend CSRF endpoint is accessible
   - Verify CORS configuration
   - Check browser console for errors

2. **403 Forbidden Errors**
   - Token may be expired, check automatic refresh
   - Verify token is being sent in headers
   - Check backend CSRF validation

3. **CORS Errors**
   - Ensure backend CORS allows your frontend origin
   - Verify `withCredentials: true` is set
   - Check SameSite cookie policy

### Debug Mode

Enable debug mode by setting `showSecurityStatus={true}` in the SecurityStatus component:

```vue
<SecurityStatus :show-security-status="true" />
```

## Performance Impact

- **Minimal Overhead**: CSRF tokens are lightweight
- **Efficient Storage**: Tokens stored in memory and sessionStorage
- **Smart Refresh**: Only refresh when needed
- **Caching**: Tokens cached for 30 minutes

## Security Benefits

1. **CSRF Protection**: Prevents cross-site request forgery attacks
2. **Token Validation**: Server-side validation of all state-changing requests
3. **Automatic Management**: No manual token handling required
4. **Graceful Degradation**: App works even if CSRF is temporarily unavailable
5. **Security Headers**: Additional protection via security headers

## Future Enhancements

1. **Token Rotation**: Implement token rotation for enhanced security
2. **Audit Logging**: Log CSRF validation events for monitoring
3. **Advanced Rate Limiting**: Implement CSRF-specific rate limiting
4. **Token Analytics**: Track token usage patterns for optimization

## Support

For issues or questions about the CSRF implementation:

1. Check the browser console for error messages
2. Verify backend CSRF configuration
3. Test with the SecurityStatus component
4. Review the backend configuration guide

The CSRF protection is designed to be transparent to users while providing robust security against cross-site request forgery attacks. 