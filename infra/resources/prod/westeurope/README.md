<!-- markdownlint-disable -->
<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_azurerm"></a> [azurerm](#requirement\_azurerm) | <= 3.100.0 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_azurerm"></a> [azurerm](#provider\_azurerm) | 3.97.1 |

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_function_pblevtdispatcher_snetout_v4"></a> [function\_pblevtdispatcher\_snetout\_v4](#module\_function\_pblevtdispatcher\_snetout\_v4) | github.com/pagopa/terraform-azurerm-v3//subnet | v8.4.0 |
| <a name="module_function_pblevtdispatcher_v4"></a> [function\_pblevtdispatcher\_v4](#module\_function\_pblevtdispatcher\_v4) | github.com/pagopa/terraform-azurerm-v3//function_app | v8.4.0 |
| <a name="module_storage_account_pblevtdispatcher"></a> [storage\_account\_pblevtdispatcher](#module\_storage\_account\_pblevtdispatcher) | github.com/pagopa/terraform-azurerm-v3//storage_account | v8.4.0 |

## Resources

| Name | Type |
|------|------|
| [azurerm_resource_group.pblevtdispatcher_rg](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/resource_group) | resource |
| [azurerm_storage_queue.storage_account_pblevtdispatcher_http_call_jobs_queue](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/storage_queue) | resource |
| [azurerm_application_insights.application_insights](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/application_insights) | data source |
| [azurerm_cosmosdb_account.cosmos_api](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/cosmosdb_account) | data source |
| [azurerm_key_vault.key_vault](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/key_vault) | data source |
| [azurerm_key_vault_secret.fn_eucovidcert_API_KEY_PUBLICIOEVENTDISPATCHER](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/key_vault_secret) | data source |
| [azurerm_linux_function_app.eucovidcert](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/linux_function_app) | data source |
| [azurerm_storage_account.storage_apievents](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/storage_account) | data source |
| [azurerm_subnet.azdoa_snet](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/subnet) | data source |
| [azurerm_virtual_network.vnet_common](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/virtual_network) | data source |

## Inputs

No inputs.

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_function_app_dispatcher"></a> [function\_app\_dispatcher](#output\_function\_app\_dispatcher) | n/a |
<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
