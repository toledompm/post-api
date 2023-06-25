import { logger } from '@common/logger';
import type { IPostService } from '@posts/types';
import type { IRssService } from '@rss/types';
import xml from 'xml';

type FeedItem = {
  item: [
    { title: string },
    { pubDate: string },
    {
      guid: [
        { _attr: { isPermaLink: boolean } },
        string,
      ],
    },
    { description: { _cdata: string } },
    { link: string },
  ],
};

export class RssService implements IRssService {
  constructor(
    private postService: IPostService,
    private cfg: { host: string, title: string, description: string },
  ) {}

  async getRss(): Promise<string> {
    logger.info('Generating RSS feed');

    const feed = {
      rss: [
        {
          _attr: {
            version: '2.0',
            'xmlns:atom': 'http://www.w3.org/2005/Atom',
          },
        },
        {
          channel: [
            {
              'atom:link': {
                _attr: {
                  href: `${this.cfg.host}/feed.rss'`,
                  rel: 'self',
                  type: 'application/rss+xml',
                },
              },
            },
            { title: this.cfg.title },
            { link: `${this.cfg.host}/'` },
            { description: this.cfg.description },
            { language: 'en-US' },
            ... await this.buildFeedItems(),
          ],
        },
      ],
    };

    return `<?xml version="1.0" encoding="UTF-8"?>${xml(feed)}`;
  }

  private async buildFeedItems(): Promise<FeedItem[]> {
    const posts = await this.postService.getPosts({ published: true, tags: [] });

    const sortedPosts = posts.sort((first, second) => {
      return second.date.getTime() - first.date.getTime();
    });

    return sortedPosts.map((post) => {
      return {
        item: [
          { title: post.title },
          { pubDate: post.date.toUTCString() },
          {
            guid: [
              { _attr: { isPermaLink: true } },
              `${this.cfg.host}/${post.slug}/`,
            ],
          },
          { description: { _cdata: post.tweet } },
          { link: `${this.cfg.host}/${post.slug}/` },
        ],
      };
    });
  }
}
