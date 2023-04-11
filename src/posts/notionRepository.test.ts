import { Client } from '@notionhq/client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { NotionRepository } from '@posts/notionRepository';
import { IPost } from '@posts/types';
import test from 'ava';
import Sinon from 'sinon';

let notionRepository: NotionRepository;
let notionClientDatabasesQueryStub: Sinon.SinonStub;

test.beforeEach(() => {
  const postFactory = (props: Partial<IPost>) => ({
    id: '1',
    title: 'title',
    body: 'body',
    published: true,
    date: new Date(),
    tags: ['tag1', 'tag2'],
    ...props,
  });

  notionClientDatabasesQueryStub = Sinon.stub();
  const notionClientMock = { databases: { query: notionClientDatabasesQueryStub } };
  notionRepository = new NotionRepository(notionClientMock as unknown as Client, postFactory, '1');
});

test('getPosts', async (t) => {
  const mockPageResponse: PageObjectResponse = {
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
      database_id: '1',
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
    },
    url: 'url',
  };

  notionClientDatabasesQueryStub.resolves({ results: [mockPageResponse] });

  const posts = await notionRepository.getPosts({
    published: false,
    tags: ['tag1', 'tag2'],
  });

  t.deepEqual(posts, [
    {
      id: '1',
      title: 'title test',
      body: 'string',
      published: true,
      date: new Date(),
      tags: ['tag1', 'tag2'],
    },
  ]);

  t.assert(notionClientDatabasesQueryStub.calledOnceWith({
    database_id: '1',
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
  }));
});
