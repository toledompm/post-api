import { appConfig } from '@common/config';
import { postModule } from '@posts/postModule';
import { genRssRoutes } from '@rss/rssController';
import { RssService } from '@rss/rssService';

const config = appConfig();

const rssService = new RssService(postModule.exports.postService, {
  host: config.server.host,
  title: config.post.rss.title,
  description: config.post.rss.description,
});

export const rssModule = {
  routes: genRssRoutes,
  exports: {
    rssService,
  },
};
