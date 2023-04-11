import { IPost } from '@posts/types';

export class PostEntity implements IPost {
  title: string;
  published: boolean;
  tags: string[];
  id: string;
  body: string;
  date: Date;

  constructor(props: Partial<IPost>) {
    this.title = props.title || '';
    this.published = props.published || false;
    this.tags = props.tags || [];
    this.id = props.id || '';
    this.body = props.body || '';
    this.date = props.date || new Date();
  }
}
