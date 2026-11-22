import { describe, expect, it } from "vitest";

import { randomToken } from "./tokens";

describe("randomToken", () => {
  it("istenen uzunlukta token üretir", () => {
    expect(randomToken()).toHaveLength(16);
    expect(randomToken(32)).toHaveLength(32);
  });

  it("yalnızca izin verilen karakterleri kullanır", () => {
    expect(randomToken(1000)).toMatch(/^[2-9a-km-np-z]+$/);
  });

  it("çakışma üretmez", () => {
    const tokens = new Set(Array.from({ length: 10_000 }, () => randomToken()));
    expect(tokens.size).toBe(10_000);
  });
});
