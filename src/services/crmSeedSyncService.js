import CrmController from "@/controllers/crm/crm_controller";
import { CRM_SOURCE_REGISTRY } from "@/data/crm/sourceRegistry";
import {
  TRANSPORT_ENGINEERING_COMPANY_SEEDS,
  TRANSPORT_ENGINEERING_PERSON_SEEDS
} from "@/data/crm/transportEngineeringSeeds";
import { buildCompanyMatchKey } from "@/utils/crm/companyNormalizer";
import { scoreEngineeringEvidence } from "@/utils/crm/engineeringEvidence";

const RESEARCH_SOURCE_ID = "transport-engineering-public-research";

const normalizeSource = (source) => ({
  id: source.id,
  name: source.name,
  source_type: source.type,
  access_class: source.access,
  source_url: source.url || null,
  metadata_json: {
    entityLevels: source.entityLevels || [],
    ingestion: source.ingestion,
    cadence: source.cadence,
    notes: source.notes
  }
});

const companyPayload = (seed) => {
  const evidence = scoreEngineeringEvidence(seed);
  return {
    canonical_name: seed.companyName,
    match_key: buildCompanyMatchKey(seed.companyName),
    website: seed.sourceUrl?.includes("linkedin.com") ? null : seed.sourceUrl || null,
    country: seed.country || null,
    region: seed.region || null,
    verification_state: "source_observed",
    sector_relevance_score: evidence.score,
    specialties: Object.entries(evidence.specialties)
      .filter(([, active]) => active)
      .map(([key]) => key),
    notes: "Seeded from reviewed public transport-engineering research."
  };
};

export async function syncCrmSourceRegistry() {
  const results = [];
  for (const source of CRM_SOURCE_REGISTRY) {
    results.push(await CrmController.upsertSource(source.id, normalizeSource(source)));
  }
  return results;
}

export async function syncTransportEngineeringSeeds() {
  await syncCrmSourceRegistry();

  const companiesByName = new Map();
  const companies = [];
  const people = [];

  for (const seed of TRANSPORT_ENGINEERING_COMPANY_SEEDS) {
    const company = await CrmController.upsertCompany(companyPayload(seed));
    companiesByName.set(seed.companyName.toLowerCase(), company);
    companies.push(company);

    await CrmController.addEvidence({
      company_id: company.id,
      source_id: RESEARCH_SOURCE_ID,
      source_url: seed.sourceUrl,
      evidence_type: "specialist_company",
      confidence: "reviewed_public_source",
      verification_state: "source_observed",
      raw_text: JSON.stringify({
        capabilities: seed.capabilities || [],
        evidenceType: seed.evidenceType
      }),
      metadata_json: {
        capabilities: seed.capabilities || [],
        region: seed.region,
        country: seed.country
      }
    });
  }

  for (const seed of TRANSPORT_ENGINEERING_PERSON_SEEDS) {
    let company = companiesByName.get((seed.companyName || "").toLowerCase());

    if (!company && seed.companyName) {
      company = await CrmController.upsertCompany({
        canonical_name: seed.companyName,
        match_key: buildCompanyMatchKey(seed.companyName),
        country: seed.country || null,
        region: seed.region || null,
        verification_state: "source_observed",
        specialties: [],
        notes: "Created from reviewed transport-engineering person seed."
      });
      companiesByName.set(seed.companyName.toLowerCase(), company);
    }

    const evidence = scoreEngineeringEvidence(seed);
    const person = await CrmController.createPerson({
      company_id: company?.id || null,
      full_name: seed.fullName,
      title: seed.roleEvidence || null,
      linkedin_url: seed.sourceUrl?.includes("linkedin.com") ? seed.sourceUrl : null,
      country: seed.country || null,
      region: seed.region || null,
      credentials: seed.credentials || [],
      specialties: Object.entries(evidence.specialties)
        .filter(([, active]) => active)
        .map(([key]) => key),
      verification_state: "source_observed",
      notes: "Seeded from reviewed public transport-engineering research."
    });

    await CrmController.addEvidence({
      person_id: person.id,
      source_id: RESEARCH_SOURCE_ID,
      source_url: seed.sourceUrl,
      evidence_type: "person_role",
      confidence: "reviewed_public_source",
      verification_state: "source_observed",
      raw_text: seed.roleEvidence || null,
      metadata_json: {
        credentials: seed.credentials || [],
        region: seed.region,
        country: seed.country
      }
    });

    people.push(person);
  }

  return {
    companies: companies.length,
    people: people.length
  };
}
