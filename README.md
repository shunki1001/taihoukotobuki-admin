## terraform/terraform.tfvars を使ったCloud Runデプロイ手順

### 前提: 秘密情報はDockerイメージに焼き込まない

`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `ALLOWED_EMAILS` / `NEXTAUTH_SECRET` /
`CONTENTFUL_MANAGEMENT_ACCESS_TOKEN` はビルド引数として渡さない。Dockerビルド時にENVとして
焼き込むと `docker history --no-trunc` や `docker inspect` でイメージから復元できてしまうため、
Cloud Run実行時にSecret Manager経由で注入する(`terraform/main.tf`参照)。

ビルド時に渡すのは `NEXT_PUBLIC_CONTENTFUL_SPACE_ID` / `NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN` の
2つのみ。どちらも秘密情報ではない(Space IDは識別子、ACCESS_TOKENはContentful Delivery APIの
閲覧専用トークン)が、Next.jsの`NEXT_PUBLIC_`変数はビルド時にクライアントJSへインライン化される
仕様のため、ビルド時に渡す必要がある。

### 1. gcloudの設定

```bash
gcloud auth configure-docker
```

### 2. Dockerイメージをビルドし、GCRにプッシュ

```bash
# .env の NEXT_PUBLIC_CONTENTFUL_SPACE_ID / NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN のみ渡す
docker build \
  --build-arg NEXT_PUBLIC_CONTENTFUL_SPACE_ID_ARG="$(grep '^NEXT_PUBLIC_CONTENTFUL_SPACE_ID=' .env | cut -d= -f2-)" \
  --build-arg NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN_ARG="$(grep '^NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN=' .env | cut -d= -f2-)" \
  -t gcr.io/smarthome-428311/taihoukotobuki-admin-cloud-run:latest .
docker push gcr.io/smarthome-428311/taihoukotobuki-admin-cloud-run:latest
```

### 3. Secret Managerへの値の登録(初回のみ、または値のローテーション時)

`terraform apply` で「入れ物」(シークレット自体)は作られるが、値はTerraformコードに書かず
手動で登録する。**このステップはユーザーが行う**(認証情報を扱うため)。

```bash
echo -n "<値>" | gcloud secrets versions add taihoukotobuki-admin-google-client-id --project smarthome-428311 --data-file=-
echo -n "<値>" | gcloud secrets versions add taihoukotobuki-admin-google-client-secret --project smarthome-428311 --data-file=-
echo -n "<値>" | gcloud secrets versions add taihoukotobuki-admin-allowed-emails --project smarthome-428311 --data-file=-
echo -n "<値>" | gcloud secrets versions add taihoukotobuki-admin-nextauth-secret --project smarthome-428311 --data-file=-
echo -n "<値>" | gcloud secrets versions add taihoukotobuki-admin-contentful-management-access-token --project smarthome-428311 --data-file=-
```

値を登録するまでは、Cloud Runサービス自体のデプロイ(手順4)が
「参照先のシークレットバージョンが存在しない」エラーで失敗する。

### 4. Terraformの初期化と適用

```bash
cd terraform
terraform init
terraform apply
```

初回は `google_secret_manager_secret`(入れ物)だけを先に作るために2段階で適用してもよい
(`terraform apply -target=google_secret_manager_secret.runtime` → 手順3で値を登録 → `terraform apply`)。

### 5. 動作確認

適用後、Cloud RunのURLが表示されるのでブラウザでアクセスし、Next.jsアプリが動作していることを
確認してください。

---

## 注意点
- Cloud Runはポート8080を使用します。DockerfileでEXPOSE 8080、Next.jsの起動もポート8080にしてください。
- Next.jsの`package.json`の`start`スクリプトは`next start -p 8080`のようにポート指定が必要です。
- 秘密情報を更新(ローテーション)する場合は手順3を再実行し、Cloud Runの新しいリビジョンを
  デプロイ(`gcloud run services update` または再度 `terraform apply`)して反映する。
