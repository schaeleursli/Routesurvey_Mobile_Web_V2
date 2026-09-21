export const CRM_SOURCE_REGISTRY = [
  {
    id: "routesurvey-users",
    name: "RouteSurvey Users",
    type: "first_party",
    entityLevels: ["person", "company"],
    access: "internal",
    ingestion: "api",
    cadence: "live",
    url: null,
    notes: "Canonical first-party registrations, subscriptions and trial lifecycle."
  },
  {
    id: "rica-attending-companies-2026",
    name: "RICA 2026 Attending Companies",
    type: "association_event",
    entityLevels: ["company"],
    access: "public",
    ingestion: "reviewed_public_import",
    cadence: "periodic",
    url: "https://www.rica.org/2026-attending-companies",
    notes: "Public company-level conference attendance source for heavy/dimensional rail logistics."
  },
  {
    id: "rica-board",
    name: "RICA Board & Committees",
    type: "association_leadership",
    entityLevels: ["person", "company"],
    access: "public",
    ingestion: "reviewed_public_import",
    cadence: "quarterly",
    url: "https://www.rica.org/board-members",
    notes: "Named industry leaders, roles and companies. Do not infer personal email addresses."
  },
  {
    id: "scra-public-membership-news",
    name: "SC&RA Public Membership News",
    type: "association_membership",
    entityLevels: ["company"],
    access: "public",
    ingestion: "reviewed_public_import",
    cadence: "monthly",
    url: "https://www.scranet.org/SCRA/Content/news/releases/Let-s-Welcome-These-New-Members.aspx",
    notes: "Public new-member and returning-member releases; useful for incremental discovery."
  },
  {
    id: "scra-directory",
    name: "SC&RA Membership Directory",
    type: "association_membership",
    entityLevels: ["company"],
    access: "licensed",
    ingestion: "licensed_file_import",
    cadence: "annual_plus_updates",
    url: "https://www.scranet.org/SCRA/scra/content/store/itemdetail.aspx?iProductCode=T7A",
    notes: "Commercial SC&RA directory. Import only after purchase/license review; preserve source terms."
  },
  {
    id: "breakbulk-americas-exhibitors-2026",
    name: "Breakbulk Americas 2026 Exhibitors",
    type: "conference_exhibitor",
    entityLevels: ["company"],
    access: "public",
    ingestion: "reviewed_public_import",
    cadence: "event_cycle",
    url: "https://americas.breakbulk.com/exhibitors",
    notes: "Company, stand and sector signals for project cargo and heavy transport."
  },
  {
    id: "breakbulk-americas-speakers-2026",
    name: "Breakbulk Americas 2026 Speakers",
    type: "conference_speaker",
    entityLevels: ["person", "company"],
    access: "public",
    ingestion: "reviewed_public_import",
    cadence: "event_cycle",
    url: "https://americas.breakbulk.com/speaker-list",
    notes: "High-value named contacts with role and employer."
  },
  {
    id: "breakbulk-europe-exhibitors-2026",
    name: "Breakbulk Europe 2026 Exhibitors",
    type: "conference_exhibitor",
    entityLevels: ["company"],
    access: "public",
    ingestion: "reviewed_public_import",
    cadence: "event_cycle",
    url: "https://europe.breakbulk.com/page/why-attend-breakbulk-europe",
    notes: "Large global project-cargo company universe. Prefer official exhibitor pages when available."
  },
  {
    id: "breakbulk-europe-speakers-2026",
    name: "Breakbulk Europe 2026 Speakers",
    type: "conference_speaker",
    entityLevels: ["person", "company"],
    access: "public",
    ingestion: "reviewed_public_import",
    cadence: "event_cycle",
    url: "https://europe.breakbulk.com/speaker-list",
    notes: "Named senior industry contacts with titles and employers."
  },
  {
    id: "breakbulk-middle-east-exhibitors-2026",
    name: "Breakbulk Middle East / Dubai 2026 Exhibitors",
    type: "conference_exhibitor",
    entityLevels: ["company"],
    access: "public",
    ingestion: "reviewed_public_import",
    cadence: "event_cycle",
    url: "https://middleeast.breakbulk.com/exhibitors?culture=en-GB",
    notes: "Dubai-based Middle East/Africa/Asia project cargo and heavy-lift company universe."
  },
  {
    id: "breakbulk-middle-east-speakers-2026",
    name: "Breakbulk Middle East / Dubai 2026 Speakers",
    type: "conference_speaker",
    entityLevels: ["person", "company"],
    access: "public",
    ingestion: "reviewed_public_import",
    cadence: "event_cycle",
    url: "https://middleeast.breakbulk.com/speaker-list",
    notes: "Named Dubai/Middle East project-cargo, EPC, rail, port, heavy-lift and logistics decision makers."
  },
  {
    id: "breakbulk-middle-east-dubai-2027-watch",
    name: "Breakbulk Middle East / Dubai 2027",
    type: "conference_event_watch",
    entityLevels: ["person", "company"],
    access: "public",
    ingestion: "reviewed_public_import",
    cadence: "event_cycle",
    url: "https://middleeast.breakbulk.com/home",
    notes: "Upcoming 2-3 February 2027 Dubai event. Track exhibitors, speakers, sponsors and public agenda participants as they are published."
  },
  {
    id: "breakbulk-europe-2027-watch",
    name: "Breakbulk Europe 2027",
    type: "conference_event_watch",
    entityLevels: ["person", "company"],
    access: "public",
    ingestion: "reviewed_public_import",
    cadence: "event_cycle",
    url: "https://europe.breakbulk.com/home",
    notes: "Upcoming 11-13 May 2027 Rotterdam event. Track current exhibitor list, speakers, sponsors and public agenda participants."
  },
  {
    id: "intermodal-south-america-exhibitors-2026",
    name: "Intermodal South America 2026 Exhibitors",
    type: "conference_exhibitor",
    entityLevels: ["company"],
    access: "public",
    ingestion: "reviewed_public_import",
    cadence: "event_cycle",
    url: "https://www.intermodal.com.br/lista-de-expositores/",
    notes: "LATAM logistics, rail, ports, road transport, shipping, customs, warehousing, technology and breakbulk company universe."
  },
  {
    id: "interlog-summit-speakers-2026",
    name: "Interlog Summit 2026 Speakers",
    type: "conference_speaker",
    entityLevels: ["person", "company"],
    access: "public",
    ingestion: "reviewed_public_import",
    cadence: "event_cycle",
    url: "https://www.intermodal.com.br/en/interlog-summit/",
    notes: "Senior LATAM logistics, infrastructure, ports, rail and supply-chain speakers associated with Intermodal South America."
  },
  {
    id: "intermodal-south-america-2027-watch",
    name: "Intermodal South America 2027",
    type: "conference_event_watch",
    entityLevels: ["person", "company"],
    access: "public",
    ingestion: "reviewed_public_import",
    cadence: "event_cycle",
    url: "https://www.intermodal.com.br/en/",
    notes: "Upcoming 13-15 April 2027 São Paulo event. Track exhibitors, Interlog Summit speakers, sponsors and public event participants."
  },
  {
    id: "asce-tdi-freight-logistics",
    name: "ASCE T&DI Freight & Logistics Committee",
    type: "professional_committee",
    entityLevels: ["person", "company"],
    access: "public",
    ingestion: "reviewed_public_import",
    cadence: "quarterly",
    url: "https://www.asce.org/communities/institutes-and-technical-groups/transportation-and-development-institute/committees/board-of-governors--t-di/planning---development-council/freight---logistics-committee",
    notes: "US transportation-engineering source with named freight/logistics engineers and committee members."
  },
  {
    id: "asce-tdi-rail-transport",
    name: "ASCE T&DI Rail Transport Committee",
    type: "professional_committee",
    entityLevels: ["person", "company"],
    access: "public",
    ingestion: "reviewed_public_import",
    cadence: "quarterly",
    url: "https://www.asce.org/communities/institutes-and-technical-groups/transportation-and-development-institute/committees/board-of-governors--t-di/rail---public-transit-council/rail-transport-committee",
    notes: "US rail-engineering source with named licensed engineers, researchers and committee leadership."
  },
  {
    id: "esta-europe-transport-engineering",
    name: "ESTA Europe Heavy Transport Network",
    type: "industry_association",
    entityLevels: ["person", "company"],
    access: "public",
    ingestion: "reviewed_public_import",
    cadence: "quarterly",
    url: "https://estaeurope.eu/",
    notes: "European abnormal transport and mobile-crane ecosystem spanning more than 100 associations/companies across 27 countries."
  },
  {
    id: "confea-engenheiro-transportes",
    name: "CONFEA / CREA Transport Engineer Credential Framework",
    type: "professional_credential",
    entityLevels: ["person"],
    access: "public",
    ingestion: "credential_validation",
    cadence: "as_needed",
    url: "https://normativos.confea.org.br/Ementas/Visualizar?id=64797",
    notes: "Brazilian authoritative source defining Engenheiro de Transportes / Engenheira de Transportes and professional scope."
  },
  {
    id: "sobratema-opus-rigging",
    name: "Sobratema / Instituto OPUS Rigging",
    type: "professional_training",
    entityLevels: ["person", "company"],
    access: "public",
    ingestion: "reviewed_public_import",
    cadence: "event_cycle",
    url: "https://www.sobratema.org.br/",
    notes: "Brazil source for rigging, lifting and cargo-handling specialists, instructors and sector participants."
  },
  {
    id: "chile-special-load-engineering",
    name: "Chile Special-Load Engineering Requirement",
    type: "regulatory_engineering",
    entityLevels: ["company", "person"],
    access: "public",
    ingestion: "discovery_support",
    cadence: "annual_review",
    url: "https://www.chileatiende.gob.cl/fichas/4429-autorizacion-para-que-vehiculos-con-sobrepeso-yo-sobredimension-circulen-por-un-camino-publico",
    notes: "Chile requires specialized engineering route studies at defined special-load thresholds; use this to identify qualified firms and engineers."
  },
  {
    id: "transport-engineering-public-research",
    name: "Transport Engineering Public Research",
    type: "reviewed_research",
    entityLevels: ["person", "company"],
    access: "public",
    ingestion: "reviewed_public_import",
    cadence: "continuous",
    url: null,
    notes: "Reviewed public-source research for transport engineering companies and engineers. Per-record evidence preserves the original source URL."
  },
  {
    id: "breakbulk-event-app-attendees",
    name: "Breakbulk Event App Attendees",
    type: "conference_attendee",
    entityLevels: ["person", "company"],
    access: "authorized_app",
    ingestion: "manual_or_authorized_export",
    cadence: "event_cycle",
    url: "https://americas.breakbulk.com/home",
    notes: "Use only data exposed to the authenticated attendee/user through official app functionality or an authorized export. No automated scraping."
  }
];

export const CRM_SOURCE_ACCESS_LABELS = {
  internal: "Internal",
  public: "Public",
  licensed: "Licensed",
  authorized_app: "Authorized app"
};
