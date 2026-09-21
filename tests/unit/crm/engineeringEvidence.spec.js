import { describe, expect, it } from "vitest";
import {
  detectEngineeringSpecialties,
  scoreEngineeringEvidence
} from "@/utils/crm/engineeringEvidence";

describe("engineeringEvidence", () => {
  it("detects heavy transport and bridge evidence", () => {
    const result = detectEngineeringSpecialties({
      capabilities: ["superload route analysis", "bridge structural analysis"]
    });
    expect(result.route).toBe(true);
    expect(result.bridge).toBe(true);
    expect(result.heavyTransport).toBe(true);
  });

  it("detects Portuguese rigging evidence", () => {
    const result = detectEngineeringSpecialties({
      roleEvidence: "Engenheiro rigger para içamento e movimentação de cargas"
    });
    expect(result.rigging).toBe(true);
  });

  it("keeps candidates in review rather than auto-verifying", () => {
    const result = scoreEngineeringEvidence({
      fullName: "Example Engineer",
      credentials: ["PE"],
      companyName: "Example Heavy Transport",
      roleEvidence: "Heavy haul route and bridge engineer",
      sourceUrl: "https://example.com/profile"
    });
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.reviewState).toBe("priority_review");
  });
});
