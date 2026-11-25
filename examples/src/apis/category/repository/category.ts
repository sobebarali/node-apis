import type { typeCategory } from '../types/category';

/**
 * Shared by the category repositories. A file named after the module alone
 * is written by hand; node-apis never generates or overwrites it.
 */
export type typeCategoryRow = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  icon_url: string | null;
  created_at: Date;
  updated_at: Date;
};

export const toCategory = (row: typeCategoryRow): typeCategory => ({
  categoryId: row.id,
  name: row.name,
  slug: row.slug,
  parentId: row.parent_id,
  iconUrl: row.icon_url,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});
