import { contentfulClient } from "./contentfulClient";
import { contentfulManagementClient } from "./contentfulManagementClient";
import type { Asset } from "contentful";

export interface BlogFormData {
  slug: string;
  publishedDate: string; // ISO string
  title: string;
  content: string; // Markdown text
  status: "draft" | "published";
  imageAssetId?: string; // Contentful asset ID for the blog image
  imageUrl?: string;
}

// Helper to get environment
const getEnvironment = async () => {
  const space = await contentfulManagementClient.getSpace(
    process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID as string
  );
  const environment = await space.getEnvironment("master"); // or your environment id
  return environment;
};

// Management APIのfieldsはロケールキー（例: 'en-US'）を持つオブジェクトなので、'en-US'キーから値を取得する
const getFieldValue = (field: unknown): string | unknown => {
  if (field == null) return "";
  if (typeof field === "object" && field !== null && "en-US" in field) {
    return (field as Record<string, unknown>)["en-US"];
  }
  return field;
};

export const uploadImageToContentful = async (file: File): Promise<string> => {
  const environment = await getEnvironment();

  // Upload the file to Contentful upload API via direct HTTP POST
  const uploadUrl = `https://upload.contentful.com/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}/uploads`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_CONTENTFUL_MANAGEMENT_ACCESS_TOKEN}`,
      "Content-Type": "application/octet-stream",
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Contentful upload failed: ${response.statusText}`);
  }

  const uploadData = await response.json();

  // Create asset referencing the upload URL
  const asset = await environment.createAsset({
    fields: {
      title: {
        "en-US": file.name,
      },
      file: {
        "en-US": {
          contentType: file.type,
          fileName: file.name,
          uploadFrom: {
            sys: {
              type: "Link",
              linkType: "Upload",
              id: uploadData.sys.id,
            },
          },
        },
      },
    },
  });

  // Process asset for all locales
  await asset.processForAllLocales();

  // Wait for processing to complete
  let processedAsset = await environment.getAsset(asset.sys.id);
  let retryCount = 0;
  const maxRetries = 5;
  while (
    processedAsset.fields.file["en-US"].url === undefined &&
    retryCount < maxRetries
  ) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    processedAsset = await environment.getAsset(asset.sys.id);
    retryCount++;
  }

  // Publish asset
  await processedAsset.publish();

  return processedAsset.sys.id;
};

// Create a new blog post entry in Contentful
interface PostEntryFields {
  slug: { "en-US": string };
  publishedDate: { "en-US": string };
  title: { "en-US": string };
  content: { "en-US": string };
  imageAssetId?: {
    "en-US": {
      sys: {
        type: string;
        linkType: string;
        id: string;
      };
    };
  };
}

export const createPostInContentful = async (data: BlogFormData) => {
  const environment = await getEnvironment();

  // Create entry
  const entryFields: PostEntryFields = {
    slug: { "en-US": data.slug },
    publishedDate: { "en-US": data.publishedDate },
    title: { "en-US": data.title },
    content: { "en-US": data.content },
  };

  if (data.imageAssetId) {
    entryFields.imageAssetId = {
      "en-US": {
        sys: {
          type: "Link",
          linkType: "Asset",
          id: data.imageAssetId,
        },
      },
    };
  }

  const entry = await environment.createEntry("pageBlogPost", {
    fields: entryFields,
  });

  // Publish entry if status is published
  if (data.status === "published") {
    await entry.publish();
  }

  return entry;
};

export const updatePostInContentful = async (
  id: string,
  data: BlogFormData
) => {
  const environment = await getEnvironment();

  const entry = await environment.getEntry(id);

  entry.fields.slug = { "en-US": data.slug };
  entry.fields.publishedDate = { "en-US": data.publishedDate };
  entry.fields.title = { "en-US": data.title };
  entry.fields.content = { "en-US": data.content };

  if (data.imageAssetId) {
    entry.fields.imageAssetId = {
      "en-US": {
        sys: {
          type: "Link",
          linkType: "Asset",
          id: data.imageAssetId,
        },
      },
    };
  } else {
    // Remove image field if no imageAssetId
    delete entry.fields.imageAssetId;
  }

  const updatedEntry = await entry.update();

  // Publish or unpublish based on status
  if (data.status === "published") {
    if (!updatedEntry.isPublished()) {
      await updatedEntry.publish();
    }
  } else {
    if (updatedEntry.isPublished()) {
      await updatedEntry.unpublish();
    }
  }

  return updatedEntry;
};

// Type guard to check if sys has publishedAt property
const hasPublishedAt = (sys: unknown): sys is { publishedAt: string } => {
  return (
    typeof sys === "object" &&
    sys !== null &&
    "publishedAt" in sys &&
    typeof (sys as { publishedAt?: unknown }).publishedAt === "string"
  );
};

export const fetchBlogPostById = async (
  id: string
): Promise<BlogFormData | null> => {
  try {
    const space = await contentfulManagementClient.getSpace(
      process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID as string
    );
    const environment = await space.getEnvironment("master");

    const entry = await environment.getEntry(id);

    if (!entry || !entry.fields) return null;

    const fields = entry.fields;

    const slug = getFieldValue(fields.slug);
    const publishedDate = getFieldValue(fields.publishedDate);
    const title = getFieldValue(fields.title);
    const content = getFieldValue(fields.content);
    const rawImageAssetId = getFieldValue(fields.imageAssetId);

    let imageAssetId: string | undefined = undefined;
    if (
      rawImageAssetId &&
      typeof rawImageAssetId === "object" &&
      "sys" in rawImageAssetId &&
      typeof rawImageAssetId.sys === "object" &&
      rawImageAssetId.sys !== null &&
      "id" in rawImageAssetId.sys &&
      typeof rawImageAssetId.sys.id === "string"
    ) {
      imageAssetId = rawImageAssetId.sys.id;
    }

    return {
      slug: typeof slug === "string" ? slug : "",
      publishedDate: typeof publishedDate === "string" ? publishedDate : "",
      title: typeof title === "string" ? title : "",
      content: typeof content === "string" ? content : "",
      status: hasPublishedAt(entry.sys) ? "published" : "draft",
      imageAssetId,
    };
  } catch (error: unknown) {
    console.error("Error fetching blog post by ID:", error);
    return null;
  }
};

export async function fetchPostsFromContentful() {
  const environment = await getEnvironment();

  // Management APIでエントリを取得（下書きも含む）
  const response = await environment.getEntries({
    content_type: "pageBlogPost",
    order: "-fields.publishedDate",
  });

  return response.items.map((item) => {
    const fields = item.fields;

    // タイトルの取得
    let title = "タイトルなし";
    const rawTitle = getFieldValue(fields.title);
    if (typeof rawTitle === "string") {
      title = rawTitle;
    } else if (
      typeof rawTitle === "object" &&
      rawTitle !== null &&
      "ja" in rawTitle
    ) {
      const jaTitle = rawTitle["ja"];
      if (typeof jaTitle === "string") {
        title = jaTitle;
      }
    } else if (
      Array.isArray(rawTitle) &&
      rawTitle.length > 0 &&
      typeof rawTitle[0] === "string"
    ) {
      title = rawTitle[0];
    }

    // publishedDateの取得
    let date = "";
    const rawDate = getFieldValue(fields.publishedDate);
    if (typeof rawDate === "string" || typeof rawDate === "number") {
      const parsedDate = new Date(rawDate);
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate.toISOString().slice(0, 10);
      }
    }

    // 公開状態の判定
    const status = item.isPublished() ? "公開済み" : "下書き";

    // imageAssetIdの取得
    let imageAssetId: string | undefined = undefined;
    const rawImageAssetId = getFieldValue(fields.imageAssetId);
    if (
      rawImageAssetId &&
      typeof rawImageAssetId === "object" &&
      "sys" in rawImageAssetId &&
      typeof rawImageAssetId.sys === "object" &&
      rawImageAssetId.sys !== null &&
      "id" in rawImageAssetId.sys &&
      typeof rawImageAssetId.sys.id === "string"
    ) {
      imageAssetId = rawImageAssetId.sys.id;
    }

    // slugの取得
    const slug = getFieldValue(fields.slug) || "";

    return {
      id: item.sys.id,
      title,
      status,
      date,
      slug,
      imageAssetId,
    };
  });
}

/**
 * アセットIDからアセットの完全なURLを取得します。
 * @param assetId 取得したいアセットのID
 * @returns アセットのURL文字列、または見つからない場合はnull
 */
export async function getAssetUrl(
  assetId: string
): Promise<string | undefined> {
  try {
    // client.getAssetメソッドでアセット情報を取得
    const asset: Asset<undefined> = await contentfulClient.getAsset(assetId);

    // アセット情報からURLを安全に取得
    // オプショナルチェイニング(?.)を使い、プロパティが存在しない場合のエラーを防ぎます
    const url = asset.fields.file?.url;

    if (url) {
      // ContentfulのAPIが返すURLはプロトコルが省略されているため、'https:'を付与
      const fullUrl = `https:${url}`;
      console.log(`取得したURL: ${fullUrl}`);
      return fullUrl;
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

export const deletePostInContentful = async (entryId: string) => {
  const environment = await getEnvironment();

  try {
    const entry = await environment.getEntry(entryId);
    if (entry.isPublished()) {
      await entry.unpublish();
    }
    await entry.delete();
    return true;
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const errObj = error as { response?: { data: unknown } };
      console.error("Failed to delete entry:", errObj.response?.data ?? error);
    } else {
      console.error("Failed to delete entry:", error);
    }
    return false;
  }
};
