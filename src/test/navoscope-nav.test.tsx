import { describe, expect, it } from "vitest";

import { navEntries, pageFromPath } from "@/components/Navoscope";

describe("top navigation", () => {
  it("does not offer workflow navigation on the homepage", () => {
    expect(navEntries(null)).toEqual([]);
  });

  it("keeps all three steps, in ascending order, on every workspace page", () => {
    expect(navEntries(1)).toEqual([1, 2, 3]);
    expect(navEntries(2)).toEqual([1, 2, 3]);
    expect(navEntries(3)).toEqual([1, 2, 3]);
  });

  it("never offers page 4, though its route still opens", () => {
    expect(navEntries(null)).not.toContain(4);
    expect(navEntries(4)).toEqual([1, 2, 3]);
    expect(pageFromPath("/page-4")).toBe(4);
  });
});
