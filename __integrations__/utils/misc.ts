import { createServer, Server, IncomingMessage } from "http";
import { once } from "events";
import {
  QueueSendMessageResponse,
  QueueServiceClient
} from "@azure/storage-queue";
import * as env from "../env";

const queueClient = QueueServiceClient.fromConnectionString(
  env.QUEUESTORAGE_APIEVENTS_CONNECTION_STRING
).getQueueClient(env.QUEUESTORAGE_APIEVENTS_EVENTS_QUEUE_NAME);

export const closeAll = (servers: ReadonlyArray<Server>): Promise<void> =>
  Promise.all(
    servers.map(server => new Promise(done => server.close(done)))
  ).then(_ => void 0);

export const startServer = async (port: number): Promise<Server> => {
  const server = createServer((_, response) => {
    response.write(Buffer.from("Hello World!"), "utf8");
    response.end();
  }).listen(port);

  await once(server, "listening");

  return server;
};

export const usingServers = async (
  ports: ReadonlyArray<number>,
  fn: (servers: ReadonlyArray<Server>) => Promise<void>
): Promise<void> => {
  const servers = ports.map(port =>
    createServer((_, response) => {
      response.write(Buffer.from("Hello World!"), "utf8");
      response.end();
    }).listen(port)
  );

  await Promise.all(servers.map(server => once(server, "listening")));

  try {
    await fn(servers);
    await closeAll(servers);
  } catch (error) {
    await closeAll(servers);
    throw error;
  }
};

export const spyRequests = (
  servers: ReadonlyArray<Server>
): ReadonlyArray<jest.Mock<IncomingMessage>> =>
  servers.map(server => {
    const spy = jest.fn();
    server.addListener("request", spy);
    return spy;
  });

export const delay = (ms: number): Promise<void> =>
  new Promise(done => setTimeout(done, ms));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const base64EncodeObject = (_: any): string =>
  Buffer.from(JSON.stringify(_)).toString("base64");

export const enqueueMessage = (
  msg: unknown
): Promise<QueueSendMessageResponse> =>
  queueClient.sendMessage(base64EncodeObject(JSON.stringify(msg)));
