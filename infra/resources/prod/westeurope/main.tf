terraform {

  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "tfinfprodio"
    container_name       = "terraform-state"
    key                  = "io-functions-public-event-dispatcher.function_dispatcher.tfstate"
  }

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "<= 3.100.0"
    }
  }
}

provider "azurerm" {
  features {}
}

module "common_values" {
  source = "github.com/pagopa/io-infra//src/_modules/common_values?ref=main"
}
