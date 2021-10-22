export const AzureWebJobsStorage = process.env.AzureWebJobsStorage;
export const QueueStorageConnection = process.env.QueueStorageConnection || "";
export const QUEUESTORAGE_APIEVENTS_CONNECTION_STRING =
  process.env.QUEUESTORAGE_APIEVENTS_CONNECTION_STRING || "";
export const QUEUESTORAGE_APIEVENTS_EVENTS_QUEUE_NAME =
  process.env.QUEUESTORAGE_APIEVENTS_EVENTS_QUEUE_NAME || "";
export const HTTP_CALL_JOB_QUEUE_NAME =
  process.env.HTTP_CALL_JOB_QUEUE_NAME || "";

// fake Webhook servers
export const WH1_PORT = Number(process.env.WH1_PORT || 8001);
export const WH2_PORT = Number(process.env.WH2_PORT || 8002);
export const WH3_PORT = Number(process.env.WH3_PORT || 8003);
