import type { IPostInfo } from '@posts/types';

class PostInfoEntity implements IPostInfo {
  title: string;
  published: boolean;
  tags: string[];
  id: string;
  date: Date;
  tweet: string;
  imageUrl: string;
  imageAlt: string;

  constructor(props: Partial<IPostInfo>) {
    this.title = props.title || '';
    this.published = props.published || false;
    this.tags = props.tags || [];
    this.id = props.id || '';
    this.date = props.date || new Date();
    this.tweet = props.tweet || '';
    this.imageUrl = props.imageUrl || '';
    this.imageAlt = props.imageAlt || '';
  }
}

export const postInfoFactory = (props: Partial<IPostInfo>) =>
  new PostInfoEntity(props);
