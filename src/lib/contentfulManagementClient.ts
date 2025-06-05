import { createClient as createManagementClient } from 'contentful-management';

export const contentfulManagementClient = createManagementClient({
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_MANAGEMENT_ACCESS_TOKEN as string,
});
