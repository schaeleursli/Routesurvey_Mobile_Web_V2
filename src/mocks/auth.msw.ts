import { http, HttpResponse } from "msw";

export const authHandlers = [
    // Login Main
    http.post('/Users/LoginMain', async () => {
        return HttpResponse.json({
            result: true,
            message: "Login successful",
            accessToken: "mock_access_token_123",
            refreshToken: "mock_refresh_token_456",
            uid: 1,
            email: "demo@routesurvey.app",
            userData: {
                id: 1,
                email: "demo@routesurvey.app",
                firstName: "Demo",
                lastName: "User"
            }
        }, { status: 200 });
    }),

    // Get User Data
    http.get('/Users/GetUserData/:uid', () => {
        return HttpResponse.json({
            result: true,
            message: "Success",
            userData: {
                id: 1,
                email: "demo@routesurvey.app",
                firstName: "Demo",
                lastName: "User",
                role: "User"
            }
        }, { status: 200 });
    }),

    // Is User Trail Expired
    http.get('/Users/IsUserTrailExpired/:uid', () => {
        return HttpResponse.json({
            result: true,
            message: "Trail active",
            data: {
                isExpired: false
            },
            remainingDays: 30,
            expireDate: "2099-12-31"
        });
    })
];
