import { describe, expect, it } from "vitest";

import { initialsFromName, normalizeIdentity, validIdentity } from "@/lib/navoscope-accounts";

describe("avatar initials", () => {
  it("uses the first two name parts", () => {
    expect(initialsFromName("ada mary lovelace")).toBe("AM");
  });
  it("uses one initial for a single-part name", () => {
    expect(initialsFromName("asher")).toBe("A");
  });
});

describe("identity", () => {
  it("accepts email or phone and normalizes them", () => {
    expect(validIdentity("A@B.co")).toBe(true);
    expect(validIdentity("+1 (555) 123-4567")).toBe(true);
    expect(validIdentity("abc")).toBe(false);
    expect(normalizeIdentity(" A@B.CO ")).toBe("a@b.co");
    expect(normalizeIdentity("+1 (555) 123-4567")).toBe("15551234567");
  });
});
