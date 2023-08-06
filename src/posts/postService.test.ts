import { PostService } from '@posts/postService';
import type { IPostInfo, IPostRepository } from '@posts/types';
import test from 'ava';
import sinon from 'sinon';

const fakeGetPosts = sinon.stub();
const fakeGetPostContent = sinon.stub();

const repositoryMock: IPostRepository = {
  getPosts: fakeGetPosts,
  getPostContent: fakeGetPostContent,
};

let postService: PostService;

test.beforeEach(() => {
  postService = new PostService(repositoryMock);
});

test('getPosts', async (t) => {
  const fakePosts: IPostInfo[] = [
    {
      id: '1',
      title: 'title',
      published: true,
      date: new Date(),
      tags: ['tag1', 'tag2'],
      slug: 'slug',
      tweet: 'this tweet is a short description of the post',
      imageUrl: 'https://image.com',
      imageAlt: 'image alt',
    },
  ];

  fakeGetPosts.resolves(fakePosts);

  const posts = await postService.getPosts({
    published: false,
    tags: [],
  });
  t.deepEqual(posts, fakePosts);

  t.assert(fakeGetPosts.calledOnceWith({
    published: false,
    tags: [],
  }));
});

test('getPostContent', async (t) => {
  const fakeContent = [
    {
      heading: 'heading',
    },
    {
      paragraph: 'paragraph',
    },
  ];

  fakeGetPostContent.resolves(fakeContent);

  const content = await postService.getPostContent('1');
  t.deepEqual(content, fakeContent);

  t.assert(fakeGetPostContent.calledOnceWith('1'));
});
