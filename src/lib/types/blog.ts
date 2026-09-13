// クライアント側(フォーム等)とサーバー側(Route Handler)の両方から参照する型定義。
// Contentful Management APIの呼び出しロジック自体はサーバー専用モジュール
// (src/lib/server/contentfulPostsAdmin.ts)にのみ置き、ここには型だけを置く。

export interface BlogFormData {
  slug: string;
  publishedDate: string; // ISO string
  title: string;
  content: string; // Markdown text
  status: "draft" | "published";
  imageAssetId?: string; // Contentful asset ID for the blog image
  imageUrl?: string;
}

export interface BlogPostSummary {
  id: string;
  title: string;
  status: string;
  date: string;
  slug: string;
  imageAssetId?: string;
}

export interface PaginatedBlogPosts {
  items: BlogPostSummary[];
  total: number;
  skip: number;
  limit: number;
}
