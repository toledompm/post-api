import type { IBucket } from '@bucket/types';
import type { objectstorage } from 'oci-sdk';
import { OciError } from 'oci-sdk';
import type { Readable } from 'stream';

export class Bucket implements IBucket {
  constructor(
    private ociObjectStorageClient: objectstorage.ObjectStorageClient,
    private bucketNamespace: string,
    private bucketName: string,
  ) {}

  async head(objectName: string): Promise<boolean> {
    const headObjectRequest: objectstorage.requests.HeadObjectRequest = {
      namespaceName: this.bucketNamespace,
      bucketName: this.bucketName,
      objectName,
    };

    try {
      const response =
        await this.ociObjectStorageClient.headObject(headObjectRequest);

      return response.versionId !== null;
    } catch (error) {
      if (error instanceof OciError && error.statusCode === 404) {
        return false;
      }

      throw error;
    }
  }

  async put(
    objectName: string,
    putObjectBody: Readable,
    contentLength: number,
  ): Promise<void> {
    const putObjectRequest: objectstorage.requests.PutObjectRequest = {
      namespaceName: this.bucketNamespace,
      bucketName: this.bucketName,
      putObjectBody,
      contentLength,
      objectName,
    };

    await this.ociObjectStorageClient.putObject(putObjectRequest);
  }
}
