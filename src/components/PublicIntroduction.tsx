import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { criteria, defaultScores, weightedScore } from "@/lib/market/model";

const exampleScores = { ...defaultScores, demand: 5 };

/** Public homepage content stays inside the persistent Navoscope shell. */
export function PublicIntroduction({ workspaceOpen }: { workspaceOpen: boolean }) {
  return (
    <main
      className="public-introduction"
      hidden={workspaceOpen}
      inert={workspaceOpen}
      aria-hidden={workspaceOpen}
    >
      <section className="public-hero" aria-labelledby="public-title">
        <div className="public-container">
          <div className="public-wordmark">
            Navoscope <span>/ MARKET COMPASS</span>
          </div>
          <h1 id="public-title">
            Market decisions,
            <br />
            made clearer.
          </h1>
          <p className="public-solution">
            Navoscope helps market teams explore opportunities, compare weighted scores and review
            the reasoning in one place.
          </p>
          <p className="public-problem">
            Turn scattered information and assumptions into a structured starting point for your
            next market decision.
          </p>
          <Button asChild variant="ghost" className="public-cta">
            <Link to="/page-1">
              Try Market Explorer <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <p className="public-access-note">
            Explore this page freely. Sign in or create an account to use the workspace.
          </p>
        </div>
      </section>

      <section className="public-section public-pain" aria-labelledby="public-pain-title">
        <div className="public-container public-editorial">
          <p className="public-label">01 / A clearer starting point</p>
          <div>
            <h2 id="public-pain-title">
              Less scattered.
              <br />
              More structured.
            </h2>
            <p>
              Reports in one folder. Spreadsheets in another. Different criteria in every
              conversation. For analysts, product managers and business development teams, comparing
              opportunities can mean piecing together information before the decision even begins.
            </p>
            <p>
              Bring the opportunity, your ratings and the assumptions behind them into one shared
              structure for comparison.
            </p>
          </div>
        </div>
      </section>

      <section className="public-section" aria-labelledby="public-steps-title">
        <div className="public-container">
          <div className="public-section-heading">
            <p className="public-label">02 / From opportunity to reasoning</p>
            <h2 id="public-steps-title">Three steps. One place.</h2>
          </div>
          <ol className="public-steps">
            <li>
              <span className="public-step-number" aria-hidden="true">
                01
              </span>
              <h3>Explore a market</h3>
              <p>
                Start with twenty Domel-related sourced application records. Search applications,
                industries and sources. Six illustrative opportunities remain in the legacy catalog;
                market size and growth are not established for the sourced records.
              </p>
            </li>
            <li>
              <span className="public-step-number" aria-hidden="true">
                02
              </span>
              <h3>Score what matters</h3>
              <p>
                Compare five weighted ratings with a transparent total. Sign in to save your
                evaluation.
              </p>
            </li>
            <li>
              <span className="public-step-number" aria-hidden="true">
                03
              </span>
              <h3>Review the reasoning</h3>
              <p>
                Record your assumptions and review a structured demo report: risks, evidence gaps
                and a suggested next step.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <section
        className="public-section public-example-section"
        aria-labelledby="public-example-title"
      >
        <div className="public-container">
          <div className="public-section-heading">
            <p className="public-label">03 / Illustrative preview · Static example</p>
            <h2 id="public-example-title">European heat pumps</h2>
            <p>Your ratings, with the maths in view.</p>
          </div>
          <div
            className="public-score-preview"
            role="group"
            aria-label="Static illustrative weighted score example"
          >
            <div className="public-score-total">
              <span className="public-label">Weighted score</span>
              <p>
                <strong>{weightedScore(exampleScores)}</strong>
                <span>/100</span>
              </p>
              <span>Illustrative evaluation</span>
            </div>
            <div className="public-score-detail">
              <table>
                <caption className="sr-only">Five ratings and their weighted points</caption>
                <thead>
                  <tr>
                    <th scope="col">Criterion</th>
                    <th scope="col">Rating</th>
                    <th scope="col">Weight</th>
                    <th scope="col">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {criteria.map(({ key, label, weight }) => (
                    <tr key={key}>
                      <th scope="row">{label}</th>
                      <td>{exampleScores[key]}/5</td>
                      <td>{Math.round(weight * 100)}%</td>
                      <td>{Math.round((exampleScores[key] / 5) * weight * 100)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="public-calculation">
                Demand: 5/5 × 30% = <strong>30 pts</strong>
                <br />
                Other four ratings: 3/5 × combined 70% = <strong>42 pts</strong>
                <br />
                <strong>Total: 72/100</strong>
              </p>
            </div>
          </div>
          <p className="public-example-note">
            Static illustrative example only. Ratings are assumed, not verified market research or a
            forecast.
          </p>
        </div>
      </section>

      <section className="public-section public-team" aria-labelledby="public-team-title">
        <div className="public-container public-editorial">
          <p className="public-label">04 / The team</p>
          <div>
            <h2 id="public-team-title">
              A student project.
              <br />
              An open invitation.
            </h2>
            <p>
              We are an XJTLU student team building Navoscope for ENT207TC Digital Startup Lab. Our
              project explores how manufacturing businesses such as Domel can compare core and
              emerging market opportunities.
            </p>
            <p>
              No active industry partner is on record. This student project does not imply Domel
              endorsement or a confirmed commercial partnership.
            </p>
            <p className="public-invitation">
              We invite early users to try Navoscope and share feedback with our team.
            </p>
          </div>
        </div>
      </section>
      <footer className="public-footer">
        <div className="public-container">
          <span className="public-footer-brand">Navoscope / MARKET COMPASS</span>
          <p>
            Student prototype · Manufacturer-sourced application relevance · Legacy illustrative
            data · Rule-based analysis demonstration. No live language model is called; outputs
            require further research and human judgement.
          </p>
        </div>
      </footer>
    </main>
  );
}
