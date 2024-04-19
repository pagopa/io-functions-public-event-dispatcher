output "function_app_dispatcher" {
  value = {
    id   = module.function_pblevtdispatcher_v4.id
    name = module.function_pblevtdispatcher_v4.name
  }
}
