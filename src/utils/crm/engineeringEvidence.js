const SPECIALTY_SIGNALS = {
  route: ["route", "road survey", "estudo de rota", "estudio de ruta", "itinerario"],
  bridge: ["bridge", "pontes", "puentes", "structural", "estrutural", "estructural"],
  heavyTransport: ["heavy transport", "heavy haul", "superload", "schwertransport", "transporte pesado", "transportes especiais", "transporte especial"],
  rigging: ["rigging", "rigger", "izaje", "içamento", "lifting", "lift engineer"],
  sweptPath: ["swept path", "turning", "simulação", "simulacion", "cinemática", "cinematica"],
  axleLoad: ["axle load", "load distribution", "distribuição de carga", "distribucion de carga", "carga por eje"],
  permits: ["permit", "permitting", "aet", "autorização", "autorizacion", "permiso"]
};

const CREDENTIAL_PATTERNS = [
  /\bpe\b/i,
  /\bp\.e\.\b/i,
  /\bse\b/i,
  /\bs\.e\.\b/i,
  /civil engineer/i,
  /structural engineer/i,
  /engenheir[oa]/i,
  /ingenier[oa]/i
];

const normalize = (value = "") =>
  String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function detectEngineeringSpecialties(candidate = {}) {
  const haystack = normalize([
    candidate.title,
    candidate.roleEvidence,
    candidate.companyName,
    ...(candidate.capabilities || []),
    ...(candidate.specialties || [])
  ].filter(Boolean).join(" "));

  return Object.fromEntries(
    Object.entries(SPECIALTY_SIGNALS).map(([key, signals]) => [
      key,
      signals.some((signal) => haystack.includes(normalize(signal)))
    ])
  );
}

export function hasEngineeringCredential(candidate = {}) {
  const values = [
    ...(candidate.credentials || []),
    candidate.title,
    candidate.roleEvidence
  ].filter(Boolean).join(" ");
  return CREDENTIAL_PATTERNS.some((pattern) => pattern.test(values));
}

export function scoreEngineeringEvidence(candidate = {}) {
  const specialties = detectEngineeringSpecialties(candidate);
  const specialtyCount = Object.values(specialties).filter(Boolean).length;

  let score = 0;
  const reasons = [];

  if (candidate.sourceUrl) {
    score += 10;
    reasons.push("source URL");
  }

  if (candidate.companyName) {
    score += 10;
    reasons.push("company identified");
  }

  if (candidate.fullName) {
    score += 10;
    reasons.push("named person");
  }

  if (hasEngineeringCredential(candidate)) {
    score += 20;
    reasons.push("engineering credential/title evidence");
  }

  if (specialtyCount > 0) {
    score += Math.min(30, specialtyCount * 10);
    reasons.push(`${specialtyCount} relevant engineering specialties`);
  }

  if (candidate.evidenceType === "specialist_company") {
    score += 15;
    reasons.push("specialist company evidence");
  }

  if (candidate.roleEvidence) {
    score += 10;
    reasons.push("role evidence");
  }

  return {
    score: Math.min(100, score),
    specialties,
    reasons,
    reviewState: score >= 70 ? "priority_review" : score >= 40 ? "review" : "discovery"
  };
}

export function buildEngineeringCandidate(candidate = {}) {
  return {
    ...candidate,
    engineeringEvidence: scoreEngineeringEvidence(candidate),
    verificationState: candidate.verificationState || "unverified"
  };
}
