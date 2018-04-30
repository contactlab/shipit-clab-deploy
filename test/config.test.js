import test from 'ava';
import {merge, getReleasesPath, getCurrentPath} from '../lib/config';
import {CONFIG_KO, CONFIG_OK} from './_helpers';

test('merge()', t => {
  t.deepEqual(
    merge({deployTo: '/usr/share/nginx'}),
    {
      from: 'dist',
      deployTo: '/usr/share/nginx',
      releasesDir: 'releases',
      currentDir: 'current',
      keepReleases: 5
    },
    'should merge provided config with defaults'
  );

  t.deepEqual(
    merge({deployTo: '/usr/share/nginx', keepReleases: 2}),
    {
      from: 'dist',
      deployTo: '/usr/share/nginx',
      releasesDir: 'releases',
      currentDir: 'current',
      keepReleases: 2
    },
    'should merge provided config with defaults - override'
  );

  t.deepEqual(
    merge({deployTo: '/usr/share/nginx', extraKey: 'foo'}),
    {
      from: 'dist',
      deployTo: '/usr/share/nginx',
      releasesDir: 'releases',
      currentDir: 'current',
      extraKey: 'foo',
      keepReleases: 5
    },
    'should merge provided config with defaults - extend'
  );
});

test('getReleasesPath()', t => {
  t.is(getReleasesPath(CONFIG_OK), '/var/www/html/releases', 'should return `releases` dir path');

  t.throws(() => {
    getReleasesPath({deployTo: '/var/www/html'});
    getReleasesPath({});
  }, Error, 'should throw error if config is missing `deployTo` and `releasesDir` properties');

  t.throws(() => {
    getReleasesPath(CONFIG_KO);
  }, Error, 'should throw error if config is not valid');
});

test('getCurrentPath()', t => {
  t.is(getCurrentPath(CONFIG_OK), '/var/www/html/current', 'should return `current` dir path');

  t.throws(() => {
    getCurrentPath({deployTo: '/var/www/html'});
    getCurrentPath({});
  }, Error, 'should throw error if config is missing `deployTo` and `currentDir` properties');

  t.throws(() => {
    getCurrentPath(CONFIG_KO);
  }, Error, 'should throw error if config is not valid');
});
