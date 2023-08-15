const parsePortEnv = (env: string | undefined, defaultValue: number) => {
  if (env === undefined) {
    return defaultValue;
  }

  const parsed = parseInt(env, 10);

  if (isNaN(parsed)) {
    throw new Error(`[config] Invalid port: ${env}`);
  }

  return parsed;
};

export enum DatabaseType {
  NOTION,
}

const parseDatabaseTypeEnv = (env: string | undefined, defaultValue: DatabaseType) => {
  if (env === undefined) {
    return defaultValue;
  }

  if (env === 'NOTION') {
    return DatabaseType.NOTION;
  }

  throw new Error(`[config] Invalid database type: ${env}`);
};

export const appConfig = () => ({
  server: {
    host: process.env.HOST || 'localhost',
    port: parsePortEnv(process.env.PORT, 3030),
  },
  imageBucket: {
    namespace: process.env.IMAGE_BUCKET_NAMESPACE || 'aaaaa',
    name: process.env.IMAGE_BUCKET_NAME || 'some-bucket-name',
    index: {
      file_path: process.env.IMAGE_INDEX_FILE_PATH || './tmp/index.txt',
    },
  },
  post: {
    rss: {
      title: process.env.RSS_TITLE || '',
      description: process.env.RSS_DESCRIPTION || '',
    },
    database: {
      type: parseDatabaseTypeEnv(process.env.DATABASE_TYPE, DatabaseType.NOTION),
      notion: {
        databaseId: process.env.NOTION_DATABASE_ID || '',
        apiToken: process.env.NOTION_API_TOKEN || '',
      },
    },
  },
});
