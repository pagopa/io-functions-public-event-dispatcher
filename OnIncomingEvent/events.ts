import * as t from "io-ts";
import { withDefault } from "@pagopa/ts-commons/lib/types";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";

const empty = withDefault(t.any, {} as const);

interface IBaseEvent<N extends string, P> {
  readonly name: N;
  readonly payload: P;
}

// helper to define a codec for an event
const event = <N extends string, P>(
  name: N,
  payload: t.Type<P> = empty
): t.Type<IBaseEvent<N, P>> => t.interface({ name: t.literal(name), payload });

type PingOneEvent = t.TypeOf<typeof PingOneEvent>;
const PingOneEvent = event(
  "ping" as const,
  t.interface({ name: NonEmptyString })
);

type PingAllEvent = t.TypeOf<typeof PingAllEvent>;
const PingAllEvent = event("ping:all" as const);

export type PublicEvent = t.TypeOf<typeof PublicEvent>;
export const PublicEvent = PingOneEvent; // this will be a union of all public events

export type NonPublicEvent = t.TypeOf<typeof NonPublicEvent>;
export const NonPublicEvent = PingAllEvent; // this will be a union of all non-public events

export type IncomingEvent = t.TypeOf<typeof IncomingEvent>;
export const IncomingEvent = t.union([PublicEvent, NonPublicEvent]);

// Map every incoming event with the eventual set of required attributes
export const publicEventsRequiredAttributes: Record<
  PublicEvent["name"],
  t.Type<Record<string, unknown>>
> = {
  ping: empty
};
