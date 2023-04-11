import { IPost, IPostRepository, IPostService, PostFilter } from '@posts/types';

export class PostService implements IPostService {
  constructor(private postRepository: IPostRepository) {}

  getPosts(filter: PostFilter): Promise<IPost[]> {
  return this.postRepository.getPosts(filter);
  }
}
