# Public Event Dispatcher

A set of Azure Functions to dispatch IO core domain events to IO-powered project that may need a specific integration. Such projects should expose a webhook url to which this applicative can perform a http request.


This application's responsibilities are:
* to gather all IO core domain events
* to hold a set of webhook from integrated projects, along with their configuration
* to maintain a documented list of Public Events to be dispatched to webhooks, and to internally map IO core domain events with such Public Events

## Events
Incoming events are processed and propagated only when and to whom need to be notified. This application introduces two kind of events:
* `PublicEvent`s are events emitted by **IO** that are interesting for downstream subscribers, thus can be propagated;
* `NonPublicEvent`s are events emitted by **IO** that are NOT interesting for downstream subscriber, thus need to be re-mapped into `PublicEvent`s

![Events flow](/docs/evetns-flow.png)
[edit](https://excalidraw.com/#json=6579291928133632,C1u8ZCFxw3Y0miM1EnXroA)
### Public Events
List of all Public Events emitted to registered webhooks

| Event | Payload | Description | Required attributes
|:---:|:---:|:---:|
|`ping`| `name: the name of the webhook to be pinged` |Just a ping on a registered webhook, used for testing the system. This event is used mainly for testing purposes.| `name`|

### NonPublic Events
List of all Non-Public Events received by the application. These are the events that are accepted by the dispatcher, but will be then re-mapped into public events.

| Event | Payload | Description | Required attributes
|:---:|:---:|:---:|:---:|
|`ping:all`| - |Just a ping on ALL registered webhooks, used for testing the system. This event is used mainly for testing purposes.| - |