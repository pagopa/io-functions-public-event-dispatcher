module "storage_account_pblevtdispatcher" {
  source = "github.com/pagopa/terraform-azurerm-v3//storage_account?ref=v8.4.0"

  name                = replace(format("%s-stpblevtdispatcher", local.project), "-", "")
  resource_group_name = azurerm_resource_group.pblevtdispatcher_rg.name
  location            = local.location

  account_kind                  = "StorageV2"
  account_tier                  = "Standard"
  account_replication_type      = "GZRS"
  access_tier                   = "Hot"
  advanced_threat_protection    = false
  public_network_access_enabled = true

  tags = local.tags
}

resource "azurerm_storage_queue" "storage_account_pblevtdispatcher_http_call_jobs_queue" {
  name                 = "httpcalljobqueue"
  storage_account_name = module.storage_account_pblevtdispatcher.name
}
