import test from 'ava';
import Shipit from 'shipit-cli';
import sinon from 'sinon';
import deploy from '../tasks/deploy';

test.beforeEach('mocking shipit', t => {
  const log = sinon.spy();
  const shipit = new Shipit({
    environment: 'test',
    log
  });

  deploy(shipit);

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

test.cb('task - deploy', t => {
  const {log, shipit} = t.context;

  shipit.start('deploy', err => {
    if (err) {
      return t.end(err);
    }

    t.true(log.calledWithExactly('DEPLOY'));
    t.end();
  });
});
