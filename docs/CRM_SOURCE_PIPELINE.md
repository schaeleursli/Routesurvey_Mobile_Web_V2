# RouteSurvey CRM sector intelligence sources

## Purpose

RouteSurvey CRM should cover more than first-party trial users. It should build a governed company/person universe for the heavy-haul, lifting, rail-clearance and project-cargo sectors.

Every imported fact must preserve:
- source ID
- source URL
- source type
- observed date
- import date
- public/licensed/internal access class
- entity type (company/person)
- evidence text or normalized source fields
- confidence
- human verification state
- source-specific usage restrictions

## Priority source families

### 1. RICA — Railroad Industrial Clearance Association

Use:
- public current attending-company lists
- public board and committee pages
- public event/sponsor pages
- manually supplied/authorized registrant lists if RouteSurvey/SLC is entitled to use them

Strong signals:
- rail clearance
- dimensional rail
- shipper/project owner
- Class I / short line railroad
- heavy haul / rigging
- ports / barge / steamship
- engineering / survey / clearance technology

Do not infer personal emails from names. Email enrichment is a separate evidence step.

### 2. SC&RA — Specialized Carriers & Rigging Association

Public sources:
- new-member announcements
- award announcements
- public news and event pages

Licensed source:
- SC&RA Membership Directory

The commercial directory must not be scraped or reconstructed from unauthorized access. If purchased, ingest the supplied file under a source record that stores license/provenance and import date.

### 3. Breakbulk events

Public sources:
- exhibitors
- sponsors/partners
- speakers
- agenda participants
- public company snapshots

Events:
- Breakbulk Americas — Houston
- Breakbulk Europe — Rotterdam
- Breakbulk Middle East — Dubai

Track both:
- the completed 2026 editions for historical company/person evidence
- the upcoming 2027 editions as live prospecting/event-planning pipelines

Breakbulk Europe and Breakbulk Middle East/Dubai are first-class CRM source families, not secondary regional add-ons.

Attendee/visitor records:
- treat attendee data as authorized/event-app data
- use only information the authenticated user is entitled to access or export
- do not automate extraction from private networking views

### 4. Intermodal South America — LATAM

Intermodal South America should be the main broad LATAM logistics-event source alongside the more specialized heavy-haul/project-cargo associations.

Use:
- public exhibitor list
- public sponsors/partners
- public Interlog Summit speakers and agenda participants
- public attraction/arena participants
- manually supplied or authorized attendee/export data where permitted

Strong LATAM signals:
- ports and terminals
- railways and rail logistics
- road carriers
- freight forwarders
- customs and foreign trade
- shipping lines
- warehousing and intralogistics
- project cargo / breakbulk
- logistics technology
- infrastructure operators
- shippers and industrial cargo owners

Keep Intermodal contacts tagged by country and sub-region so Brazil-heavy event data can be separated from wider LATAM coverage.

## CRM source-to-lead model

A company can have multiple independent source signals:

```text
Company
  ├─ RouteSurvey trial user
  ├─ RICA attendee
  ├─ RICA leadership
  ├─ SC&RA member / new member
  ├─ Breakbulk Americas exhibitor/speaker
  ├─ Breakbulk Europe exhibitor/speaker
  ├─ Breakbulk Middle East / Dubai exhibitor/speaker
  ├─ Breakbulk attendee (authorized)
  ├─ Intermodal South America exhibitor
  └─ Interlog Summit speaker/company
```

Multiple independent signals raise sector relevance but do not by themselves establish sales interest.

## Suggested relevance scoring

This is a discovery score, not a sales verdict.

- +30 first-party RouteSurvey trial/customer
- +20 named Breakbulk speaker / decision-maker
- +15 Breakbulk exhibitor
- +15 Intermodal South America exhibitor
- +20 Interlog Summit named speaker / decision-maker
- +15 RICA current attending company
- +15 SC&RA member evidence
- +10 RICA board/committee company
- +10 appears in two or more independent sector sources
- +10 corporate email verified
- +10 company website verified
- +10 target service fit: heavy haul / rigging / project cargo / rail / engineering
- cap at 100

Keep `sector_relevance_score` separate from `commercial_engagement_score`.

## Next implementation

1. Create CRM source/evidence persistence API.
2. Add company normalization and alias matching.
3. Add reviewed import jobs for public source snapshots.
4. Import the existing RouteSurvey trial-user enrichment workbook.
5. Add licensed-file import for SC&RA if/when obtained.
6. Add email-verification provider adapter.
7. Add people/company detail views showing every source signal and evidence date.
