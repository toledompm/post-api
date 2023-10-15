import type { IIndex } from '@index/types';
import { createReadStream, appendFileSync } from 'fs';
import { appendFile } from 'fs/promises';
import split2 from 'split2';
import { Transform } from 'stream';
import { pipeline } from 'stream/promises';

export class FileIndex implements IIndex {
  constructor(private filePath: string) {
    // Create file if it doesn't exist
    appendFileSync(this.filePath, '');
  }

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

    await pipeline(createReadStream(this.filePath), split2(), keyMatches);

    return indexValue;
  }

  async set(key: string, value: string): Promise<void> {
    const lineContent = `${JSON.stringify({ [key]: value })}\n`;

    await appendFile(this.filePath, lineContent);
  }
}
