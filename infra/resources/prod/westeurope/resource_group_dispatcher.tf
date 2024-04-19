resource "azurerm_resource_group" "pblevtdispatcher_rg" {
  name     = format("%s-pblevtdispatcher-rg", local.project)
  location = local.location

  tags = local.tags
}