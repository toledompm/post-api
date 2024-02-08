require('module-alias/register');
import type { IPostInfo, IPostService } from '@posts/types';
import { RssService } from '@rss/rssService';
import test from 'ava';
import sinon from 'sinon';

const fakeGetPosts = sinon.stub();
const fakeGetPostContent = sinon.stub();

const postServiceMock: IPostService = {
  getPosts: fakeGetPosts,
  getPostContent: fakeGetPostContent,
};

const cfg = {
  host: 'host.com',
  title: 'RSS Title',
  description: 'RSS Description',
};

let rssService: RssService;

test.beforeEach(() => {
  rssService = new RssService(postServiceMock, cfg);
});

test('getRss', async (t) => {
  const fakePosts: IPostInfo[] = [
    {
      id: '10',
      title: 'post title',
      published: true,
      date: new Date(),
      tags: ['tag1', 'tag2'],
      tweet: 'this tweet is a short description of the post',
      imageUrl: 'https://image.com',
      imageAlt: 'image alt',
    },
  ];

  const expectedRss = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><atom:link href="${
    cfg.host
  }/feed.rss&apos;" rel="self" type="application/rss+xml"/><title>${
    cfg.title
  }</title><link>${cfg.host}/&apos;</link><description>${
    cfg.description
  }</description><language>en-US</language><item><title>${
    fakePosts[0].title
  }</title><pubDate>${fakePosts[0].date.toUTCString()}</pubDate><guid isPermaLink="true">${
    cfg.host
  }/${fakePosts[0].id}/</guid><description><![CDATA[${
    fakePosts[0].tweet
  }]]></description><link>${cfg.host}/${
    fakePosts[0].id
  }/</link></item></channel></rss>`;

  fakeGetPosts.resolves(fakePosts);

  const rss = await rssService.getRss();

  t.assert(t.deepEqual(rss, expectedRss));

  t.assert(
    fakeGetPosts.calledOnceWith({
      published: true,
      tags: [],
    }),
  );
});
