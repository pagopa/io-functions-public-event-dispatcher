/**
 * Listener to incoming events queue
 *
 * Process incoming event to notify proper webhooks
 */

import { AzureFunction } from "@azure/functions";

import { getConfigOrThrow } from "../utils/config";
import { OnIncomingEventHandler } from "./handler";

const config = getConfigOrThrow();

const index: AzureFunction = OnIncomingEventHandler(config.webhooks);

export default index;
