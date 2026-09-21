#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { buildSourceEvidence } from "../../src/utils/crm/companyNormalizer.js";

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const value = argv[i];
    if (!value.startsWith("--")) continue;
    const [key, inline] = value.slice(2).split("=");
    args[key] = inline ?? argv[++i];
  }
  return args;
}

function splitCsvLine(line) {
  const cells = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        value += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      cells.push(value.trim());
      value = "";
    } else {
      value += char;
    }
  }
  cells.push(value.trim());
  return cells;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];
  const headers = splitCsvLine(lines[0]).map((value) => value.trim());
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function first(row, keys) {
  for (const key of keys) {
    const value = row[key];
    if (value && String(value).trim()) return String(value).trim();
  }
  return "";
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.input || !args["source-id"] || !args["source-url"]) {
    throw new Error(
      "Usage: node scripts/crm/import-source-csv.mjs --input file.csv --source-id SOURCE --source-url URL [--output file.json]"
    );
  }

  const inputPath = path.resolve(args.input);
  const outputPath = path.resolve(
    args.output || `src/data/crm/generated/${args["source-id"]}.json`
  );

  const rows = parseCsv(await fs.readFile(inputPath, "utf8"));
  const observedAt = new Date().toISOString();
  const companyRecords = [];
  const personRecords = [];

  for (const row of rows) {
    const companyName = first(row, [
      "company",
      "company_name",
      "Company",
      "Company Name",
      "exhibitor",
      "Exhibitor"
    ]);

    const fullName = first(row, [
      "name",
      "full_name",
      "Full Name",
      "person",
      "Person"
    ]);

    const title = first(row, ["title", "job_title", "Job Title", "position", "Position"]);
    const country = first(row, ["country", "Country"]);
    const stand = first(row, ["stand", "Stand", "booth", "Booth"]);
    const sectorValue = first(row, ["sector", "Sector", "category", "Category"]);
    const sectors = sectorValue
      ? sectorValue.split(/[;|]/).map((value) => value.trim()).filter(Boolean)
      : [];

    if (companyName) {
      companyRecords.push(
        buildSourceEvidence({
          companyName,
          sourceId: args["source-id"],
          sourceUrl: args["source-url"],
          observedAt,
          stand: stand || null,
          sectors,
          country: country || null,
          rawText: JSON.stringify(row)
        })
      );
    }

    if (fullName) {
      personRecords.push({
        entityType: "person",
        fullName,
        title: title || null,
        companyName: companyName || null,
        country: country || null,
        sourceId: args["source-id"],
        sourceUrl: args["source-url"],
        observedAt,
        verificationState: "source_observed",
        confidence: "source_exact",
        rawSourceRow: row
      });
    }
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(
    outputPath,
    JSON.stringify(
      {
        schemaVersion: 1,
        sourceId: args["source-id"],
        sourceUrl: args["source-url"],
        importedAt: new Date().toISOString(),
        companyRecordCount: companyRecords.length,
        personRecordCount: personRecords.length,
        companies: companyRecords,
        people: personRecords
      },
      null,
      2
    ) + "\n",
    "utf8"
  );

  console.log(
    `Imported ${companyRecords.length} companies and ${personRecords.length} people -> ${outputPath}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
