import axios from 'axios';

// Section Registry to map IDs to Titles (since DB/JSON only stores IDs)
const SECTION_LIBRARY = {
    // Front Matter
    'sec_cover': { title: 'Cover Page', group: 'Front Matter' },
    'sec_executive_summary': { title: 'Executive Summary', group: 'Front Matter' },
    'sec_document_control': { title: 'Document Control', group: 'Front Matter' },
    'sec_revision_history': { title: 'Revision History', group: 'Front Matter' },
    'sec_agenda_objectives': { title: 'Agenda / Objectives', group: 'Front Matter' },
    'sec_cover_slide': { title: 'Cover Slide', group: 'Front Matter' },

    // Route Context
    'sec_route_overview_map': { title: 'Route Overview Map', group: 'Route Context' },
    'sec_route_overview_map_fullwidth': { title: 'Route Overview Map (Full)', group: 'Route Context' },
    'sec_route_description': { title: 'Route Description', group: 'Route Context' },
    'sec_cargo_transport_assumptions': { title: 'Cargo & Transport Assumptions', group: 'Route Context' },
    'sec_equipment_configuration_overview': { title: 'Equipment Configuration', group: 'Route Context' },

    // Findings
    'sec_key_observations': { title: 'Key Observations', group: 'Findings' },
    'sec_clearance_summary_tables': { title: 'Clearance Summary Tables', group: 'Findings' },
    'sec_clearance_tables_detailed': { title: 'Clearance Tables (Detailed)', group: 'Findings' },
    'sec_geometry_turning': { title: 'Horizontal & Vertical Geometry', group: 'Findings' },
    'sec_bridge_register_detailed': { title: 'Bridge Register (Detailed)', group: 'Findings' },
    'sec_obstruction_register_full': { title: 'Obstruction Register (Full)', group: 'Findings' },
    'sec_key_constraints_visual': { title: 'Key Constraints (Visual)', group: 'Findings' },
    'sec_critical_locations_pages': { title: 'Critical Locations', group: 'Findings' },

    // Risk & Engineering
    'sec_critical_risks_mitigations': { title: 'Critical Risks & Mitigations', group: 'Risk & Engineering' },
    'sec_risk_matrix_full': { title: 'Risk Matrix (Full)', group: 'Risk & Engineering' },
    'sec_risk_heatmap_visual': { title: 'Risk Heatmap', group: 'Risk & Engineering' },
    'sec_mitigation_measures': { title: 'Mitigation Measures', group: 'Risk & Engineering' },
    'sec_mitigation_strategy_overview': { title: 'Mitigation Strategy Overview', group: 'Risk & Engineering' },
    'sec_feasibility_statement': { title: 'Overall Feasibility Statement', group: 'Risk & Engineering' },
    'sec_feasibility_recommendation': { title: 'Feasibility & Recommendation', group: 'Risk & Engineering' },
    'sec_engineering_limitations': { title: 'Engineering Limitations', group: 'Risk & Engineering' },
    'sec_swept_path_analysis': { title: 'Swept Path Analysis', group: 'Risk & Engineering' },

    // Regulatory
    'sec_permits_regulatory_framework': { title: 'Permits & Regulatory Framework', group: 'Regulatory' },
    'sec_escort_traffic_management_overview': { title: 'Escort & Traffic Management', group: 'Regulatory' },

    // Appendices
    'sec_photo_appendix_selected': { title: 'Photo Appendix (Selected)', group: 'Appendices' },
    'sec_photo_log_full': { title: 'Photo Log (Full)', group: 'Appendices' },
    'sec_full_photo_log': { title: 'Photo Log (Full)', group: 'Appendices' },
    'sec_detailed_maps': { title: 'Detailed Maps', group: 'Appendices' },
    'sec_raw_data_tables': { title: 'Raw Data Tables', group: 'Appendices' },
    'sec_raw_tables_any': { title: 'Raw Data Tables', group: 'Appendices' },

    // Conclusion
    'sec_next_steps': { title: 'Next Steps', group: 'Conclusion' }
};

// Helper to hydrate section titles from library
const hydrateTemplate = (template) => {
    if (!template) return null;
    const deep = JSON.parse(JSON.stringify(template));
    if (deep.snapshot && deep.snapshot.sections) {
        deep.snapshot.sections.forEach(s => {
            const lib = SECTION_LIBRARY[s.id];
            if (lib) {
                s.title = lib.title; // Hydrate Title
                // preserve group from snapshot if exists, else use lib
                if (!s.group) s.group = lib.group;
            } else {
                s.title = s.id; // Fallback
            }
        });
    }
    // Hydrate step titles if needed (UI expects title or label)
    if (deep.snapshot && deep.snapshot.steps) {
        deep.snapshot.steps.forEach(s => {
            if (!s.title && s.label) s.title = s.label;
        });
    }
    return deep;
};

export default {
    async getTemplates(filters = {}) {
        try {
            const res = await axios.get('/Templates/GetTemplates');
            if (res.data.result) {
                let results = res.data.data.map(hydrateTemplate);

                // Client-side filtering if backend doesn't support it yet
                if (filters.status) {
                    results = results.filter(t => t.status === filters.status);
                }
                if (filters.search) {
                    const q = filters.search.toLowerCase();
                    results = results.filter(t => t.name.toLowerCase().includes(q));
                }
                return { success: true, data: results };
            }
            return { success: false, message: res.data.message };
        } catch (err) {
            console.error('getTemplates error:', err);
            return { success: false, message: err.message };
        }
    },

    async getTemplate(id) {
        try {
            const res = await axios.get(`/Templates/GetTemplate/${id}`);
            if (res.data.result) {
                return { success: true, data: hydrateTemplate(res.data.data) };
            }
            return { success: false, message: res.data.message };
        } catch (err) {
            return { success: false, message: err.message };
        }
    },

    async createTemplate(payload) {
        try {
            const initialSnapshot = payload.snapshot || await this.getBaselineSnapshot();
            const payloadWithSnapshot = { ...payload, snapshot: initialSnapshot };

            const res = await axios.post('/Templates/AddTemplate', payloadWithSnapshot);
            if (res.data.result) {
                return { success: true, data: hydrateTemplate(res.data.data) };
            }
            return { success: false, message: res.data.message };
        } catch (err) {
            return { success: false, message: err.message };
        }
    },

    async updateTemplate(id, updates) {
        try {
            const res = await axios.post('/Templates/UpdateTemplate', { id, ...updates });
            if (res.data.result) {
                return { success: true, data: hydrateTemplate(res.data.data) };
            }
            return { success: false, message: res.data.message };
        } catch (err) {
            return { success: false, message: err.message };
        }
    },

    async publishTemplate(id) {
        try {
            const res = await axios.post('/Templates/UpdateTemplate', { id, status: 'published' });
            if (res.data.result) {
                return { success: true, data: hydrateTemplate(res.data.data) };
            }
            return { success: false, message: res.data.message };
        } catch (err) {
            return { success: false, message: err.message };
        }
    },

    async getBaselineSnapshot() {
        // Fetch a default or use a hardcoded fallback if not in DB
        // For now, let's just ask for the first template as baseline or empty
        try {
            const res = await this.getTemplates();
            if (res.success && res.data.length > 0) {
                return JSON.parse(JSON.stringify(res.data[0].snapshot));
            }
        } catch (e) { /* ignore */ }

        return { orientation: 'portrait', steps: [], sections: [] };
    }
};
