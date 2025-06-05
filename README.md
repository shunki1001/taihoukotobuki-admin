## terraform/terraform.tfvars を使ったCloud Runデプロイ手順

1. gcloudの設定

```bash
gcloud auth configure-docker
```

2. Dockerイメージをビルドし、GCRにプッシュ

```bash
# .envファイルから環境変数を読み込み、ビルド時に渡す例
docker build $(awk -F= '!/^#/ && NF==2 {print "--build-arg " $1 "_ARG=" $2}' .env.local | tr '\n' ' ') -t gcr.io/smarthome-428311/taihoukotobuki-admin-cloud-run:latest .
docker push gcr.io/smarthome-428311/taihoukotobuki-admin-cloud-run:latest
```

3. Terraformの初期化と適用

```bash
cd terraform
terraform init
terraform apply
```

4. 適用後、Cloud RunのURLが表示されるのでブラウザでアクセスし、Next.jsアプリが動作していることを確認してください。

---

## 注意点
- Cloud Runはポート8080を使用します。DockerfileでEXPOSE 8080、Next.jsの起動もポート8080にしてください。
- Next.jsの`package.json`の`start`スクリプトは`next start -p 8080`のようにポート指定が必要です。

