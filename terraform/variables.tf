variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "asia-northeast1"
}

variable "service_name" {
  description = "Cloud Run service name"
  type        = string
  default     = "nextjs-cloud-run"
}

variable "image" {
  description = "Container image URL"
  type        = string
}

variable "nextauth_url" {
  description = "next-authのNEXTAUTH_URL(デプロイ先のURL。秘密情報ではないためSecret Manager経由にしない)"
  type        = string
}
