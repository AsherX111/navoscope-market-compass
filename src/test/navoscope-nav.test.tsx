import { describe, expect, it } from "vitest";

import { navEntries, pageFromPath } from "@/components/Navoscope";

describe("top navigation", () => {
  it("offers exactly pages 1, 2 and 3 on the homepage", () => {
    expect(navEntries(null)).toEqual([1, 2, 3]);
  });

  it("offers the other two pages, in ascending order, on each numbered page", () => {
    expect(navEntries(1)).toEqual([2, 3]);
    expect(navEntries(2)).toEqual([1, 3]);
    expect(navEntries(3)).toEqual([1, 2]);
  });

  it("never offers page 4, though its route still opens", () => {
    expect(navEntries(null)).not.toContain(4);
    expect(navEntries(4)).toEqual([1, 2, 3]);
    expect(pageFromPath("/page-4")).toBe(4);
  });
});
