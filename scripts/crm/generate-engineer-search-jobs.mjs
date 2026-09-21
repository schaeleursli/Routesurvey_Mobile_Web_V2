#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { TRANSPORT_ENGINEERING_DISCOVERY } from "../../src/data/crm/transportEngineeringTaxonomy.js";

const OUTPUT = path.resolve(
  process.argv[2] || "src/data/crm/generated/transport-engineering-search-jobs.json"
);

const COUNTRY_GROUPS = {
  usa: [
    { country: "United States", locale: "en-US" }
  ],
  europe: [
    { country: "Germany", locale: "de-DE" },
    { country: "Netherlands", locale: "nl-NL" },
    { country: "Belgium", locale: "nl-BE" },
    { country: "France", locale: "fr-FR" },
    { country: "Italy", locale: "it-IT" },
    { country: "Spain", locale: "es-ES" },
    { country: "Portugal", locale: "pt-PT" },
    { country: "United Kingdom", locale: "en-GB" },
    { country: "Poland", locale: "pl-PL" },
    { country: "Switzerland", locale: "de-CH" }
  ],
  brazil: [
    { country: "Brazil", locale: "pt-BR" }
  ],
  latamSpanish: [
    { country: "Chile", locale: "es-CL" },
    { country: "Peru", locale: "es-PE" },
    { country: "Argentina", locale: "es-AR" },
    { country: "Colombia", locale: "es-CO" },
    { country: "Mexico", locale: "es-MX" },
    { country: "Uruguay", locale: "es-UY" },
    { country: "Paraguay", locale: "es-PY" },
    { country: "Bolivia", locale: "es-BO" },
    { country: "Ecuador", locale: "es-EC" }
  ]
};

const jobs = [];
let sequence = 1;

for (const [regionKey, countries] of Object.entries(COUNTRY_GROUPS)) {
  const region = TRANSPORT_ENGINEERING_DISCOVERY.regions[regionKey];
  for (const countryConfig of countries) {
    for (const term of region.terms) {
      jobs.push({
        id: `te-${String(sequence++).padStart(4, "0")}`,
        region: regionKey,
        country: countryConfig.country,
        locale: countryConfig.locale,
        query: `"${term}" "${countryConfig.country}"`,
        intent: "company_and_engineer_discovery",
        status: "pending",
        resultPolicy: {
          publicSourcesOnly: true,
          requireSourceUrl: true,
          autoMerge: false,
          requireHumanReview: true
        }
      });
    }
  }
}

const payload = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  jobCount: jobs.length,
  jobs
};

await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
await fs.writeFile(OUTPUT, JSON.stringify(payload, null, 2) + "\n", "utf8");
console.log(`Generated ${jobs.length} transport-engineering discovery jobs -> ${OUTPUT}`);
