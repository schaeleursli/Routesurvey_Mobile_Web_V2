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
    name: "Breakbulk Middle East 2026 Exhibitors",
    type: "conference_exhibitor",
    entityLevels: ["company"],
    access: "public",
    ingestion: "reviewed_public_import",
    cadence: "event_cycle",
    url: "https://middleeast.breakbulk.com/exhibitors?culture=en-GB",
    notes: "Middle East/Africa/Asia project cargo and heavy-lift company universe."
  },
  {
    id: "breakbulk-middle-east-speakers-2026",
    name: "Breakbulk Middle East 2026 Speakers",
    type: "conference_speaker",
    entityLevels: ["person", "company"],
    access: "public",
    ingestion: "reviewed_public_import",
    cadence: "event_cycle",
    url: "https://middleeast.breakbulk.com/speaker-list",
    notes: "Named project-cargo, EPC, rail, port, heavy-lift and logistics decision makers."
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
