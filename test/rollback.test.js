import test from 'ava';
import Shipit from 'shipit-cli';
import sinon from 'sinon';
import {CONFIG_KO, CONFIG_OK, initTaskWith} from './_helpers';
import rollback from '../tasks/rollback';

const handleLatestRelease = (path, oneDir) => command => {
  if (command.indexOf('ls -rd1 ') === 0) {
    return Promise.resolve([{stdout: `${path}/20171220120000`}]);
  }

  if (command.indexOf('find ') === 0 && !oneDir) {
    return Promise.resolve([{stdout: '3'}]);
  }

  if (command.indexOf('find ') === 0 && oneDir) {
    return Promise.resolve([{stdout: '1'}]);
  }

  return Promise.resolve();
}

test.beforeEach('mocking shipit', t => {
  const log = sinon.spy();
  const shipit = new Shipit({
    environment: 'test',
    log
  });

  t.context.log    = log;
  t.context.shipit = shipit;
});

test.afterEach(t => {
  t.context.remote.restore();
});

test.cb('rollback - success', t => {
  const {log, shipit} = t.context;

  t.context.remote = sinon.stub(shipit, 'remote').callsFake(handleLatestRelease('/var/www/html/releases', false));

  initTaskWith(shipit, CONFIG_OK, rollback);

  shipit.start('rollback', err => {
    if (err) {
      return t.end(err);
    }

    t.true(log.calledWithExactly('Rollbacking to previous release'), 'should log message');

    t.true(
      t.context.remote.calledWithExactly('find /var/www/html/releases/ -maxdepth 1 -mindepth 1 -type d | wc -l'),
      'should call a `count dirs` in releases folder command'
    );

    t.true(
      t.context.remote.calledWithExactly('ls -rd1 /var/www/html/releases/* | head -n 1'),
      'should call a `take latest` release command'
    );

    t.true(
      t.context.remote.calledWithExactly('rm -rf /var/www/html/releases/20171220120000'),
      'should call a `rm` latest release command'
    );

    t.true(
      t.context.remote.calledWithExactly('ls -rd1 /var/www/html/releases/* | head -n 1'),
      'should call a `take latest` release command'
    );

    t.true(
      t.context.remote.calledWithExactly('ln -nfs /var/www/html/releases/20171220120000 /var/www/html/current'),
      'should call a `symlink` remote command from latest release to current'
    );

    t.true(log.calledWithExactly('Rollbacked to release 20171220120000'), 'should log message');

    t.end();
  });
});

test.cb('rollback - success with defaults', t => {
  const {log, shipit} = t.context;

  t.context.remote = sinon.stub(shipit, 'remote').callsFake(handleLatestRelease('/usr/share/nginx/releases', false));

  initTaskWith(shipit, {deployTo: '/usr/share/nginx/'}, rollback);

  shipit.start('rollback', err => {
    if (err) {
      return t.end(err);
    }

    t.true(log.calledWithExactly('Rollbacking to previous release'), 'should log message');

    t.true(
      t.context.remote.calledWithExactly('find /usr/share/nginx/releases/ -maxdepth 1 -mindepth 1 -type d | wc -l'),
      'should call a `count dirs` in releases folder command'
    );

    t.true(
      t.context.remote.calledWithExactly('ls -rd1 /usr/share/nginx/releases/* | head -n 1'),
      'should call a `take latest` release command'
    );

    t.true(
      t.context.remote.calledWithExactly('rm -rf /usr/share/nginx/releases/20171220120000'),
      'should call a `rm` latest release command'
    );

    t.true(
      t.context.remote.calledWithExactly('ls -rd1 /usr/share/nginx/releases/* | head -n 1'),
      'should call a `take latest` release command'
    );

    t.true(
      t.context.remote.calledWithExactly('ln -nfs /usr/share/nginx/releases/20171220120000 /usr/share/nginx/current'),
      'should call a `symlink` remote command from latest release to current'
    );

    t.true(log.calledWithExactly('Rollbacked to release 20171220120000'), 'should log message');

    t.end();
  });
});

test.cb('rollback - fail if just 1 release', t => {
  const {shipit} = t.context;

  t.context.remote = sinon.stub(shipit, 'remote').callsFake(handleLatestRelease('/var/www/html/releases', true));

  initTaskWith(shipit, CONFIG_OK, rollback);

  shipit.start('rollback', err => {
    t.truthy(err, 'should throw error');
    t.is(err.message, 'Can\'t rollback if there is only 1 release', 'should throw specific error');
    t.end();
  });
});

test.cb('rollback - fail with wrong config', t => {
  const {shipit} = t.context;

  t.context.remote = sinon.stub(shipit, 'remote').callsFake(handleLatestRelease('/var/www/html/releases', false));

  initTaskWith(shipit, CONFIG_KO, rollback);

  shipit.start('rollback', err => {
    t.truthy(err, 'should throw error');
    t.end();
  });
});
