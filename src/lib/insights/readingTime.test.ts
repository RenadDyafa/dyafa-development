import { describe, it, expect } from "vitest";
import { readingTimeMinutes } from "./readingTime";

describe("readingTimeMinutes", () => {
  it("returns at least 1 minute for short text", () => {
    expect(readingTimeMinutes("A short sentence.")).toBe(1);
  });

  it("scales with word count at ~200 wpm", () => {
    const text = new Array(400).fill("word").join(" ");
    expect(readingTimeMinutes(text)).toBe(2);
  });

  it("handles empty text", () => {
    expect(readingTimeMinutes("")).toBe(1);
  });
});
