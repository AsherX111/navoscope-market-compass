import { useState } from "react";
import { criteria, defaultScores, weightedScore, type Scores } from "@/lib/market/model";

/** Guest ratings are isolated from authenticated evaluations and never persisted. */
export function GuestScoringExample() {
  const [scores, setScores] = useState<Scores>({ ...defaultScores, demand: 5 });
  const total = weightedScore(scores);

  return (
    <>
      <div className="public-score-preview" role="group" aria-label="Guest scoring example">
        <div className="public-score-total">
          <span className="public-label">Weighted score</span>
          <p>
            <strong>
              <output aria-label="Guest weighted score" aria-live="polite">
                {total}
              </output>
            </strong>
            <span>/100</span>
          </p>
          <span>Illustrative evaluation · Not saved</span>
        </div>
        <div className="public-score-detail">
          <table>
            <caption className="sr-only">
              Five illustrative ratings, weights and weighted points
            </caption>
            <thead>
              <tr>
                <th scope="col">Criterion</th>
                <th scope="col">Rating /5</th>
                <th scope="col">Weight</th>
                <th scope="col">Points</th>
              </tr>
            </thead>
            <tbody>
              {criteria.map(({ key, label, weight, help }) => (
                <tr key={key}>
                  <th scope="row">
                    <label htmlFor={`guest-${key}`}>{label}</label>
                    <span id={`guest-${key}-help`} className="public-criterion-help">
                      {help}
                    </span>
                  </th>
                  <td>
                    <select
                      id={`guest-${key}`}
                      aria-describedby={`guest-${key}-help`}
                      value={scores[key]}
                      onChange={(event) => {
                        const rating = Number(event.target.value);
                        if (Number.isInteger(rating) && rating >= 1 && rating <= 5) {
                          setScores((previous) => ({ ...previous, [key]: rating }));
                        }
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <option key={rating} value={rating}>
                          {rating}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{Math.round(weight * 100)}%</td>
                  <td>
                    <output aria-label={`${label} weighted points`}>
                      {((scores[key] / 5) * weight * 100).toFixed(1)}
                    </output>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="public-calculation">
            Each rating ÷ 5 × its weight × 100 = weighted points.
            <br />
            <strong>Total: {total}/100</strong>
          </p>
        </div>
      </div>
      <p className="public-example-note">
        Guest-only scoring example. Rate each criterion from 1 (weak) to 5 (strong). These example
        ratings are illustrative, not verified market research or a forecast. Changes are not saved
        and do not affect your workspace evaluations.
      </p>
    </>
  );
}
