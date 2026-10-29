import { useEffect, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import {
  criteria,
  defaultScores,
  generateAnalysis,
  markets,
  recommendation,
  searchMarkets,
  statuses,
  weightedScore,
  type Analysis,
  type Evaluation,
  type Report,
  type Scores,
  type WorkStatus,
} from "@/lib/market/model";
import { loadWorkspace, saveAnalysis, saveEvaluation, storageError } from "@/lib/market/storage";

export function MarketWorkspace({ page, userId }: { page: number; userId: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("");
  const [region, setRegion] = useState("");
  const [minGrowth, setMinGrowth] = useState(0);
  const [sort, setSort] = useState("name");
  const [selected, setSelected] = useState(markets[0]!.id);
  const [detail, setDetail] = useState<string | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [scores, setScores] = useState<Scores>({ ...defaultScores });
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<WorkStatus>("New");
  const [assumptions, setAssumptions] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [reportMarket, setReportMarket] = useState("");
  const [reportScores, setReportScores] = useState<Scores>({ ...defaultScores });
  const [savedReportId, setSavedReportId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const [savedFilter, setSavedFilter] = useState("");
  const [savedSort, setSavedSort] = useState("updated");
  const [savedQuery, setSavedQuery] = useState("");
  const [dirty, setDirty] = useState(false);
  const market = markets.find((m) => m.id === selected)!;
  const saved = evaluations.find((e) => e.market_id === selected);
  const archived = saved?.status === "Archived";
  const visible = searchMarkets({ query, industry, region, minGrowth, sort });
  const total = weightedScore(scores);
  const advice = recommendation(scores);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setLoadError("");
    loadWorkspace(userId)
      .then((data) => {
        if (alive) {
          setEvaluations(data.evaluations);
          setAnalyses(data.analyses);
        }
      })
      .catch((e) => {
        if (alive) setLoadError(storageError(e));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [userId, revision]);
  useEffect(() => {
    if (dirty) return;
    setScores(saved?.scores ?? { ...defaultScores });
    setNotes(saved?.notes ?? "");
    setStatus(saved?.status ?? "New");
    setDirty(false);
  }, [saved, selected, dirty]);
  function choose(id: string) {
    if (id === selected) return true;
    if (dirty && !window.confirm("Discard unsaved evaluation changes?")) return false;
    setDirty(false);
    setSelected(id);
    setReport(null);
    setSavedReportId(null);
    setError("");
    setMessage("");
    return true;
  }
  async function persistEvaluation() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const value: Evaluation = {
        id: saved?.id ?? crypto.randomUUID(),
        user_id: userId,
        market_id: selected,
        scores,
        notes: notes.trim(),
        status,
        updated_at: new Date().toISOString(),
      };
      const result = await saveEvaluation(value);
      setEvaluations((prev) => [...prev.filter((e) => e.market_id !== result.market_id), result]);
      setDirty(false);
      setMessage("Evaluation saved to your account.");
    } catch (e) {
      setError(storageError(e));
    } finally {
      setBusy(false);
    }
  }
  async function persistReport() {
    if (!report) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await saveAnalysis({
        id: crypto.randomUUID(),
        user_id: userId,
        market_id: reportMarket,
        scores: reportScores,
        assumptions: report.assumptions,
        report,
        created_at: new Date().toISOString(),
      });
      setAnalyses((prev) => [result, ...prev]);
      setSavedReportId(result.id);
      setMessage("Demo analysis saved to your account.");
    } catch (e) {
      setError(storageError(e));
    } finally {
      setBusy(false);
    }
  }
  function generate() {
    setError("");
    setMessage("");
    try {
      setReport(generateAnalysis(market, scores, assumptions));
      setReportMarket(selected);
      setReportScores({ ...scores });
      setSavedReportId(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  const savedResults = evaluations
    .filter(
      (e) =>
        (!savedFilter || e.status === savedFilter) &&
        markets
          .find((m) => m.id === e.market_id)
          ?.name.toLowerCase()
          .includes(savedQuery.toLowerCase()),
    )
    .sort((a, b) =>
      savedSort === "score"
        ? weightedScore(b.scores) - weightedScore(a.scores)
        : b.updated_at.localeCompare(a.updated_at),
    );
  const title =
    page === 1
      ? "Market Explorer"
      : page === 2
        ? "Opportunity Scoring"
        : "Analysis & Recommendations";
  return (
    <section className="market-workspace" aria-label={title}>
      <div className="workspace-heading">
        <p className="eyebrow">NAVOSCOPE / MARKET COMPASS</p>
        <h1>{title}</h1>
        <nav aria-label="Market workflow">
          <Link to="/page-1" aria-current={page === 1 ? "page" : undefined}>
            1 · Explore
          </Link>
          <Link to="/page-2" aria-current={page === 2 ? "page" : undefined}>
            2 · Score
          </Link>
          <Link to="/page-3" aria-current={page === 3 ? "page" : undefined}>
            3 · Analyse
          </Link>
        </nav>
        <p>
          Illustrative teaching data only. Market figures and analysis are assumptions, not verified
          research or investment advice.
        </p>
      </div>
      {loading && <p role="status">Loading your saved work…</p>}
      {loadError && (
        <div role="alert">
          <p>{loadError}</p>
          <button onClick={() => setRevision((v) => v + 1)}>Retry cloud storage</button>
          <p>
            Exploration and unsaved calculations remain available. Saving is disabled until records
            can be loaded.
          </p>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      {page === 1 ? (
        <>
          <div className="workspace-filters">
            <label>
              Search markets
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, keyword or industry"
              />
            </label>
            <label>
              Industry
              <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
                <option value="">All industries</option>
                {[...new Set(markets.map((m) => m.industry))].map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </label>
            <label>
              Region
              <select value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="">All regions</option>
                {[...new Set(markets.map((m) => m.region))].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
            <label>
              Minimum growth
              <select value={minGrowth} onChange={(e) => setMinGrowth(Number(e.target.value))}>
                <option value={0}>Any growth</option>
                <option value={10}>10% or higher</option>
                <option value={15}>15% or higher</option>
              </select>
            </label>
            <label>
              Sort markets
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="name">Name A–Z</option>
                <option value="size">Largest estimated size</option>
                <option value="growth">Highest growth</option>
              </select>
            </label>
          </div>
          <p role="status">
            {visible.length} market{visible.length === 1 ? "" : "s"} found
          </p>
          {visible.length === 0 && (
            <p>No markets match. Clear your search or broaden the filters.</p>
          )}
          <div className="market-grid">
            {visible.map((m) => (
              <article key={m.id} className="market-card">
                <p className="eyebrow">
                  {m.industry} / {m.region}
                </p>
                <h2>{m.name}</h2>
                <p>{m.summary}</p>
                <p>
                  Illustrative size USD {m.size}bn · Growth {m.growth}%
                </p>
                <button
                  onClick={() => setDetail(detail === m.id ? null : m.id)}
                  aria-expanded={detail === m.id}
                >
                  Details: {m.name}
                </button>
                {detail === m.id && (
                  <div>
                    <h3>Growth drivers</h3>
                    <ul>
                      {m.drivers.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                    <h3>Risks</h3>
                    <ul>
                      {m.risks.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                    <p>{m.evidence}</p>
                    <button
                      onClick={() => {
                        if (choose(m.id)) void router.navigate({ to: "/page-2" });
                      }}
                    >
                      Evaluate this market
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </>
      ) : (
        <>
          <label className="market-picker">
            Selected market
            <select value={selected} disabled={busy} onChange={(e) => choose(e.target.value)}>
              {markets.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          {page === 2 ? (
            <div className="workspace-columns">
              <section className="market-card">
                <h2>Evaluate {market.name}</h2>
                <p>
                  Rate each criterion 1 (weak) to 5 (strong). Higher risk resilience means lower
                  risk.
                </p>
                <p>Formula: Σ (rating ÷ 5 × weight × 100). Range 20–100; rounded to one decimal.</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void persistEvaluation();
                  }}
                >
                  {criteria.map((c) => (
                    <label key={c.key}>
                      {c.label} · {c.weight * 100}%<span className="field-help">{c.help}</span>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        step={1}
                        value={scores[c.key]}
                        disabled={archived || busy}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          if (Number.isInteger(n) && n >= 1 && n <= 5) {
                            setScores((prev) => ({ ...prev, [c.key]: n }));
                            setDirty(true);
                          }
                        }}
                      />
                    </label>
                  ))}
                  <label>
                    Research notes
                    <textarea
                      maxLength={3000}
                      value={notes}
                      disabled={archived || busy}
                      onChange={(e) => {
                        setNotes(e.target.value);
                        setDirty(true);
                      }}
                    />
                  </label>
                  <label>
                    Status
                    <select
                      value={status}
                      disabled={busy}
                      onChange={(e) => {
                        setStatus(e.target.value as WorkStatus);
                        setDirty(true);
                      }}
                    >
                      {statuses.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  {archived && (
                    <p>
                      Archived content is read-only. Choose another status and save to restore
                      editing. Reports can still be retrieved.
                    </p>
                  )}
                  <button type="submit" disabled={busy || loading || !!loadError}>
                    {busy ? "Saving…" : "Save evaluation"}
                  </button>
                  {dirty && <p>Unsaved evaluation changes</p>}
                </form>
              </section>
              <section className="market-card">
                <h2>Score breakdown</h2>
                <output className="score" aria-live="polite">
                  {total} / 100
                </output>
                <p>
                  <strong>{advice.category}</strong> — {advice.reason}
                </p>
                <ul>
                  {criteria.map((c) => (
                    <li key={c.key}>
                      {c.label}: {scores[c.key]}/5 × {c.weight * 100}% ={" "}
                      {((scores[c.key] / 5) * c.weight * 100).toFixed(1)} points
                    </li>
                  ))}
                </ul>
                <p>
                  Risk/feasibility ≤2 → Protect; otherwise total ≥80 and fit ≥4 → Prioritise; ≥60 →
                  Expand; otherwise Monitor.
                </p>
                <Link to="/page-3">Continue to analysis →</Link>
              </section>
            </div>
          ) : (
            <div className="workspace-columns">
              <section className="market-card">
                <h2>Generate a demo report</h2>
                <p>
                  No AI provider is configured. This deterministic rule-based report uses the
                  selected market and the current ratings ({total}/100). It does not call a language
                  model.
                </p>
                <Link to="/page-2">Edit scoring inputs</Link>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    generate();
                  }}
                >
                  <label>
                    Assumptions and business context
                    <textarea
                      required
                      maxLength={3000}
                      value={assumptions}
                      onChange={(e) => setAssumptions(e.target.value)}
                      placeholder="Capabilities, target customers, budget and assumptions to verify"
                    />
                  </label>
                  <button type="submit">Generate demo analysis</button>
                </form>
                <p>Current recommendation: {advice.category}</p>
              </section>
              {report && (
                <article className="market-card" aria-label="Analysis report">
                  <p className="eyebrow">{report.mode}</p>
                  <h2>{markets.find((m) => m.id === reportMarket)?.name}</h2>
                  <p>
                    <strong>
                      {report.category} · {report.score}/100
                    </strong>
                  </p>
                  <h3>Opportunity summary</h3>
                  <p>{report.summary}</p>
                  <h3>Strengths & growth drivers</h3>
                  <ul>
                    {report.strengths.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <h3>Risks & uncertainties</h3>
                  <ul>
                    {report.risks.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <h3>Strategic fit & feasibility</h3>
                  <p>{report.fit}</p>
                  <h3>Evidence gaps</h3>
                  <ul>
                    {report.gaps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <h3>Assumptions used</h3>
                  <p className="preserve-lines">{report.assumptions}</p>
                  <h3>Recommendations</h3>
                  <ul>
                    {report.actions.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <button
                    disabled={busy || loading || !!loadError || !!savedReportId}
                    onClick={() => void persistReport()}
                  >
                    {savedReportId ? "Saved report" : busy ? "Saving…" : "Save this demo report"}
                  </button>
                </article>
              )}
            </div>
          )}
        </>
      )}
      {page === 2 && (
        <section className="saved-work">
          <h2>Your saved evaluations</h2>
          <div className="workspace-filters">
            <label>
              Search saved markets
              <input
                type="search"
                value={savedQuery}
                onChange={(e) => setSavedQuery(e.target.value)}
              />
            </label>
            <label>
              Filter status
              <select value={savedFilter} onChange={(e) => setSavedFilter(e.target.value)}>
                <option value="">All statuses</option>
                {statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Sort saved evaluations
              <select value={savedSort} onChange={(e) => setSavedSort(e.target.value)}>
                <option value="updated">Most recently updated</option>
                <option value="score">Highest score</option>
              </select>
            </label>
          </div>
          {!loading && !loadError && savedResults.length === 0 && (
            <p>No saved evaluations match. Save an evaluation or broaden your filters.</p>
          )}
          {savedResults.map((e) => (
            <article className="saved-row" key={e.id}>
              <span>
                {markets.find((m) => m.id === e.market_id)?.name} · {weightedScore(e.scores)}/100 ·{" "}
                {e.status}
                <small>Updated {new Date(e.updated_at).toLocaleString()}</small>
              </span>
              <button
                onClick={() => {
                  if (e.market_id === selected && dirty) {
                    if (window.confirm("Reload saved evaluation and discard changes?")) {
                      setScores(e.scores);
                      setNotes(e.notes);
                      setStatus(e.status);
                      setDirty(false);
                    }
                  } else choose(e.market_id);
                }}
              >
                Open saved evaluation
              </button>
            </article>
          ))}
        </section>
      )}
      {page === 3 && (
        <section className="saved-work">
          <h2>Previous demo analyses for {market.name}</h2>
          {!loading && !loadError && !analyses.some((a) => a.market_id === selected) && (
            <p>No saved reports for this market yet.</p>
          )}
          {analyses
            .filter((a) => a.market_id === selected)
            .map((a) => (
              <article key={a.id} className="saved-row">
                <span>
                  {a.report.category} · {a.report.score}/100
                  <small>{new Date(a.created_at).toLocaleString()}</small>
                </span>
                <button
                  onClick={() => {
                    setReport(a.report);
                    setReportMarket(a.market_id);
                    setReportScores(a.scores);
                    setSavedReportId(a.id);
                  }}
                >
                  Read saved analysis
                </button>
              </article>
            ))}
        </section>
      )}
    </section>
  );
}
