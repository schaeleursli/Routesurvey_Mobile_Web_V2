import { http, HttpResponse } from "msw";
import fixtures from "../../../tests/e2e/permits/fixtures/permits.fixtures.json";

// Define types for fixtures to avoid 'any'
interface PermitAttachments {
    kmlProvided?: boolean;
    clearanceEvidenceProvided?: boolean;
    [key: string]: unknown;
}

interface PermitTransport {
    overall?: {
        width_m?: number;
        height_m?: number;
        length_m?: number;
        gross_kg?: number;
        _meta?: {
            source?: string;
            [key: string]: unknown;
        };
        [key: string]: unknown;
    };
    axleConfig?: {
        groups?: string[];
        spacings_m?: number[];
        loads_kg?: number[];
        _meta?: {
            source?: string;
            [key: string]: unknown;
        };
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

interface PermitPayload {
    attachments?: PermitAttachments;
    transport?: PermitTransport;
    [key: string]: unknown;
}

interface PermitValidation {
    blockingIssues?: unknown[];
    warnings?: unknown[];
}

interface PermitRollup {
    validation?: PermitValidation;
    conflicts?: unknown[];
    [key: string]: unknown;
}

interface PermitCase {
    id: string;
    title: string;
    payload_json: PermitPayload; // Typed payload
    rollup_json: PermitRollup; // Typed rollup
    updated_at: string;
    status: string;
    readiness_score: number;
    engineering_job_id?: string;
    [key: string]: unknown;
}

interface RouteSegment {
    id: string;
    [key: string]: unknown;
}

interface PermitCasePatchRequest {
    title?: string;
    payload_json?: Record<string, unknown>;
}

const projectId = fixtures.ids.projectId;
const casesById = fixtures.api.permitCaseDetail as unknown as Record<string, PermitCase>;
const listCases = fixtures.api.listCases;
const routeSegments = fixtures.api.routeSegments as unknown as Record<string, RouteSegment>;
const createResponse = fixtures.api.createCaseResponse;

export const permitsHandlers = [
    // LIST cases (dashboard)
    http.get(`/api/v1/projects/${projectId}/permit-cases`, () => {
        return HttpResponse.json(listCases, { status: 200 });
    }),

    // GET case detail
    http.get<{ caseId: string }>(`/api/v1/permit-cases/:caseId`, ({ params }) => {
        const caseId = String(params.caseId);
        const dto = casesById[caseId];
        if (!dto) return HttpResponse.json({ message: "Not found" }, { status: 404 });
        return HttpResponse.json(dto, { status: 200 });
    }),

    // CREATE case
    http.post(`/api/v1/projects/${projectId}/permit-cases/us`, async () => {
        return HttpResponse.json(createResponse, { status: 201 });
    }),



    // PATCH case with status flip simulation
    http.patch<{ caseId: string }, PermitCasePatchRequest>('/api/v1/permit-cases/:caseId', async ({ params, request }) => {
        const caseId = String(params.caseId);
        const existing = casesById[caseId];
        if (!existing) return HttpResponse.json({ message: "Not found" }, { status: 404 });

        const body = (await request.json()) as PermitCasePatchRequest;
        const payloadPatch = body.payload_json ?? {};
        const titlePatch = body.title;

        // Deep merge payload
        const merged = structuredClone(existing);

        if (payloadPatch) {
            merged.payload_json = deepMerge(merged.payload_json, payloadPatch);
        }

        if (titlePatch) {
            merged.title = titlePatch;
        }

        merged.updated_at = new Date().toISOString();

        // Status flip simulation: Blocked → Ready
        const attachments = merged.payload_json?.attachments || {};
        const validation = merged.rollup_json?.validation || { blockingIssues: [], warnings: [] };

        // If critical attachments are now provided, clear blocking status
        if (attachments.kmlProvided && attachments.clearanceEvidenceProvided) {
            merged.status = "ready";
            merged.readiness_score = 96;

            // Clear blocking issues
            if (merged.rollup_json) {
                if (!merged.rollup_json.validation) {
                    merged.rollup_json.validation = { blockingIssues: [], warnings: [] };
                }
                merged.rollup_json.validation.blockingIssues = [];
                merged.rollup_json.conflicts = [];
            }
        } else if (!attachments.kmlProvided || !attachments.clearanceEvidenceProvided) {
            // Keep or revert to blocked if missing critical items
            merged.status = "blocked";
        }

        // Update in-memory store
        casesById[caseId] = merged;

        return HttpResponse.json(merged, { status: 200 });
    }),

    // Route segments
    http.get<{ routeId: string }>(`/api/v1/routes/:routeId/segments`, ({ params }) => {
        const routeId = String(params.routeId);
        const dto = routeSegments[routeId];
        if (!dto) return HttpResponse.json({ message: "Not found" }, { status: 404 });
        return HttpResponse.json(dto, { status: 200 });
    }),

    // Phase 2: Link Engineering
    http.post<{ caseId: string }>(`/api/v1/permit-cases/:caseId/link-engineering`, async ({ params, request }) => {
        const caseId = String(params.caseId);
        const existing = casesById[caseId];
        if (!existing) return HttpResponse.json({ message: "Not found" }, { status: 404 });

        const body = (await request.json()) as { calc_job_id: string };
        const calcJobId = body.calc_job_id;

        const merged = structuredClone(existing);
        merged.engineering_job_id = calcJobId;

        // Auto-populate engineering data
        if (!merged.payload_json.transport) {
            merged.payload_json.transport = {};
        }

        merged.payload_json.transport.overall = {
            width_m: 5.893,
            height_m: 5.892,
            length_m: 45.110,
            gross_kg: 210000,
            _meta: {
                source: "ENGINEERING",
                sourceRef: { calcJobId },
                updatedAt: new Date().toISOString()
            }
        };

        merged.payload_json.transport.axleConfig = {
            groups: ["Tractor", "Trailer Front", "Trailer Rear"],
            spacings_m: [5.0, 12.0],
            loads_kg: [60000, 90000, 60000],
            _meta: {
                source: "ENGINEERING",
                sourceRef: { calcJobId },
                updatedAt: new Date().toISOString()
            }
        };

        merged.updated_at = new Date().toISOString();

        casesById[caseId] = merged;
        return HttpResponse.json(merged, { status: 200 });
    }),

    // Phase 2: Sync Engineering
    http.post<{ caseId: string }>(`/api/v1/permit-cases/:caseId/sync-engineering`, async ({ params }) => {
        const caseId = String(params.caseId);
        const existing = casesById[caseId];
        if (!existing) return HttpResponse.json({ message: "Not found" }, { status: 404 });

        if (!existing.engineering_job_id) {
            return HttpResponse.json({ message: "No engineering job linked" }, { status: 400 });
        }

        // Mock sync response
        return HttpResponse.json({
            updated_fields: ["width_m", "height_m", "length_m", "gross_kg"],
            preserved_fields: [],
            sync_timestamp: new Date().toISOString()
        }, { status: 200 });
    }),

    // Phase 2: Get Engineering Status
    http.get<{ caseId: string }>(`/api/v1/permit-cases/:caseId/engineering-status`, ({ params }) => {
        const caseId = String(params.caseId);
        const existing = casesById[caseId];
        if (!existing) return HttpResponse.json({ message: "Not found" }, { status: 404 });

        const hasEngineering = existing.engineering_job_id ||
            existing.payload_json?.transport?.overall?._meta?.source === "ENGINEERING";

        return HttpResponse.json({
            is_linked: hasEngineering,
            engineering_job_id: existing.engineering_job_id || null,
            last_sync_at: existing.updated_at,
            available_data: hasEngineering ? {
                overall_dimensions: true,
                axle_configuration: true
            } : {}
        }, { status: 200 });
    })
];

// Helper: Deep merge utility
// Helper: Deep merge utility
function deepMerge<T extends Record<string, unknown>>(target: T, source: T): T {
    const output: Record<string, unknown> = { ...target };

    for (const key in source) {
        const srcValue = source[key];
        const tgtValue = target[key];

        if (srcValue && typeof srcValue === 'object' && !Array.isArray(srcValue)) {
            // Recurse if both are objects
            const tgtObj = (tgtValue && typeof tgtValue === 'object') ? (tgtValue as Record<string, unknown>) : {};
            output[key] = deepMerge(tgtObj, srcValue as Record<string, unknown>);
        } else {
            output[key] = srcValue;
        }
    }

    return output as T;
}
