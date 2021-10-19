/**
 * Listener to http-call job queue
 *
 * This handler's job is to perform htto call. By using QueueStorage's native retry mechanism, it enhance resilience as it improves the tollerance to faults
 */

import * as t from "io-ts";
import { Context } from "@azure/functions";
import { pipe } from "fp-ts/lib/function";

import * as E from "fp-ts/lib/Either";
import * as RA from "fp-ts/lib/ReadonlyArray";

import { readableReport } from "@pagopa/ts-commons/lib/reporters";

import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { EnabledWebhookCollection, WebhookConfig } from "../utils/webhooks";
import { HttpCallStruct } from "../HttpCallJob/types";
import {
  IncomingEvent,
  NonPublicEvent,
  PublicEvent,
  publicEventsRequiredAttributes
} from "./events";

const logPrefix = `OnIncomingEvent`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const exclude = (obj: any, keysToRemove: ReadonlyArray<string>): any =>
  typeof obj === "object"
    ? Object.entries(obj)
        .filter(([k]) => !keysToRemove.includes(k))
        .reduce((p, [k, v]) => ({ ...p, [k]: v }), {})
    : obj;

/**
 * Compose a struct defining a http call to notify a webhook after an incoming event
 *
 * @param incomingEvent the incoming event
 * @param webhook a single enabled webhook definition
 * @returns
 */
const composeWebhookNotification = (
  incomingEvent: IncomingEvent,
  webhook: WebhookConfig
): HttpCallStruct => ({
  body: {
    name: incomingEvent.name,
    payload: exclude(incomingEvent.payload, Object.keys(webhook.attributes))
  },
  headers: webhook.headers,
  url: webhook.url
});

// Map a given PublicEvent into a set of http calls to be perfomed against listening webhooks
const processPublicEvent = (webhooks: EnabledWebhookCollection) => (
  publicEvent: PublicEvent
): ReadonlyArray<t.OutputOf<typeof HttpCallStruct>> =>
  pipe(
    webhooks,
    // consider only webhooks defined to be notified by this event
    RA.filter(webhook => webhook.subscriptions.includes(publicEvent.name)),
    // consider only webhooks that comply with required attributes for the event
    RA.filter(webhook =>
      publicEventsRequiredAttributes[publicEvent.name].is(webhook.attributes)
    ),
    // consider only webhooks which attributes match with the ones in the incoming event
    RA.filter(webhook =>
      Object.entries(publicEvent.payload)
        .map(([k, v]) =>
          k in webhook.attributes ? webhook.attributes[k] === v : true
        )
        .every(Boolean)
    ),
    // compose a http call for each webhook
    RA.map(webhook => composeWebhookNotification(publicEvent, webhook)),

    // append the notification to the http call queue
    RA.map(HttpCallStruct.encode)
  );

const hasAttribute = <A extends string>(attributeName: A) => (
  w: WebhookConfig
): w is WebhookConfig & {
  readonly disabled: false;
  readonly attributes: { readonly name: NonEmptyString };
} =>
  typeof w.attributes[attributeName] === "string" &&
  w.attributes[attributeName].length > 0;

// Map a non-public event into a public event
const remapNonPublicEvent = (webhooks: EnabledWebhookCollection) => (
  publicEvent: NonPublicEvent
): ReadonlyArray<t.OutputOf<typeof PublicEvent>> => {
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (publicEvent.name) {
    // remap a ping to all into a ping for every specific webhook
    case "ping:all":
      return pipe(
        webhooks,
        RA.filter(hasAttribute("name")),
        RA.map(w => ({
          name: "ping" as const,
          payload: { name: w.attributes.name }
        })),
        RA.map(PublicEvent.encode)
      );
    default:
      return [];
  }
};

/**
 * Consume an incoming event and prodices a http call for every webhook to be notified
 *
 * @param webhooks collection of enabled webhooks from configuration
 * @returns void
 */
export const OnIncomingEventHandler = (
  webhooks: EnabledWebhookCollection
) => async (context: Context, input: unknown): Promise<void> => {
  pipe(
    input,
    IncomingEvent.decode,

    E.map(incomingEvent =>
      PublicEvent.is(incomingEvent)
        ? // if the incoming event is a public event, we may proceed to notify webhooks
          pipe(
            processPublicEvent(webhooks)(incomingEvent),
            RA.map(JSON.stringify),
            messages => {
              // eslint-disable-next-line functional/immutable-data
              context.bindings.httpCalls = messages;
            }
          )
        : // otherwise, we must re-map the incoming event into its relative public events to be re-submitted to the queue in order to be processed
          pipe(
            remapNonPublicEvent(webhooks)(incomingEvent),
            RA.map(JSON.stringify),
            messages => {
              // eslint-disable-next-line functional/immutable-data
              context.bindings.remappedEvents = messages;
            }
          )
    ),

    // the handler fails if the incoming message is malformed
    E.getOrElseW(err => {
      context.log.error(
        `${logPrefix}|invalid incoming event|${readableReport(err)}`
      );
      throw new Error(`Cannot handle incoming event: ${readableReport(err)}`);
    })
  );
};
