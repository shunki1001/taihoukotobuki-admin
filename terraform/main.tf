terraform {
  backend "gcs" {
    bucket = "terrform-bucket-smarthome-428311"
    prefix = "state/taihoukotobuki-admin"
  }

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
  required_version = ">= 1.0"
}

provider "google" {
  project = var.project_id
  region  = var.region
}

data "google_project" "current" {
  project_id = var.project_id
}

# --- 実行時シークレット(Secret Manager) ---
# ここではシークレットの「入れ物」だけを作る。値そのものはTerraformコードに書かず、
# 初回apply後に手動で登録する(認証情報をコードやコミットに含めないため):
#   echo -n "<値>" | gcloud secrets versions add <secret_id> --project smarthome-428311 --data-file=-
# 値を登録するまでは secret_key_ref が参照するバージョンが存在せず、
# Cloud Runサービス自体のapply/デプロイが失敗する点に注意。
locals {
  runtime_secrets = {
    GOOGLE_CLIENT_ID                   = "taihoukotobuki-admin-google-client-id"
    GOOGLE_CLIENT_SECRET               = "taihoukotobuki-admin-google-client-secret"
    ALLOWED_EMAILS                     = "taihoukotobuki-admin-allowed-emails"
    NEXTAUTH_SECRET                    = "taihoukotobuki-admin-nextauth-secret"
    CONTENTFUL_MANAGEMENT_ACCESS_TOKEN = "taihoukotobuki-admin-contentful-management-access-token"
  }
}

resource "google_secret_manager_secret" "runtime" {
  for_each  = local.runtime_secrets
  secret_id = each.value

  replication {
    auto {}
  }
}

# Cloud Runのデフォルト実行サービスアカウント(<project number>-compute@developer.gserviceaccount.com)に
# 各シークレットの読み取り権限のみを付与する。
resource "google_secret_manager_secret_iam_member" "runtime_accessor" {
  for_each  = google_secret_manager_secret.runtime
  project   = var.project_id
  secret_id = each.value.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${data.google_project.current.number}-compute@developer.gserviceaccount.com"
}

resource "google_cloud_run_service" "default" {
  name     = var.service_name
  location = var.region

  template {
    spec {
      containers {
        image = var.image
        ports {
          container_port = 8080
        }

        # NEXTAUTH_URLは秘密情報ではないため通常の環境変数として渡す
        env {
          name  = "NEXTAUTH_URL"
          value = var.nextauth_url
        }

        # 秘密情報はSecret Managerから実行時に注入する(Dockerイメージには焼き込まない)
        dynamic "env" {
          for_each = local.runtime_secrets
          content {
            name = env.key
            value_from {
              secret_key_ref {
                name = google_secret_manager_secret.runtime[env.key].secret_id
                key  = "latest"
              }
            }
          }
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [google_secret_manager_secret_iam_member.runtime_accessor]
}

resource "google_cloud_run_service_iam_member" "noauth" {
  location = google_cloud_run_service.default.location
  project  = var.project_id
  service  = google_cloud_run_service.default.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
