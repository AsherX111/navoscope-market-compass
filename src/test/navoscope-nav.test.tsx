import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

async function renderAt(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    context: { queryClient: new QueryClient() },
    defaultPreload: "off",
  });
  await router.load();
  render(<RouterProvider router={router} />);
  return screen.findByRole("navigation", { name: "Primary navigation" });
}

afterEach(cleanup);

describe("top navigation", () => {
  it("offers exactly pages 1, 2 and 3 on the homepage", async () => {
    const nav = await renderAt("/");
    expect(
      [...nav.querySelectorAll<HTMLAnchorElement>("a.nav-pill")].map((a) => a.textContent?.trim()),
    ).toEqual(["1", "2", "3"]);
    expect(nav.textContent).not.toContain("4");
  });

  it("leads with Main Page, then the remaining numbers in ascending order, on page 2", async () => {
    const nav = await renderAt("/page-2");
    expect(
      [...nav.querySelectorAll<HTMLAnchorElement>("a.nav-pill")].map((a) => a.textContent?.trim()),
    ).toEqual(["Main Page", "1", "3"]);
    expect(nav.textContent).not.toContain("4");
  });
});
