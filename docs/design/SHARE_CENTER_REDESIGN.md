# Share Center Review & Redesign

## 1. Phase 1 — Explain the current system

### 1.1 Explain it back
The current Share Center is a **Route-centric utility** rather than a Document Management system.
*   **Discovery:** A user selects a Route from a list/card view to access sharing options for that specific route.
*   **Creation:** Reports are generated in a separate "Report Generations" tab. They are treated as individual files (PDFs) tied to a timestamp, not as evolving "Documents."
*   **Sharing:** A user selects a specific *file generation* (e.g., "Report generated at 10:00 AM") and creates a unique link for it.
*   **Versioning:** There is no strict versioning system. "Versions" are just a chronological list of file generations (v1, v2) based on the order they were created.
*   **Recipient Experience:** The client receives a link that opens a basic wrapper page (`ReportShare.vue`) displaying the specific PDF file.

## 2. Phase 2 — Identify gaps and risks

### 2.1 Professional risk assessment
*   **Broken Link Risk (Critical):** Links are tied to specific *generations* (File IDs). If a user notices a typo, deletes the old generation, and generates a new one, **the client's link breaks**.
*   **Versioning Confusion:** There is no concept of a "Published" version. If a user generates 5 drafts internally, the client might see "v5" on their file, implying they missed 4 previous versions.
*   **No "Source of Truth":** A route can have 20 unrelated PDF files. It is impossible to know which one is the "Final Report" sent to the client.
*   **Lack of Audit Trail:** The system tracks "Views" as a simple counter. There is no log of *who* (which token/link) viewed it, when, or if they downloaded it.
*   **Unprofessional Experience:** Clients receive a link to a raw file viewer. There is no context, no project summary, and no "Portal" feeling that reassures them this is a formal delivery.

## 3. Phase 3 — Define the correct mental model

### 3.1 Mental model
To fix this, we must shift from **"Sharing Files"** to **"Publishing Documents"**.

*   **Document (The Container):** A persistent entity (e.g., "Route 66 Bridge Assessment"). It has a lifecycle (Draft, Review, Published).
*   **Version (The Content):** An immutable snapshot of the report at a point in time (v1.0, v1.1, v2.0).
*   **Publication (The Action):** The act of designating a specific Version as the "Live" version for the Document.
*   **Share (The Access):** A secure key (Link) given to a client that points to the **Document**, *not* the file.
    *   *Result:* When the client clicks the link, they see whatever version is currently **Published**. You can fix a typo (v1.1) and publish it without sending a new link.

## 4. Phase 4 — Redesign the Share Center (UX + logic)

### 4.1 Information architecture
The new Share Center will have a dedicated top-level view, independent of the Route list.

**1. Main Library (Archive View)**
*   **Purpose:** Central repository of all formal Documents across the organization.
*   **Columns:** Status (Draft/Published), Document Name, Associated Route, Current Version, Last Updated, Client Access (Active/Expired).
*   **Filter:** By Project, Route, or Client.

**2. Document Detail View (The "Cockpit")**
*   **Purpose:** The single source of truth for one deliverable.
*   **Header:** Title, Status Badge, "View as Client" button.
*   **Left Panel (Version Control):** Timeline of versions (Drafts vs Published).
*   **Center Panel (Preview):** Preview of the *currently selected* version.
*   **Right Panel (Distribution):** List of Active Share Links (e.g., "Client A - Read Only", "Internal Team - Edit").

**3. Activity Log (Audit)**
*   **Purpose:** Detailed history of every interaction.
*   **Data:** Timestamp | Actor (User or "Client Link A") | Action (Published v2, Viewed, Downloaded).

### 4.2 Core user flows

**Flow 1: Publishing a Report (First Time)**
1.  **Intent:** User wants to send the first draft of a survey to a client.
2.  **Action:** User goes to "Reports", generates a PDF. Clicks "Create Document".
3.  **System:** Creates a Document container. Sets the PDF as "v1.0 (Draft)".
4.  **Action:** User reviews PDF. Clicks "Publish v1.0".
5.  **System:** Locks v1.0 as immutable. Marks Document as "Live".

**Flow 2: Updating a Version (Fixing a Typo)**
1.  **Intent:** User found an error in v1.0. Needs to fix it without confusing the client.
2.  **Action:** User generates new PDF with fixes. Navigates to the existing Document.
3.  **Action:** Clicks "Import New Version". Selects new PDF. System labels it "v1.1".
4.  **Confirm:** User reviews v1.1. Clicks "Publish & Overwrite".
5.  **System:** Updates the "Live" pointer to v1.1.
6.  **Result:** The client clicks the *same email link* they already have, but now sees v1.1.

**Flow 3: Sharing with a Client**
1.  **Intent:** Give access to the client.
2.  **Action:** In Document Detail > Distribution, click "Create Share Link".
3.  **Settings:** Label ("Client Main"), Expiry (30 Days), Password (Optional).
4.  **System:** Generates a short URL.
5.  **Action:** User sends URL.

## 5. Phase 5 — Version control & governance

### 5.1 Versioning rules
*   **Immutability:** Once a version is "Published", that specific PDF file cannot be modified or confused.
*   **Drafts:** Draft versions (v1.1-draft) are visible only to internal users.
*   **Naming:**
    *   **Major (v1.0, v2.0):** Significant changes or re-surveys.
    *   **Minor (v1.1, v1.2):** Corrections, formatting fixes.
*   **Notes:** Every version upload requires a "Change Log" note (e.g., "Fixed typ on page 4").

## 6. Phase 6 — Sharing model

### 6.1 Sharing mechanics
*   **The "Portal" Experience:** The link opens a branded page, not a raw PDF.
    *   **Header:** Company Logo, Document Title, "Official Record".
    *   **Body:** File Preview.
    *   **Footer:** "Generated on [Date]. Version [X]."
*   **Access Control:**
    *   **Expired:** Shows a polite "Link Expired. Contact [User] for access" page.
    *   **Revoked:** Instant kill-switch for any link.
*   **Tracking:** We track "Sessions". If a link is opened 5 times from the same IP in 10 minutes, it's one session.

## 7. Phase 7 — UX confidence & safety

### 7.1 Confidence checks
*   **"View as Client" Mode:** A prominent toggle in the admin view. When ON, the interface mimics exactly what the share link will show.
*   **Pre-flight Checklist:** Before publishing:
    *   "You are about to publish v2.0."
    *   "3 active clients will see this update immediately."
    *   "[Confirm] / [Cancel]"

## 8. Phase 8 — MVP vs Phase 2

### 8.1 Scope control

**MVP (Immediate Release)**
*   **Document Container:** Grouping PDFs into a "Document".
*   "Publish" Action (Pointer to active file).
*   **Refactored Share Page:** Branded wrapper instead of raw PDF.
*   **Admin UI:** Document Detail view with basic list of versions.

**Phase 2 (Future)**
*   **Client Login:** Clients create accounts to see *all* their historical documents.
*   **Watermarking:** Dynamic stamping of "Accessed by [Client] on [Date]".
*   **Granular Analytics:** "Client read Page 5 for 10 minutes."
*   **Automatic Emailing:** System sends the emails directly.

