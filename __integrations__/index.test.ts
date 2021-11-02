import { Server } from "http";
import {
  delay,
  spyRequests,
  enqueueMessage,
  startServer,
  closeAll
} from "./utils/misc";
import { WH1_PORT, WH2_PORT, WH3_PORT, WAIT_MS } from "./env";

jest.setTimeout(WAIT_MS * 5);

// eslint-disable-next-line functional/no-let
let allServers: ReadonlyArray<Server>;

beforeAll(async () => {
  allServers = await Promise.all(
    // order matters: the order of ports is the order of servers into the collection
    [WH1_PORT, WH2_PORT, WH3_PORT].map(startServer)
  );
});
afterAll(async () => closeAll(allServers));

beforeEach(() => jest.clearAllMocks());

describe("Event |> ping", () => {
  it("should notify wh1 on when ping is for wh1", async () => {
    const [spyW1, spyW2, spyW3] = spyRequests(allServers);

    const msg = {
      name: "ping",
      payload: { name: "wh1" }
    };
    await enqueueMessage(msg);

    await delay(WAIT_MS);

    expect(spyW1).toHaveBeenCalledTimes(1);
    expect(spyW2).not.toHaveBeenCalled();
    expect(spyW3).not.toHaveBeenCalled();
  });

  it.each([5, 10, 100].map(n => ({ n })))(
    "should notify wh1 $n times",
    async ({ n }) => {
      const [spyW1, spyW2, spyW3] = spyRequests(allServers);

      // eslint-disable-next-line functional/no-let
      for (let i = 0; i < n; i++) {
        const msg = {
          name: "ping",
          payload: { name: "wh1" }
        };
        await enqueueMessage(msg);
      }

      await delay(WAIT_MS);

      expect(spyW1).toHaveBeenCalledTimes(n);
      expect(spyW2).not.toHaveBeenCalled();
      expect(spyW3).not.toHaveBeenCalled();
    }
  );

  it("should notify wh2 on when ping is for wh2", async () => {
    const [spyW1, spyW2, spyW3] = spyRequests(allServers);

    const msg = {
      name: "ping",
      payload: { name: "wh2" }
    };
    await enqueueMessage(msg);

    await delay(5000);

    expect(spyW2).toHaveBeenCalledTimes(1);
    expect(spyW1).not.toHaveBeenCalled();
    expect(spyW3).not.toHaveBeenCalled();
  });

  it("should notify both when ping is emitted for both", async () => {
    const [spyW1, spyW2, spyW3] = spyRequests(allServers);

    const msg1 = {
      name: "ping",
      payload: { name: "wh1" }
    };
    const msg2 = {
      name: "ping",
      payload: { name: "wh2" }
    };
    await enqueueMessage(msg1);
    await enqueueMessage(msg2);

    await delay(WAIT_MS);

    expect(spyW2).toHaveBeenCalledTimes(1);
    expect(spyW1).toHaveBeenCalledTimes(1);
    expect(spyW3).not.toHaveBeenCalled();
  });
});

describe("Event |> ping:all", () => {
  it("should notify both when ping:all is emitted", async () => {
    const [spyW1, spyW2, spyW3] = spyRequests(allServers);

    const msg = { name: "ping:all" };
    await enqueueMessage(msg);

    await delay(WAIT_MS);

    expect(spyW2).toHaveBeenCalledTimes(1);
    expect(spyW1).toHaveBeenCalledTimes(1);
    expect(spyW3).not.toHaveBeenCalled();
  });
});
