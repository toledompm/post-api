require('module-alias/register');
import type { Client } from '@notionhq/client';
import type {
  ListBlockChildrenResponse,
  PageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { NotionRepository } from '@posts/notionRepository';
import type { IPostContent, IPostInfo } from '@posts/types';
import test from 'ava';
import Sinon from 'sinon';

let notionRepository: NotionRepository;

const DATABASE_ID = 'mydbid';
let notionClientDatabasesQueryStub: Sinon.SinonStub;
let notionClientBlocksChildrenListStub: Sinon.SinonStub;

test.beforeEach(async () => {
  const postContentFactory = (props: Partial<IPostContent>) => ({
    heading: (props as any).heading,
    paragraph: (props as any).paragraph,
  });

  const postInfoFactory = (props: Partial<IPostInfo>) => ({
    title: props.title || '',
    published: props.published || false,
    tags: props.tags || [],
    id: props.id || '',
    date: new Date('2021-01-01'),
    tweet: props.tweet || '',
    imageUrl: props.imageUrl || '',
    imageAlt: props.imageAlt || '',
  });

  notionClientBlocksChildrenListStub = Sinon.stub();
  notionClientDatabasesQueryStub = Sinon.stub();
  const notionClientMock = {
    databases: { query: notionClientDatabasesQueryStub },
    blocks: { children: { list: notionClientBlocksChildrenListStub } },
  };

  notionRepository = new NotionRepository(
    notionClientMock as unknown as Client,
    postInfoFactory,
    postContentFactory,
    DATABASE_ID,
  );

  await Promise.resolve();
});

test('getPosts', async (t) => {
  const dateString = '2021-01-01T00:00:00.000Z';
  const mockPageResponse: PageObjectResponse = {
    public_url: 'url',
    icon: null,
    cover: null,
    created_by: { id: 'null', object: 'user' },
    last_edited_by: { id: 'null', object: 'user' },
    object: 'page',
    id: '1',
    created_time: '2021-01-01',
    last_edited_time: '2021-01-01',
    parent: {
      type: 'database_id',
      database_id: DATABASE_ID,
    },
    archived: false,
    properties: {
      Title: {
        id: '1',
        type: 'title',
        title: [
          {
            type: 'text',
            text: {
              content: 'title test',
              link: null,
            },
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: 'default',
            },
            plain_text: 'title test',
            href: null,
          },
        ],
      },
      Published: {
        id: '2',
        type: 'checkbox',
        checkbox: true,
      },
      Tags: {
        id: '3',
        type: 'multi_select',
        multi_select: [
          {
            id: '1',
            name: 'tag1',
            color: 'default',
          },
          {
            id: '2',
            name: 'tag2',
            color: 'default',
          },
        ],
      },
      Id: {
        id: '%5B%3E%3Fn',
        type: 'rich_text',
        rich_text: [
          {
            type: 'text',
            text: {
              content: 'post-id',
              link: null,
            },
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: 'default',
            },
            plain_text: 'post-id',
            href: null,
          },
        ],
      },
      Date: {
        id: '4',
        type: 'date',
        date: {
          time_zone: 'Europe/Paris',
          start: dateString,
          end: null,
        },
      },
      Tweet: {
        id: '%5B%3E%3Fn',
        type: 'rich_text',
        rich_text: [
          {
            type: 'text',
            text: {
              content: 'This is a tweet that brifely describes the post.',
              link: null,
            },
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: 'default',
            },
            plain_text: 'This is a tweet that brifely describes the post.',
            href: null,
          },
        ],
      },
      ImageURL: {
        id: '%5B%3E%3Fn',
        type: 'rich_text',
        rich_text: [
          {
            type: 'text',
            text: {
              content: '/placeholder.png',
              link: null,
            },
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: 'default',
            },
            plain_text: '/placeholder.png',
            href: null,
          },
        ],
      },
      ImageAlt: {
        id: '%5B%3E%3Fn',
        type: 'rich_text',
        rich_text: [
          {
            type: 'text',
            text: {
              content: 'Some image alt',
              link: null,
            },
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: 'default',
            },
            plain_text: 'Some image alt',
            href: null,
          },
        ],
      },
    },
    url: 'url',
  };

  notionClientDatabasesQueryStub.resolves({ results: [mockPageResponse] });
  const posts = await notionRepository.getPosts({
    published: false,
    tags: ['tag1', 'tag2'],
  });

  t.assert(
    t.deepEqual(posts, [
      {
        id: 'post-id',
        title: 'title test',
        published: true,
        date: new Date(dateString),
        tags: ['tag1', 'tag2'],
        tweet: 'This is a tweet that brifely describes the post.',
        imageUrl: '/placeholder.png',
        imageAlt: 'Some image alt',
      },
    ]),
  );

  t.assert(
    t.deepEqual(notionClientDatabasesQueryStub.getCalls()[0].firstArg, {
      database_id: DATABASE_ID,
      filter: {
        and: [
          {
            property: 'Published',
            checkbox: {
              equals: false,
            },
          },
          {
            property: 'Tags',
            multi_select: {
              contains: 'tag1',
            },
          },
          {
            property: 'Tags',
            multi_select: {
              contains: 'tag2',
            },
          },
        ],
      },
    }),
  );
});

test('getPostContent', async (t) => {
  const mockPartialPageResponse: Partial<PageObjectResponse> = {
    id: 'someid',
  };

  const mockListObjectPageResponse: ListBlockChildrenResponse = {
    type: 'block',
    has_more: false,
    block: {},
    next_cursor: null,
    object: 'list',
    results: [
      {
        object: 'block',
        id: '1',
        type: 'heading_1',
        heading_1: {
          is_toggleable: false,
          color: 'default',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'TEST TITLE',
                link: null,
              },
              plain_text: 'TEST TITLE',
              href: null,
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
            },
          ],
        },
      },
      {
        object: 'block',
        id: '2',
        type: 'paragraph',
        paragraph: {
          color: 'default',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'This is a text paragraph',
                link: null,
              },
              plain_text: 'This is a text paragraph',
              href: null,
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
            },
            {
              type: 'text',
              text: {
                content: 'This is a link block in a paragraph',
                link: { url: 'https://example.com' },
              },
              plain_text: 'This is a link block in a paragraph',
              href: 'https://example.com',
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
            },
            {
              type: 'text',
              text: {
                content: 'This is the rest of the paragraph',
                link: null,
              },
              plain_text: 'This is the rest of the paragraph',
              href: null,
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
            },
          ],
        },
      },
    ],
  };

  notionClientBlocksChildrenListStub.resolves(mockListObjectPageResponse);

  notionClientDatabasesQueryStub.resolves({
    results: [mockPartialPageResponse],
  });

  const postID = 'somepostid';
  const postContent = await notionRepository.getPostContent(postID);

  t.assert(
    t.deepEqual(postContent, [
      {
        heading: 'TEST TITLE',
        paragraph: undefined,
      },
      {
        heading: undefined,
        paragraph: [
          'This is a text paragraph',
          {
            url: 'https://example.com',
            text: 'This is a link block in a paragraph',
          },
          'This is the rest of the paragraph',
        ],
      },
    ]),
  );

  t.assert(
    t.deepEqual(notionClientBlocksChildrenListStub.getCalls()[0].firstArg, {
      block_id: mockPartialPageResponse.id,
    }),
  );

  t.assert(
    t.deepEqual(notionClientDatabasesQueryStub.getCalls()[0].firstArg, {
      database_id: DATABASE_ID,
      filter: {
        and: [
          {
            property: 'Id',
            rich_text: {
              equals: postID,
            },
          },
        ],
      },
    }),
  );
});
