import { IPost, IPostRepository } from '@posts/types';

// Placeholder

export class PostRepository implements IPostRepository {
  getPosts(): Promise<IPost[]> {
    return new Promise((resolve) => {
      resolve(
        [
          {
            id: '1',
            title: 'Post 1',
            body: 'Post 1 body',
            published: true,
            date: new Date(),
            tags: ['tag1', 'tag2'],
          },
        ],
      );
    });
  }
}
