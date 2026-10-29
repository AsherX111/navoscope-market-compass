import { describe, expect, it } from "vitest";
import {
  criteria,
  defaultScores,
  generateAnalysis,
  markets,
  recommendation,
  searchMarkets,
  weightedScore,
} from "@/lib/market/model";

describe("opportunity scoring", () => {
  it("uses documented weights, boundaries and changed inputs", () => {
    expect(criteria.reduce((n, c) => n + c.weight, 0)).toBe(1);
    expect(weightedScore({ demand: 1, growth: 1, fit: 1, feasibility: 1, resilience: 1 })).toBe(20);
    expect(weightedScore({ demand: 5, growth: 5, fit: 5, feasibility: 5, resilience: 5 })).toBe(
      100,
    );
    expect(weightedScore(defaultScores)).toBe(60);
    expect(weightedScore({ ...defaultScores, demand: 5 })).toBe(72);
  });
  it.each([0, 6, 2.5, NaN, Infinity])("rejects invalid rating %s", (demand) => {
    expect(() => weightedScore({ ...defaultScores, demand })).toThrow();
  });
  it("prioritises risk and feasibility over a high aggregate", () => {
    expect(
      recommendation({ demand: 5, growth: 5, fit: 5, feasibility: 5, resilience: 2 }).category,
    ).toBe("Protect");
    expect(
      recommendation({ demand: 5, growth: 5, fit: 5, feasibility: 2, resilience: 5 }).category,
    ).toBe("Protect");
    expect(
      recommendation({ demand: 4, growth: 4, fit: 4, feasibility: 4, resilience: 4 }).category,
    ).toBe("Prioritise");
    expect(recommendation(defaultScores).category).toBe("Expand");
    expect(recommendation({ ...defaultScores, demand: 1 }).category).toBe("Monitor");
  });
});
describe("market discovery", () => {
  it("combines case-insensitive keywords, industry, region and growth", () => {
    expect(
      searchMarkets({
        query: "COOLING",
        industry: "Energy",
        region: "Asia Pacific",
        minGrowth: 15,
        sort: "growth",
      }).map((m) => m.id),
    ).toEqual(["asia-cooling"]);
    expect(
      searchMarkets({
        query: "no such market",
        industry: "",
        region: "",
        minGrowth: 0,
        sort: "size",
      }),
    ).toEqual([]);
  });
  it("sorts numeric metrics and does not mutate the catalog", () => {
    const ids = markets.map((m) => m.id);
    expect(
      searchMarkets({ query: "", industry: "", region: "", minGrowth: 0, sort: "size" })[0]?.id,
    ).toBe("na-automation");
    expect(
      searchMarkets({ query: "", industry: "", region: "", minGrowth: 0, sort: "growth" })[0]?.id,
    ).toBe("asia-cooling");
    expect(markets.map((m) => m.id)).toEqual(ids);
  });
});
describe("rule-based analysis", () => {
  it("records assumptions and rating-dependent recommendations without claiming AI", () => {
    const report = generateAnalysis(
      markets[0]!,
      { ...defaultScores, resilience: 1 },
      "Limited pilot budget",
    );
    expect(report.mode).toContain("no language model called");
    expect(report.summary).toContain(markets[0]!.name);
    expect(report.assumptions).toBe("Limited pilot budget");
    expect(report.category).toBe("Protect");
    expect(report.risks.join(" ")).toContain("Risk resilience");
    expect(report.gaps.join(" ")).toContain("not verified market research");
    expect(report.actions.length).toBeGreaterThan(2);
  });
  it("requires nonempty bounded assumptions", () => {
    expect(() => generateAnalysis(markets[0]!, defaultScores, "  ")).toThrow();
    expect(() => generateAnalysis(markets[0]!, defaultScores, "a".repeat(3001))).toThrow();
  });
});
