# Public Event Dispatcher

A set of Azure Functions to dispatch IO core domain events to IO-powered project that may need a specific integration. Such projects should expose a webhook url to which this applicative can perform a http request.


This application's responsibilities are:
* to gather all IO core domain events
* to hold a set of webhook from integrated projects, along with their configuration
* to maintain a documented list of Public Events to be dispatched to webhooks, and to internally map IO core domain events with such Public Events

## Public Events
List of all Public Events emitted to registered webhooks

| Event | Payload | Description 
|:---:|:---:|:---:|