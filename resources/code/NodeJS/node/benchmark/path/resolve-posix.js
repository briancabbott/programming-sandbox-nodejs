'use strict';
const common = require('../common.js');
const { posix } = require('path');

const bench = common.createBenchmark(main, {
  paths: [
    '',
    ['', ''].join('|'),
    ['foo/bar', '/tmp/file/', '..', 'a/../subfile'].join('|'),
    ['a/b/c/', '../../..'].join('|'),
  ],
  n: [1e5]
});

function main({ n, paths }) {
  const args = paths.split('|');
  const copy = [...args];
  const orig = copy[0];

  bench.start();
  for (let i = 0; i < n; i++) {
    if (i % 3 === 0) {
      copy[0] = `${orig}${i}`;
      posix.resolve(...copy);
    } else {
      posix.resolve(...args);
    }
  }
  bench.end(n);
}
