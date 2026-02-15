// permits.mockState.ts
export type PermitStatus = "draft" | "blocked" | "ready";

export type PermitListItem = {
    id: string;
    program: "US_PERMIT";
    title: string;
    routeId: string;
    statesInRoute: string[];
    status: PermitStatus;
    readiness: { score: number; breakdown: Record<string, number> };
    updatedAt: string;
};

export type PermitCaseDTO = Record<string, unknown>; // keep loose for fixture-driven UI; tighten later

export const permitsMockState = {
    projectId: "11111111-1111-1111-1111-111111111111",
    list: {
        loading: false,
        error: null as string | null,
        items: [
            {
                id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                program: "US_PERMIT" as const,
                title: "Reactor Vessel Move – CA/TX/FL",
                routeId: "route-CA-TX-FL-001",
                statesInRoute: ["CA", "TX", "FL"],
                status: "blocked" as PermitStatus,
                readiness: {
                    score: 52,
                    breakdown: { blockingIssues: 2, blockingConflicts: 1, warnings: 3, lowConfidenceMeasurements: 1 }
                },
                updatedAt: "2026-01-27T16:05:12Z"
            },
            {
                id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                program: "US_PERMIT" as const,
                title: "Transformer Delivery – TX only",
                routeId: "route-TX-009",
                statesInRoute: ["TX"],
                status: "ready" as PermitStatus,
                readiness: {
                    score: 96,
                    breakdown: { blockingIssues: 0, blockingConflicts: 0, warnings: 1, lowConfidenceMeasurements: 0 }
                },
                updatedAt: "2026-01-27T14:22:43Z"
            }
        ] as PermitListItem[]
    },
    activeCase: {
        loading: false,
        error: null as string | null,
        data: null as PermitCaseDTO | null
    },
    ui: {
        selectedBlockId: "permit_summary",
        rightPanelTab: "rolled_up" as "rolled_up" | "by_jurisdiction"
    }
};

/**
 * Usage in Pinia store:
 * 
 * import { defineStore } from 'pinia';
 * import { permitsMockState } from '@/mocks/permits/permits.mockState';
 * 
 * export const usePermitsStore = defineStore('permits', {
 *   state: () => ({ ...permitsMockState }),
 *   actions: {
 *     async loadCasesList() { ... },
 *     async loadCase(caseId) { ... }
 *   }
 * });
 */
