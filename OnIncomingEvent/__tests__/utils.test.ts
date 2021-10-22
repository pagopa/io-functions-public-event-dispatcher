import { pipe } from "fp-ts/lib/function";
import { WebhookConfig } from "../../utils/webhooks";
import { hasAttribute, exclude } from "../utils";
import * as E from "fp-ts/lib/Either";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";

describe("hasAttribute", () => {
  it("should return false on webhook with no attributes", () => {
    const aWebook = pipe(
      WebhookConfig.decode({ url: "https://example.com", subscriptions: [] }),
      E.getOrElseW(_ => {
        throw new Error(`Cannot decode value, ${readableReport(_)}`);
      })
    );

    const result = hasAttribute("foo")(aWebook);

    expect(result).toBe(false);
  });

  it("should return false on webhook with different attributes", () => {
    const aWebook = pipe(
      WebhookConfig.decode({
        url: "https://example.com",
        subscriptions: [],
        attributes: { bar: "anyvalue" }
      }),
      E.getOrElseW(_ => {
        throw new Error(`Cannot decode value, ${readableReport(_)}`);
      })
    );

    const result = hasAttribute("foo")(aWebook);

    expect(result).toBe(false);
  });

  it("should return true on webhook with the given attributes", () => {
    const aWebook = pipe(
      WebhookConfig.decode({
        url: "https://example.com",
        subscriptions: [],
        attributes: { foo: "anyvalue", bar: "anyvalue" }
      }),
      E.getOrElseW(_ => {
        throw new Error(`Cannot decode value, ${readableReport(_)}`);
      })
    );

    const result = hasAttribute("foo")(aWebook);

    expect(result).toBe(true);
  });
});

describe("exclude", () => {
  it.each`
    scenario                                 | obj                               | keysToRemove      | expected
    ${"empty objects and no keys to remove"} | ${{}}                             | ${[]}             | ${{}}
    ${"empty objects"}                       | ${{}}                             | ${["foo", "bar"]} | ${{}}
    ${"objects with different keys"}         | ${{ baz: "value" }}               | ${["foo", "bar"]} | ${{ baz: "value" }}
    ${"objects with no keys to remove"}      | ${{ baz: "value" }}               | ${[]}             | ${{ baz: "value" }}
    ${"all keys removed from object"}        | ${{ foo: "value", bar: "value" }} | ${["foo", "bar"]} | ${{}}
    ${"some keys removed from object"}       | ${{ foo: "value", bar: "value" }} | ${["foo", "baz"]} | ${{ bar: "value" }}
  `("should work with $scenario", ({ obj, keysToRemove, expected }) => {
    const result = exclude(obj, keysToRemove);
    expect(result).toEqual(expected);
  });

  it("typoes", () => {
    const obj = { foo: "value", bar: "value" };
    const keysToRemove = ["foo" as const];

    const result = exclude(obj, keysToRemove);

    // @ts-expect-error because foo should be removed
    const _ = result.foo;
    const __ = result.bar;
  });

  it("should map correct types when no keys are removed", () => {
    const obj = { foo: "value", bar: "value" };
    const keysToRemove = ["baz" as const];

    const result = exclude(obj, keysToRemove);

    // no errors, as keys are untouched
    const _ = result.foo;
    const __ = result.bar;
  });

  it("should map correct types when one key is removed", () => {
    const obj = { foo: "value", bar: "value" };
    const keysToRemove = ["foo" as const, "baz" as const];

    const result = exclude(obj, keysToRemove);

    // @ts-expect-error because foo should be removed
    const _ = result.foo;
    const __ = result.bar;
  });
});
