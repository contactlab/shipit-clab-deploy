import test from 'ava';
import {mkdir, symlink, keepLastOf, revision, countDirs, rm, takeLatest, gitRev} from '../lib/commands';

test('mkdir()', t => {
  t.is(
    mkdir('/var/www/html/releases/20171217120000'),
    'mkdir -p /var/www/html/releases/20171217120000',
    'should return a make dir command'
  );

  t.is(
    mkdir(20171217120000),
    'mkdir -p 20171217120000',
    'should return a create dir command - even with a number'
  );

  t.throws(() => {
    mkdir(['20171217120000']);
  }, TypeError, 'should throw error if path is neither string nor number');
});

test('symlink()', t => {
  t.is(
    symlink('/var/www/html/releases/20171217120000', '/var/www/html/current'),
    'ln -nfs /var/www/html/releases/20171217120000 /var/www/html/current',
    'should return a symlink command'
  );

  t.is(
    symlink(20171217120000, 123),
    'ln -nfs 20171217120000 123',
    'should return a symlink command - even with a number'
  );

  t.throws(() => {
    symlink(['20171217120000'], ['123']);
    symlink(null, '/var/www');
    symlink('/var/www', null);
    symlink('/var/www');
  }, TypeError, 'should throw error if paths are neither string nor number');
});

test('keepLastOf()', t => {
  t.is(
    keepLastOf(10, '/var/www/html/releases'),
    'ls -d1 /var/www/html/releases/* | sort -n | head -n -10 | xargs rm -rf',
    'should return a command which lists folder in path, sorts them, keeps the last 10 and deletes the others'
  );

  t.is(
    keepLastOf(2, '/var/www/html/releases'),
    'ls -d1 /var/www/html/releases/* | sort -n | head -n -2 | xargs rm -rf',
    'should return a command which lists folder in path, sorts them, keeps the last 2 and deletes the others'
  );

  t.is(
    keepLastOf(2, '/var/www/html/releases/'),
    'ls -d1 /var/www/html/releases/* | sort -n | head -n -2 | xargs rm -rf',
    'should trim trailing `/` in path'
  );

  t.is(
    keepLastOf(2, 20171217120000),
    'ls -d1 20171217120000/* | sort -n | head -n -2 | xargs rm -rf',
    'should work even with number'
  );

  t.throws(() => {
    keepLastOf('10', '/var/www/html/releases');
    symlink(null, '/var/www/html/releases');
    symlink('/var/www/html/releases');
  }, TypeError, 'should throw error if `n` is not a number');

  t.throws(() => {
    keepLastOf(10, ['/var/www/html/releases']);
    symlink(10, null);
    symlink(10);
  }, TypeError, 'should throw error if `path` is neither number nor string');
});

test('revision()', t => {
  t.is(
    revision('/var/www/html/releases/20171217120000', 'abcd1234'),
    'echo "abcd1234" > /var/www/html/releases/20171217120000/REVISION',
    'should return a command which creates a REVISION file under `path` with `hash` as content'
  );

  t.is(
    revision('/var/www/html/releases/20171217120000/', 'abcd1234'),
    'echo "abcd1234" > /var/www/html/releases/20171217120000/REVISION',
    'should trim trailing `/` in path'
  );

  t.is(
    revision(20171217120000, 'abcd1234'),
    'echo "abcd1234" > 20171217120000/REVISION',
    'should return a command which creates a REVISION file under `path` with `hash` as content - even with number'
  );

  t.throws(() => {
    revision(['20171217120000'], 'abcd1234');
    revision(null, 'abcd1234');
  }, TypeError, 'should throw error if `path` is neither number nor string');

  t.throws(() => {
    revision('20171217120000', '');
    revision('20171217120000', 123);
    revision('20171217120000', null);
    revision('20171217120000');
  }, TypeError, 'should throw error if `hash` is neither string nor empty');
});

test('countDirs()', t => {
  t.is(
    countDirs('/var/www/html/releases'),
    'find /var/www/html/releases/ -maxdepth 1 -type d | wc -l',
    'should return a command which counts sub-directories under `path`'
  );

  t.is(
    countDirs('/var/www/html/releases/'),
    'find /var/www/html/releases/ -maxdepth 1 -type d | wc -l',
    'should trim trailing `/` in path'
  );

  t.is(
    countDirs(20171217120000),
    'find 20171217120000/ -maxdepth 1 -type d | wc -l',
    'should return a command which counts sub-directories under `path` - even with number'
  );

  t.throws(() => {
    revision(['20171217120000']);
    revision(null);
    revision();
  }, TypeError, 'should throw error if `path` is neither string nor number');
});

test('rm()', t => {
  t.is(
    rm('/var/www/html/releases'),
    'rm -rf /var/www/html/releases',
    'should return a `rm` command'
  );

  t.is(
    rm(20171217120000),
    'rm -rf 20171217120000',
    'should return a `rm` command - even with number'
  );

  t.throws(() => {
    revision(['20171217120000']);
    revision(null);
    revision();
  }, TypeError, 'should throw error if `path` is neither string nor number');
});

test('takeLatest()', t => {
  t.is(
    takeLatest('/var/www/html/releases'),
    'ls -rd1 /var/www/html/releases/* | head -n 1',
    'should return a command which take the latest sub-directory in `path`'
  );

  t.is(
    takeLatest('/var/www/html/releases/'),
    'ls -rd1 /var/www/html/releases/* | head -n 1',
    'should trim trailing `/` in `path`'
  );

  t.is(
    takeLatest(20171217120000),
    'ls -rd1 20171217120000/* | head -n 1',
    'should return a command which take the latest sub-directory in `path` - even with number'
  );

  t.throws(() => {
    takeLatest(['20171217120000']);
    takeLatest(null);
    takeLatest();
  }, TypeError, 'should throw error if `path` is neither string nor number');
});

test('gitRev()', t => {
  t.is(gitRev('master'), 'git rev-parse master', 'should return a command which gets the last commit hash in `branch`');

  t.is(gitRev('dev'), 'git rev-parse dev', 'should return a command which gets the last commit hash in `branch`');

  t.throws(() => {
    gitRev(1);
    gitRev('');
    gitRev(null);
    gitRev();
  }, TypeError, 'should throw error if `branch` is not string or is empty');
});
