export const statuses = ["New", "Researching", "Scored", "Reviewed", "Archived"] as const;
export type WorkStatus = (typeof statuses)[number];
export type Market = {
  id: string;
  name: string;
  industry: string;
  region: string;
  size: number;
  growth: number;
  summary: string;
  drivers: string[];
  risks: string[];
  evidence: string;
};
const evidence =
  "Illustrative teaching dataset, authored for this MVP. All sizes (USD billions), growth rates and scenarios are invented assumptions, not verified market research.";
export const markets: Market[] = [
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
export const criteria = [
  {
    key: "demand",
    label: "Demand potential",
    weight: 0.3,
    help: "Validated customer need and willingness to pay",
  },
  {
    key: "growth",
    label: "Growth outlook",
    weight: 0.2,
    help: "Durability of expected market expansion",
  },
  {
    key: "fit",
    label: "Strategic fit",
    weight: 0.25,
    help: "Fit with your capabilities and business objectives",
  },
  {
    key: "feasibility",
    label: "Delivery feasibility",
    weight: 0.15,
    help: "Resources, channels and regulatory readiness",
  },
  {
    key: "resilience",
    label: "Risk resilience",
    weight: 0.1,
    help: "Higher means lower exposure and stronger mitigations",
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
  mode: "Rule-based demo — no language model called";
  summary: string;
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
    summary: `${market.name}: ${market.summary} Illustrative size: USD ${market.size}bn; illustrative annual growth: ${market.growth}%.`,
    strengths: [
      ...market.drivers,
      ...criteria
        .filter(({ key }) => scores[key] >= 4)
        .map(({ label }) => `User-rated strength: ${label}.`),
    ],
    risks: [
      ...market.risks,
      ...weak.map((label) => `Low user rating: ${label}; investigate before investment.`),
    ],
    fit: `Strategic fit ${scores.fit}/5; delivery feasibility ${scores.feasibility}/5. These are user judgments, not verified feasibility findings.`,
    gaps: [
      market.evidence,
      "Verify customer demand, addressable segments, competitor pricing and compliance requirements with dated primary sources.",
      "Validate the user's assumptions independently before using this report.",
    ],
    actions: [
      reason,
      ...weak.map((label) => `Assign an owner and collect evidence for ${label.toLowerCase()}.`),
      `Interview three potential customers in ${market.region} and document purchasing constraints.`,
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
}) {
  const q = options.query.trim().toLowerCase();
  return markets
    .filter(
      (m) =>
        `${m.name} ${m.summary} ${m.industry} ${m.drivers.join(" ")}`.toLowerCase().includes(q) &&
        (!options.industry || m.industry === options.industry) &&
        (!options.region || m.region === options.region) &&
        m.growth >= options.minGrowth,
    )
    .sort((a, b) =>
      options.sort === "size"
        ? b.size - a.size
        : options.sort === "growth"
          ? b.growth - a.growth
          : a.name.localeCompare(b.name),
    );
}
