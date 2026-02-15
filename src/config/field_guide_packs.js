
export const FIELD_GUIDE_PACKS = [
    {
        id: 'basic',
        title: 'Field Guide',
        audience: 'All Users',
        unlock_rule: 'default',
        tips: [
            // --- Section: Getting Mindset ---
            {
                id: 'mindset_1',
                title: 'Start with the whole route',
                body: 'Before focusing on details, capture the full route once. This gives context and prevents missed constraints later.',
                ctaLabel: 'Start a new route survey',
                ctaRoute: '/planned-routes/add'
            },

            // --- Section: Planning ---
            {
                id: 'plan_1',
                title: 'Planning saves driving',
                body: 'Use the "Manual Route" tool to sketch your path before you drive. It helps you anticipate permits and easy bypasses.',
                ctaLabel: 'Go to Route Planner',
                ctaRoute: '/manual-routes'
            },
            {
                id: 'plan_2',
                title: 'Check existing data',
                body: 'RouteSurvey remembers previous trips. Check "Planned Routes" to see if a colleague has already driven this path.',
            },

            // --- Section: Surveying ---
            {
                id: 'survey_1',
                title: 'Consistency beats perfection',
                body: 'Clear, repeatable observation types matter more than perfect wording. Consistency is what makes reports defensible.'
            },
            {
                id: 'survey_2',
                title: 'Photograph intent, not everything',
                body: 'Take photos that explain *why* something matters. One clear image of a bridge sign beats five random shots.',
                ctaLabel: 'Add an observation',
                ctaRoute: null
            },
            {
                id: 'survey_3',
                title: 'Mark uncertainty early',
                body: 'If a clearance isn’t verified, flag it as "Unverified". Engineering decisions depend on knowing what’s confirmed and what isn’t.'
            },
            {
                id: 'survey_4',
                title: 'Offline is expected',
                body: 'You can work fully offline. We sync your GPS traces, photos, and timestamps automatically when you reconnect.'
            },

            // --- Section: Reporting ---
            {
                id: 'report_1',
                title: 'Freeze before sharing',
                body: 'Always "Freeze" a version before exporting or sharing. It protects your work and avoids confusion downstream.',
                ctaLabel: 'Generate a report',
                ctaRoute: '/reporting'
            },
            {
                id: 'report_2',
                title: 'Think like the reviewer',
                body: 'Ask yourself: "Would this be enough to approve a permit?" If yes, your survey is ready.'
            }
        ]
    },
    {
        id: 'advanced_heavy_transport',
        title: 'Heavy & Oversize Transport',
        audience: 'Transport Engineers',
        unlock_rule: 'role:transport_engineer',
        tips: [
            {
                id: 'adv_1',
                title: 'Define the governing constraint',
                body: 'Every route has one constraint that matters most. Identify it early — everything else is secondary.'
            },
            {
                id: 'adv_2',
                title: 'Bridges decide feasibility',
                body: 'If a bridge governs, flag it explicitly. Unknown capacity is not a detail — it’s a decision blocker.',
                ctaLabel: 'Review bridge observations',
                ctaRoute: null
            },
            {
                id: 'adv_3',
                title: 'Clearance ≠ passable',
                body: 'Height alone is not enough. Offsets, cambers, and lateral movement often decide clearance risk.'
            },
            {
                id: 'adv_4',
                title: 'Turning beats straight-line logic',
                body: 'Most failures happen at intersections, not mid-route. Prioritise geometry where articulation is highest.'
            },
            {
                id: 'adv_5',
                title: 'Document assumptions',
                body: 'If something is assumed, say so. Assumptions that are written can be engineered — silent ones cannot.'
            },
            {
                id: 'adv_6',
                title: 'Separate survey from engineering',
                body: 'Your role is to identify, not to calculate. A good survey enables fast engineering — it doesn’t replace it.'
            },
            {
                id: 'adv_7',
                title: 'Temporary constraints matter',
                body: 'Roadworks, seasonal restrictions, and temporary utilities often decide timing. Capture them even if they’re not permanent.'
            },
            {
                id: 'adv_8',
                title: 'Think in envelopes',
                body: 'Transport is about swept envelopes, not static dimensions. What moves sideways is just as important as what moves forward.'
            },
            {
                id: 'adv_9',
                title: 'Flag mitigation early',
                body: 'If something requires lifting, removal, or civil work — mark it. Early visibility saves weeks later.',
                ctaLabel: 'Add mitigation notes',
                ctaRoute: null
            },
            {
                id: 'adv_10',
                title: 'Design for the weakest link',
                body: 'The route is only as strong as its weakest section. Optimisation elsewhere won’t fix one impossible point.'
            },
            {
                id: 'adv_11',
                title: 'Review like an authority',
                body: 'Ask yourself: Would I approve this with my name on it? That mindset changes what you capture.'
            },
            {
                id: 'adv_12',
                title: 'Leave a clear next step',
                body: 'Every critical observation should imply an action. Unclear next steps stall projects.'
            }
        ]
    }
];
