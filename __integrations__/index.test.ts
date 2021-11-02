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

const aFiscalCode = "AAABBB00A00A000B";

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

describe("Event |> service:subscribed", () => {
  it("should notify only wh2 when a subscrition event is emitted", async () => {
    const [spyW1, spyW2, spyW3] = spyRequests(allServers);

    // same value as in webhooks setup for wh2
    const serviceId = "aServiceId12345";

    const msg = {
      name: "service:subscribed",
      payload: { serviceId, fiscalCode: aFiscalCode }
    };
    await enqueueMessage(msg);

    await delay(WAIT_MS);

    expect(spyW2).toHaveBeenCalledTimes(1);
    expect(spyW1).not.toHaveBeenCalled();
    expect(spyW3).not.toHaveBeenCalled();

    const req = spyW2.mock.calls[0][0];

    expect(JSON.parse(req.body)).toEqual({
      name: "service:subscribed",
      payload: { fiscalCode: aFiscalCode }
    });
  });

  it("should notify nobody when a subscrition event is emitted for an unmapped service", async () => {
    const [spyW1, spyW2, spyW3] = spyRequests(allServers);

    const serviceId = "aServiceThatDoesNotExist";

    const msg = {
      name: "service:subscribed",
      payload: { serviceId, fiscalCode: aFiscalCode }
    };
    await enqueueMessage(msg);

    await delay(WAIT_MS);

    expect(spyW1).not.toHaveBeenCalled();
    expect(spyW2).not.toHaveBeenCalled();
    expect(spyW3).not.toHaveBeenCalled();
  });

  describe("Event |> profile:service-preferences-changed", () => {
    it("should notify wh2 and wh3 when a profile changes its preference mode to AUTO", async () => {
      const [spyW1, spyW2, spyW3] = spyRequests(allServers);

      const msg = {
        name: "profile:service-preferences-changed",
        payload: {
          fiscalCode: aFiscalCode,
          servicePreferencesMode: "AUTO",
          oldServicePreferencesMode: "MANUAL"
        }
      };
      await enqueueMessage(msg);

      await delay(WAIT_MS);

      expect(spyW2).toHaveBeenCalledTimes(1);
      expect(spyW3).toHaveBeenCalledTimes(1);
      expect(spyW1).not.toHaveBeenCalled();

      const receivedByWH2 = spyW2.mock.calls[0][0].body;
      const receivedByWH3 = spyW3.mock.calls[0][0].body;

      expect(JSON.parse(receivedByWH2)).toEqual({
        name: "service:subscribed",
        payload: { fiscalCode: aFiscalCode }
      });

      expect(JSON.parse(receivedByWH3)).toEqual({
        name: "service:subscribed",
        payload: { fiscalCode: aFiscalCode }
      });
    });

    it("should notify nobody when a profile changes its preference mode to MANUAL", async () => {
      const [spyW1, spyW2, spyW3] = spyRequests(allServers);

      const msg = {
        name: "profile:service-preferences-changed",
        payload: {
          fiscalCode: aFiscalCode,
          servicePreferencesMode: "MANUAL",
          oldServicePreferencesMode: "AUTO"
        }
      };
      await enqueueMessage(msg);

      await delay(WAIT_MS);

      expect(spyW1).not.toHaveBeenCalled();
      expect(spyW2).not.toHaveBeenCalled();
      expect(spyW3).not.toHaveBeenCalled();
    });
  });

  describe("Event |> profile:completed", () => {
    it("should notify wh2 and wh3 when a profile is completed and its preference mode is AUTO", async () => {
      const [spyW1, spyW2, spyW3] = spyRequests(allServers);

      const msg = {
        name: "profile:completed",
        payload: { fiscalCode: aFiscalCode, servicePreferencesMode: "AUTO" }
      };
      await enqueueMessage(msg);

      await delay(WAIT_MS);

      expect(spyW2).toHaveBeenCalledTimes(1);
      expect(spyW3).toHaveBeenCalledTimes(1);
      expect(spyW1).not.toHaveBeenCalled();

      const receivedByWH2 = spyW2.mock.calls[0][0].body;
      const receivedByWH3 = spyW3.mock.calls[0][0].body;

      expect(JSON.parse(receivedByWH2)).toEqual({
        name: "service:subscribed",
        payload: { fiscalCode: aFiscalCode }
      });

      expect(JSON.parse(receivedByWH3)).toEqual({
        name: "service:subscribed",
        payload: { fiscalCode: aFiscalCode }
      });
    });

    it("should notify nobody when a profile is completed and its preference mode is MANUAL", async () => {
      const [spyW1, spyW2, spyW3] = spyRequests(allServers);

      const msg = {
        name: "profile:completed",
        payload: { fiscalCode: aFiscalCode, servicePreferencesMode: "MANUAL" }
      };
      await enqueueMessage(msg);

      await delay(WAIT_MS);

      expect(spyW1).not.toHaveBeenCalled();
      expect(spyW2).not.toHaveBeenCalled();
      expect(spyW3).not.toHaveBeenCalled();
    });
  });
});
