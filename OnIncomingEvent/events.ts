import * as t from "io-ts";
import { withDefault } from "@pagopa/ts-commons/lib/types";
import { FiscalCode, NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { ServicesPreferencesMode } from "@pagopa/io-functions-commons/dist/generated/definitions/ServicesPreferencesMode";

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

type ProfileCompleted = t.TypeOf<typeof ProfileCompleted>;
const ProfileCompleted = event(
  "profile:completed" as const,
  t.interface({
    fiscalCode: FiscalCode,
    servicePreferencesMode: ServicesPreferencesMode
  })
);

type ProfileServicePreferencesChanged = t.TypeOf<
  typeof ProfileServicePreferencesChanged
>;
const ProfileServicePreferencesChanged = event(
  "profile:service-preferences-changed" as const,
  t.interface({
    fiscalCode: FiscalCode,
    oldServicePreferencesMode: ServicesPreferencesMode,
    servicePreferencesMode: ServicesPreferencesMode
  })
);

type ServiceSubscribed = t.TypeOf<typeof ServiceSubscribed>;
const ServiceSubscribed = event(
  "service:subscribed" as const,
  t.interface({ fiscalCode: FiscalCode, serviceId: NonEmptyString })
);

type PingAllEvent = t.TypeOf<typeof PingAllEvent>;
const PingAllEvent = event("ping:all" as const);

export type PublicEvent = t.TypeOf<typeof PublicEvent>;
export const PublicEvent = t.union([PingOneEvent, ServiceSubscribed]);

export type NonPublicEvent = t.TypeOf<typeof NonPublicEvent>;
export const NonPublicEvent = t.union([
  PingAllEvent,
  ProfileCompleted,
  ProfileServicePreferencesChanged
]); // this will be a union of all non-public events

export type IncomingEvent = t.TypeOf<typeof IncomingEvent>;
export const IncomingEvent = t.union([PublicEvent, NonPublicEvent]);

// Map every incoming event with the eventual set of required attributes
export const publicEventsRequiredAttributes: Record<
  PublicEvent["name"],
  t.Mixed
> = {
  ping: t.interface({ name: NonEmptyString }),
  "service:subscribed": t.interface({ serviceId: NonEmptyString })
};
