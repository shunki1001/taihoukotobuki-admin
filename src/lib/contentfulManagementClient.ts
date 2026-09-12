import { createClient as createManagementClient } from "contentful-management";

// フル書き込み権限を持つトークンのため、NEXT_PUBLIC_ プレフィックスは付けない。
// クライアントバンドルには絶対に含めず、サーバー側(Route Handler / middleware)からのみ参照する。
export const contentfulManagementClient = createManagementClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN as string,
});
