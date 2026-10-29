import { describe, expect, it } from "vitest";

import { initialsFromName, emailError, passwordError, safeDestination } from "@/lib/navoscope-auth";

describe("avatar initials", () => {
  it("uses the first two name parts", () => {
    expect(initialsFromName("ada mary lovelace")).toBe("AM");
  });
  it("uses one initial for a single-part name", () => {
    expect(initialsFromName("asher")).toBe("A");
  });
});

describe('hosted auth rules', () => {
  it('accepts only email and rejects phone', () => {
    expect(emailError('A@B.co')).toBeNull();
    expect(emailError('+1 (555) 123-4567')).toContain('not yet available');
    expect(emailError('abc')).toContain('valid email');
  });
  it('requires eight characters and matching confirmation', () => {
    expect(passwordError('1234567', '1234567')).not.toBeNull();
    expect(passwordError('12345678', '12345678')).toBeNull();
    expect(passwordError('12345678', 'different')).not.toBeNull();
  });
  it('preserves only private page destinations', () => {
    expect(safeDestination('/page-2')).toBe('/page-2');
    expect(safeDestination('https://evil.example')).toBe('/');
    expect(safeDestination('/page-4')).toBe('/');
  });
});
