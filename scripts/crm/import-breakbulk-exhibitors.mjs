#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { JSDOM } from "jsdom";
import { buildSourceEvidence } from "../../src/utils/crm/companyNormalizer.js";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "src/data/crm/generated");

const SOURCES = [
  {
    sourceId: "breakbulk-europe-2027-watch",
    sourceUrl: "https://europe.breakbulk.com/exhibitors",
    output: "breakbulk-europe-2027.json"
  },
  {
    sourceId: "breakbulk-middle-east-dubai-2027-watch",
    sourceUrl: "https://middleeast.breakbulk.com/exhibitors",
    output: "breakbulk-dubai-2027.json"
  }
];

const clean = (value = "") => value.replace(/\s+/g, " ").trim();

function parseExhibitorText(text) {
  const value = clean(text);
  if (!value || !/\bStand\b/i.test(value)) return null;

  const match = value.match(/^(.*?)\s+Stand\s+([^\s]+(?:,[^\s]+)*)\s*(.*)$/i);
  if (!match) return null;

  const companyName = clean(match[1]);
  const stand = clean(match[2]);
  const tail = clean(match[3]);
  if (!companyName || companyName.length < 2) return null;

  const knownSectors = [
    "Freight Forwarder",
    "Maritime Transport",
    "Ports & Terminals",
    "Air Transport",
    "Industry Related Services",
    "Equipment Supplier",
    "Road Transport",
    "Rail Transport",
    "Shippers & Project Owners",
    "Technology",
    "Equipment",
    "IT",
    "Other"
  ];

  const sectors = knownSectors.filter((sector) =>
    tail.toLowerCase().includes(sector.toLowerCase())
  );

  return { companyName, stand, sectors, rawText: value };
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "RouteSurvey-CRM-SourceImporter/1.0 (+https://routesurvey.app)"
    }
  });
  if (!response.ok) {
    throw new Error(`Failed ${url}: HTTP ${response.status}`);
  }
  return response.text();
}

function extractRecords(html, source) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const candidates = [
    ...document.querySelectorAll("a"),
    ...document.querySelectorAll("article"),
    ...document.querySelectorAll("li")
  ];

  const seen = new Set();
  const records = [];
  const observedAt = new Date().toISOString();

  for (const node of candidates) {
    const parsed = parseExhibitorText(node.textContent || "");
    if (!parsed) continue;

    const dedupe = parsed.companyName.toLowerCase() + "|" + parsed.stand.toLowerCase();
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);

    records.push(buildSourceEvidence({
      ...parsed,
      sourceId: source.sourceId,
      sourceUrl: source.sourceUrl,
      observedAt
    }));
  }

  return records;
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const summary = [];
  for (const source of SOURCES) {
    const html = await fetchHtml(source.sourceUrl);
    const records = extractRecords(html, source);
    const payload = {
      schemaVersion: 1,
      sourceId: source.sourceId,
      sourceUrl: source.sourceUrl,
      importedAt: new Date().toISOString(),
      recordCount: records.length,
      records
    };
    await fs.writeFile(
      path.join(OUTPUT_DIR, source.output),
      JSON.stringify(payload, null, 2) + "\n",
      "utf8"
    );
    summary.push({ source: source.sourceId, records: records.length, output: source.output });
  }

  console.table(summary);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
