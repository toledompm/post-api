import { DatabaseType, appConfig } from '@common/config';
import { Client } from '@notionhq/client';
import { NotionRepository } from '@posts/notionRepository';
import { postContentFactory } from '@posts/postContentEntity';
import { genPostRoutes } from '@posts/postController';
import { postInfoFactory } from '@posts/postInfoEntity';
import { PostService } from '@posts/postService';
import type { IPostRepository, IPostService, PostContentFactory, PostInfoFactory } from '@posts/types';

const { post: postConfig } = appConfig();

const postServiceFactory = (postRepository: IPostRepository): IPostService => new PostService(postRepository);

const notionRepositoryFactory = (opts: { apiToken: string, databaseId: string, postInfoFactory: PostInfoFactory, postContentFactory: PostContentFactory }): IPostRepository => {
  const client = new Client({ auth: opts.apiToken });
  return new NotionRepository(client, opts.postInfoFactory, opts.postContentFactory, opts.databaseId);
};

const repositoryMapping = {
  [DatabaseType.NOTION]: {
   factory: notionRepositoryFactory,
   opts: { apiToken: postConfig.database.notion.apiToken, databaseId: postConfig.database.notion.databaseId },
  },
};

const databaseType = postConfig.database.type;

const repositoryCustomOpts = repositoryMapping[databaseType].opts;

const repositoryOpts = {
  ...repositoryCustomOpts,
  postInfoFactory,
  postContentFactory,
};

const repositoryFactory = repositoryMapping[databaseType].factory;

const repository = repositoryFactory(repositoryOpts);
const service = postServiceFactory(repository);

export const postModule = {
  routes: genPostRoutes,
  exports: {
    postService: service,
  },
};
