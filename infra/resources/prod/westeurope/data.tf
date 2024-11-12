data "azurerm_virtual_network" "vnet_common" {
  name                = "${local.project}-vnet-common"
  resource_group_name = local.resource_group_common
}

data "azurerm_subnet" "azdoa_snet" {
  name                 = "azure-devops"
  virtual_network_name = data.azurerm_virtual_network.vnet_common.name
  resource_group_name  = data.azurerm_virtual_network.vnet_common.resource_group_name
}

data "azurerm_application_insights" "application_insights" {
  name                = format("%s-ai-common", local.project)
  resource_group_name = local.resource_group_common
}

data "azurerm_cosmosdb_account" "cosmos_api" {
  name                = format("%s-cosmos-api", local.project)
  resource_group_name = local.resource_group_internal
}

data "azurerm_storage_account" "storage_apievents" {
  name                = replace(format("%s-stapievents", local.project), "-", "")
  resource_group_name = local.resource_group_internal
}

data "azurerm_linux_function_app" "eucovidcert" {
  resource_group_name = "${local.project}-rg-eucovidcert"
  name                = format("%s-eucovidcert-fn", local.project)
}

data "azurerm_key_vault" "key_vault" {
  name                = format("%s-kv", local.project)
  resource_group_name = format("%s-sec-rg", local.project)
}

data "azurerm_key_vault_secret" "fn_eucovidcert_API_KEY_PUBLICIOEVENTDISPATCHER" {
  name         = "funceucovidcert-KEY-PUBLICIOEVENTDISPATCHER"
  key_vault_id = data.azurerm_key_vault.key_vault.id
}
