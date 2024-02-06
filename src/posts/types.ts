export interface IPostInfo {
  id: string;
  title: string;
  published: boolean;
  date: Date;
  tags: string[];
  tweet: string;
  imageUrl: string;
  imageAlt: string;
}

export type PostInfoFactory = (props: Partial<IPostInfo>) => IPostInfo;

export interface IPostContentHeading {
  heading: string;
}

export interface IPostContentParagraph {
  paragraph: (string | { url: string, text: string })[];
}

export interface IPostContentImage {
  image: {
    url: string;
    caption: string;
  };
}

export type PostContentFactory = (props: Partial<IPostContent>) => IPostContent;

export type IPostContent =
  | IPostContentHeading
  | IPostContentParagraph
  | IPostContentImage;

export type PostFilter = Pick<IPostInfo, 'published' | 'tags'>;

export interface IPostRepository {
  getPosts(filter: PostFilter): Promise<IPostInfo[] | null>;
  getPostContent(pageId: string): Promise<IPostContent[] | null>;
}

export interface IPostService {
  getPosts(filter: PostFilter): Promise<IPostInfo[]>;
  getPostContent(pageId: string): Promise<IPostContent[]>;
}
