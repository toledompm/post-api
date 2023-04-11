import { IPostService } from '@posts/types';
import { FastifyPluginAsync, FastifyRequest } from 'fastify';

export const genPostRoutes = (postService: IPostService, routePrefix: string): FastifyPluginAsync => {
  return (instance) => {
    instance.get(`${routePrefix}`, {
      handler: async (
        req: FastifyRequest<{
          Querystring: { published: boolean; tag: string[] };
        }>,
        res,
      ) => {
        const filter = {
          published: req.query.published,
          tags: req.query.tag,
        };

        const posts = await postService.getPosts(filter);
        await res.send(posts);
      },
      schema: {
        querystring: {
          type: 'object',
          properties: {
            published: {
              type: 'boolean',
            },
            tag: {
              type: 'array',
            },
          },
        },
      },
    });

    return Promise.resolve();
  };
};
