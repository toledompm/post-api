export interface IPost {
  id: string;
  title: string;
  body: string;
  published: boolean;
  date: Date;
  tags: string[];
}

export interface IPostRepository {
  getPosts(): Promise<IPost[]>;
}

export interface IPostService {
  getPosts(): Promise<IPost[]>;
}
