import { describe, it, expect } from "vitest";
import { organizationJsonLd, breadcrumbJsonLd, faqJsonLd, buildMetadata } from "./metadata";

describe("organizationJsonLd", () => {
  it("carries the legal name separately from the public brand name", () => {
    const data = organizationJsonLd();
    expect(data.name).toBe("Dyafa Development");
    expect(data.legalName).toBe("Dyafa Real Estate Development & Investment");
  });
});

describe("breadcrumbJsonLd", () => {
  it("builds a positioned ListItem array", () => {
    const data = breadcrumbJsonLd([
      { name: "Home", url: "https://example.com/en" },
      { name: "About", url: "https://example.com/en/about" },
    ]);
    expect(data.itemListElement).toHaveLength(2);
    expect(data.itemListElement[0]!.position).toBe(1);
    expect(data.itemListElement[1]!.position).toBe(2);
  });
});

describe("faqJsonLd", () => {
  it("maps question/answer pairs to schema.org Question/Answer", () => {
    const data = faqJsonLd([{ q: "Is modular cheap?", a: "No, it is disciplined." }]);
    expect(data.mainEntity[0]!.name).toBe("Is modular cheap?");
    expect(data.mainEntity[0]!.acceptedAnswer.text).toBe("No, it is disciplined.");
  });
});

describe("buildMetadata", () => {
  it("produces hreflang alternates for en/ar/x-default", () => {
    const meta = buildMetadata({ locale: "en", path: "/about", title: "About", description: "desc" });
    expect(meta.alternates?.languages).toMatchObject({
      en: "/en/about",
      ar: "/ar/about",
      "x-default": "/en/about",
    });
  });

  it("sets noindex robots when requested", () => {
    const meta = buildMetadata({ locale: "en", path: "/draft", title: "Draft", description: "desc", noIndex: true });
    expect(meta.robots).toMatchObject({ index: false, follow: false });
  });
});
