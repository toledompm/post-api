import type { IPostContent, IPostContentHeading, IPostContentParagraph } from '@posts/types';

class PostContentHeading implements IPostContentHeading {
  heading: string;

  constructor(props: Partial<IPostContentHeading>) {
    this.heading = props.heading || '';
  }
}

class PostContentParagraph implements IPostContentParagraph {
  paragraph: string;

  constructor(props: Partial<IPostContentParagraph>) {
    this.paragraph = props.paragraph || '';
  }
}

const isIPostContentHeading = (obj: Record<string, any>): obj is IPostContentHeading => {
  return obj.heading !== undefined;
};

const isIPostContentParagraph = (obj: Record<string, any>): obj is IPostContentParagraph => {
  return obj.paragraph !== undefined;
};

export const postContentFactory = (props: Partial<IPostContent>) => {
  if (isIPostContentHeading(props)) {
    return new PostContentHeading(props);
  }

 if (isIPostContentParagraph(props)) {
    return new PostContentParagraph(props);
  }

  throw new Error('Invalid post content');
};
