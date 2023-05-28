import { NotFoundError } from '@common/errors';
import { logger } from '@common/logger';
import { IPostService } from '@posts/types';
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';

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

        await postControllerErrorHandler(res, callback);
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

        await postControllerErrorHandler(res, callback);
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

const postControllerErrorHandler = async(res: FastifyReply, callback: () => Promise<void>) => {
  try {
    await callback();
  } catch (error) {
    logger.error('Error during request', error as Error);

    if (error instanceof NotFoundError) {
      await res.status(404).send({ message: error.message });
    } else {
      await res.status(500).send({ message: 'Internal server error.' });
    }
  }
};
