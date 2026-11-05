const description = "Navoscope — AI-assisted market intelligence designed for Domel.";

export function navoscopeHead(title: string, pageDescription = description) {
  return {
    meta: [
      { title },
      { name: "description", content: pageDescription },
      { property: "og:title", content: title },
      { property: "og:description", content: pageDescription },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
