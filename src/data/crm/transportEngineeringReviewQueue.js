import { TRANSPORT_ENGINEERING_COMPANY_SEEDS, TRANSPORT_ENGINEERING_PERSON_SEEDS } from "@/data/crm/transportEngineeringSeeds";
import { buildEngineeringCandidate } from "@/utils/crm/engineeringEvidence";

export const TRANSPORT_ENGINEERING_REVIEW_QUEUE = [
  ...TRANSPORT_ENGINEERING_PERSON_SEEDS.map((candidate) =>
    buildEngineeringCandidate({
      ...candidate,
      candidateType: "person"
    })
  ),
  ...TRANSPORT_ENGINEERING_COMPANY_SEEDS.map((candidate) =>
    buildEngineeringCandidate({
      ...candidate,
      candidateType: "company"
    })
  )
].sort(
  (left, right) =>
    right.engineeringEvidence.score - left.engineeringEvidence.score
);
