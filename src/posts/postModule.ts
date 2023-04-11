import { genPostRoutes } from '@posts/postController';
import { PostService } from '@posts/postService';
import { DatabaseType, appConfig } from '@common/config';
import { NotionRepository } from '@posts/notionRepository';
import { IPost, IPostRepository, IPostService } from '@posts/types';
import { PostEntity } from '@posts/postEntity';
import { Client } from '@notionhq/client';
import { FastifyPluginAsync } from 'fastify';

const { post: postConfig } = appConfig();

const postFactory = (props: Partial<IPost>): IPost => {
  return new PostEntity(props);
};

const notionRepositoryFactory = (): IPostRepository => {
  const { apiToken, databaseId } = postConfig.database.notion;
  const client = new Client({ auth: apiToken });
  return new NotionRepository(client, factories.entity, databaseId);
};

const postServiceFactory = (): IPostService => {
  return new PostService(factories.repository());
};

const postRoutesFactory = (): FastifyPluginAsync => {
  return genPostRoutes(factories.service(), '/posts');
};

const repositoryMapping = {
  [DatabaseType.NOTION]: {
   factory: notionRepositoryFactory,
  },
};

const factories = {
  entity: postFactory,
  repository: repositoryMapping[postConfig.database.type].factory,
  service: postServiceFactory,
  routes: postRoutesFactory,
};

export const postModule = {
  routes: factories.routes(),
};
