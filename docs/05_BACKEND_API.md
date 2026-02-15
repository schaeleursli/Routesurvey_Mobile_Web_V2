# Backend API Documentation

This document outlines the backend API structure, authentication mechanisms, and available endpoints as implemented in the frontend application (`RSConsole-V3`).

## Overview

-   **Base URL**: Configured via `VITE_API_URL` environment variable.
-   **MASL API URL**: Configured via `VITE_MASL_API_BASE_URL` (used specifically for reporting).
-   **Authentication**: Bearer Token (JWT).
    -   Token stored in `l_t` cookie.
    -   Refresh token stored in `refresh_token` cookie.
    -   Header: `Authorization: Bearer <token>`
-   **CSRF Protection**:
    -   Token managed via `csrfManager`.
    -   Header: `X-CSRF-Token` required for state-changing methods (POST, PUT, DELETE, PATCH).
-   **Global Interceptors**:
    -   `src/utils/axios-interceptors.js` handles token injection and 401/403 refreshing logic.

## Resource Groups & Endpoints

> **Legacy API Support**: For information on switching back to initial API endpoints/components, see **[Switching to Legacy APIs](./developer/API_SWITCHING.md)**.

The following sections list the API calls managed by the frontend controllers, grouped by their respective distinct features.

### 1. Authentication & MFA
**Controller**: `auth_controller.js`, `mfa_controller.js`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `Users/LoginMain` | Login with Email/Password |
| POST | `Users/LoginAdmin` | Login for Admin users |
| POST | `Users/LoginWithPhoneNumber` | Login with Phone Number |
| POST | `Token/refresh` | Refresh Access Token |
| POST | `Token/logout` | Logout (Revoke Refresh Token) |
| POST | `Token/revoke-all` | Revoke all tokens for user |
| GET | `Users/GetUserData/{id}` | Get current user profile data |
| POST | `Users/UpdateUserInfo` | Update user profile |
| POST | `Users/UpdateCompanyInfo` | Update company details |
| POST | `Mfa/Setup` | Setup MFA (returns QR code/Secret) |
| POST | `Mfa/Enable` | Enable MFA with verification code |
| POST | `Mfa/Login` | Verify MFA code during login |
| POST | `Mfa/Disable` | Disable MFA |
| GET | `Mfa/Status/{userId}` | Get MFA status |
| POST | `Mfa/GenerateBackupCodes` | Generate new backup codes |
| POST | `Users/CheckMfaStatus` | Check if user has MFA enabled before login |
| GET | `Security/csrf-token` | Get CSRF token for state-changing requests |

### 2. Users & Administration
**Controller**: `users_admin_controller.js`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `UsersAdmin/AddUser` | Create a new user |
| POST | `UsersAdmin/UpdateUser` | Update existing user |
| GET | `UsersAdmin/DeleteUser/{id}/{uid}` | Soft delete a user |
| GET | `UsersAdmin/GetUser/{id}` | Get user details |
| GET | `UsersAdmin/GetUsers` | List all users |
| POST | `UsersAdmin/ChangeUserPassword` | Admin reset of user password |
| POST | `UsersAdmin/FreezeUser` | Freeze user account |
| POST | `UsersAdmin/UnfreezeUser` | Unfreeze user account |
| POST | `UsersAdmin/SwitchUserPlan` | Change user subscription plan |
| GET | `UsersAdmin/CancelUserPlan/{userId}/{uid}` | Cancel user plan |

### 3. Organizations
**Controller**: `organizations_admin_controller.js`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `OrganizationsAdmin/AddOrganization` | Create organization |
| POST | `OrganizationsAdmin/UpdateOrganization` | Update organization |
| GET | `OrganizationsAdmin/DeleteOrganization/{id}/{uid}` | Delete organization |
| GET | `OrganizationsAdmin/GetOrganization/{id}` | Get organization details |
| GET | `OrganizationsAdmin/GetOrganizations` | List all organizations |
| POST | `OrganizationsAdmin/AssignUserToOrganization` | Add user to org |
| POST | `OrganizationsAdmin/UnassignUserFromOrganization`| Remove user from org |
| GET | `OrganizationsAdmin/GetOrganizationUsers/{id}` | List users in org |
| GET | `OrganizationsAdmin/GetOrganizationManagers/{id}`| List managers in org |
| GET | `OrganizationsAdmin/GetOrganizationAdmin/{id}` | Get admin of org |
| POST | `OrganizationsAdmin/ChangeUserRole` | Change user role within org |
| GET | `OrganizationsAdmin/GetUserOrganization/{userId}`| Get org for a specific user |

### 4. Routes (General & Manual)
**Controller**: `routes_controller.js`, `manual_routes_controller.js`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `Routes/AddRoute` | Create new route |
| POST | `Routes/UpdateRoute` | Update route details |
| GET | `Routes/RemoveRoute/{id}/{uid}` | Remove route |
| GET | `Routes/ArchiveRoute/{id}/{uid}` | Archive route |
| GET | `Routes/UnarchiveRoute/{id}/{uid}` | Unarchive route |
| GET | `Routes/GetRoute/{id}` | Get specific route |
| GET | `Routes/GetUserRoutes/{userId}` | Get routes for a user |
| POST | `Routes/SearchRoutes` | Search routes with query |
| GET | `Routes/GetRouteReportData/{routeId}` | Get stats/data for reports |
| POST | `ManualRoutes/AddManualRoute` | Create manual route |
| POST | `ManualRoutes/UpdateManualRoute` | Update manual route |
| GET | `ManualRoutes/GetManualRoutes` | List all manual routes |

### 5. Planned Routes
**Controller**: `planned_routes_controller.js`

*Note: Planned Route data is often stored as a JSON string within the `Data` field.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `PlannedRoutes/AddPlannedRoute` | Create planned route |
| POST | `PlannedRoutes/UpdatePlannedRoute` | Update planned route |
| GET | `PlannedRoutes/DeletePlannedRoute/{id}/{uid}` | Delete planned route |
| GET | `PlannedRoutes/GetPlannedRoutes` | List all planned routes |
| GET | `PlannedRoutes/GetPlannedRoute/{id}` | Get specific planned route |
| GET | `PlannedRoutes/GetUserPlannedRoutes/{uid}` | Get routes for current user |
| POST | `PlannedRoutes/UpdateRouteData` | Update specific JSON data blob |
| GET | `PlannedRoutes/GetRouteData/{routeId}` | Get specific JSON data blob |

### 6. Screenshots & Files
**Controller**: `route_map_screenshots_controller.js`, `file_management_controller.js`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `Route/MapScreenshots/AddMapScreenshot` | Add screenshot to route |
| GET | `Route/MapScreenshots/GetMapScreenshotsByRouteId`| List screenshots for route |
| POST | `Route/MapScreenshots/UpdateMapScreenshotOrder`| Reorder screenshots |
| POST | `FileManagement/UploadUserPhoto` | Upload user avatar |
| POST | `FileManagement/UploadCompanyLogo` | Upload company logo |
| POST | `FileManagement/UploadRoutePhoto` | Upload route photo |

### 7. Share Center
**Controller**: `share_center_controller.js`

*Handles sharing of different route aspects (Report, Route, Data, Map, Photos).*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `ShareCenter/Generate[Type]RouteShare` | Generate share link (Type=Report, Route, etc.) |
| GET | `ShareCenter/Get[Type]RouteShareById/{id}` | Get share details by ID |
| POST | `ShareCenter/Get[Type]RouteShareFromUrl` | Resolve share from a public URL |
| GET | `ShareCenter/Delete[Type]RouteShare/{id}/{uid}` | Delete a share link |
| POST | `ShareCenter/GenerateZipFromUrls` | Generate ZIP download from URLs |

*(Replace `[Type]` with `Report`, `Route`, `Data`, `Map`, or `Photos`)*

### 8. Subscriptions & Payments
**Controller**: `subscription_plans_controller.js`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `Subscription/GetSubscriptionPlans` | List available plans |
| POST | `Subscription/AddSubscriptionPlan` | Add new plan (Admin) |
| POST | `Stripe/CreateSubscription` | Create Stripe subscription |
| GET | `Stripe/CancelSubscription/{uid}` | Cancel Stripe subscription |
| POST | `Stripe/CreatePaymentIntent` | Create payment intent |
| GET | `Subscription/GetActiveSubscription/{uid}` | Get current user's subscription |

### 9. Templates
**Controller**: `templates_controller.js`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `Templates/AddTemplate` | Create system template |
| GET | `Templates/GetTemplates` | List system templates |
| POST | `Templates/AddUserTemplate` | Create user-specific template |
| GET | `Templates/GetUserTemplates/{uid}` | List user specific templates |

### 10. Reporting
**Controller**: `reporting_controller.js`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/generate_masl_doc_from_template_non_blocking` | Generate PDF/Doc from template (MASL API) |

*(Note: This uses the separate MASL API service)*

### 11. Other Utilities
**Controllers**: `stats_controller.js`, `notifications_controller.js`, `account_requests_controller.js`

-   **Stats**: `Stats/GetMyStats/{uid}`, `Stats/GetAllStats`
-   **Notifications**: `Notifications/SendSingleNotification`, `Notifications/GetNotificationsForUser/{uid}`
-   **AccountRequests**: `AccountRequests/AddAccountRequest`, `AccountRequests/GetAccountRequests`

---

## Gap Analysis & Future Improvements

The following gaps have been identified based on the feature comparison between different modules (e.g., General Routes vs. Planned Routes).

### Planned Routes Gaps
1.  **Filtering & Search**: Unlike `Routes/SearchRoutes`, the `PlannedRoutes` module lacks a dedicated backend search/filter endpoint. Currently, all routes are fetched (`GetPlannedRoutes`), potentially causing performance issues as data grows.
    *   *Recommendation*: Implement `PlannedRoutes/SearchPlannedRoutes` accepting query parameters.
2.  **Pagination**: There is no paginated endpoint for planned routes (e.g., `GetUserPlannedRoutesPaginated`).
    *   *Recommendation*: Add pagination support similar to `Routes/GetUserRoutesPaginated`.
3.  **Assignment Workflow**: There is no explicit endpoint to "assign" a planned route to another surveyor. While `UpdatePlannedRoute` allows changing the `UserId`, a dedicated `AssignRoute` endpoint would be safer and better for triggering notifications.
    *   *Recommendation*: Add `PlannedRoutes/AssignRoute` endpoint.
4.  **Conversion to Actual Route**: There is no backend endpoint to convert a "Planned Route" into an active "Route". This logic likely resides entirely on the frontend or is manual.
    *   *Recommendation*: Create a `PlannedRoutes/ConvertToRoute` endpoint to handle the data migration transactional integrity.

### General Backend Observations
-   **Type Safety**: The API relies heavily on passing JSON strings within payloads (e.g., `Data: JSON.stringify(data)`). This reduces type safety and validation on the server side.
    *   *Recommendation*: Move towards strongly typed DTOs where possible.
-   **Standardization**: Some endpoints use `GET` for actions that should be `DELETE` (e.g., `DeletePlannedRoute`).
    *   *Recommendation*: Standardize on HTTP verbs (`DELETE` for deletions, `PUT`/`PATCH` for updates).
