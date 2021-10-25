import { QueueServiceClient } from "@azure/storage-queue";

const apiEvents = QueueServiceClient.fromConnectionString(
  process.env.QUEUESTORAGE_APIEVENTS_CONNECTION_STRING
);

const httpJobs = QueueServiceClient.fromConnectionString(
  process.env.QueueStorageConnection
);

await Promise.all([
  [
    apiEvents
      .getQueueClient(process.env.QUEUESTORAGE_APIEVENTS_EVENTS_QUEUE_NAME)
      .createIfNotExists(),
    apiEvents
      .getQueueClient(
        `${process.env.QUEUESTORAGE_APIEVENTS_EVENTS_QUEUE_NAME}-poison`
      )
      .createIfNotExists(),
    httpJobs
      .getQueueClient(process.env.HTTP_CALL_JOB_QUEUE_NAME)
      .createIfNotExists(),
    httpJobs
      .getQueueClient(`${process.env.HTTP_CALL_JOB_QUEUE_NAME}-poison`)
      .createIfNotExists()
  ]
]);
