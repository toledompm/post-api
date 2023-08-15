import type {
  IPostContent,
  IPostContentHeading,
  IPostContentImage,
  IPostContentParagraph,
} from '@posts/types';

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

class PostContentImage implements IPostContentImage {
  image: { url: string; caption: string, metaUrl: string };

  constructor(props: Partial<IPostContentImage>) {
    this.image = props.image || { url: '', caption: '', metaUrl: '' };
  }
}

export function isIPostContentHeading(
  obj: Record<string, any>,
): obj is IPostContentHeading {
  return obj.heading !== undefined;
}

export function isIPostContentParagraph (
  obj: Record<string, any>,
): obj is IPostContentParagraph {
  return obj.paragraph !== undefined;
}

export function isIPostContentImage(
  obj: Record<string, any>,
): obj is IPostContentImage {
  return obj.image !== undefined;
}

export const postContentFactory = (props: Partial<IPostContent>) => {
  if (isIPostContentHeading(props)) {
    return new PostContentHeading(props);
  }

  if (isIPostContentParagraph(props)) {
    return new PostContentParagraph(props);
  }

  if (isIPostContentImage(props)) {
    return new PostContentImage(props);
  }

  throw new Error('Invalid post content');
};
