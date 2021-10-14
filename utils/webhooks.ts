import * as t from "io-ts";
import { identity } from "fp-ts/lib/function";
import { HttpsUrlFromString } from "@pagopa/ts-commons/lib/url";
import { CommaSeparatedListOf } from "@pagopa/ts-commons/lib/comma-separated-list";
import { withDefault } from "@pagopa/ts-commons/lib/types";
import { NonEmptyString } from "io-ts-types";

/**
 * The shape of a configuration for a webhook entry
 */
export type WebhookConfig = t.TypeOf<typeof WebhookConfig>;
export const WebhookConfig = t.interface({
  // attributes for the webhook, as required by events specification
  attributes: withDefault(t.record(t.string, t.string), {}),
  // if true, the webhook will be ignored
  disabled: withDefault(t.boolean, false),
  // optional set of headers to be sent with the http request
  headers: withDefault(t.record(t.string, NonEmptyString), {}),
  // list of events the webhook registers to
  subscriptions: CommaSeparatedListOf(t.string),
  // the url which identifies the webhook
  url: HttpsUrlFromString
});

type EnabledWebhookConfig = t.TypeOf<typeof EnabledWebhookConfig>;
const EnabledWebhookConfig = t.intersection([
  WebhookConfig,
  t.interface({ disabled: t.literal(false) })
]);

/**
 * Filter out disabled webhooks, so that only enabled ones are considered in the application
 */
export type EnabledWebhookCollection = t.TypeOf<
  typeof EnabledWebhookCollection
>;
export const EnabledWebhookCollection = new t.Type<
  ReadonlyArray<EnabledWebhookConfig>,
  ReadonlyArray<WebhookConfig>,
  ReadonlyArray<WebhookConfig>
>(
  t.readonlyArray(EnabledWebhookConfig).name,
  t.readonlyArray(EnabledWebhookConfig).is,
  (input, _) =>
    t
      .readonlyArray(EnabledWebhookConfig)
      .decode(input.filter(w => w.disabled === false)),
  identity
);
