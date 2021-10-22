import { withDefault } from "@pagopa/ts-commons/lib/types";
import {
  HttpsUrlFromString,
  HttpUrlFromString
} from "@pagopa/ts-commons/lib/url";

import * as t from "io-ts";

/**
 * define a http call to be performed
 */
export type HttpCallStruct = t.TypeOf<typeof HttpCallStruct>;
export const HttpCallStruct = t.interface({
  body: withDefault(t.unknown, {}),
  headers: t.record(t.string, t.string),
  url: t.union([HttpUrlFromString, HttpsUrlFromString])
});
