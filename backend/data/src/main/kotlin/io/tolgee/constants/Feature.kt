@file:Suppress("unused")

package io.tolgee.constants

enum class Feature {
  GRANULAR_PERMISSIONS,
  PRIORITIZED_FEATURE_REQUESTS,
  PREMIUM_SUPPORT,
  DEDICATED_SLACK_CHANNEL,
  ASSISTED_UPDATES,
  DEPLOYMENT_ASSISTANCE,
  BACKUP_CONFIGURATION,
  TEAM_TRAINING,
  ACCOUNT_MANAGER,
  STANDARD_SUPPORT,
  PROJECT_LEVEL_CONTENT_STORAGES,
  WEBHOOKS,
  MULTIPLE_CONTENT_DELIVERY_CONFIGS,
  AI_PROMPT_CUSTOMIZATION,
  SLACK_INTEGRATION,
  TASKS,
  SSO,
  ORDER_TRANSLATION,
  GLOSSARY,
  TRANSLATION_LABELS,
  ;

  companion object {
    fun findByName(name: String): Feature? {
      return entries.find { it.name == name }
    }
  }
}
