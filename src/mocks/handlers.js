import { http, HttpResponse, passthrough } from 'msw'
import { MOCK_TEMPLATES } from './mock_templates'
import { MOCK_PLANNED_ROUTES } from './mock_planned_routes'
import { MOCK_SURVEYS } from './mock_surveys'

// Helper to simulate network delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Match the VITE_API_URL from .env.development
// Match the VITE_API_URL from .env.development
const API_BASE = 'https://api.route-survey.survys.com/api';

export const handlers = [
    // --- Auth & User ---
    // Handle both /Users/GetUserData and /Users/GetUserData/123
    http.get(`${API_BASE}/Users/GetUserData`, () => {
        return HttpResponse.json({
            id: 'user-123',
            firstName: 'Test',
            lastName: 'User',
            email: 'test@routesurvey.app',
            roles: ['Admin'],
            permissions: ['*'],
            onboarding_completed_at: new Date().toISOString(),
            tips_seen_count: 0
        })
    }),
    http.get(`${API_BASE}/Users/GetUserData/:id`, () => {
        return HttpResponse.json({
            id: 'user-123',
            firstName: 'Test',
            lastName: 'User',
            email: 'test@routesurvey.app',
            roles: ['Admin'],
            permissions: ['*'],
            onboarding_completed_at: new Date().toISOString(),
            tips_seen_count: 0
        })
    }),

    http.get(`${API_BASE}/Security/csrf-token`, () => {
        return HttpResponse.json({ token: 'mock-csrf-token' });
    }),

    http.get(`${API_BASE}/Stats/GetAllStats`, () => {
        return HttpResponse.json({
            activeRoutes: 5,
            pendingApprovals: 2,
            completedSurveys: 12,
            totalUsers: 10
        })
    }),
    http.post(`${API_BASE}/Stats/GetAllStats`, () => {
        console.log('[MSW] POST Stats/GetAllStats');
        return HttpResponse.json({
            activeRoutes: 5,
            pendingApprovals: 2,
            completedSurveys: 12,
            totalUsers: 10
        })
    }),


    http.get(`${API_BASE}/Users/IsUserTrailExpired/:id`, () => {
        return HttpResponse.json(false) // Not expired
    }),
    http.post(`${API_BASE}/Users/IsUserTrailExpired/:id`, () => {
        console.log('[MSW] POST Users/IsUserTrailExpired');
        return HttpResponse.json(false) // Not expired
    }),


    http.get(`${API_BASE}/Subscription/GetActiveSubscription/:id`, () => {
        return HttpResponse.json({
            planName: 'Enterprise',
            status: 'Active',
            features: ['Unlimited']
        })
    }),
    http.post(`${API_BASE}/Subscription/GetActiveSubscription/:id`, () => {
        console.log('[MSW] POST Subscription/GetActiveSubscription');
        return HttpResponse.json({
            planName: 'Enterprise',
            status: 'Active',
            features: ['Unlimited']
        })
    }),


    http.get(`${API_BASE}/Subscription/GetSubscriptionPlans`, () => {
        return HttpResponse.json([
            { id: 1, name: 'Basic', price: 0 },
            { id: 2, name: 'Pro', price: 29 },
            { id: 3, name: 'Enterprise', price: 99 }
        ])
    }),

    // --- Users Admin ---
    http.get(`${API_BASE}/UsersAdmin/GetUsers`, () => {
        return HttpResponse.json({
            result: true,
            data: [
                { id: 1, firstName: 'Test', lastName: 'User', email: 'test@example.com', role: 'Admin' }
            ]
        })
    }),

    // --- Templates ---
    http.get(`${API_BASE}/Reports/GetTemplates`, async () => {
        await delay(200);
        return HttpResponse.json({
            result: true,
            data: MOCK_TEMPLATES
        })
    }),

    // Also catch with params if needed or variations
    http.get(`${API_BASE}/Templates/GetTemplates`, async () => {
        return HttpResponse.json({ result: true, data: MOCK_TEMPLATES })
    }),

    http.get(`${API_BASE}/Templates/GetUserTemplates/:id`, async () => {
        return HttpResponse.json({ result: true, data: [] })
    }),

    http.get(`${API_BASE}/Reports/GetUserTemplates`, async () => {
        await delay(200);
        return HttpResponse.json({
            result: true,
            data: []
        })
    }),

    // --- Planning / Routes ---
    http.get(`${API_BASE}/ManualRoutes/GetManualRoutes`, async () => {
        return HttpResponse.json({
            result: true,
            data: [
                { id: 1001, title: 'New Smoke Route', distance: 100, points: 2, dateAdded: new Date().toISOString() }
            ]
        })
    }),

    http.get(`${API_BASE}/ManualRoutes/GetManualRoutesByUser/:id`, async () => {
        console.log('[MSW] ManualRoutes/GetManualRoutesByUser called');
        return HttpResponse.json({
            result: true,
            data: [
                { id: 1001, title: 'New Smoke Route', distance: 100, points: 2, dateAdded: new Date().toISOString() }
            ]
        });
    }),

    http.post(`${API_BASE}/ManualRoutes/AddManualRoute`, async () => {
        return HttpResponse.json({
            result: true,
            message: "Route created",
            data: { id: 1000 }
        })
    }),

    http.get(`${API_BASE}/ManualRoutes/RemoveManualRoute/:id/:uid`, async () => {
        return HttpResponse.json({
            result: true,
            message: "Route removed"
        })
    }),

    http.post(/\/Routes\/GetUserRoutesPaginated/, async ({ request }) => {
        const url = new URL(request.url);
        console.log(`[MSW] GetUserRoutesPaginated called (Regex Match): ${url.toString()}`);
        return HttpResponse.json({
            result: true,
            data: [
                { id: 1001, title: 'New Smoke Route', routeName: 'New Smoke Route', status: 'Draft', distance: 100, createdAt: new Date().toISOString() },
                { id: 1002, title: 'Existing Route A', routeName: 'Existing Route A', status: 'Active', distance: 200, createdAt: new Date().toISOString() }
            ],
            pagination: {
                currentPage: 1,
                pageSize: 10,
                totalCount: 2,
                totalPages: 1,
                hasPreviousPage: false,
                hasNextPage: false
            }
        })
    }),

    http.post(`${API_BASE}/Routes/AddRoute`, async () => {
        return HttpResponse.json({
            result: true,
            message: "Route created",
            data: { id: 1001 }
        })
    }),

    http.get(/\/Routes\/RemoveRoute\/.+/, async () => {
        return HttpResponse.json({
            result: true,
            message: "Route removed"
        })
    }),

    http.get(/\/Routes\/GetRoute\/(.+)/, async ({ params }) => {
        const id = Number(params[0]);
        const survey = MOCK_SURVEYS.find(s => s.id === id);
        if (survey) {
            return HttpResponse.json({
                result: true,
                data: survey
            });
        }
        return HttpResponse.json({
            result: true,
            data: {
                id: id,
                title: 'Mock Route Detail (Fallback)',
                points: []
            }
        });
    }),

    // --- Planned Routes ---
    http.get(`${API_BASE}/PlannedRoutes/GetPlannedRoutes`, async () => {
        return HttpResponse.json({
            result: true,
            data: MOCK_PLANNED_ROUTES
        })
    }),
    http.get(`${API_BASE}/PlannedRoutes/GetPlannedRoutesByUser/:id`, async () => {
        console.log('[MSW] PlannedRoutes/GetPlannedRoutesByUser called');
        return HttpResponse.json({
            result: true,
            data: MOCK_PLANNED_ROUTES
        })
    }),
    http.get(`${API_BASE}/PlannedRoutes/GetPlannedRoute/:id`, async ({ params }) => {
        const id = Number(params.id);
        const route = MOCK_PLANNED_ROUTES.find(r => r.id === id);
        return HttpResponse.json({
            result: true,
            data: route || MOCK_PLANNED_ROUTES[0]
        })
    }),
    http.post(`${API_BASE}/PlannedRoutes/AddPlannedRoute`, async () => {
        return HttpResponse.json({
            result: true,
            message: "Planned route created",
            data: { id: 200 }
        })
    }),
    http.post(`${API_BASE}/PlannedRoutes/UpdatePlannedRoute`, async () => {
        return HttpResponse.json({
            result: true,
            message: "Planned route updated"
        })
    }),
    http.get(`${API_BASE}/PlannedRoutes/RemovePlannedRoute/:id/:uid`, async () => {
        return HttpResponse.json({
            result: true,
            message: "Planned route removed"
        })
    }),

    // --- Surveys ---
    http.get(`${API_BASE}/Surveys/GetSurveys`, async () => {
        return HttpResponse.json({
            result: true,
            data: MOCK_SURVEYS
        })
    }),
    http.get(`${API_BASE}/Surveys/GetSurveysByUser/:id`, async () => {
        console.log('[MSW] Surveys/GetSurveysByUser called');
        return HttpResponse.json({
            result: true,
            data: MOCK_SURVEYS
        })
    }),
    http.get(`${API_BASE}/Surveys/GetSurvey/:id`, async () => {
        return HttpResponse.json({
            result: true,
            data: MOCK_SURVEYS[0]
        })
    }),
    http.post(`${API_BASE}/Surveys/AddSurvey`, async () => {
        return HttpResponse.json({
            result: true,
            message: "Survey created",
            data: { id: 300 }
        })
    }),
    http.post(`${API_BASE}/Surveys/UpdateSurvey`, async () => {
        return HttpResponse.json({
            result: true,
            message: "Survey updated"
        })
    }),
    http.get(`${API_BASE}/Surveys/RemoveSurvey/:id/:uid`, async () => {
        return HttpResponse.json({
            result: true,
            message: "Survey removed"
        })
    }),

    // --- Reports ---
    http.get(`${API_BASE}/Reports/GetReports`, async () => {
        return HttpResponse.json({
            result: true,
            data: [
                { id: 1, name: 'Route Assessment Report', type: 'Assessment', status: 'Completed', createdAt: '2024-03-01' },
                { id: 2, name: 'Clearance Analysis', type: 'Analysis', status: 'Draft', createdAt: '2024-03-10' },
                { id: 3, name: 'Transport Feasibility', type: 'Feasibility', status: 'Completed', createdAt: '2024-03-15' }
            ]
        })
    }),
    http.get(`${API_BASE}/Reports/GetReportsByUser/:id`, async () => {
        return HttpResponse.json({
            result: true,
            data: [
                { id: 1, name: 'Route Assessment Report', type: 'Assessment', status: 'Completed', createdAt: '2024-03-01' },
                { id: 2, name: 'Clearance Analysis', type: 'Analysis', status: 'Draft', createdAt: '2024-03-10' }
            ]
        })
    }),
    http.get(`${API_BASE}/Reports/GetReport/:id`, async () => {
        return HttpResponse.json({
            result: true,
            data: { id: 1, name: 'Route Assessment Report', type: 'Assessment', status: 'Completed', content: {} }
        })
    }),
    http.post(`${API_BASE}/Reports/AddReport`, async () => {
        return HttpResponse.json({
            result: true,
            message: "Report created",
            data: { id: 400 }
        })
    }),
    http.post(`${API_BASE}/Reports/UpdateReport`, async () => {
        return HttpResponse.json({
            result: true,
            message: "Report updated"
        })
    }),
    http.get(`${API_BASE}/Reports/RemoveReport/:id/:uid`, async () => {
        return HttpResponse.json({
            result: true,
            message: "Report removed"
        })
    }),
    http.post(`${API_BASE}/Reports/GenerateReport`, async () => {
        return HttpResponse.json({
            result: true,
            message: "Report generated",
            data: { url: '/mock-report.pdf' }
        })
    }),

    // --- Report Generations ---
    http.get(`${API_BASE}/ReportGenerations/GetReportGenerations/:routeId`, async () => {
        console.log('[MSW] ReportGenerations/GetReportGenerations called');
        return HttpResponse.json({
            result: true,
            data: [
                {
                    id: 'rg-001',
                    routeId: 1001,
                    title: 'Route Assessment Report v3',
                    fileName: 'route_assessment_v3.pdf',
                    filePath: 'reports/route_assessment_v3.pdf',
                    status: 'Success',
                    dateAdded: '2026-01-20T14:30:00Z'
                },
                {
                    id: 'rg-002',
                    routeId: 1001,
                    title: 'Route Assessment Report v2',
                    fileName: 'route_assessment_v2.pdf',
                    filePath: 'reports/route_assessment_v2.pdf',
                    status: 'Success',
                    dateAdded: '2026-01-15T10:00:00Z'
                },
                {
                    id: 'rg-003',
                    routeId: 1001,
                    title: 'Route Assessment Report v1',
                    fileName: 'route_assessment_v1.pdf',
                    filePath: 'reports/route_assessment_v1.pdf',
                    status: 'Failed',
                    dateAdded: '2026-01-10T09:00:00Z'
                }
            ]
        })
    }),
    http.get(`${API_BASE}/ReportGenerations/GetReportGeneration/:id`, async () => {
        return HttpResponse.json({
            result: true,
            data: {
                id: 'rg-001',
                routeId: 1001,
                title: 'Route Assessment Report v3',
                fileName: 'route_assessment_v3.pdf',
                filePath: 'reports/route_assessment_v3.pdf',
                status: 'Success',
                dateAdded: '2026-01-20T14:30:00Z'
            }
        })
    }),
    http.post(`${API_BASE}/ReportGenerations/AddReportGeneration`, async () => {
        return HttpResponse.json({
            result: true,
            message: "Report generation started",
            data: { id: 'rg-new' }
        })
    }),
    http.post(`${API_BASE}/ReportGenerations/UpdateReportGeneration`, async () => {
        return HttpResponse.json({
            result: true,
            message: "Report generation updated"
        })
    }),

    // --- Obstructions ---
    http.get(`${API_BASE}/Obstructions/GetObstructions`, async () => {
        return HttpResponse.json({
            result: true,
            data: [
                { id: 1, type: 'Bridge', name: 'Main Street Bridge', clearance: 4.2, location: { lat: 25.7743, lng: -80.1937 } },
                { id: 2, type: 'Tunnel', name: 'Highway Tunnel A', clearance: 3.8, location: { lat: 25.7800, lng: -80.2000 } },
                { id: 3, type: 'Overhead Lines', name: 'Power Line Crossing', clearance: 5.5, location: { lat: 25.7850, lng: -80.2100 } }
            ]
        })
    }),
    http.get(`${API_BASE}/Obstructions/GetObstructionsByRoute/:id`, async () => {
        return HttpResponse.json({
            result: true,
            data: [
                { id: 1, type: 'Bridge', name: 'Main Street Bridge', clearance: 4.2, location: { lat: 25.7743, lng: -80.1937 } }
            ]
        })
    }),

    // --- Observations ---
    http.get(`${API_BASE}/Observations/GetObservations`, async () => {
        return HttpResponse.json({
            result: true,
            data: [
                { id: 1, type: 'Note', description: 'Road surface rough', location: { lat: 25.7743, lng: -80.1937 }, createdAt: '2024-03-01' },
                { id: 2, type: 'Photo', description: 'Narrow passage', location: { lat: 25.7800, lng: -80.2000 }, createdAt: '2024-03-02' }
            ]
        })
    }),
    http.get(`${API_BASE}/Observations/GetObservationsByRoute/:id`, async () => {
        return HttpResponse.json({
            result: true,
            data: [
                { id: 1, type: 'Note', description: 'Road surface rough', location: { lat: 25.7743, lng: -80.1937 } }
            ]
        })
    }),

    // --- Engineering Integration (Phase 2.0) ---
    // POST /api/v1/permit-cases/:caseId/link-engineering
    http.post(/\/api\/v1\/permit-cases\/([^/]+)\/link-engineering/, async ({ request, params }) => {
        const caseId = params[0];
        const body = await request.json();
        const { calc_job_id } = body;

        console.log(`[MSW] Linking engineering job ${calc_job_id} to case ${caseId}`);

        // Return updated case with engineering data
        return HttpResponse.json({
            id: caseId,
            engineering_job_id: calc_job_id,
            payload_json: {
                transport: {
                    overall: {
                        width_m: 5.893,
                        height_m: 5.892,
                        length_m: 45.110,
                        gross_kg: 210000,
                        _meta: {
                            source: 'ENGINEERING',
                            sourceRef: { calcJobId: calc_job_id },
                            updatedAt: new Date().toISOString()
                        }
                    },
                    axleConfig: {
                        groups: ['Tractor', 'Trailer Front', 'Trailer Rear'],
                        spacings_m: [5.0, 12.0],
                        loads_kg: [60000, 90000, 60000],
                        _meta: {
                            source: 'ENGINEERING',
                            sourceRef: { calcJobId: calc_job_id },
                            updatedAt: new Date().toISOString()
                        }
                    }
                }
            },
            updated_at: new Date().toISOString()
        });
    }),

    // POST /api/v1/permit-cases/:caseId/sync-engineering
    http.post(/\/api\/v1\/permit-cases\/([^/]+)\/sync-engineering/, async ({ params }) => {
        const caseId = params[0];
        console.log(`[MSW] Syncing engineering data for case ${caseId}`);

        return HttpResponse.json({
            updated_fields: ['width_m', 'height_m', 'length_m', 'gross_kg'],
            preserved_fields: [],
            sync_timestamp: new Date().toISOString()
        });
    }),

    // GET /api/v1/permit-cases/:caseId/engineering-status
    http.get(/\/api\/v1\/permit-cases\/([^/]+)\/engineering-status/, async ({ params }) => {
        const caseId = params[0];
        console.log(`[MSW] Getting engineering status for case ${caseId}`);

        // Mock: return unlinked for test case
        const isLinked = !caseId.includes('unlinked');

        return HttpResponse.json({
            is_linked: isLinked,
            engineering_job_id: isLinked ? 'engjob-5555' : null,
            last_sync_at: isLinked ? new Date(Date.now() - 3600000).toISOString() : null,
            available_data: isLinked ? {
                overall_dimensions: true,
                axle_configuration: true
            } : {}
        });
    }),

    // POST /api/v1/permit-cases/:caseId/unlink-engineering
    http.post(/\/api\/v1\/permit-cases\/([^/]+)\/unlink-engineering/, async ({ params }) => {
        const caseId = params[0];
        console.log(`[MSW] Unlinking engineering from case ${caseId}`);

        return HttpResponse.json({
            id: caseId,
            engineering_job_id: null,
            updated_at: new Date().toISOString()
        });
    }),

    // GET /api/v1/calc-jobs/:jobId (for update detection)
    http.get(/\/api\/v1\/calc-jobs\/([^/]+)/, async ({ params }) => {
        const jobId = params[0];
        console.log(`[MSW] Getting calc job ${jobId}`);

        return HttpResponse.json({
            id: jobId,
            status: 'completed',
            created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
            updated_at: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
            results: {
                overall_dimensions: {
                    width_m: 5.893,
                    height_m: 5.892,
                    length_m: 45.110,
                    gross_kg: 210000
                },
                axle_configuration: {
                    groups: ['Tractor', 'Trailer Front', 'Trailer Rear'],
                    spacings_m: [5.0, 12.0],
                    loads_kg: [60000, 90000, 60000]
                }
            }
        });
    }),

    // --- Generic GET fallback ---
    http.get(`${API_BASE}/:path*`, async ({ request }) => {
        console.log('[MSW] Fallback GET', request.url);
        return HttpResponse.json({ result: true, data: [] });
    }),

    // --- Generic POST fallback ---
    http.post(`${API_BASE}/:path*`, async ({ request }) => {
        console.log('[MSW] Fallback POST', request.url);
        return HttpResponse.json({ result: true, message: 'Success' });
    }),


    // --- Passthrough for Static Assets & Source Files (Vital for E2E/Vite) ---
    http.get('/*.vue', () => { return passthrough() }),
    http.get('/src/*', () => { return passthrough() }),
    http.get('/node_modules/*', () => { return passthrough() }),
    http.get('/@fs/*', () => { return passthrough() }),
    http.get('/@id/*', () => { return passthrough() }),
    http.get('/@vite/*', () => { return passthrough() }),

    // Generic OPTIONS handler for CORS preflight
    http.options(`${API_BASE}/:path*`, async ({ request }) => {
        console.log('[MSW] OPTIONS preflight', request.url);
        return HttpResponse.json({}, { status: 200 });
    }),

    // --- Auth & User ---
    http.post('https://api.route-survey.survys.com/api/Users/LoginMain', async ({ request }) => {
        const body = await request.json();
        console.log('[MSW] Handling Users/LoginMain request for:', body.Email);

        return HttpResponse.json({
            result: true,
            message: 'Login successful',
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ2OTA4OTg2MDYsInVpZCI6MTIzfQ.signature',
            refreshToken: 'mock-refresh-token',
            userId: 123,
            uid: 123, // Controller expects this for cookie
            userType: 'Admin',
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ2OTA4OTg2MDYsInVpZCI6MTIzfQ.signature', // legacy
            user: { id: 123, email: 'test@routesurvey.app', onboarding_completed_at: new Date().toISOString(), tips_seen_count: 0 }
        }, {
            headers: {
                'Set-Cookie': 'l_t=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ2OTA4OTg2MDYsInVpZCI6MTIzfQ.signature; Path=/; Max-Age=3600'
            }
        })
    }),

    http.post(`${API_BASE}/Users/CompleteOnboarding`, () => {
        return HttpResponse.json({
            result: true,
            message: 'Onboarding completed'
        })
    }),


    http.post(`${API_BASE}/Users/CheckMfaStatus`, () => {
        return HttpResponse.json({
            result: true,
            message: 'Success',
            data: { hasMfa: false, userId: 123 }
        })
    }),

    http.post(`${API_BASE}/Mfa/Login`, () => {
        return HttpResponse.json({
            result: true,
            message: 'MFA Login Success',
            accessToken: 'mock-jwt-token',
            refreshToken: 'mock-refresh-token',
            userId: 123,
            userType: 'Admin'
        })
    }),

    http.get(`${API_BASE}/Mfa/Status/:id`, () => {
        return HttpResponse.json({
            result: true,
            isEnabled: false
        })
    }),

    // --- Notifications ---
    http.get(`${API_BASE}/Notifications/GetNotificationsForUser/:id`, () => {
        return HttpResponse.json({
            result: true,
            data: []
        })
    }),

    // --- Organizations ---
    http.get(`${API_BASE}/OrganizationsAdmin/GetOrganizations`, () => {
        return HttpResponse.json({
            result: true,
            data: [
                { id: 1, name: 'Mock Org', type: 'Carrier' }
            ]
        })
    }),
]
