import { NotFoundError } from '@common/errors';
import { IPostContent, IPostInfo, IPostRepository, IPostService, PostFilter } from '@posts/types';

export class PostService implements IPostService {
  constructor(private postRepository: IPostRepository) {}

  async getPosts(filter: PostFilter): Promise<IPostInfo[]> {
    const postInfo = await this.postRepository.getPosts(filter);
    if (postInfo === null) throw new NotFoundError('PostInfo not found');

    return postInfo;
  }

  async getPostContent(pageId: string): Promise<IPostContent[]> {
    const postContent = await this.postRepository.getPostContent(pageId);
    if (postContent === null) throw new NotFoundError('PostContent not found');

    return postContent;
  }
}
