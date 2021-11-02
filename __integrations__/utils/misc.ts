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

const getBody = (r: IncomingMessage): Promise<string> =>
  new Promise((resolve, reject) => {
    let body = [];

    r.on("readable", function() {
      const chunk = r.read();
      body.push(chunk);
    });
    r.on("end", function() {
      resolve(body.join(""));
    });

    r.on("error", reject);
  });

type IncomingMessageWithBody = IncomingMessage & {
  body: string;
};

export const spyRequests = (
  servers: ReadonlyArray<Server>,
  ttl = env.WAIT_MS // how many milliseconds before discarding the listener
): ReadonlyArray<jest.Mock<void, [IncomingMessageWithBody]>> =>
  servers.map(server => {
    const spy = jest.fn();
    const listener = async r => {
      const body = await getBody(r);
      spy({ ...r, body });
    };
    server.addListener("request", listener);
    // this is a trick to not add too many listeners to a server
    setTimeout(() => {
      server.removeListener("request", listener);
    }, ttl);
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
