const description = "Navoscope student prototype: Domel-related application evidence and user-rated opportunities. Rule-based demo, no live model or active industry partner.";

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
