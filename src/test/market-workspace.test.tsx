import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MarketWorkspace } from "@/components/market/MarketWorkspace";
import { defaultScores, type Analysis, type Evaluation } from "@/lib/market/model";
const mock = vi.hoisted(() => ({
  evaluations: [] as Evaluation[],
  analyses: [] as Analysis[],
  failLoad: false,
  failSave: false,
  navigate: vi.fn(),
}));
vi.mock("@tanstack/react-router", () => ({
  useRouter: () => ({ navigate: mock.navigate }),
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("@/lib/market/storage", () => ({
  loadWorkspace: vi.fn(async (id: string) => {
    if (mock.failLoad) throw new Error("offline");
    return structuredClone({
      evaluations: mock.evaluations.filter((e) => e.user_id === id),
      analyses: mock.analyses.filter((a) => a.user_id === id),
    });
  }),
  saveEvaluation: vi.fn(async (e: Evaluation) => {
    if (mock.failSave) throw new Error("offline");
    mock.evaluations = [...mock.evaluations.filter((v) => v.id !== e.id), structuredClone(e)];
    return structuredClone(e);
  }),
  saveAnalysis: vi.fn(async (a: Analysis) => {
    mock.analyses.push(structuredClone(a));
    return structuredClone(a);
  }),
  storageError: () => "Cloud storage unavailable. Retry.",
}));
beforeEach(() => {
  mock.evaluations = [];
  mock.analyses = [];
  mock.failLoad = false;
  mock.failSave = false;
  mock.navigate.mockClear();
});
afterEach(cleanup);
async function ready() {
  await waitFor(() =>
    expect(screen.queryByText("Loading your saved work…")).not.toBeInTheDocument(),
  );
}
describe("market workspace interactions (mock cloud boundary)", () => {
  it("searches, combines filters, sorts, opens details and navigates to scoring", async () => {
    render(<MarketWorkspace page={1} userId="alice" />);
    await ready();
    fireEvent.change(screen.getByLabelText("Search markets"), { target: { value: "cooling" } });
    fireEvent.change(screen.getByLabelText("Industry"), { target: { value: "Energy" } });
    fireEvent.change(screen.getByLabelText("Minimum growth"), { target: { value: "15" } });
    expect(screen.getByText("1 market found")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Details: Asian/ }));
    expect(screen.getByText("Customer concentration")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Evaluate this market" }));
    expect(mock.navigate).toHaveBeenCalledWith({ to: "/page-2" });
    fireEvent.change(screen.getByLabelText("Search markets"), { target: { value: "unmatched" } });
    expect(screen.getByText(/No markets match/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Search markets"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Industry"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Minimum growth"), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText("Sort markets"), { target: { value: "size" } });
    expect(screen.getAllByRole("heading", { level: 2 })[0]).toHaveTextContent(
      "North American automation",
    );
  });
  it("recalculates, saves, remounts and restores evaluation including status", async () => {
    const view = render(<MarketWorkspace page={2} userId="alice" />);
    await ready();
    fireEvent.change(screen.getByRole("spinbutton", { name: /Demand potential/ }), {
      target: { value: "5" },
    });
    expect(screen.getByText("72 / 100")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Research notes"), {
      target: { value: "Interview customers" },
    });
    fireEvent.change(screen.getByLabelText("Status", { exact: true }), {
      target: { value: "Scored" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save evaluation" }));
    await screen.findByText("Evaluation saved to your account.");
    view.unmount();
    render(<MarketWorkspace page={2} userId="alice" />);
    await ready();
    expect(screen.getByLabelText("Research notes")).toHaveValue("Interview customers");
    expect(screen.getByLabelText("Status", { exact: true })).toHaveValue("Scored");
    expect(screen.getByText("72 / 100")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Filter status"), { target: { value: "Archived" } });
    expect(screen.getByText(/No saved evaluations match/)).toBeInTheDocument();
  });
  it("generates, saves and retrieves an immutable analysis snapshot", async () => {
    const view = render(<MarketWorkspace page={3} userId="alice" />);
    await ready();
    fireEvent.change(screen.getByLabelText("Assumptions and business context"), {
      target: { value: "Pilot with limited budget" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate demo analysis" }));
    expect(screen.getByText("Rule-based demo — no language model called")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save this demo report" }));
    await screen.findByText("Demo analysis saved to your account.");
    view.unmount();
    render(<MarketWorkspace page={3} userId="alice" />);
    await ready();
    fireEvent.click(screen.getByRole("button", { name: "Read saved analysis" }));
    expect(
      within(screen.getByRole("article", { name: "Analysis report" })).getByText(
        "Pilot with limited budget",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Saved report" })).toBeDisabled();
  });
  it("keeps failed saves unsaved and disables saving after load failure", async () => {
    mock.failSave = true;
    const view = render(<MarketWorkspace page={2} userId="alice" />);
    await ready();
    fireEvent.change(screen.getByLabelText("Research notes"), {
      target: { value: "Do not lose me" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save evaluation" }));
    await screen.findByRole("alert");
    expect(screen.getByLabelText("Research notes")).toHaveValue("Do not lose me");
    expect(mock.evaluations).toHaveLength(0);
    view.unmount();
    mock.failLoad = true;
    render(<MarketWorkspace page={2} userId="alice" />);
    await ready();
    expect(screen.getByRole("button", { name: "Save evaluation" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Research notes"), {
      target: { value: "Offline draft" },
    });
    mock.evaluations = [
      {
        id: "server-record",
        user_id: "alice",
        market_id: "eu-heat-pumps",
        scores: defaultScores,
        notes: "Server copy",
        status: "Reviewed",
        updated_at: new Date().toISOString(),
      },
    ];
    mock.failLoad = false;
    fireEvent.click(screen.getByRole("button", { name: "Retry cloud storage" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Save evaluation" })).toBeEnabled(),
    );
    expect(screen.getByLabelText("Research notes")).toHaveValue("Offline draft");
  });
  it("protects archived content and allows an explicit restore", async () => {
    mock.evaluations = [
      {
        id: "e",
        user_id: "alice",
        market_id: "eu-heat-pumps",
        scores: defaultScores,
        notes: "Archived",
        status: "Archived",
        updated_at: new Date().toISOString(),
      },
    ];
    render(<MarketWorkspace page={2} userId="alice" />);
    await ready();
    expect(screen.getByLabelText("Research notes")).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Status", { exact: true }), {
      target: { value: "Researching" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save evaluation" }));
    await screen.findByText("Evaluation saved to your account.");
    expect(screen.getByLabelText("Research notes")).toBeEnabled();
  });
});
