import type { IImageBucketService } from '@bucket/types';
import { NotFoundError } from '@common/errors';
import { isIPostContentImage } from '@posts/postContentEntity';
import type {
  IPostContent,
  IPostInfo,
  IPostRepository,
  IPostService,
  PostFilter,
} from '@posts/types';

export class PostService implements IPostService {
  constructor(
    private postRepository: IPostRepository,
    private imageBucketService: IImageBucketService,
  ) {}

  async getPosts(filter: PostFilter): Promise<IPostInfo[]> {
    const postInfo = await this.postRepository.getPosts(filter);
    if (postInfo === null) throw new NotFoundError('PostInfo not found');

    const parsedPostInfo = await Promise.all(
      postInfo.map(async (info) => {
        if (info.imageUrl.includes('http')) {
          info.imageUrl = await this.imageBucketService.getBucketUrl(
            info.imageUrl,
          );
        }

        return info;
      }),
    );

    return parsedPostInfo;
  }

  async getPostContent(pageId: string): Promise<IPostContent[]> {
    const postContent = await this.postRepository.getPostContent(pageId);
    if (postContent === null) throw new NotFoundError('PostContent not found');

    const parsedPostContent = await Promise.all(
      postContent.map(async (content) => {
        if (isIPostContentImage(content)) {
          content.image.url = await this.imageBucketService.getBucketUrl(
            content.image.url,
          );
        }

        return content;
      }),
    );

    return parsedPostContent;
  }
}
