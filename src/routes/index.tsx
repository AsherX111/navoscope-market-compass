import { createFileRoute } from "@tanstack/react-router";

import { navoscopeHead } from "@/lib/navoscope-head";

// The Navoscope shell lives in __root so the video keeps playing across routes.
export const Route = createFileRoute("/")({
  head: () => ({
    ...navoscopeHead(
      "Navoscope Market Compass — Explore, score and review market opportunities",
      "Explore twenty Domel-related sourced application records, compare five weighted ratings and try guest scoring and sign in for DeepSeek Q&A, reference file upload and AI-assisted reports. ENT207TC student prototype; market size and growth are not established. AI outputs require verification; no active industry partnership.",
    ),
    links: [{ rel: "canonical", href: "https://navoscope-market-compass.lovable.app/" }],
  }),
  component: () => null,
});
