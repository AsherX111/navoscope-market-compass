import { createFileRoute } from "@tanstack/react-router";

import { navoscopeHead } from "@/lib/navoscope-head";

// The Navoscope shell lives in __root so the video keeps playing across routes.
export const Route = createFileRoute("/")({
  head: () => ({
    ...navoscopeHead(
      "Navoscope Market Compass — Explore, score and review market opportunities",
      "Explore six illustrative markets, compare five weighted ratings and review rule-based demo reasoning. An ENT207TC student prototype; sign in to save workspace evaluations.",
    ),
    links: [{ rel: "canonical", href: "https://navoscope-market-compass.lovable.app/" }],
  }),
  component: () => null,
});
