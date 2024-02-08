import type { IImageBucketService } from '@bucket/types';
import { PostService } from '@posts/postService';
import type { IPostContent, IPostInfo, IPostRepository } from '@posts/types';
import test from 'ava';
import sinon from 'sinon';

const fakeGetPosts = sinon.stub();
const fakeGetPostContent = sinon.stub();

const fakeGetBucketUrl = sinon.stub();

const repositoryMock: IPostRepository = {
  getPosts: fakeGetPosts,
  getPostContent: fakeGetPostContent,
};

const bucketServiceMock: IImageBucketService = {
  getBucketUrl: fakeGetBucketUrl,
};

let postService: PostService;

test.beforeEach(() => {
  postService = new PostService(repositoryMock, bucketServiceMock);
});

test('getPosts', async (t) => {
  const fakeBucketImage = 'https://new-image.com';
  const fakePosts: IPostInfo[] = [
    {
      id: '1',
      title: 'title',
      published: true,
      date: new Date(),
      tags: ['tag1', 'tag2'],
      tweet: 'this tweet is a short description of the post',
      imageUrl: 'https://image.com',
      imageAlt: 'image alt',
    },
  ];

  const expectedPosts = [
    {
      ...fakePosts[0],
      imageUrl: fakeBucketImage,
    },
  ];

  fakeGetPosts.resolves(fakePosts);
  fakeGetBucketUrl.resolves(fakeBucketImage);

  const posts = await postService.getPosts({
    published: false,
    tags: [],
  });
  t.assert(t.deepEqual(posts, expectedPosts));

  t.assert(
    fakeGetPosts.calledOnceWith({
      published: false,
      tags: [],
    }),
  );
});

test('getPostContent', async (t) => {
  const fakeBucketImage = 'https://new-image.com';
  const fakeContent: IPostContent[] = [
    {
      heading: 'heading',
    },
    {
      paragraph: ['paragraph', { url: 'link', text: 'foo' }],
    },
    {
      image: {
        url: 'https://image.com',
        caption: 'caption',
      },
    },
  ];

  const expectedContent: IPostContent[] = [
    {
      heading: 'heading',
    },
    {
      paragraph: ['paragraph', { url: 'link', text: 'foo' }],
    },
    {
      image: {
        url: fakeBucketImage,
        caption: 'caption',
      },
    },
  ];

  fakeGetPostContent.resolves(fakeContent);
  fakeGetBucketUrl.resolves(fakeBucketImage);

  const content = await postService.getPostContent('1');

  t.assert(t.deepEqual(content, expectedContent));
  t.assert(fakeGetPostContent.calledOnceWith('1'));
});
