CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS crm_sources (
  id varchar(160) PRIMARY KEY,
  name varchar(255) NOT NULL,
  source_type varchar(80) NOT NULL,
  access_class varchar(40) NOT NULL,
  source_url text,
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crm_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name varchar(255) NOT NULL,
  match_key varchar(255) NOT NULL UNIQUE,
  website text,
  linkedin_url text,
  country varchar(120),
  region varchar(80),
  verification_state varchar(40) NOT NULL DEFAULT 'unverified',
  sector_relevance_score integer CHECK (sector_relevance_score BETWEEN 0 AND 100),
  commercial_engagement_score integer CHECK (commercial_engagement_score BETWEEN 0 AND 100),
  specialties jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crm_company_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES crm_companies(id) ON DELETE CASCADE,
  alias_name varchar(255) NOT NULL,
  alias_match_key varchar(255) NOT NULL,
  source_id varchar(160) REFERENCES crm_sources(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_crm_company_alias UNIQUE (company_id, alias_match_key)
);

CREATE TABLE IF NOT EXISTS crm_people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES crm_companies(id) ON DELETE SET NULL,
  routesurvey_user_id varchar(120),
  full_name varchar(255) NOT NULL,
  title varchar(255),
  linkedin_url text,
  country varchar(120),
  region varchar(80),
  languages jsonb NOT NULL DEFAULT '[]'::jsonb,
  credentials jsonb NOT NULL DEFAULT '[]'::jsonb,
  specialties jsonb NOT NULL DEFAULT '[]'::jsonb,
  verification_state varchar(40) NOT NULL DEFAULT 'unverified',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_crm_people_company_id ON crm_people(company_id);
CREATE INDEX IF NOT EXISTS ix_crm_people_routesurvey_user_id ON crm_people(routesurvey_user_id);

CREATE TABLE IF NOT EXISTS crm_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid REFERENCES crm_people(id) ON DELETE CASCADE,
  company_id uuid REFERENCES crm_companies(id) ON DELETE CASCADE,
  email varchar(320) NOT NULL UNIQUE,
  email_type varchar(40) NOT NULL DEFAULT 'unknown',
  basis text,
  verification_status varchar(40) NOT NULL DEFAULT 'unverified',
  verification_provider varchar(80),
  verified_at timestamptz,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_crm_email_owner CHECK ((person_id IS NOT NULL) <> (company_id IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS ix_crm_emails_person_id ON crm_emails(person_id);
CREATE INDEX IF NOT EXISTS ix_crm_emails_company_id ON crm_emails(company_id);

CREATE TABLE IF NOT EXISTS crm_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES crm_companies(id) ON DELETE CASCADE,
  person_id uuid REFERENCES crm_people(id) ON DELETE CASCADE,
  source_id varchar(160) NOT NULL REFERENCES crm_sources(id),
  source_url text,
  observed_at timestamptz,
  evidence_type varchar(80) NOT NULL DEFAULT 'observation',
  confidence varchar(40) NOT NULL DEFAULT 'unknown',
  verification_state varchar(40) NOT NULL DEFAULT 'source_observed',
  raw_text text,
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_crm_evidence_subject CHECK ((company_id IS NOT NULL) <> (person_id IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS ix_crm_evidence_company_id ON crm_evidence(company_id);
CREATE INDEX IF NOT EXISTS ix_crm_evidence_person_id ON crm_evidence(person_id);
CREATE INDEX IF NOT EXISTS ix_crm_evidence_source_id ON crm_evidence(source_id);

CREATE TABLE IF NOT EXISTS crm_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES crm_companies(id) ON DELETE CASCADE,
  person_id uuid REFERENCES crm_people(id) ON DELETE CASCADE,
  activity_type varchar(80) NOT NULL,
  subject varchar(255),
  detail text,
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_crm_activity_subject CHECK (company_id IS NOT NULL OR person_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS ix_crm_activities_company_id ON crm_activities(company_id);
CREATE INDEX IF NOT EXISTS ix_crm_activities_person_id ON crm_activities(person_id);
CREATE INDEX IF NOT EXISTS ix_crm_activities_occurred_at ON crm_activities(occurred_at DESC);

REVOKE ALL ON crm_sources, crm_companies, crm_company_aliases, crm_people, crm_emails, crm_evidence, crm_activities FROM PUBLIC;
