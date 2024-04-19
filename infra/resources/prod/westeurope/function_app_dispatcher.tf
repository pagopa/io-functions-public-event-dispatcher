module "function_pblevtdispatcher_v4" {
  source = "github.com/pagopa/terraform-azurerm-v3//function_app?ref=v8.4.0"

  resource_group_name = azurerm_resource_group.pblevtdispatcher_rg.name
  name                = format("%s-pblevtdispatcher-fn", local.project)
  location            = local.location
  health_check_path   = "/api/v1/info"

  node_version    = "14"
  runtime_version = "~4"

  always_on                                = "true"
  application_insights_instrumentation_key = data.azurerm_application_insights.application_insights.instrumentation_key

  app_service_plan_info = {
    kind                         = "Linux"
    sku_tier                     = "PremiumV3"
    sku_size                     = "P1v3"
    maximum_elastic_worker_count = 0
    worker_count                 = null
    zone_balancing_enabled       = false
  }

  app_settings = {
    FUNCTIONS_WORKER_RUNTIME       = "node"
    FUNCTIONS_WORKER_PROCESS_COUNT = 4
    NODE_ENV                       = "production"

    // Keepalive fields are all optionals
    FETCH_KEEPALIVE_ENABLED             = "true"
    FETCH_KEEPALIVE_SOCKET_ACTIVE_TTL   = "110000"
    FETCH_KEEPALIVE_MAX_SOCKETS         = "40"
    FETCH_KEEPALIVE_MAX_FREE_SOCKETS    = "10"
    FETCH_KEEPALIVE_FREE_SOCKET_TIMEOUT = "30000"
    FETCH_KEEPALIVE_TIMEOUT             = "60000"

    COSMOS_API_CONNECTION_STRING = format("AccountEndpoint=%s;AccountKey=%s;", data.azurerm_cosmosdb_account.cosmos_api.endpoint, data.azurerm_cosmosdb_account.cosmos_api.primary_key)

    QUEUESTORAGE_APIEVENTS_CONNECTION_STRING = data.azurerm_storage_account.storage_apievents.primary_connection_string
    QUEUESTORAGE_APIEVENTS_EVENTS_QUEUE_NAME = "events"

    # queue storage used by this function app to run async jobs
    QueueStorageConnection = module.storage_account_pblevtdispatcher.primary_connection_string

    HTTP_CALL_JOB_QUEUE_NAME = azurerm_storage_queue.storage_account_pblevtdispatcher_http_call_jobs_queue.name

    webhooks = jsonencode([
      # EUCovidCert PROD
      {
        url           = format("https://%s/api/v1/io-events-webhook", data.azurerm_linux_function_app.eucovidcert.default_hostname),
        headers       = { "X-Functions-Key" = data.azurerm_key_vault_secret.fn_eucovidcert_API_KEY_PUBLICIOEVENTDISPATCHER.value },
        attributes    = { serviceId = "01F73DNTMJTCEZQKJDFNB53KEB" },
        subscriptions = ["service:subscribed"]
      }
    ])

    # Keep listener unactive until the legacy instance isn't dismissed
    "AzureWebJobs.OnIncomingEvent.Disabled" = "1"
  }

  subnet_id                     = module.function_pblevtdispatcher_snetout_v4.id
  ip_restriction_default_action = "Deny"

  allowed_subnets = [
    data.azurerm_subnet.azdoa_snet.id,
  ]

  tags = local.tags
}
