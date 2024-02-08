require('module-alias/register');
import { ImageBucketService } from '@bucket/imageBucketService';
import test from 'ava';
import Sinon from 'sinon';
import { Readable } from 'stream';

const mockBucket = {
  head: Sinon.stub(),
  put: Sinon.stub(),
};

const mockIndex = {
  get: Sinon.stub(),
  set: Sinon.stub(),
};

let imageBucketService: ImageBucketService;

test.beforeEach(() => {
  mockIndex.get.reset();
  mockIndex.set.reset();

  mockBucket.head.reset();
  mockBucket.put.reset();

  imageBucketService = new ImageBucketService(mockBucket, mockIndex);
});

test('getBucketURL - indexed image', async (t) => {
  const mockURL = 'https://image.com/my-image';
  const mockStrippedURL = 'image.com/my-image';
  const expectedImageBucketResponse = 'images/image.com-my-image';

  mockIndex.get.resolves(expectedImageBucketResponse);
  const imageBucketResponse = await imageBucketService.getBucketUrl(mockURL);

  t.assert(t.deepEqual(imageBucketResponse, expectedImageBucketResponse));
  t.assert(mockIndex.get.calledOnceWith(mockStrippedURL));
});

test('getBucketURL - non-indexed image', async (t) => {
  const mockURL = 'https://image.com/my-image';
  const mockStrippedURL = 'image.com/my-image';
  const expectedImageBucketResponse = 'images/image.com-my-image';

  mockIndex.get.resolves(null);
  mockBucket.head.resolves(true);
  mockIndex.set.resolves();
  const bucketPrefix = await imageBucketService.getBucketUrl(mockURL);

  t.assert(t.deepEqual(bucketPrefix, expectedImageBucketResponse));
  t.assert(mockIndex.get.calledOnceWith(mockStrippedURL));
  t.assert(mockBucket.head.calledOnceWith(expectedImageBucketResponse));

  t.assert(
    mockIndex.set.calledOnceWith(mockStrippedURL, expectedImageBucketResponse),
  );
});

test('getBucketURL - non-published image', async (t) => {
  const mockURL = 'https://fastly.picsum.photos/id/866/20/20.jpg';
  const mockStrippedURL = 'fastly.picsum.photos/id/866/20/20.jpg';
  const expectedImageBucketResponse =
    'images/fastly.picsum.photos-id-866-20-20.jpg';

  mockIndex.get.resolves(null);
  mockBucket.head.resolves(false);
  mockBucket.put.resolves();
  mockIndex.set.resolves();
  const bucketPrefix = await imageBucketService.getBucketUrl(mockURL);

  t.assert(t.deepEqual(bucketPrefix, expectedImageBucketResponse));
  t.assert(mockIndex.get.calledOnceWith(mockStrippedURL));
  t.assert(mockBucket.head.calledOnceWith(expectedImageBucketResponse));

  t.assert(
    mockBucket.put.calledWith(
      expectedImageBucketResponse,
      Sinon.match(Readable),
      19,
    ),
  );

  t.assert(
    mockIndex.set.calledOnceWith(mockStrippedURL, expectedImageBucketResponse),
  );
});
