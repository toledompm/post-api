import type { Readable } from 'stream';

export interface IImageBucketService {
  getBucketUrl(url: string): Promise<string>;
}

export interface IBucket {
  head(objectKey: string): Promise<boolean>;
  put(objectKey: string, stream: Readable, contentLength: number): Promise<void>;
}
