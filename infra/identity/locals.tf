locals {

  prefix    = "io"
  env_short = "p"
  env       = "prod"
  location  = "westeurope"
  project   = "${local.prefix}-${local.env_short}"
  domain    = "pblevtdispatcher"

  repo_name = "io-functions-public-event-dispatcher"

  tags = {
    CostCenter     = "TS310 - PAGAMENTI & SERVIZI"
    CreatedBy      = "Terraform"
    Environment    = "Prod"
    Owner          = "DevEx"
    ManagementTeam = "IO Platform"
    Source         = "https://github.com/pagopa/dx/blob/main/infra/github_federated_identity"
  }
}
