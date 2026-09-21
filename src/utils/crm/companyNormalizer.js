const LEGAL_SUFFIXES = [
  "ag", "as", "a s", "bv", "b v", "co", "co kg", "company", "corp", "corporation",
  "dmcc", "fze", "fzco", "gmbh", "gmbh co kg", "inc", "incorporated", "llc", "llp",
  "ltd", "limited", "nv", "oy", "oyj", "pjsc", "pte ltd", "sa", "s a", "spa",
  "srl", "s r l", "ulc"
];

const normalizeCharacters = (value = "") =>
  String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[’'"`´]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

export const normalizeCompanyName = (name = "") => {
  let normalized = normalizeCharacters(name);
  if (!normalized) return "";

  let changed = true;
  while (changed) {
    changed = false;
    for (const suffix of LEGAL_SUFFIXES) {
      const suffixNormalized = normalizeCharacters(suffix);
      if (normalized === suffixNormalized) break;
      if (normalized.endsWith(" " + suffixNormalized)) {
        normalized = normalized.slice(0, -(suffixNormalized.length + 1)).trim();
        changed = true;
        break;
      }
    }
  }

  return normalized;
};

export const buildCompanyMatchKey = (name = "") =>
  normalizeCompanyName(name).replace(/\s+/g, "-");

export const exactCompanyMatch = (left, right) => {
  const a = buildCompanyMatchKey(left);
  const b = buildCompanyMatchKey(right);
  return Boolean(a && b && a === b);
};

export const buildSourceEvidence = ({
  companyName,
  sourceId,
  sourceUrl,
  observedAt,
  stand = null,
  sectors = [],
  country = null,
  rawText = null
}) => ({
  entityType: "company",
  companyName,
  companyMatchKey: buildCompanyMatchKey(companyName),
  sourceId,
  sourceUrl,
  observedAt,
  stand,
  sectors: [...new Set(sectors.filter(Boolean))],
  country,
  rawText,
  verificationState: "source_observed",
  confidence: "source_exact"
});
