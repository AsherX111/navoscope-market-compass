import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuestScoringExample } from "@/components/GuestScoringExample";

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
            <strong className="public-brand">Navoscope</strong> <span>/ MARKET COMPASS</span>
          </div>
          <h1 id="public-title">
            See clearly.
            <br /> <em>Move forward.</em>
          </h1>
          <p className="public-solution">
            Navoscope helps market teams explore opportunities and compare weighted scores. Sign in
            to ask DeepSeek questions, upload reference files and generate market reports.
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
          <div className="public-secondary-actions">
            <Button asChild variant="ghost" className="public-secondary-link">
              <a href="#guest-scoring">
                Try the scoring demo as a guest <ArrowDown aria-hidden="true" />
              </a>
            </Button>
            <Button asChild variant="ghost" className="public-secondary-link">
              <a
                href="https://cn.unoanalyzer.com/app/project/G6GaIWlHF8vIWt8mmMREKq6rLby_dsdT89v7dQYLHao"
                target="_blank"
                rel="noopener noreferrer"
              >
                Give feedback <ExternalLink aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </Button>
          </div>
          <p className="public-access-note">
            Explore this page freely. Sign in or create an account to use the workspace.
          </p>
        </div>
        <div className="public-scroll-hint">
          <span>swipe to view more information</span>
          <ArrowDown aria-hidden="true" />
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
                Sign in to ask DeepSeek questions, upload a reference file and generate an
                AI-assisted report using your ratings and assumptions. Review risks, evidence gaps
                and suggested next steps; check AI responses against reliable sources.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <section
        id="guest-scoring"
        tabIndex={-1}
        className="public-section public-example-section"
        aria-labelledby="public-example-title"
      >
        <div className="public-container">
          <div className="public-section-heading">
            <p className="public-label">03 / Illustrative preview · Guest scoring demo</p>
            <h2 id="public-example-title">European heat pumps</h2>
            <p>Your ratings, with the maths in view.</p>
          </div>
          <GuestScoringExample />
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
            data · Signed-in DeepSeek Q&A, reference file upload and AI-assisted report generation.
            Questions, report context and included file text are shared with DeepSeek. AI outputs
            may be inaccurate and require further research and human judgement.
          </p>
        </div>
      </footer>
    </main>
  );
}
