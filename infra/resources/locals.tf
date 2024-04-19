locals {
  prefix    = "io"
  env_short = "p"
  project   = "${local.prefix}-${local.env_short}"
  location  = "westeurope"

  cidr_subnet_fnpblevtdispatcherv4 = ["10.0.15.64/26"]

  resource_group_common   = "${local.project}-rg-common"
  resource_group_internal = "${local.project}-rg-internal"

  tags = {
    CostCenter     = "TS310 - PAGAMENTI & SERVIZI"
    CreatedBy      = "Terraform"
    Environment    = "Prod"
    Owner          = "IO"
    ManagementTeam = "IO Platform"
    Source         = "https://github.com/pagopa/io-functions-public-event-dispatcher/blob/main/infra/function_app_dispatcher"
  }
}
