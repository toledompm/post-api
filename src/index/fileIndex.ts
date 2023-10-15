import type { IIndex } from '@index/types';
import { createReadStream } from 'fs';
import { appendFile } from 'fs/promises';
import split2 from 'split2';
import { Transform } from 'stream';
import { pipeline } from 'stream/promises';

export class FileIndex implements IIndex {
  constructor(private filePath: string) {}

  async get(key: string): Promise<string | null> {
    let indexValue = null;

    const keyMatches = new Transform({
      transform(chunk, _, done) {
        const lineObj: Record<string, any> = JSON.parse(
          chunk.toString() as string,
        );
        if (Object.keys(lineObj).includes(key)) indexValue = lineObj[key];
        done(null, null);
      },
    });

    try {
      await pipeline(createReadStream(this.filePath), split2(), keyMatches);
    } catch (err) {
      if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') {
        return indexValue;
      }

      throw err;
    }

    return indexValue;
  }

  async set(key: string, value: string): Promise<void> {
    const lineContent = `${JSON.stringify({ [key]: value })}\n`;

    await appendFile(this.filePath, lineContent);
  }
}
