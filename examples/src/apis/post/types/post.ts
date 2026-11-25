/**
 * The post as the API returns it. create, get, update and list
 * build on this type, so a field added here reaches all of them.
 */
export type typePost = {
  postId: string;
  title: string;
  content: string;
  authorId: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
};
