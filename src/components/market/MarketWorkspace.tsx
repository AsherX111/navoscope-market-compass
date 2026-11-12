import { feedbackUrl } from "@/lib/feedback-url";
import { useEffect, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import {
  catalogMarkets,
  metricText,
  type Catalog,
  type SourceEvidence,
  criteria,
  defaultScores,
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
import { askMarketAi, generateAiAnalysis } from "@/lib/market/analysis";
import { loadWorkspace, saveAnalysis, saveEvaluation, storageError } from "@/lib/market/storage";

export function MarketWorkspace({ page, userId }: { page: number; userId: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("");
  const [region, setRegion] = useState("");
  const [minGrowth, setMinGrowth] = useState(0);
  const [catalog, setCatalog] = useState<Catalog>("domel");
  const [sort, setSort] = useState("name");
  const [selected, setSelected] = useState(markets[0]?.id ?? "");
  const [detail, setDetail] = useState<string | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [scores, setScores] = useState<Scores>({ ...defaultScores });
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<WorkStatus>("New");
  const [assumptions, setAssumptions] = useState("");
  const [document, setDocument] = useState<{ name: string; text: string }>();
  const [fileError, setFileError] = useState("");
  const [readingFile, setReadingFile] = useState(false);
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState<{ question: string; answer: string }[]>([]);
  const [asking, setAsking] = useState(false);
  const [chatError, setChatError] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [reportMarket, setReportMarket] = useState("");
  const [reportScores, setReportScores] = useState<Scores>({ ...defaultScores });
  const [savedReportId, setSavedReportId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [revision, setRevision] = useState(0);
  const [savedFilter, setSavedFilter] = useState("");
  const [savedSort, setSavedSort] = useState("updated");
  const [savedQuery, setSavedQuery] = useState("");
  const [dirty, setDirty] = useState(false);
  const market = markets.find((m) => m.id === selected);
  const saved = evaluations.find((e) => e.market_id === selected);
  const archived = saved?.status === "Archived";
  const currentCatalog = catalogMarkets(catalog);
  const industries = [...new Set(currentCatalog.map((entry) => entry.industry))].sort();
  const regions = [...new Set(currentCatalog.map((entry) => entry.region))].sort();
  const visible = searchMarkets({ query, industry, region, minGrowth, sort, catalog });
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
  function clearFilters() {
    setQuery("");
    setIndustry("");
    setRegion("");
    setMinGrowth(0);
  }

  function changeCatalog(nextCatalog: Catalog) {
    setCatalog(nextCatalog);
    const entries = catalogMarkets(nextCatalog);
    if (!entries.some((entry) => entry.industry === industry)) setIndustry("");
    if (!entries.some((entry) => entry.region === region)) setRegion("");
    if (!entries.some((entry) => entry.growth != null)) setMinGrowth(0);
  }

  function choose(id: string) {
    if (id === selected) return true;
    if (dirty && !window.confirm("Discard unsaved evaluation changes?")) return false;
    setDirty(false);
    const target = markets.find((m) => m.id === id);
    if (!target) return false;
    if (target.catalog !== "domel" && catalog === "domel") changeCatalog("legacy");
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
      setMessage("Analysis saved to your account.");
    } catch (e) {
      setError(storageError(e));
    } finally {
      setBusy(false);
    }
  }
  async function generateWithAi() {
    setError("");
    setMessage("");
    setGenerating(true);
    try {
      const result = await generateAiAnalysis({
        data: { marketId: selected, scores, assumptions, document },
      });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setReport(result);
      setReportMarket(selected);
      setReportScores({ ...scores });
      setSavedReportId(null);
    } catch {
      setError("AI analysis could not start. Check your sign-in and assumptions, then try again.");
    } finally {
      setGenerating(false);
    }
  }
  async function readDocument(file: File) {
    setDocument(undefined);
    setConversation([]);
    setFileError("");
    setReadingFile(true);
    try {
      if (!/\.(txt|csv|md|tsv|json)$/i.test(file.name) || file.size > 96000) {
        throw new Error("Choose a TXT, CSV, Markdown, TSV or JSON file under 96 KB.");
      }
      const content = new TextDecoder("utf-8", { fatal: true })
        .decode(await file.arrayBuffer())
        .trim();
      if (!content || content.includes("\0") || content.length > 24000) {
        throw new Error("Choose a non-empty text file with at most 24,000 characters.");
      }
      setDocument({ name: file.name, text: content });
    } catch (error) {
      setFileError(
        error instanceof TypeError
          ? "Save the file as UTF-8 and upload it again."
          : (error as Error).message,
      );
    } finally {
      setReadingFile(false);
    }
  }

  async function askQuestion() {
    const prompt = question.trim();
    if (!prompt || asking || readingFile) return;
    setAsking(true);
    setChatError("");
    try {
      const result = await askMarketAi({
        data: {
          marketId: selected,
          marketIds: page === 1 ? visible.slice(0, 20).map(({ id }) => id) : undefined,
          ratings: page === 2 ? scores : undefined,
          question: prompt,
          assumptions,
          document,
          reportSummary: reportMarket === selected ? report?.summary.slice(0, 2000) : undefined,
          history: conversation
            .slice(-4)
            .map((turn) => ({ ...turn, answer: turn.answer.slice(0, 6000) })),
        },
      });
      if ("error" in result) {
        setChatError(result.error);
        return;
      }
      setConversation((turns) => [...turns, { question: prompt, answer: result.answer }]);
      setQuestion("");
    } catch {
      setChatError("Could not contact DeepSeek. Check your sign-in and try again.");
    } finally {
      setAsking(false);
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
  if (!market) return <p role="alert">Selected application is unavailable.</p>;
  const pickerMarkets = catalogMarkets(catalog);
  const options = pickerMarkets.some((m) => m.id === selected)
    ? pickerMarkets
    : [market, ...pickerMarkets];
  const referenceFileInput = (
    <>
      <label>
        Reference file (optional)
        <input
          type="file"
          accept=".txt,.csv,.md,.tsv,.json"
          disabled={readingFile || asking || generating}
          onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            e.currentTarget.value = "";
            if (file) void readDocument(file);
          }}
        />
      </label>
      <p>
        UTF-8 TXT, CSV, Markdown, TSV or JSON, up to 24,000 characters. Upload only material you can
        share with DeepSeek.
      </p>
      {readingFile && <p role="status">Reading file…</p>}
      {fileError && <p role="alert">{fileError}</p>}
      {document && (
        <p>
          {document.name}{" "}
          <button
            type="button"
            disabled={asking || generating}
            onClick={() => {
              setDocument(undefined);
              setConversation([]);
            }}
          >
            Remove file
          </button>
        </p>
      )}
    </>
  );
  const aiAssistant = (
    <section className="market-assistant" aria-label="Ask DeepSeek">
      <p className="eyebrow">DEEPSEEK</p>
      <h3>
        {page === 1
          ? "Explore these markets"
          : page === 2
            ? "Understand this score"
            : "Discuss this analysis"}
      </h3>
      <p>
        {page === 1
          ? "Compare markets in the current results or ask what to research next."
          : page === 2
            ? "Ask why your ratings produced this score or which changes would matter most."
            : "Ask about the selected market, uploaded file, or report. Follow-up questions are welcome."}
        {" Your question and relevant context are sent to DeepSeek."}
      </p>
      {page !== 3 && referenceFileInput}
      {conversation.length > 0 && (
        <div className="market-assistant-thread" aria-live="polite">
          {conversation.map((turn, index) => (
            <div key={index}>
              <p>
                <strong>{turn.question}</strong>
              </p>
              <p style={{ whiteSpace: "pre-wrap" }}>{turn.answer}</p>
            </div>
          ))}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void askQuestion();
        }}
      >
        <label>
          Your question
          <textarea
            required
            maxLength={2000}
            disabled={asking}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={
              page === 1
                ? "Which markets in these results should I research first?"
                : page === 2
                  ? "Which ratings have the biggest effect on this score?"
                  : "What does this file say about demand?"
            }
          />
        </label>
        <button type="submit" disabled={asking || readingFile || !question.trim()}>
          {asking ? "Asking…" : "Ask DeepSeek"}
        </button>
      </form>
      {chatError && <p role="alert">{chatError}</p>}
    </section>
  );
  return (
    <section className="market-workspace" aria-label={title}>
      <div className="workspace-heading">
        <p className="eyebrow">NAVOSCOPE / MARKET COMPASS</p>
        <h1>{title}</h1>
        <p>
          Manufacturer statements establish application relevance only, not market size, growth or
          demand. Ratings are user judgements. Legacy data is illustrative.
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
      <label className="market-picker">
        Catalog / evidence
        <select value={catalog} onChange={(e) => changeCatalog(e.target.value as Catalog)}>
          <option value="domel">Domel · Manufacturer-sourced applications (20)</option>
          <option value="legacy">Legacy · Illustrative teaching catalog (6)</option>
          <option value="all">All evidence types (26)</option>
        </select>
      </label>
      {page === 1 ? (
        <>
          <div className="workspace-filters">
            <label>
              Search markets
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Application, industry, publisher or source"
              />
            </label>
            <label>
              Industry
              <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
                <option value="">All industries</option>
                {industries.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Region
              <select value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="">All regions</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Minimum growth
              <select
                disabled={!currentCatalog.some((entry) => entry.growth != null)}
                value={minGrowth}
                onChange={(e) => setMinGrowth(Number(e.target.value))}
              >
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
          <p>
            Pick a market, open its details to review the evidence, then choose “Evaluate this
            market.”
          </p>
          <p>
            <a href={feedbackUrl} target="_blank" rel="noopener noreferrer">
              Leave a written suggestion on UnoAnalyzer
            </a>
          </p>
          <p role="status">
            {visible.length} market{visible.length === 1 ? "" : "s"} found
          </p>
          {visible.length === 0 && (
            <div>
              <p>No markets match these filters in the selected catalog.</p>
              <button type="button" onClick={clearFilters}>
                Clear search and filters
              </button>
            </div>
          )}
          <div className="market-explore-layout">
            <div className="market-grid">
              {visible.map((m) => (
                <article key={m.id} className="market-card">
                  <p className="eyebrow">
                    {m.industry} / {m.region}
                  </p>
                  <h2>{m.name}</h2>
                  <p>{m.summary}</p>
                  <p>
                    Size: {metricText(m.size, "size")} · Growth: {metricText(m.growth, "growth")}
                  </p>
                  {m.sources?.map((source) => (
                    <p key={source.url}>
                      {source.publisher}:{" "}
                      <a href={source.url} target="_blank" rel="noopener noreferrer">
                        {source.title}
                      </a>
                    </p>
                  ))}
                  <button
                    onClick={() => setDetail(detail === m.id ? null : m.id)}
                    aria-expanded={detail === m.id}
                  >
                    Details: {m.name}
                  </button>
                  {detail === m.id && (
                    <div>
                      <h3>
                        {m.sources?.length
                          ? "Source-grounded applicability"
                          : "Legacy illustrative drivers"}
                      </h3>
                      {m.sources?.length ? <p>{m.summary}</p> : null}
                      <ul>
                        {m.drivers.map((d) => (
                          <li key={d}>{d}</li>
                        ))}
                      </ul>
                      <h3>
                        {m.sources?.length
                          ? "Questions to validate · analyst-authored"
                          : "Legacy illustrative risks"}
                      </h3>
                      <ul>
                        {(m.questions ?? m.risks).map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                      <h3>Evidence limitations</h3>
                      <p>{m.evidence}</p>
                      <Sources sources={m.sources} />
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
            <aside className="market-card market-explore-assistant">{aiAssistant}</aside>
          </div>
        </>
      ) : (
        <>
          <label className="market-picker">
            Selected market
            <select value={selected} disabled={busy} onChange={(e) => choose(e.target.value)}>
              {options.map((m) => (
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
                <p>
                  The score combines your ratings using the weights below. Record the evidence and
                  assumptions behind those ratings in Research notes, then open Analysis to review
                  the evidence gaps and next steps.
                </p>
                <details>
                  <summary>Evidence and limitations for this market</summary>
                  <p>{market.evidence}</p>
                  <Sources sources={market.sources} />
                </details>
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
                {aiAssistant}
              </section>
            </div>
          ) : (
            <div className="workspace-columns">
              <section className="market-card">
                <h2>Generate a market report</h2>
                <p>
                  Generate an AI-assisted report using the selected market and current ratings (
                  {total}/100). Reports and questions send the provided context and file text to
                  DeepSeek.
                </p>
                <Link to="/page-2">Edit scoring inputs</Link>
                {referenceFileInput}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!generating && !busy && !readingFile) void generateWithAi();
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
                  <button type="submit" disabled={generating || busy || readingFile}>
                    {generating ? "Generating…" : "Generate AI analysis"}
                  </button>
                </form>
                <p>Current recommendation: {advice.category}</p>
              </section>
              <div className="market-analysis-results">
                {report && (
                  <article className="market-card" aria-label="Analysis report">
                    <p className="eyebrow">{report.mode}</p>
                    <h2>{markets.find((m) => m.id === reportMarket)?.name}</h2>
                    <p>
                      <strong>
                        {report.category} · {report.score}/100
                      </strong>
                    </p>
                    {report.format === "freeform" ? (
                      <>
                        <p className="preserve-lines">{report.summary}</p>
                        <Sources sources={report.sources} />
                      </>
                    ) : (
                      <>
                        <h3>Opportunity summary</h3>
                        <p>{report.summary}</p>
                        <p>{report.applicability}</p>
                        <Sources sources={report.sources} />
                        <h3>Source context & user-rated attractiveness</h3>
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
                        {report.questions?.length ? (
                          <>
                            <h3>Questions to validate · analyst-authored</h3>
                            <ul>
                              {report.questions.map((q) => (
                                <li key={q}>{q}</li>
                              ))}
                            </ul>
                          </>
                        ) : null}
                        <h3>Assumptions used</h3>
                        <p className="preserve-lines">{report.assumptions}</p>
                        <h3>Recommendations</h3>
                        <ul>
                          {report.actions.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    <button
                      disabled={busy || loading || !!loadError || !!savedReportId}
                      onClick={() => void persistReport()}
                    >
                      {savedReportId ? "Saved report" : busy ? "Saving…" : "Save this report"}
                    </button>
                  </article>
                )}
                <div className="market-card">{aiAssistant}</div>
              </div>
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
          <h2>Previous analyses for {market.name}</h2>
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
                <Sources sources={a.report.sources} />
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

function Sources({ sources }: { sources: SourceEvidence[] | undefined }) {
  if (!sources?.length) return null;
  return (
    <div className="evidence-sources">
      <h3>Source snapshot</h3>
      {sources.map((source) => (
        <p key={source.url}>
          <a href={source.url} target="_blank" rel="noopener noreferrer">
            {source.title}
          </a>
          <br />
          {source.publisher} · {source.sourceType} · Published:{" "}
          {source.publicationDate ?? "Undated"} · Accessed: {source.accessedDate}
          {source.eventDates ? (
            <>
              <br />
              Event: {source.eventDates}
            </>
          ) : null}
          <br />
          {source.limitations}
        </p>
      ))}
    </div>
  );
}
