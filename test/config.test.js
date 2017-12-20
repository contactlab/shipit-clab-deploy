import test from 'ava';
import {isValid} from '../lib/config';

test('isValid()', t => {
  t.true(
    isValid({
      deployTo: '/var/www/html',
      releasesDir: 'releases'
    }),
    'should return T if config object is valid'
  );

  t.false(
    isValid({
      deployTo: '/var/www/html'
    }),
    'should return F if config object is not valid'
  );

  t.false(
    isValid(null),
    'should return F if config object is null'
  );

  t.false(
    isValid(undefined), // eslint-disable-line no-undefined
    'should return F if config object is undefined'
  );

  t.false(
    isValid({}),
    'should return F if config object is empty'
  );
});
