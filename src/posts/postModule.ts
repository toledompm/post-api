import { genPostRoutes } from '@posts/postController';
import { PostService } from '@posts/postService';
import { DatabaseType, appConfig } from '@common/config';
import { NotionRepository } from '@posts/notionRepository';
import { IPost, IPostRepository } from '@posts/types';
import { PostEntity } from '@posts/postEntity';
import { Client } from '@notionhq/client';

const { post: postConfig } = appConfig();

const notionRepositoryFactory = (
  postFactory: (props: Partial<IPost>) => IPost,
  { apiToken, databaseId }: { apiToken: string; databaseId: string },
): IPostRepository => {
  const client = new Client({ auth: apiToken });
  return new NotionRepository(client, postFactory, databaseId);
};

const postFactory = (props: Partial<IPost>): IPost => {
  return new PostEntity(props);
};

const repositoryMapping = {
  [DatabaseType.NOTION]: {
   class: NotionRepository,
   factory: () => notionRepositoryFactory(postFactory, postConfig.database.notion),
  },
};

const postRepository = repositoryMapping[postConfig.database.type].factory();
const postService = new PostService(postRepository);

const postRoutes = genPostRoutes(postService, '/posts');

export const postModule = {
  routes: postRoutes,
};
