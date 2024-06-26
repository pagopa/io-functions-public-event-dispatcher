module "function_pblevtdispatcher_snetout_v4" {
  source = "github.com/pagopa/terraform-azurerm-v3//subnet?ref=v8.4.0"

  name                 = "fnpblevtdispatcherv4out"
  address_prefixes     = local.cidr_subnet_fnpblevtdispatcherv4
  resource_group_name  = data.azurerm_virtual_network.vnet_common.resource_group_name
  virtual_network_name = data.azurerm_virtual_network.vnet_common.name

  private_endpoint_network_policies_enabled = true
  service_endpoints = [
    "Microsoft.EventHub",
    "Microsoft.Storage",
    "Microsoft.AzureCosmosDB",
    "Microsoft.Web",
  ]

  delegation = {
    name = "default"
    service_delegation = {
      name    = "Microsoft.Web/serverFarms"
      actions = ["Microsoft.Network/virtualNetworks/subnets/action"]
    }
  }
}
