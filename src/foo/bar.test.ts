import test from 'ava';
import { msg } from '@foo/bar';

test('msg', (t) => {
  t.deepEqual(msg, 'Hello World');
});
