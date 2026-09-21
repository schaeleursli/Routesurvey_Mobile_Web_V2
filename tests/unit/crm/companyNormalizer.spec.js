import { describe, expect, it } from "vitest";
import {
  buildCompanyMatchKey,
  exactCompanyMatch,
  normalizeCompanyName
} from "@/utils/crm/companyNormalizer";

describe("companyNormalizer", () => {
  it("normalizes punctuation and legal suffixes", () => {
    expect(normalizeCompanyName("Fracht GROUP")).toBe("fracht group");
    expect(normalizeCompanyName("Mammoet B.V.")).toBe("mammoet");
    expect(normalizeCompanyName("AAL Shipping DMCC")).toBe("aal shipping");
  });

  it("keeps operating-brand words", () => {
    expect(normalizeCompanyName("DHL Industrial Projects")).toBe("dhl industrial projects");
  });

  it("builds stable conservative match keys", () => {
    expect(buildCompanyMatchKey("LASO TRANSPORTES S.A.")).toBe("laso-transportes");
    expect(exactCompanyMatch("Mammoet B.V.", "Mammoet")).toBe(true);
  });
});
