export interface IPost {
  id: string;
  title: string;
  body: string;
  published: boolean;
  date: Date;
  tags: string[];
}

export type PostFilter = Pick<IPost, 'published' | 'tags'>;

export interface IPostRepository {
  getPosts(filter: PostFilter): Promise<IPost[]>;
}

export interface IPostService {
  getPosts(filter: PostFilter): Promise<IPost[]>;
}
