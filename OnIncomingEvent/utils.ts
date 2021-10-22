import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { WebhookConfig } from "../utils/webhooks";

/**
 * Ensures a Webhook has a given attribute
 *
 * @param attributeName name of the attribute to check
 * @returns whether the Webhook has the attribute
 */
export const hasAttribute = <A extends string>(attributeName: A) => (
  w: WebhookConfig
): w is WebhookConfig & {
  readonly disabled: boolean;
  readonly attributes: { readonly [k in A]: NonEmptyString };
} =>
  typeof w.attributes[attributeName] === "string" &&
  w.attributes[attributeName].length > 0;

/**
 * Removes a set of keys from an object
 *
 * @param obj the original object
 * @param keysToRemove
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const exclude = <T, K extends string>(
  obj: T,
  keysToRemove: ReadonlyArray<K>
): Record<Exclude<keyof T, K>, T[Exclude<keyof T, K>]> =>
  Object.entries(obj)
    .filter(
      ([k]) =>
        !keysToRemove.includes(
          /* force k to be checked against the set of keysToRemove */
          (k as unknown) as K
        )
    )
    .reduce((p, [k, v]) => ({ ...p, [k]: v }), {} as Exclude<T, keyof T & K>);
