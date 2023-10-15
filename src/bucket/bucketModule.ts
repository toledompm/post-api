import { Bucket } from '@bucket/bucket';
import { ImageBucketService } from '@bucket/imageBucketService';
import { appConfig } from '@common/config';
import { FileIndex } from '@index/fileIndex';
import { common, objectstorage } from 'oci-sdk';

const provider = new common.ConfigFileAuthenticationDetailsProvider();

const ociObjectStorageClient = new objectstorage.ObjectStorageClient({
  authenticationDetailsProvider: provider,
});

const { imageBucket } = appConfig();

const bucket = new Bucket(
  ociObjectStorageClient,
  imageBucket.namespace,
  imageBucket.name,
);
const index = new FileIndex(imageBucket.index.filePath);
const imageBucketService = new ImageBucketService(bucket, index);

export const bucketModule = {
  exports: {
    imageBucketService,
  },
};
