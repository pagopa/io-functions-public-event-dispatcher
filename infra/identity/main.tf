terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "<= 3.97.1"
    }
  }

  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "tfappprodio"
    container_name       = "terraform-state"
    key                  = "functions-public-event-dispatcher.identity.tfstate"
  }
}

provider "azurerm" {
  features {
  }
}

module "federated_identities" {
  source = "github.com/pagopa/dx//infra/modules/azure_federated_identity_with_github?ref=DEVEX-50-produrre-una-configurazione-terraform-per-le-identity-git-hub-per-autorizzare-le-modifiche-di-infrastruttura-tramite-pipeline"

  prefix    = local.prefix
  env_short = local.env_short
  env       = local.env
  domain    = local.domain

  repositories = [local.repo_name]

  tags = local.tags
}

resource "azurerm_key_vault_access_policy" "ci_kv_policy" {
  key_vault_id = data.azurerm_key_vault.key_vault.id

  tenant_id = data.azurerm_client_config.current.tenant_id
  object_id = module.federated_identities.federated_ci_identity.id

  secret_permissions = ["Get", "List"]
}

resource "azurerm_key_vault_access_policy" "cd_kv_policy" {
  key_vault_id = data.azurerm_key_vault.key_vault.id

  tenant_id = data.azurerm_client_config.current.tenant_id
  object_id = module.federated_identities.federated_cd_identity.id

  secret_permissions = ["Get", "List"]
}
