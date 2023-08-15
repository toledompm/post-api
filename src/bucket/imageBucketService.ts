import type { IBucket, IImageBucketService } from '@bucket/types';
import type { IIndex } from '@index/types';
import { Readable } from 'stream';

export class ImageBucketService implements IImageBucketService {
  constructor(private bucket: IBucket, private index: IIndex) {}

  async getBucketUrl(url: string): Promise<{ url: string, metaUrl: string }> {
    const strippedUrl = stripUrl(url);

    const search = await this.index.get(strippedUrl);

    if (search) {
      return { url: search, metaUrl: generateMetaFileName(search) };
    }

    const bucketKey = generateBucketKey(strippedUrl);
    const metaFileBucketKey = generateMetaFileName(bucketKey);

    if (!await this.bucket.head(bucketKey)) {
      await this.saveToBucket(url, bucketKey, metaFileBucketKey);
    }

    await this.index.set(strippedUrl, bucketKey);

    return { url: bucketKey, metaUrl: metaFileBucketKey };
  }

  private async saveToBucket(url: string, bucketKey: string, metaFileBucketKey: string): Promise<void[]> {
    const { stream, contentLength, extension } = await downloadImage(url);

    const imageMetadata = { extension };
    const imageMetadataBuffer = Buffer.from(JSON.stringify(imageMetadata));
    const imageMetadataBufferReadable = Readable.from(imageMetadataBuffer);

    return Promise.all([
      this.bucket.put(metaFileBucketKey, imageMetadataBufferReadable, imageMetadataBuffer.length),
      this.bucket.put(bucketKey, stream, contentLength),
    ]);
  }
}

function stripUrl(urlString: string): string {
  const url = new URL(urlString);
  return `${url.host}${url.pathname}`;
}

function generateBucketKey(stripedUrl: string): string {
  return `images/${stripedUrl.replaceAll('/', '-')}`;
}

function generateMetaFileName(fileName: string): string {
  return `${fileName}.meta`;
}

async function downloadImage(url: string): Promise<{ stream: Readable, contentLength: number, extension: string }> {
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

  const contentTypeString = res.headers.get('content-type');

  let extension = '';

  if (contentTypeString === 'image/jpeg') {
    extension = '.jpeg';
  } else if (contentTypeString === 'image/png') {
    extension = '.png';
  }

  return { stream, contentLength, extension };
}
