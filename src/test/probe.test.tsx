import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { routeTree } from "@/routeTree.gen";

describe("probe", () => {
  it("inspect", async () => {
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/page-2"] }),
      context: { queryClient: new QueryClient() },
    });
    await router.load();
    console.log("pathname:", router.state.pathname);
    console.log("matches:", router.state.matches.map((m) => m.routeId));
    console.log("methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(router)).slice(0, 40));
    expect(true).toBe(true);
  });
});
