import * as t from "io-ts";

import * as E from "fp-ts/lib/Either";

import { Context } from "@azure/functions";

import { OnIncomingEventHandler } from "../handler";
import { EnabledWebhookCollection, WebhookConfig } from "../../utils/webhooks";
import { pipe } from "fp-ts/lib/function";
import { Json } from "io-ts-types/lib/JsonFromString";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { HttpsUrlFromString } from "@pagopa/ts-commons/lib/url";
const createContext = () =>
  (({ log: console, bindings: {} } as unknown) as Context);

const webhookA = {
  url: "https://example-a.com/webhook",
  subscriptions: ["ping"],
  attributes: { name: "wa" }
};

const webhookB = {
  url: "https://example-b.com/webhook",
  subscriptions: ["ping"],
  attributes: { name: "wb" }
};

const webhookC = {
  url: "https://example-C.com/webhook",
  subscriptions: ["fake-event"]
};

const webhooks = pipe(
  Json.pipe(t.readonlyArray(WebhookConfig))
    .pipe(EnabledWebhookCollection)
    .decode([webhookA, webhookB, webhookC]),
  E.getOrElseW(err => fail(`Cannot decode: ${readableReport(err)}`))
);

describe("OnIncomingEvent", () => {
  it("should handle a non-public event", async () => {
    const event = { name: "ping:all" };

    const context = createContext();

    const handler = OnIncomingEventHandler(webhooks);

    await handler(context, event);

    expect(context.bindings.remappedEvents).toEqual([
      JSON.stringify({
        name: "ping",
        payload: { name: webhookA.attributes.name }
      }),
      JSON.stringify({
        name: "ping",
        payload: { name: webhookB.attributes.name }
      })
    ]);
    expect(context.bindings.httpCalls).toBe(undefined);
  });

  it("should handle a public event", async () => {
    const event = { name: "ping", payload: { name: webhookA.attributes.name } };

    const context = createContext();

    const handler = OnIncomingEventHandler(webhooks);

    await handler(context, event);

    expect(context.bindings.remappedEvents).toBe(undefined);
    expect(context.bindings.httpCalls).toHaveLength(1);
    expect(JSON.parse(context.bindings.httpCalls[0])).toEqual({
      headers: {},
      body: { name: event.name, payload: {} },
      url: webhookA.url
    });
  });
});
