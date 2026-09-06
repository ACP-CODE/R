import { describe, it, expect } from "vite-plus/test";
import { ok, err, isOk, isErr, unwrapOr, mapOk } from "../../src/core/result";

describe("Result", () => {
    it("distinguishes ok from err", () => {
        expect(isOk(ok(1))).toBe(true);
        expect(isErr(ok(1))).toBe(false);
        expect(isOk(err("boom"))).toBe(false);
        expect(isErr(err("boom"))).toBe(true);
    });

    it("unwrapOr falls back on error", () => {
        expect(unwrapOr(ok(5), 0)).toBe(5);
        expect(unwrapOr(err("x"), 0)).toBe(0);
    });

    it("mapOk transforms only the ok branch", () => {
        expect(mapOk(ok(2), (n) => n * 10)).toEqual(ok(20));
        expect(mapOk(err("x"), (n: number) => n * 10)).toEqual(err("x"));
    });
});
