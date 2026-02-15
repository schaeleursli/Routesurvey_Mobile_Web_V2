# MFA (Multi-Factor Authentication) Implementation

## Overview

This document describes the implementation of Multi-Factor Authentication (MFA) for the RouteSurvey application. The MFA system provides an additional layer of security by requiring users to provide a time-based one-time password (TOTP) in addition to their regular login credentials.

## Backend Implementation

### API Endpoints

The backend provides the following MFA-related endpoints:

1. **POST /api/Mfa/Setup** - Setup MFA for a user
   - Requires: email, password
   - Returns: QR code URL, secret key, manual entry key, userId

2. **POST /api/Mfa/Enable** - Enable MFA after verification
   - Requires: userId, mfaCode
   - Returns: success status

3. **POST /api/Mfa/Login** - Login with MFA verification
   - Requires: email, password, mfaCode (optional: userId)
   - Returns: access token, refresh token, user info

4. **GET /api/Mfa/Status/{userId}** - Get MFA status
   - Returns: isEnabled, backupCodesRemaining, lastUsedAt

5. **POST /api/Mfa/Disable** - Disable MFA
   - Requires: userId, password, mfaCode
   - Returns: success status

6. **POST /api/Mfa/GenerateBackupCodes** - Generate backup codes
   - Requires: userId, password, mfaCode
   - Returns: list of backup codes

7. **POST /api/Users/CheckMfaStatus** - Check MFA status during login
   - Requires: email, password
   - Returns: hasMfa, userId, backupCodesRemaining, lastUsedAt

### Backend Services

- **MfaService**: Handles all MFA-related business logic
- **MfaController**: API controller for MFA endpoints
- **Database Models**: MfaModel, MfaBackupCodeModel, MfaLoginAttemptModel

## Frontend Implementation

### Components

1. **MfaSetup.vue** (`/src/views/authentication/MfaSetup.vue`)
   - Multi-step setup process
   - QR code display and manual entry
   - Verification step
   - Backup codes generation

2. **MfaVerification.vue** (`/src/views/authentication/MfaVerification.vue`)
   - MFA code input during login
   - Backup code support
   - Auto-submit on 6 digits

3. **MfaSettings.vue** (`/src/views/settings/MfaSettings.vue`)
   - MFA status display
   - Enable/disable MFA
   - Generate backup codes
   - Manage MFA settings

4. **MfaWarningBanner.vue** (`/src/components/MfaWarningBanner.vue`)
   - System-wide warning panel for users without MFA
   - Bottom overlay panel (less intrusive than top banner)
   - Dismissible with localStorage persistence
   - Direct link to MFA setup
   - Automatic visibility management

### Controllers

1. **mfa_controller.js** (`/src/controllers/auth/mfa_controller.js`)
   - Handles all MFA API calls
   - Manages authentication state
   - Error handling and response processing
   - Includes `checkMfaStatus` method for efficient MFA detection

### Utilities

1. **mfa-utils.js** (`/src/utils/mfa-utils.js`)
   - Helper functions for MFA operations
   - Credential storage and retrieval
   - Code validation utilities
   - Session management functions

### Routes

- `/mfa-setup` - MFA setup page
- `/mfa-verification` - MFA verification during login
- `/user/mfa-settings` - MFA management page

## User Flow

### 1. MFA Setup Flow

1. User navigates to `/mfa-setup`
2. Enters email and password
3. System generates QR code and secret key
4. User scans QR code with authenticator app
5. User enters 6-digit code for verification
6. System enables MFA and generates backup codes
7. User downloads/saves backup codes

### 2. Login with MFA Flow

1. User enters email and password on login page
2. System checks if MFA is enabled using `/api/Users/CheckMfaStatus`
3. If MFA is enabled, store credentials and redirect to `/mfa-verification`
4. User enters 6-digit code from authenticator app or backup code
5. System verifies code and completes login
6. User is redirected to dashboard
7. Stored credentials are automatically cleared after successful login

### 3. Backup Code Usage

1. User can use backup codes instead of TOTP codes
2. Backup codes are single-use
3. System tracks remaining backup codes
4. Users can generate new backup codes

### 4. MFA Warning Banner Flow

1. User logs in without MFA enabled
2. System displays warning panel at the bottom of the application
3. User can either:
   - Click "Setup MFA" to go directly to MFA setup
   - Click "Dismiss" to hide the warning (stored in localStorage)
4. Panel automatically disappears when MFA is enabled
5. Panel reappears if MFA is disabled (unless dismissed)

## Security Features

### Rate Limiting
- Failed MFA attempts are tracked
- IP-based rate limiting for failed attempts
- Temporary lockout after too many failures

### Backup Codes
- 10 backup codes generated per user
- Single-use codes
- SHA-256 hashed storage
- Users can regenerate codes

### Session Management
- Credentials temporarily stored in session storage during MFA verification
- Automatic cleanup after successful login or logout
- Secure token management
- User ID tracking for enhanced security

### Improved Login Flow
- MFA status checked before regular login attempt
- Reduced server load by avoiding unnecessary login attempts
- Better error handling and user feedback
- Secure credential storage with automatic cleanup

### MFA Warning Banner
- System-wide warning panel for users without MFA enabled
- Bottom overlay positioning (less intrusive than top banner)
- Dismissible with localStorage persistence
- Direct navigation to MFA setup
- Automatic visibility management based on MFA status
- Event-driven updates when MFA status changes

## Technical Details

### TOTP Implementation
- Uses RFC 6238 TOTP standard
- 30-second time windows
- SHA-1 algorithm
- 6-digit codes
- 1-step tolerance for time drift

### QR Code Format
```
otpauth://totp/RouteSurveyAPI:email?secret=SECRET&issuer=RouteSurveyAPI&algorithm=SHA1&digits=6&period=30
```

### Database Schema
- `MfaSettings`: User MFA configuration
- `MfaBackupCodes`: Backup codes for users
- `MfaLoginAttempts`: Failed login attempts tracking

## Configuration

### Environment Variables
- No additional environment variables required
- Uses existing JWT configuration

### Dependencies
- `OtpNet` library for TOTP generation
- `qrcode.vue` for QR code display (frontend)
- `crypto-js` for hashing (already included)

## Testing

### Manual Testing Steps

1. **Setup MFA**:
   - Navigate to `/mfa-setup`
   - Complete the setup process
   - Verify QR code works with authenticator app

2. **Login with MFA**:
   - Login with credentials
   - Verify MFA verification page appears
   - Enter correct TOTP code
   - Verify successful login

3. **Backup Codes**:
   - Use backup code instead of TOTP
   - Verify single-use functionality
   - Generate new backup codes

4. **MFA Management**:
   - Navigate to `/user/mfa-settings`
   - Verify status display
   - Test enable/disable functionality
   - Test backup code generation

## Error Handling

### Common Error Scenarios

1. **Invalid MFA Code**: User enters wrong 6-digit code
2. **Expired Code**: Code is outside time window
3. **Rate Limiting**: Too many failed attempts
4. **Backup Code Already Used**: Attempting to reuse backup code
5. **MFA Not Enabled**: User tries to use MFA without setup

### Error Messages

- Clear, user-friendly error messages
- Specific guidance for common issues
- Helpful troubleshooting tips

## Future Enhancements

### Potential Improvements

1. **SMS MFA**: Add SMS-based MFA option
2. **Hardware Tokens**: Support for hardware security keys
3. **Admin Controls**: Admin ability to force MFA for users
4. **MFA Recovery**: Account recovery options
5. **Analytics**: MFA usage analytics and reporting

## Troubleshooting

### Common Issues

1. **QR Code Not Working**: Ensure authenticator app supports TOTP
2. **Time Sync Issues**: Check device time synchronization
3. **Backup Codes Not Working**: Verify codes haven't been used
4. **Login Loop**: Clear browser cache and cookies

### Support

For technical support with MFA implementation:
- Check browser console for errors
- Verify API endpoints are accessible
- Test with different authenticator apps
- Review server logs for backend issues 