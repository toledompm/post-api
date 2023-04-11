import { PostService } from '@posts/postService';
import { IPost, IPostRepository } from '@posts/types';
import test from 'ava';
import sinon from 'sinon';

const fakeGetPosts = sinon.stub();

const repositoryMock: IPostRepository = {
  getPosts: fakeGetPosts,
};

let postService: PostService;

test.beforeEach(() => {
  postService = new PostService(repositoryMock);
});

test('getPosts', async (t) => {
  const fakePosts: IPost[] = [
    {
      id: '1',
      title: 'title',
      body: 'body',
      published: true,
      date: new Date(),
      tags: ['tag1', 'tag2'],
    },
  ];

  fakeGetPosts.resolves(fakePosts);

  const posts = await postService.getPosts({
    published: false,
    tags: [],
  });
  t.deepEqual(posts, fakePosts);
});
