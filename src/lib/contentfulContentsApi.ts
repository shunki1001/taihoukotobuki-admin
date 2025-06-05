import { contentfulClient } from './contentfulClient';
import { contentfulManagementClient } from './contentfulManagementClient';

export interface BlogFormData {
  slug: string;
  publishedDate: string; // ISO string
  title: string;
  content: string; // Markdown text
  status: 'draft' | 'published';
}

// Helper to get environment
const getEnvironment = async () => {
  const space = await contentfulManagementClient.getSpace(process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID as string);
  const environment = await space.getEnvironment('master'); // or your environment id
  return environment;
};

// Create a new blog post entry in Contentful
export const createPostInContentful = async (data: BlogFormData) => {
  const environment = await getEnvironment();

  // Create entry
  const entry = await environment.createEntry('pageBlogPost', {
    fields: {
      slug: { 'en-US': data.slug },
      publishedDate: { 'en-US': data.publishedDate },
      title: { 'en-US': data.title },
      content: { 'en-US': data.content },
    },
  });

  // Publish entry if status is published
  if (data.status === 'published') {
    await entry.publish();
  }

  return entry;
};

// Update an existing blog post entry by ID
export const updatePostInContentful = async (id: string, data: BlogFormData) => {
  const environment = await getEnvironment();

  const entry = await environment.getEntry(id);

  entry.fields.slug = { 'en-US': data.slug };
  entry.fields.publishedDate = { 'en-US': data.publishedDate };
  entry.fields.title = { 'en-US': data.title };
  entry.fields.content = { 'en-US': data.content };

  const updatedEntry = await entry.update();

  // Publish or unpublish based on status
  if (data.status === 'published') {
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
  return typeof sys === 'object' && sys !== null && 'publishedAt' in sys && typeof (sys as { publishedAt?: unknown }).publishedAt === 'string';
};

// Fetch a blog post by ID and map to BlogFormData
export const fetchBlogPostById = async (id: string): Promise<BlogFormData | null> => {
  try {
    const entry = await contentfulClient.getEntry(id);

    if (!entry || !entry.fields) return null;

    const fields = entry.fields;

    return {
      slug: typeof fields.slug === 'string' ? fields.slug : '',
      publishedDate: typeof fields.publishedDate === 'string' ? fields.publishedDate : '',
      title: typeof fields.title === 'string' ? fields.title : '',
      content: typeof fields.content === 'string' ? fields.content : '',
      status: hasPublishedAt(entry.sys) ? 'published' : 'draft',
    };
  } catch (error) {
     
    console.error('Error fetching blog post by ID:', error);
    return null;
  }
};

// Contentfulからブログ記事一覧を取得する関数
export async function fetchPostsFromContentful() {
  const response = await contentfulClient.getEntries<any>({
    content_type: 'pageBlogPost',
    order: '-fields.publishedDate',
  });

  return response.items.map((item: any) => {
    const fields = item.fields;
    return {
      id: item.sys.id,
      title: fields.title?.ja || fields.title || 'タイトルなし',
      status: fields.status === 'draft' ? '下書き' : '公開済み',
      date: fields.publishedDate ? new Date(fields.publishedDate).toISOString().slice(0, 10) : '',
      slug: fields.slug || '',
    };
  });
}
