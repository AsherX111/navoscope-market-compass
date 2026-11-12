const description =
  "Navoscope student prototype: Domel-related application evidence and user-rated opportunities. Guest scoring and signed-in DeepSeek Q&A, reference files and AI-assisted reports. AI outputs require verification; no active industry partner.";

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
