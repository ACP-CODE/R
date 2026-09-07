import { describe, it, expect } from "vitest";
import { PROJECT_TIER_OPTIONS } from "../../../src/services/quickpick/projectTierOptions";

describe("PROJECT_TIER_OPTIONS", () => {
    it("has exactly one entry per project tier, in ascending order", () => {
        expect(PROJECT_TIER_OPTIONS.map((o) => o.tier)).toEqual(["L0", "L1", "L2"]);
    });

    it("gives every option a non-empty icon id and an https help link", () => {
        for (const option of PROJECT_TIER_OPTIONS) {
            expect(option.iconId.length).toBeGreaterThan(0);
            expect(option.helpUrl).toMatch(/^https:\/\//);
        }
    });

    it("keeps help links unique per tier (no copy-pasted placeholder URL)", () => {
        const urls = PROJECT_TIER_OPTIONS.map((o) => o.helpUrl);
        expect(new Set(urls).size).toBe(urls.length);
    });
});
