# RouteSurvey CRM v1

## Scope

CRM v1 is a read-only intelligence layer over the existing RouteSurvey user API.

It provides:

- total RouteSurvey contacts
- active trial users
- expired trial users
- paying customers
- company-identification coverage
- contact search and lifecycle filtering
- simple conversion-priority signals based only on existing product/account data

## Data integrity boundary

CRM v1 does **not** persist enrichment data in local storage.

The following require a dedicated CRM API and persistence model:

- LinkedIn profile
- researched company identity
- email verification status
- email verification provider and timestamp
- CRM owner
- notes
- outreach events
- replies / meetings
- lead stage overrides
- opportunities
- product-usage events beyond the fields already returned by the users endpoint

## Next sprint

Create a backend CRM contact extension keyed to the RouteSurvey user ID, then import the researched trial-user enrichment dataset and add email-verification adapters.
