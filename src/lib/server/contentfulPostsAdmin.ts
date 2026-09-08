// サーバー専用モジュール。Contentful Management API(フル書き込み権限)を直接叩く処理はここに集約し、
// Route Handler(src/app/api/admin/posts/**)からのみ呼び出す。クライアントコンポーネントから
// import しないこと(CONTENTFUL_MANAGEMENT_ACCESS_TOKEN はサーバー環境変数でありクライアントには渡らない)。

import { contentfulManagementClient } from "@/lib/contentfulManagementClient";
import type { BlogFormData, BlogPostSummary } from "@/lib/types/blog";

const getEnvironment = async () => {
  const space = await contentfulManagementClient.getSpace(
    process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID as string
  );
  return space.getEnvironment("master"); // or your environment id
};

// Management APIのfieldsはロケールキー（例: 'en-US'）を持つオブジェクトなので、'en-US'キーから値を取得する
const getFieldValue = (field: unknown): string | unknown => {
  if (field == null) return "";
  if (typeof field === "object" && field !== null && "en-US" in field) {
    return (field as Record<string, unknown>)["en-US"];
  }
  return field;
};

export const uploadImageToContentful = async (
  file: File
): Promise<string> => {
  const environment = await getEnvironment();

  const uploadUrl = `https://upload.contentful.com/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}/uploads`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN}`,
      "Content-Type": "application/octet-stream",
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Contentful upload failed: ${response.statusText}`);
  }

  const uploadData = await response.json();

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

  await asset.processForAllLocales();

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

  await processedAsset.publish();

  return processedAsset.sys.id;
};

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

  if (data.status === "published") {
    await entry.publish();
  }

  return entry;
};

/**
 * 更新対象のentryIdが実在するか、およびpageBlogPostであるかを確認する。
 * 存在しない/型が違う場合は null を返す(呼び出し側で404扱いにする)。
 */
const getExistingPostEntry = async (id: string) => {
  const environment = await getEnvironment();
  try {
    const entry = await environment.getEntry(id);
    if (entry.sys.contentType?.sys?.id !== "pageBlogPost") {
      return null;
    }
    return { environment, entry };
  } catch {
    return null;
  }
};

export const updatePostInContentful = async (
  id: string,
  data: BlogFormData
) => {
  const existing = await getExistingPostEntry(id);
  if (!existing) return null;
  const { entry } = existing;

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
    delete entry.fields.imageAssetId;
  }

  const updatedEntry = await entry.update();

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
    const existing = await getExistingPostEntry(id);
    if (!existing) return null;
    const { entry } = existing;

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

export async function fetchPostsFromContentful(): Promise<BlogPostSummary[]> {
  const environment = await getEnvironment();

  const response = await environment.getEntries({
    content_type: "pageBlogPost",
    order: "-fields.publishedDate",
  });

  return response.items.map((item) => {
    const fields = item.fields;

    let title = "タイトルなし";
    const rawTitle = getFieldValue(fields.title);
    if (typeof rawTitle === "string") {
      title = rawTitle;
    } else if (
      typeof rawTitle === "object" &&
      rawTitle !== null &&
      "ja" in rawTitle
    ) {
      const jaTitle = (rawTitle as Record<string, unknown>)["ja"];
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

    let date = "";
    const rawDate = getFieldValue(fields.publishedDate);
    if (typeof rawDate === "string" || typeof rawDate === "number") {
      const parsedDate = new Date(rawDate);
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate.toISOString().slice(0, 10);
      }
    }

    const status = item.isPublished() ? "公開済み" : "下書き";

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

    const rawSlug = getFieldValue(fields.slug);
    const slug = typeof rawSlug === "string" ? rawSlug : "";

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

export const deletePostInContentful = async (
  entryId: string
): Promise<boolean | null> => {
  const existing = await getExistingPostEntry(entryId);
  if (!existing) return null; // 呼び出し側で404扱いにする

  try {
    const { entry } = existing;
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
