import { createFileRoute } from "@tanstack/react-router";

import { navoscopeHead } from "@/lib/navoscope-head";

// The Navoscope shell lives in __root so the video keeps playing across routes.
export const Route = createFileRoute("/")({
  head: () => navoscopeHead("Navoscope"),
  component: () => null,
});
