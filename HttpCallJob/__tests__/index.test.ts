import * as E from "fp-ts/lib/Either";

import { Context } from "@azure/functions";
import { createServer, Server, IncomingMessage, ServerResponse } from "http";
import { once } from "events";

import HttpCallJob from "../index";
import { HttpCallStruct } from "../types";

const mockContext = ({ log: console } as unknown) as Context;

const delay = (ms: number) => new Promise(done => setTimeout(done, ms));

// utility: collect a body string from a request
const getBody = async (req: IncomingMessage): Promise<string> => {
  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  return Buffer.concat(buffers).toString();
};

const aServerThasAlwaysSucceed = (
  _: IncomingMessage,
  response: ServerResponse
) => response.end();

const aServerThasAlwaysFail = (
  _: IncomingMessage,
  response: ServerResponse
) => {
  //console.log("--->", _);
  response.statusCode = 500;
  response.end();
};

// utility: wrap an execution with a context where a server is instantiated, handling rejections and server close
const usingServer = async (
  serverFactory: (req: IncomingMessage, res: ServerResponse) => void,
  fn: (server: Server) => Promise<unknown>
) => {
  const server = createServer(serverFactory).listen();
  await once(server, "listening");
  try {
    await fn(server);
    server.close();
  } catch (error) {
    server.close();
    throw error;
  }
};

describe("HttpCallJob", () => {
  // give time to servers to shutwdown after tests complete
  afterAll(async () => delay(3000));

  it("should perform http call", () =>
    usingServer(aServerThasAlwaysSucceed, async server => {
      const path = "/custom-path";
      const body = { foo: 123 };
      const headers = { "my-header": "my-header-value" };

      // setup http call job message
      const httpCall = E.getOrElseW(_ => fail("Failed to decode input"))(
        HttpCallStruct.decode({
          // @ts-ignore because address() could be a string, but it's never
          url: `http://localhost:${server.address().port}${path}`,
          headers,
          body
        })
      );

      // spy on server incoming requests and produce an easy-to-read struct with spied data
      const spiedRequest = jest.fn();
      server.on("request", async req => {
        const body = await getBody(req);
        spiedRequest({
          url: req.url,
          headers: req.headers,
          body
        });
      });

      // run the job (expecting http call to be performed correctly)
      await HttpCallJob(mockContext, httpCall);

      // checks
      expect(spiedRequest).toBeCalledTimes(1);
      const {
        body: receivedBody,
        url: receivedUrl,
        headers: receivedHeaders
      } = spiedRequest.mock.calls[0][0];
      expect(receivedUrl).toBe(path);
      expect(receivedBody).toEqual(JSON.stringify(body));
      expect(receivedHeaders).toEqual(expect.objectContaining(headers));
    }));

  it("should raise exception on wrong input", () =>
    usingServer(aServerThasAlwaysSucceed, async server => {
      const wrong = { wrong: "input" };

      const spiedRequest = jest.fn();
      server.on("request", spiedRequest);

      const result = HttpCallJob(mockContext, wrong);

      expect(result).rejects.toEqual(expect.any(Error));
      expect(spiedRequest).not.toBeCalled();
    }));

  it("should accept on server error", () =>
    usingServer(aServerThasAlwaysFail, async server => {
      const path = "/custom-path";
      const body = { foo: 123 };
      const headers = { "my-header": "my-header-value" };

      // setup http call job message
      const httpCall = E.getOrElseW(_ => fail("Failed to decode input"))(
        HttpCallStruct.decode({
          // @ts-ignore because address() could be a string, but it's never
          url: `http://localhost:${server.address().port}${path}`,
          headers,
          body
        })
      );

      const spiedRequest = jest.fn();
      server.on("request", spiedRequest);

      await HttpCallJob(mockContext, httpCall);
      expect(spiedRequest).toBeCalledTimes(1);
    }));

  it("should use keep-alive", () =>
    usingServer(aServerThasAlwaysSucceed, async server => {
      const path = "/custom-path";
      const body = { foo: 123 };
      const headers = { "my-header": "my-header-value" };

      // setup http call job message
      const httpCall = E.getOrElseW(_ => fail("Failed to decode input"))(
        HttpCallStruct.decode({
          // @ts-ignore because address() could be a string, but it's never
          url: `http://localhost:${server.address().port}${path}`,
          headers,
          body
        })
      );

      // spy on server incoming requests and produce an easy-to-read struct with spied data
      const spiedRequest = jest.fn();
      server.on("request", async req => {
        const body = await getBody(req);
        spiedRequest({
          url: req.url,
          headers: req.headers,
          body
        });
      });

      // run the job (expecting http call to be performed correctly)
      await HttpCallJob(mockContext, httpCall);

      // checks
      expect(spiedRequest).toBeCalledTimes(1);
      const { headers: receivedHeaders } = spiedRequest.mock.calls[0][0];
      expect(receivedHeaders).toEqual(
        expect.objectContaining({ connection: "keep-alive" })
      );
    }));
});
