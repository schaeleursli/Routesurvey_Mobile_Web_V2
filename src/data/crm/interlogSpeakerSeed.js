const SOURCE_ID = "interlog-summit-speakers-2026";
const SOURCE_URL = "https://www.intermodal.com.br/en/interlog-summit/";
const OBSERVED_AT = "2026-09-21";

export const INTERLOG_2026_PUBLIC_SPEAKERS = [
  {
    fullName: "Milton Pimenta",
    title: "Global Senior Vice President Ground & Rail",
    companyName: "CEVA Logistics",
    country: "Brazil"
  },
  {
    fullName: "Eduard Moyà Barberà",
    title: "Product Manager / Container Division",
    companyName: "Port of Barcelona",
    country: "Spain"
  },
  {
    fullName: "Luciana Costa",
    title: "Director, Infrastructure, Energy Transition and Climate Change",
    companyName: "BNDES",
    country: "Brazil"
  },
  {
    fullName: "Roger Pêgas",
    title: null,
    companyName: "ARTESP",
    country: "Brazil"
  },
  {
    fullName: "Anderson Pomini",
    title: "CEO / President",
    companyName: "Autoridade Portuária de Santos",
    country: "Brazil"
  },
  {
    fullName: "Claudio Pena",
    title: "Supply Chain Manager",
    companyName: "Mondelēz Brasil",
    country: "Brazil"
  },
  {
    fullName: "Juliana Michelin",
    title: "Operations Director",
    companyName: "Mercado Livre",
    country: "Brazil"
  }
].map((person) => ({
  ...person,
  entityType: "person",
  sourceId: SOURCE_ID,
  sourceUrl: SOURCE_URL,
  observedAt: OBSERVED_AT,
  verificationState: "source_observed",
  confidence: "source_exact",
  sourceRole: "speaker_or_program_participant"
}));
