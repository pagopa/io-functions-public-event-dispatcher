resource "github_repository" "this" {
  name        = "io-functions-public-event-dispatcher"
  description = "A set of functions that propagate IO core domain events to IO-powered projects"

  #tfsec:ignore:github-repositories-private
  visibility = "public"

  allow_auto_merge            = true
  allow_rebase_merge          = true
  allow_merge_commit          = true
  allow_squash_merge          = true
  squash_merge_commit_title   = "COMMIT_OR_PR_TITLE"
  squash_merge_commit_message = "COMMIT_MESSAGES"

  delete_branch_on_merge = true

  has_projects    = true
  has_wiki        = true
  has_discussions = false
  has_issues      = true
  has_downloads   = true

  topics = []

  vulnerability_alerts = true
  template {
    include_all_branches = false
    owner                = "pagopa"
    repository           = "io-functions-template"
  }

  security_and_analysis {
    secret_scanning {
      status = "enabled"
    }

    secret_scanning_push_protection {
      status = "enabled"
    }
  }
}
