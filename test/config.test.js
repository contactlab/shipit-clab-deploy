import test from 'ava';
import {getReleasesPath, getCurrentPath} from '../lib/config';
import {CONFIG_KO, CONFIG_OK} from './_helpers';

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
    getReleasesPath(CONFIG_KO);
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
    getCurrentPath(CONFIG_KO);
  }, Error, 'should throw error if config is not valid');
});
