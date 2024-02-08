import { FileIndex } from '@index/fileIndex';
import test from 'ava';
import { existsSync } from 'fs';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';

const testFilePath = './tmp/index.txt';
let fileIndex: FileIndex;

test.beforeEach(async () => {
  fileIndex = new FileIndex(testFilePath);

  if (!existsSync('./tmp')) {
    await mkdir('./tmp');
  }
});

test.afterEach(async () => {
  await rm('./tmp', { recursive: true, force: true });
});

test('get', async (t) => {
  const fakeIndexEntry = { foo: 'bar' };
  await writeFile(testFilePath, JSON.stringify(fakeIndexEntry));

  const getResult = await fileIndex.get(Object.keys(fakeIndexEntry)[0]);

  t.assert(t.deepEqual(getResult, fakeIndexEntry.foo));
});

test('set', async (t) => {
  const fakeIndexEntry = { baz: 'xyz' };
  await fileIndex.set('baz', 'xyz');

  const file = (await readFile(testFilePath)).toString();

  t.assert(t.deepEqual(JSON.parse(file), fakeIndexEntry));
});
