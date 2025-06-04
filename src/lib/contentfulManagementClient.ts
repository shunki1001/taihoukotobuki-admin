import { createClient as createManagementClient, ContentfulClientApi } from 'contentful-management';

export const contentfulManagementClient: ContentfulClientApi = createManagementClient({
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_MANAGEMENT_ACCESS_TOKEN as string,
});
