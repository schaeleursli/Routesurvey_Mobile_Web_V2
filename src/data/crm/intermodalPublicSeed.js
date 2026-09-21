import { buildSourceEvidence } from "@/utils/crm/companyNormalizer";

const SOURCE_ID = "intermodal-south-america-exhibitors-2026";
const SOURCE_URL = "https://www.intermodal.com.br/en/attractions/ti-innovations/";
const OBSERVED_AT = "2026-09-21";

const TI_INNOVATIONS_2026 = [
  "ALLTECH",
  "ADEJO",
  "STOKKI",
  "ZARPAR",
  "NEWAGE",
  "PARAGON",
  "COMETRIX",
  "CALLINK",
  "ENVOY",
  "NEURORED",
  "SELIA",
  "HUGHES",
  "MY TRACKING",
  "GAP SISTEMAS",
  "VML",
  "OMNICOMM",
  "FSENSE",
  "MEU CHAPA",
  "DEUTSCHE TELEKOM",
  "MÔNACO",
  "ARGUS COMPASS"
];

export const INTERMODAL_PUBLIC_SEED = TI_INNOVATIONS_2026.map((companyName) =>
  buildSourceEvidence({
    companyName,
    sourceId: SOURCE_ID,
    sourceUrl: SOURCE_URL,
    observedAt: OBSERVED_AT,
    sectors: ["Technology"],
    country: "Brazil",
    rawText: "Confirmed exhibitor in Intermodal South America 2026 TI Innovations public listing"
  })
);
