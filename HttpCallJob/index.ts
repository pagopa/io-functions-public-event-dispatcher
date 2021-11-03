/**
 * Listener to http-call job queue
 *
 * This handler's job is to perform htto call. By using QueueStorage's native retry mechanism, it enhance resilience as it improves the tollerance to faults
 */

import { AzureFunction } from "@azure/functions";
import { flow, pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { request, Dispatcher } from "undici";

import { readableReport } from "@pagopa/ts-commons/lib/reporters";

import { withJsonInput } from "../utils/misc";
import { HttpCallStruct } from "./types";

const logPrefix = `HttpCallJob`;

const is2xx = (r: Dispatcher.ResponseData): boolean =>
  r.statusCode >= 200 && r.statusCode < 300;

const index: AzureFunction = withJsonInput(
  async (context, input) =>
    pipe(
      input,

      // decode and validate input
      HttpCallStruct.decode,
      E.mapLeft(err => {
        context.log.error(`${logPrefix}|invalid input|${readableReport(err)}`);
        return new Error("invalid input");
      }),
      TE.fromEither,

      // perform http call
      TE.chainW(
        flow(
          ({ url, body, headers }) =>
            TE.tryCatch(
              () =>
                request(url.href, {
                  body: JSON.stringify(body),
                  headers,
                  method: "POST"
                })
                  .then(r => {
                    // if an error occurs in downstream services, we should not retry the job as it may lead to unordered events
                    if (!is2xx(r)) {
                      context.log.warn(
                        `${logPrefix}|unexpected webhook response|code:${r.statusCode}|url:${url.href}`
                      );
                    }
                    return r;
                  })
                  .then(r => r.body),
              E.toError
            ),
          TE.mapLeft(err => {
            context.log.error(
              `${logPrefix}|failed http call|${err.message}|error:${err.message}`
            );
            return err;
          })
        )
      ),
      // if anything went wrong, raise the esception so that the message is re-enqueued
      TE.getOrElseW(err => {
        throw err;
      })
    )(),
  logPrefix
);

export default index;
