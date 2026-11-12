import { domelMarkets } from "./domel-catalog";
export const statuses = ["New", "Researching", "Scored", "Reviewed", "Archived"] as const;
export type WorkStatus = (typeof statuses)[number];
export type Catalog = "domel" | "legacy" | "all";
export type SourceEvidence = {
  url: string;
  title: string;
  publisher: "Domel";
  publicationDate: string | null;
  accessedDate: string;
  sourceType: "Manufacturer statement";
  limitations: string;
  eventDates?: string;
};
export type Market = {
  id: string;
  name: string;
  industry: string;
  region: string;
  size: number | null;
  growth: number | null;
  summary: string;
  drivers: string[];
  risks: string[];
  evidence: string;
  catalog?: "domel" | "legacy";
  sources?: SourceEvidence[];
  questions?: string[];
};
const evidence =
  "Illustrative teaching dataset, authored for this MVP. All sizes (USD billions), growth rates and scenarios are invented assumptions, not verified market research.";
export const legacyMarkets: Market[] = [
  {
    id: "eu-heat-pumps",
    name: "European heat pumps",
    industry: "Energy",
    region: "Europe",
    size: 12,
    growth: 14,
    summary: "Efficient residential heating and replacement equipment.",
    drivers: ["Building efficiency upgrades", "Electrification of heating"],
    risks: ["Installation capacity constraints", "Policy and subsidy changes"],
    evidence,
  },
  {
    id: "asia-water",
    name: "Asian water treatment",
    industry: "Infrastructure",
    region: "Asia Pacific",
    size: 22,
    growth: 9,
    summary: "Industrial filtration and water reuse systems.",
    drivers: ["Industrial water reuse", "Urban infrastructure renewal"],
    risks: ["Lengthy procurement cycles", "Local certification costs"],
    evidence,
  },
  {
    id: "na-automation",
    name: "North American automation",
    industry: "Manufacturing",
    region: "North America",
    size: 35,
    growth: 8,
    summary: "Automation components for mid-size factories.",
    drivers: ["Factory productivity investment", "Demand for process consistency"],
    risks: ["Integration complexity", "Established competitors"],
    evidence,
  },
  {
    id: "eu-medical",
    name: "European medical devices",
    industry: "Healthcare",
    region: "Europe",
    size: 18,
    growth: 6,
    summary: "Precision components for non-invasive medical equipment.",
    drivers: ["Replacement of aging equipment", "Demand for reliable components"],
    risks: ["Regulatory approval requirements", "Long qualification periods"],
    evidence,
  },
  {
    id: "asia-cooling",
    name: "Asian data-centre cooling",
    industry: "Energy",
    region: "Asia Pacific",
    size: 9,
    growth: 19,
    summary: "Efficient cooling equipment for data centres.",
    drivers: ["Higher compute density", "Energy efficiency requirements"],
    risks: ["Customer concentration", "Rapid technical change"],
    evidence,
  },
  {
    id: "na-recycling",
    name: "North American recycling",
    industry: "Infrastructure",
    region: "North America",
    size: 7,
    growth: 11,
    summary: "Sorting and recovery equipment for material reuse.",
    drivers: ["Material recovery targets", "Demand for recycled inputs"],
    risks: ["Commodity price swings", "Municipal budget constraints"],
    evidence,
  },
];
export const markets: Market[] = [...domelMarkets, ...legacyMarkets];
export { domelMarkets };
export function catalogMarkets(catalog: Catalog = "domel") {
  return catalog === "all" ? markets : catalog === "legacy" ? legacyMarkets : domelMarkets;
}
export function metricText(value: number | null, metric: "size" | "growth") {
  return value === null
    ? "Not established"
    : metric === "size"
      ? `Illustrative USD ${value}bn`
      : `Illustrative ${value}%`;
}
export const criteria = [
  {
    key: "demand",
    label: "Demand potential",
    weight: 0.3,
    help: "How much customers need this and are willing to pay.",
  },
  {
    key: "growth",
    label: "Growth outlook",
    weight: 0.2,
    help: "How likely the market is to grow over time.",
  },
  {
    key: "fit",
    label: "Strategic fit",
    weight: 0.25,
    help: "How well this matches your strengths and business goals.",
  },
  {
    key: "feasibility",
    label: "Delivery feasibility",
    weight: 0.15,
    help: "How ready you are to deliver, with resources, sales channels and required approvals.",
  },
  {
    key: "resilience",
    label: "Risk resilience",
    weight: 0.1,
    help: "How well you can manage risks. A higher rating means less risk and stronger safeguards.",
  },
] as const;
export type Scores = Record<(typeof criteria)[number]["key"], number>;
export const defaultScores: Scores = {
  demand: 3,
  growth: 3,
  fit: 3,
  feasibility: 3,
  resilience: 3,
};
export type Category = "Protect" | "Expand" | "Monitor" | "Prioritise";
export function weightedScore(scores: Scores): number {
  for (const { key } of criteria) {
    if (!Number.isInteger(scores[key]) || scores[key] < 1 || scores[key] > 5)
      throw new Error("Each criterion must be an integer from 1 to 5.");
  }
  return (
    Math.round(
      criteria.reduce((total, { key, weight }) => total + (scores[key] / 5) * weight * 100, 0) * 10,
    ) / 10
  );
}
export function recommendation(scores: Scores): { category: Category; reason: string } {
  const total = weightedScore(scores);
  if (scores.resilience <= 2 || scores.feasibility <= 2)
    return {
      category: "Protect",
      reason: "Resolve delivery constraints or risk exposure before committing investment.",
    };
  if (total >= 80 && scores.fit >= 4)
    return {
      category: "Prioritise",
      reason: "Strong weighted potential and strategic fit; validate demand with a bounded pilot.",
    };
  if (total >= 60)
    return {
      category: "Expand",
      reason: "Promising potential; test a limited expansion before scaling.",
    };
  return {
    category: "Monitor",
    reason: "Evidence or capability is insufficient; research the weakest criteria first.",
  };
}
export type Evaluation = {
  id: string;
  user_id: string;
  market_id: string;
  scores: Scores;
  notes: string;
  status: WorkStatus;
  updated_at: string;
};
export type Report = {
  format?: "freeform";
  mode: "Rule-based demo — no language model called" | "AI-assisted analysis — DeepSeek";
  summary: string;
  sources?: SourceEvidence[];
  applicability?: string;
  questions?: string[];
  strengths: string[];
  risks: string[];
  fit: string;
  gaps: string[];
  actions: string[];
  category: Category;
  rationale: string;
  assumptions: string;
  score: number;
};
export type Analysis = {
  id: string;
  user_id: string;
  market_id: string;
  scores: Scores;
  assumptions: string;
  report: Report;
  created_at: string;
};
export function generateAnalysis(market: Market, scores: Scores, assumptions: string): Report {
  if (!assumptions.trim() || assumptions.length > 3000)
    throw new Error("Enter assumptions (1–3000 characters).");
  const { category, reason } = recommendation(scores);
  const weak = criteria.filter(({ key }) => scores[key] <= 2).map(({ label }) => label);
  return {
    mode: "Rule-based demo — no language model called",
    summary: `${market.name}: ${market.summary} Size: ${metricText(market.size, "size")}; annual growth: ${metricText(market.growth, "growth")}.`,
    sources: (market.sources ?? []).map((source) => ({ ...source })),
    applicability: market.sources?.length
      ? "Manufacturer-sourced application relevance is separate from user-rated attractiveness; no customer demand or commercial validation is established."
      : "Legacy illustrative teaching assumptions, not verified research.",
    questions: [...(market.questions ?? [])],
    strengths: [
      ...market.drivers,
      ...criteria
        .filter(({ key }) => scores[key] >= 4)
        .map(({ label }) => `User-rated attractiveness: ${label}.`),
    ],
    risks: [
      ...market.risks,
      ...weak.map((label) => `Low user rating: ${label}; investigate before investment.`),
    ],
    fit: `Strategic fit ${scores.fit}/5; delivery feasibility ${scores.feasibility}/5. These are user judgments, not verified feasibility findings.`,
    gaps: [
      market.evidence,
      "Not established by these sources: market size, growth, customer demand, contracts or competitor comparisons. Not verified market research. Verify customer demand, addressable segments, competitor pricing and compliance requirements with dated primary sources.",
      "Validate the user's assumptions independently before using this report.",
    ],
    actions: [
      reason,
      ...weak.map((label) => `Assign an owner and collect evidence for ${label.toLowerCase()}.`),
      "Questions to validate: Which potential customers have purchasing constraints and unmet requirements?",
      "Set a pilot budget and review date before committing resources.",
    ],
    category,
    rationale: reason,
    assumptions: assumptions.trim(),
    score: weightedScore(scores),
  };
}
export function searchMarkets(options: {
  query: string;
  industry: string;
  region: string;
  minGrowth: number;
  sort: string;
  catalog?: Catalog;
}) {
  const q = options.query.trim().toLowerCase();
  return catalogMarkets(options.catalog)
    .filter(
      (m) =>
        `${m.name} ${m.summary} ${m.industry} ${m.drivers.join(" ")} ${m.sources?.map((s) => `${s.publisher} ${s.title} ${s.url}`).join(" ") ?? ""}`
          .toLowerCase()
          .includes(q) &&
        (!options.industry || m.industry === options.industry) &&
        (!options.region || m.region === options.region) &&
        (options.minGrowth <= 0 || (m.growth !== null && m.growth >= options.minGrowth)),
    )
    .sort((a, b) =>
      options.sort === "size"
        ? compareMetric(a.size, b.size) || a.name.localeCompare(b.name)
        : options.sort === "growth"
          ? compareMetric(a.growth, b.growth) || a.name.localeCompare(b.name)
          : a.name.localeCompare(b.name),
    );
}

function compareMetric(a: number | null, b: number | null) {
  if (a === null) return b === null ? 0 : 1;
  if (b === null) return -1;
  return b - a;
}
