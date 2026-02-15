import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import type {
    ReportModel,
    ReportType,
    SectionType,
    ReportSection,
    SectionGroup,
    ReportMetadata,
    Appendix,
    SectionConfiguration,
    SectionStatus
} from '@/types/report';
import {
    REQUIRED_SECTIONS,
    ALL_SECTIONS_CONFIG,
    SECTION_GROUPS_ORDER
} from '@/types/report';
import { getDefaultConfiguration } from '@/components/reports/editor/config/sectionConfigSchemas';
import { v4 as uuidv4 } from 'uuid'; // Assuming uuid is available, else use custom random
import { useAuthStore } from '@/stores/auth';

export const useReportStore = defineStore('report', () => {

    // --- State ---
    const activeReport = ref<ReportModel | null>(null);
    const isDirty = ref(false);

    // --- Getters ---

    const sectionsByGroup = computed(() => {
        if (!activeReport.value) return {};

        // Initialize groups in order
        const groups = {} as Record<SectionGroup, ReportSection[]>;
        SECTION_GROUPS_ORDER.forEach(g => groups[g] = []);

        // Distribute sections
        activeReport.value.sections.forEach(section => {
            if (groups[section.group]) {
                groups[section.group].push(section);
            }
        });

        return groups;
    });

    const isReportValid = computed(() => {
        if (!activeReport.value) return false;
        // Check all Enabled sections. If any is Error or Incomplete (and required), return false.
        // Also check if all REQUIRED sections are present and Enabled.
        return activeReport.value.sections.every(s => {
            // If disabled, it's valid (unless it's required, but logic prevents disabling required)
            if (!s.enabled) return true;

            // If enabled, must not be incomplete or error
            return s.status === 'Complete' || s.status === 'Warning';
        });
    });

    // --- Actions ---

    function initializeReport(
        type: ReportType = 'Desktop Route Review',
        initialMetadata?: Partial<ReportMetadata>
    ) {
        const requiredTypes = REQUIRED_SECTIONS[type];

        const sections: ReportSection[] = ALL_SECTIONS_CONFIG.map(config => {
            const isRequired = requiredTypes.includes(config.type);

            return {
                id: uuidv4(),
                type: config.type,
                title: config.title,
                group: config.group,
                required: isRequired,
                enabled: isRequired, // Required sections enabled by default
                status: isRequired ? 'Incomplete' : 'Disabled',
                // Optional sections default to Disabled unless we decide otherwise? 
                // Prompt says "Optional sections... When toggled ON again...". 
                // Let's default optional to Disabled to start clean, or Enabled-but-empty?
                // Prompt "Empty-state rules... C. Optional section (disabled) Collapsed 'Optional' badge".
                // Let's default non-required to 'Disabled' status if they are truly optional.
                // Actually, for better UX, maybe we enable them but mark as incomplete? 
                // Prompt says: "When OFF: Section hidden from editor... Status shown as Disabled".
                // So I will initialize non-required as enabled=false (or enabled=true but status=disabled handled by UI?).
                // "Toggle disabled for required sections". 

                // Let's set enabled = true for ALL initially, but status = Disabled for optional?
                // No, "When OFF: Section hidden from editor". So enabled property governs visibility.
                // Let's set non-required to enabled=false? No, user needs to see them in list to toggle on.
                // Wait, sidebar lists ALL sections. "Disabled sections remain visible but inactive".
                // So enabled=false is correct for "Hidden from editor, visible in sidebar".
                content: '',
                configuration: getDefaultConfiguration(config.type)
            };
        });

        activeReport.value = {
            id: uuidv4(),
            metadata: {
                title: 'New Report',
                reportType: type,
                revision: 'Rev A',
                status: 'Draft',
                client: initialMetadata?.client || '',
                project: initialMetadata?.project || '',
                routeOrigin: initialMetadata?.routeOrigin || '',
                routeDestination: initialMetadata?.routeDestination || '',
                author: initialMetadata?.author || '',
                company: initialMetadata?.company || '',
                ...initialMetadata
            },
            sections: sections,
            sectionOrder: sections.map(s => s.id),
            appendices: []
        };

        isDirty.value = false;
    }

    function toggleSection(sectionId: string) {
        if (!activeReport.value) return;

        const section = activeReport.value.sections.find(s => s.id === sectionId);
        if (!section) return;

        if (section.required) {
            // Cannot toggle off required section
            console.warn('Cannot disable required section');
            return;
        }

        section.enabled = !section.enabled;
        if (section.enabled) {
            // Recalculate status?
            if (section.status === 'Disabled') {
                section.status = 'Incomplete';
            }
        } else {
            section.status = 'Disabled';
        }

        isDirty.value = true;
    }

    function updateSectionStatus(sectionId: string, status: SectionStatus) {
        if (!activeReport.value) return;
        const section = activeReport.value.sections.find(s => s.id === sectionId);
        if (section) {
            section.status = status;
            isDirty.value = true;
        }
    }

    function updateSectionContent(sectionId: string, content: string) {
        if (!activeReport.value) return;
        const section = activeReport.value.sections.find(s => s.id === sectionId);
        if (section) {
            section.content = content;
            isDirty.value = true;
            // Trigger validation logic here?
            if (content.trim().length > 0) {
                section.status = 'Complete'; // Simplified validation
            } else {
                section.status = 'Incomplete';
            }
        }
    }

    function updateSectionConfiguration(sectionId: string, config: SectionConfiguration) {
        if (!activeReport.value) return;
        const section = activeReport.value.sections.find(s => s.id === sectionId);
        if (section) {
            section.configuration = { ...section.configuration, ...config };
            isDirty.value = true;
        }
    }

    // Reorder strictly within groups
    function updateGroupOrder(group: SectionGroup, newSectionOrder: ReportSection[]) {
        if (!activeReport.value) return;

        // Verify all belong to group
        if (newSectionOrder.some(s => s.group !== group)) {
            console.error('Attempted to move section across groups');
            return;
        }

        // Reconstruct the master list based on SECTION_GROUPS_ORDER
        const newMasterList: ReportSection[] = [];

        SECTION_GROUPS_ORDER.forEach(g => {
            if (g === group) {
                newMasterList.push(...newSectionOrder);
            } else {
                const existingGroupSections = activeReport.value!.sections.filter(s => s.group === g);
                newMasterList.push(...existingGroupSections);
            }
        });

        activeReport.value.sections = newMasterList;
        isDirty.value = true;
    }

    // Handle beforeUnload
    watch(isDirty, (dirty) => {
        if (dirty) {
            window.onbeforeunload = () => true;
        } else {
            window.onbeforeunload = null;
        }
    });

    // --- Persistence (Local + Backend) ---
    const currentRouteId = ref<string | null>(null);

    // Debounce timer for auto-save to localStorage
    let saveTimeout: NodeJS.Timeout | null = null;

    watch([activeReport, isDirty], ([newReport, dirty]) => {
        if (!newReport || !currentRouteId.value || !dirty) return;

        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            try {
                localStorage.setItem(
                    `report_backup_${currentRouteId.value}`,
                    JSON.stringify(newReport)
                );
            } catch (e) {
                console.error('Failed to save backup', e);
            }
        }, 1000);
    }, { deep: true });

    function clearBackup() {
        if (currentRouteId.value) {
            localStorage.removeItem(`report_backup_${currentRouteId.value}`);
        }
    }

    function loadFromBackup(routeId: string): boolean {
        try {
            const backup = localStorage.getItem(`report_backup_${routeId}`);
            if (backup) {
                const parsed = JSON.parse(backup);
                if (parsed && parsed.metadata && parsed.sections) {
                    activeReport.value = parsed;
                    isDirty.value = true;
                    currentRouteId.value = routeId;
                    return true;
                }
            }
        } catch (e) {
            console.error('Failed to load backup', e);
        }
        return false;
    }

    function setCurrentRouteId(id: string) {
        currentRouteId.value = id;
    }

    // Backend Actions

    async function saveReportToBackend() {
        if (!activeReport.value) return;

        // Example: Only saving metadata or generation record for now
        // A full Content Save endpoint might be needed if we want to save the Draft JSON to DB.
        // For now, we assume 'Generate' action saves the result.
        console.log('Saving report draft to backend (Not fully implemented, using LocalStorage backup)');
        isDirty.value = false;
    }

    async function generatePdf() {
        if (!activeReport.value) throw new Error("No active report");

        try {
            // Import dynamically to avoid circular dependencies if any
            const ReportController = (await import('@/controllers/report/report_controller')).default;
            const authStore = useAuthStore();

            // 1. Record generation start
            const userId = (authStore.user as { userId?: string | number } | null)?.userId;
            if (!userId) {
                throw new Error('Missing authenticated user ID for report generation');
            }

            await ReportController.addReportGeneration({
                routeId: currentRouteId.value || 'unknown',
                type: activeReport.value.metadata.reportType,
                userId
            });

            // 2. Call PDF Render
            const res = await ReportController.renderPdf(activeReport.value.id, activeReport.value);

            if (res.result && res.blob) {
                // Return blob url for display/download
                return window.URL.createObjectURL(res.blob);
            } else {
                throw new Error(res.message || "PDF Generation failed");
            }

        } catch (e) {
            console.error("PDF Generation Error", e);
            throw e;
        }
    }

    return {
        activeReport,
        sectionsByGroup,
        isReportValid,
        isDirty,
        currentRouteId, // Expose
        initializeReport,
        toggleSection,
        updateSectionStatus,
        updateSectionContent,
        updateSectionConfiguration,
        updateGroupOrder,
        clearBackup,
        loadFromBackup,
        setCurrentRouteId,
        saveReportToBackend,
        generatePdf
    };
});
