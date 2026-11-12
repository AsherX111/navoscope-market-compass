import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { GuestScoringExample } from "@/components/GuestScoringExample";

afterEach(cleanup);

describe("isolated guest scoring", () => {
  it("starts at demand 5 and four ratings of 3 for 72/100", () => {
    render(<GuestScoringExample />);
    expect(
      screen.getAllByRole("combobox").map((input) => (input as HTMLSelectElement).value),
    ).toEqual(["5", "3", "3", "3", "3"]);
    expect(screen.getByLabelText("Guest weighted score")).toHaveTextContent("72");
  });

  it.each([
    ["Demand potential", "Demand potential weighted points", "1", "6.0", "48"],
    ["Growth outlook", "Growth outlook weighted points", "5", "20.0", "80"],
    ["Strategic fit", "Strategic fit weighted points", "5", "25.0", "82"],
    ["Delivery feasibility", "Delivery feasibility weighted points", "5", "15.0", "78"],
    ["Risk resilience", "Risk resilience weighted points", "5", "10.0", "76"],
  ])("recomputes %s weighted points and total", (label, points, rating, expectedPoints, total) => {
    render(<GuestScoringExample />);
    fireEvent.change(screen.getByRole("combobox", { name: label }), { target: { value: rating } });
    expect(screen.getByLabelText(points)).toHaveTextContent(expectedPoints);
    expect(screen.getByLabelText("Guest weighted score")).toHaveTextContent(total);
  });

  it("supports 1–5 on all five criteria with concrete 20 and 100 totals", () => {
    render(<GuestScoringExample />);
    for (const rating of ["1", "5"]) {
      for (const control of screen.getAllByRole("combobox")) {
        fireEvent.change(control, { target: { value: rating } });
      }
      expect(screen.getByLabelText("Guest weighted score")).toHaveTextContent(
        rating === "1" ? "20" : "100",
      );
    }
  });

  it("does not carry guest edits into a new example session", () => {
    const { unmount } = render(<GuestScoringExample />);
    fireEvent.change(screen.getByRole("combobox", { name: "Demand potential" }), {
      target: { value: "1" },
    });
    unmount();
    render(<GuestScoringExample />);
    expect(screen.getByLabelText("Guest weighted score")).toHaveTextContent("72");
  });
});
