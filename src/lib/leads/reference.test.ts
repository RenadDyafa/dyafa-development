import { describe, it, expect } from "vitest";
import { buildLeadReferenceNumber } from "./reference";

describe("buildLeadReferenceNumber", () => {
  it("prefixes with DYA- and uppercases the derived suffix", () => {
    const ref = buildLeadReferenceNumber("clx1234567890abcdef");
    expect(ref).toMatch(/^DYA-[A-Z0-9]{8}$/);
  });

  it("is deterministic for the same lead id", () => {
    const id = "clx0000000000000000";
    expect(buildLeadReferenceNumber(id)).toBe(buildLeadReferenceNumber(id));
  });

  it("differs for different lead ids", () => {
    expect(buildLeadReferenceNumber("clx1111111111111111")).not.toBe(buildLeadReferenceNumber("clx2222222222222222"));
  });

  it("pads short ids to a full 8-character suffix", () => {
    const ref = buildLeadReferenceNumber("abc");
    expect(ref).toBe("DYA-00000ABC");
  });
});
