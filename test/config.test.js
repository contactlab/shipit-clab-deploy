import test from 'ava';
import {isValid, getReleasesPath, getCurrentPath} from '../lib/config';

const CONFIG_OK = {
  from: './dist',
  deployTo: '/var/www/html',
  releasesDir: 'releases',
  currentDir: 'current',
  keepReleases: 10
};

const CONFIG_MISSING = {
  deployTo: '/var/www/html'
};

const CONFIG_INVALID = {
  from: 123,
  deployTo: '/var/www/html',
  releasesDir: false,
  currentDir: true,
  keepReleases: 1
};

test('isValid()', t => {
  t.true(isValid(CONFIG_OK), 'should return T if config object is valid');

  t.false(isValid(CONFIG_MISSING), 'should return F if config object has not all required keys');

  t.false(isValid(CONFIG_INVALID), 'should return F if config object is not valid');

  t.false(isValid(null), 'should return F if config object is null');

  t.false(isValid(), 'should return F if config object is undefined');

  t.false(isValid({}), 'should return F if config object is empty');
});

test('getReleasesPath()', t => {
  t.is(getReleasesPath(CONFIG_OK), '/var/www/html/releases', 'should return `releases` dir path');

  t.is(
    getReleasesPath({deployTo: '/var/www/html'}),
    '/var/www/html/releases',
    'should return `releases` dir path - default'
  );

  t.throws(() => {
    getReleasesPath({});
  }, Error, 'should throw error if config is missing `deployTo` property');

  t.throws(() => {
    getReleasesPath(CONFIG_INVALID);
  }, Error, 'should throw error if config is not valid');
});

test('getCurrentPath()', t => {
  t.is(getCurrentPath(CONFIG_OK), '/var/www/html/current', 'should return `current` dir path');

  t.is(
    getCurrentPath({deployTo: '/var/www/html'}),
    '/var/www/html/current',
    'should return `current` dir path - default'
  );

  t.throws(() => {
    getCurrentPath({});
  }, Error, 'should throw error if config is missing `deployTo` property');

  t.throws(() => {
    getCurrentPath(CONFIG_INVALID);
  }, Error, 'should throw error if config is not valid');
});
