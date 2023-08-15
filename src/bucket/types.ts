import type { Readable } from 'stream';

export interface IImageBucketService {
  getBucketUrl(url: string): Promise<{ url: string, metaUrl: string }>;
}

export interface IBucket {
  head(objectKey: string): Promise<boolean>;
  put(objectKey: string, stream: Readable, contentLength: number): Promise<void>;
}
