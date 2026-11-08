import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WorkspaceNavigation } from "@/components/Navoscope";
import { PublicIntroduction } from "@/components/PublicIntroduction";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode }) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

afterEach(cleanup);

describe("unified workspace navigation", () => {
  it("does not render workflow tabs on the public homepage", () => {
    render(<WorkspaceNavigation activePage={null} />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it.each([1, 2, 3])("keeps four correctly linked tabs on workspace %s", (page) => {
    render(<WorkspaceNavigation activePage={page} />);
    const nav = screen.getByRole("navigation", { name: "Primary navigation" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "Main Page", "1 · Explore", "2 · Score", "3 · Analyse",
    ]);
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/", "/page-1", "/page-2", "/page-3",
    ]);
    expect(within(nav).getAllByRole("link", { current: "page" })).toEqual([links[page]]);
  });

  it("keeps the existing entry CTA and adds a non-interactive down-scroll hint", () => {
    render(<PublicIntroduction workspaceOpen={false} />);
    expect(screen.getByRole("link", { name: "Try Market Explorer" })).toHaveAttribute("href", "/page-1");
    const hint = screen.getByText("swipe to view more information");
    expect(hint.closest("section")).toHaveClass("public-hero");
    expect(hint.parentElement?.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("hides public content and its scroll hint while the workspace is open", () => {
    render(<PublicIntroduction workspaceOpen />);
    expect(screen.getByText("swipe to view more information")).not.toBeVisible();
  });

  it("restores the original slogan and keeps the Market Compass label", () => {
    render(<PublicIntroduction workspaceOpen={false} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("See clearly. Move forward.");
    expect(within(heading).getByText("Move forward.").tagName).toBe("EM");
    expect(screen.getByText("/ MARKET COMPASS")).toBeInTheDocument();
    expect(screen.getByText("Navoscope", { exact: true })).toHaveClass("public-brand");
    expect(screen.queryByText("Market decisions,")).not.toBeInTheDocument();
  });
});
