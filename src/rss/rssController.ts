import { controllerErrorHandler } from '@common/errors';
import type { IRssService } from '@rss/types';
import type { FastifyPluginAsync } from 'fastify';

export const genRssRoutes = (rssService: IRssService, routePrefix: string): FastifyPluginAsync => {
  return (instance) => {
    instance.get(`${routePrefix}`, {
      handler: async (_, res) => {
        const callback = async () => {
          void res.header('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
          void res.header('Content-Type', 'application/xml');
          const feed = await rssService.getRss();
          await res.send(feed);
        };

        await controllerErrorHandler(res, callback);
      },
    });

    return Promise.resolve();
  };
};
