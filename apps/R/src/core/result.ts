/**
 * Minimal Result<T, E> implementation.
 *
 * The repo's CORE rule forbids throwing uncaught exceptions; every fallible
 * operation (spawning R, parsing a file, reading the registry) must return a
 * Result instead. Kept dependency-free so pure logic stays trivially testable.
 */

export type Result<T, E> = Ok<T> | Err<E>;

export interface Ok<T> {
    readonly kind: "ok";
    readonly value: T;
}

export interface Err<E> {
    readonly kind: "err";
    readonly error: E;
}

export function ok<T>(value: T): Ok<T> {
    return { kind: "ok", value };
}

export function err<E>(error: E): Err<E> {
    return { kind: "err", error };
}

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
    return result.kind === "ok";
}

export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
    return result.kind === "err";
}

/** Unwraps a Result, falling back to `fallback` on error instead of throwing. */
export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
    return isOk(result) ? result.value : fallback;
}

export function mapOk<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
    return isOk(result) ? ok(fn(result.value)) : result;
}
