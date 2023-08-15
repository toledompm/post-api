import type { IBucket, IImageBucketService } from '@bucket/types';
import type { IIndex } from '@index/types';
import { Readable } from 'stream';

export class ImageBucketService implements IImageBucketService {
  constructor(private bucket: IBucket, private index: IIndex) {}

  async getBucketUrl(url: string): Promise<string> {
    const strippedUrl = stripUrl(url);

    const search = await this.index.get(strippedUrl);

    if (search) {
      return search;
    }

    const bucketKey = generateBucketKey(strippedUrl);

    if (!await this.bucket.head(bucketKey)) {
      await this.saveToBucket(url, bucketKey);
    }

    await this.index.set(strippedUrl, bucketKey);

    return bucketKey;
  }

  private async saveToBucket(url: string, bucketKey: string): Promise<void> {
    const { stream, contentLength } = await downloadImage(url);

    return this.bucket.put(bucketKey, stream, contentLength);
  }
}

function stripUrl(urlString: string): string {
  const url = new URL(urlString);
  return `${url.host}${url.pathname}`;
}

function generateBucketKey(stripedUrl: string): string {
  return `images/${stripedUrl.replaceAll('/', '-')}`;
}

async function downloadImage(url: string): Promise<{ stream: Readable, contentLength: number }> {
  const res = await fetch(url);

  if (!res.body) {
    throw new Error(`No response body when fetching image from ${url}`);
  }

  // stream/web.ReadableStream does not type match ReadableStream exactly, ignoring for now
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const stream = Readable.fromWeb(res.body);

  const contentLengthString = res.headers.get('content-length');

  if (!contentLengthString) {
    throw new Error(`Unknown content length from ${url}`);
  }

  const contentLength = Number(contentLengthString);

  return { stream, contentLength };
}
