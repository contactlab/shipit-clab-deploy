import test from 'ava';
import Shipit from 'shipit-cli';
import sinon from 'sinon';
import rollback from '../tasks/rollback';

test.beforeEach('mocking shipit', t => {
  const log = sinon.spy();
  const shipit = new Shipit({
    environment: 'test',
    log
  });

  rollback(shipit);

  shipit.initConfig({
    test: {
      deployTo    : '/var/www/html',
      releasesDir : 'releases',
      currentDir  : 'current',
      keepReleases: 10
    }
  });

  t.context.log = log;
  t.context.shipit = shipit;
});

// test.afterEach(t => {
//   // t.context.log.
// });

test.cb('task - rollback', t => {
  const {log, shipit} = t.context;

  shipit.start('rollback', err => {
    if (err) {
      return t.end(err);
    }

    t.true(log.calledWithExactly('ROLLBACK'));
    t.end();
  });
});
