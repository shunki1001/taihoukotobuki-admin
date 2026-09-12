// クライアント側から呼び出す薄いラッパー。実際のContentful Management API呼び出しは
// サーバー側(src/app/api/admin/posts/**, src/lib/server/contentfulPostsAdmin.ts)で行う。
// フル書き込み権限のトークンはここでは一切扱わない。

import { contentfulClient } from "./contentfulClient";
import type { Asset } from "contentful";
import type { BlogFormData, BlogPostSummary } from "@/lib/types/blog";

export type { BlogFormData, BlogPostSummary };

const parseErrorMessage = async (
  response: Response,
  fallback: string
): Promise<string> => {
  try {
    const data = await response.json();
    if (data && typeof data.error === "string") return data.error;
  } catch {
    // レスポンスがJSONでない場合はfallbackを使う
  }
  return fallback;
};

export const uploadImageToContentful = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/admin/posts/upload-image", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      await parseErrorMessage(response, "画像のアップロードに失敗しました。")
    );
  }

  const { assetId } = await response.json();
  return assetId as string;
};

export const createPostInContentful = async (
  data: BlogFormData
): Promise<{ id: string }> => {
  const response = await fetch("/api/admin/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await parseErrorMessage(response, "記事の作成に失敗しました。")
    );
  }

  return response.json();
};

export const updatePostInContentful = async (
  id: string,
  data: BlogFormData
): Promise<{ id: string }> => {
  const response = await fetch(`/api/admin/posts/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await parseErrorMessage(response, "記事の更新に失敗しました。")
    );
  }

  return response.json();
};

export const fetchBlogPostById = async (
  id: string
): Promise<BlogFormData | null> => {
  const response = await fetch(`/api/admin/posts/${encodeURIComponent(id)}`);
  if (response.status === 404) return null;
  if (!response.ok) {
    console.error("Failed to fetch blog post by ID:", await response.text());
    return null;
  }
  return response.json();
};

export async function fetchPostsFromContentful(): Promise<BlogPostSummary[]> {
  const response = await fetch("/api/admin/posts");
  if (!response.ok) {
    throw new Error(
      await parseErrorMessage(response, "記事一覧の取得に失敗しました。")
    );
  }
  return response.json();
}

export const deletePostInContentful = async (
  entryId: string
): Promise<boolean> => {
  const response = await fetch(
    `/api/admin/posts/${encodeURIComponent(entryId)}`,
    { method: "DELETE" }
  );
  return response.ok;
};

/**
 * アセットIDからアセットの完全なURLを取得します。
 * Contentful Delivery API(閲覧専用の公開トークン)を使うため、クライアント側で直接呼び出す。
 * @param assetId 取得したいアセットのID
 * @returns アセットのURL文字列、または見つからない場合はnull
 */
export async function getAssetUrl(
  assetId: string
): Promise<string | undefined> {
  try {
    const asset: Asset<undefined> = await contentfulClient.getAsset(assetId);
    const url = asset.fields.file?.url;

    if (url) {
      return `https:${url}`;
    } else {
      console.warn(
        `アセットID '${assetId}' にファイルURLが見つかりませんでした。`
      );
      return undefined;
    }
  } catch (error) {
    console.error(
      `アセットID '${assetId}' の取得中にエラーが発生しました:`,
      error
    );
    return undefined;
  }
}
