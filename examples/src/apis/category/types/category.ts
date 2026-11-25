/**
 * The category as the API returns it. create, get, update and list
 * build on this type, so a field added here reaches all of them.
 */
export type typeCategory = {
  categoryId: string;
  name: string;
  slug: string;
  parentId: string | null;
  iconUrl: string | null;
  createdAt: string;
  updatedAt: string;
};
