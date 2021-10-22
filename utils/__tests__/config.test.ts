import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { HttpsUrlFromString } from "@pagopa/ts-commons/lib/url";
import * as E from "fp-ts/lib/Either";

import { IConfig } from "../config";

const baseEnv = {
  AzureWebJobsStorage: "value-for-AzureWebJobsStorage",
  HTTP_CALL_JOB_QUEUE_NAME: "http_call_job_queue_name",
  QueueStorageConnection: "queuestorageconnection",
  isProduction: false
};

const aWebhook = {
  url: "https://example.com",
  subscriptions: ["an-event"]
};

const anotherWebhook = {
  url: "https://another.com",
  subscriptions: ["an-event"]
};

const aDisabledWebhook = {
  ...aWebhook,
  disabled: true
};

const aWebhookWithAttributes = {
  ...aWebhook,
  attributes: { attr1: "an-attribute" }
};

const toUrl = (url: string) =>
  E.getOrElseW(_ => fail(`Cannot paese url: ${_}`))(
    HttpsUrlFromString.decode(url)
  );

describe("IConfig", () => {
  it.each`
    scenario                                 | input                                                 | expected
    ${"with no webhooks"}                    | ${JSON.stringify([])}                                 | ${[]}
    ${"with single webhook"}                 | ${JSON.stringify([aWebhook])}                         | ${[{ ...aWebhook, attributes: {}, headers: {}, url: toUrl(aWebhook.url), disabled: false }]}
    ${"with single webhook with attributes"} | ${JSON.stringify([aWebhookWithAttributes])}           | ${[{ ...aWebhookWithAttributes, headers: {}, url: toUrl(aWebhook.url), disabled: false }]}
    ${"and filter away disabled webhooks"}   | ${JSON.stringify([aDisabledWebhook, anotherWebhook])} | ${[{ ...anotherWebhook, attributes: {}, headers: {}, url: toUrl(anotherWebhook.url), disabled: false }]}
  `("should decode config $scenario", ({ input, expected }) => {
    const env = {
      ...baseEnv,
      webhooks: input
    };

    const result = IConfig.decode(env);

    if (E.isRight(result)) {
      expect(result.right.webhooks).toEqual(expected);
    } else {
      fail(`Cannot decode env, reason: ${readableReport(result.left)}`);
    }
  });

  it.each`
    scenario          | input
    ${"empty string"} | ${""}
    ${"undefined"}    | ${undefined}
  `(
    "should fail to decode config with webhooks defined as $scenario",
    ({ input }) => {
      const env = {
        ...baseEnv,
        webhooks: input
      };

      const result = IConfig.decode(env);

      if (E.isRight(result)) {
        fail(`Expected decoded to fail`);
      }
    }
  );
});
