import { IPost, IPostRepository, IPostService } from '@posts/types';

export class PostService implements IPostService {
  constructor(private postRepository: IPostRepository) {}

  getPosts(): Promise<IPost[]> {
    return this.postRepository.getPosts();
  }
}
