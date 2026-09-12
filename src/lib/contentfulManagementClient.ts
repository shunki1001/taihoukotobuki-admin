import {
  createClient as createManagementClient,
  ClientAPI,
} from "contentful-management";

// フル書き込み権限を持つトークンのため、NEXT_PUBLIC_ プレフィックスは付けない。
// クライアントバンドルには絶対に含めず、サーバー側(Route Handler / middleware)からのみ参照する。

let cachedClient: ClientAPI | undefined;

/**
 * Contentful Management APIクライアントを遅延生成する。
 *
 * モジュールのトップレベルでクライアントを生成すると、Next.jsのビルド時
 * (`next build` のページデータ収集フェーズ)にこのモジュールが評価され、
 * ビルド環境に CONTENTFUL_MANAGEMENT_ACCESS_TOKEN が存在しない場合
 * (秘密情報をビルド時に渡さない構成では意図的に存在しない)ビルド自体が
 * 失敗してしまう。実際に呼び出された時点(リクエスト処理時)まで
 * トークンの読み込みを遅延させることでこれを避ける。
 */
export function getContentfulManagementClient(): ClientAPI {
  if (!cachedClient) {
    const accessToken = process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error("CONTENTFUL_MANAGEMENT_ACCESS_TOKEN is not set");
    }
    cachedClient = createManagementClient({ accessToken });
  }
  return cachedClient;
}
