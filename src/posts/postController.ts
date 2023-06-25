import { controllerErrorHandler } from '@common/errors';
import type { IPostService } from '@posts/types';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';

export const genPostRoutes = (postService: IPostService, routePrefix: string): FastifyPluginAsync => {
  return (instance) => {
    instance.get(`${routePrefix}`, {
      handler: async (
        req: FastifyRequest<{
          Querystring: { published: boolean; tag: string[] };
        }>,
        res,
      ) => {
        const callback = async () => {
          const { tag, published } = req.query;

          const filter = {
            published,
            tags: tag,
          };

          const posts = await postService.getPosts(filter);

          void res.header('Cache-Control', 'public, max-age=3600, stale-while-revalidate=1800');
          await res.send(posts);
        };

        await controllerErrorHandler(res, callback);
      },
      schema: {
        querystring: {
          type: 'object',
          properties: {
            published: {
              type: 'boolean',
              default: true,
            },
            tag: {
              type: 'array',
              default: [],
            },
          },
          required: [],
        },
      },
    });

    instance.get(`${routePrefix}/:pageID`, {
      handler: async (
        req:FastifyRequest<{
          Params: { pageID: string };
        }>,
        res,
      ) => {
        const callback = async () => {
          const post = await postService.getPostContent(req.params.pageID);

          void res.header('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
          await res.send(post);
        };

        await controllerErrorHandler(res, callback);
      },
      schema: {
        params: {
          type: 'object',
          properties: {
            pageID: {
              type: 'string',
            },
          },
          required: ['pageID'],
        },
      },
    });

    return Promise.resolve();
  };
};
