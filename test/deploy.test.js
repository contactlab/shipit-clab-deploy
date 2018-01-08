import test from 'ava';
import Shipit from 'shipit-cli';
import sinon from 'sinon';
import deploy from '../tasks/deploy';
import {CONFIG_OK, CONFIG_KO, initTaskWith} from './_helpers';

const handleCommitHash = command =>
  command.indexOf('git rev-parse') === 0 ?
    Promise.resolve({stdout: '9d63d4\n'}) :
    Promise.resolve();

test.beforeEach('mocking shipit', t => {
  const log = sinon.spy();
  const shipit = new Shipit({
    environment: 'test',
    log
  });

  t.context.log        = log;
  t.context.shipit     = shipit;
  t.context.local      = sinon.stub(shipit, 'local').callsFake(handleCommitHash);
  t.context.remote     = sinon.stub(shipit, 'remote').resolves();
  t.context.remoteCopy = sinon.stub(shipit, 'remoteCopy').resolves();
  t.context.clock      = sinon.useFakeTimers(Date.UTC(2017, 11, 20, 12, 0, 0));
});

test.afterEach(t => {
  t.context.local.restore();
  t.context.remote.restore();
  t.context.remoteCopy.restore();
  t.context.clock.restore();
});

test.cb('deploy - success', t => {
  const {log, shipit, local, remote, remoteCopy} = t.context;

  initTaskWith(shipit, CONFIG_OK, deploy);

  shipit.start('deploy', err => {
    if (err) {
      return t.end(err);
    }

    t.true(log.calledWithExactly('Deploy to /var/www/html/releases/20171220120000'), 'should log message');

    t.true(
      remote.calledWithExactly('mkdir -p /var/www/html/releases/20171220120000'),
      'should call a `mkdir release` remote command'
    );

    t.true(
      remoteCopy.calledWithExactly('./dist/', '/var/www/html/releases/20171220120000'),
      'should call a `remoteCopy dist -> release` command'
    );

    t.true(
      local.calledWithExactly('git rev-parse @'),
      'should call a `git rev` local command'
    );

    t.true(
      remote.calledWithExactly('echo "9d63d4" > /var/www/html/releases/20171220120000/REVISION'),
      'should call a `revision` remote command with local commit hash'
    );

    t.true(
      remote.calledWithExactly('ln -nfs /var/www/html/releases/20171220120000 /var/www/html/current'),
      'should call a `symlink` remote command from releases to current'
    );

    t.true(
      remote.calledWithExactly('ls -d1 /var/www/html/releases/* | sort -n | head -n -10 | xargs rm -rf'),
      'should call a `keep last n` remote command in releases directory'
    );

    t.true(log.calledWithExactly('Release 20171220120000 deployed'), 'should log message');

    t.end();
  });
});

test.cb('deploy - success with defaults', t => {
  const {log, shipit, local, remote, remoteCopy} = t.context;

  initTaskWith(shipit, {deployTo: '/usr/share/nginx/'}, deploy);

  shipit.start('deploy', err => {
    if (err) {
      return t.end(err);
    }

    t.true(log.calledWithExactly('Deploy to /usr/share/nginx/releases/20171220120000'), 'should log message');

    t.true(
      remote.calledWithExactly('mkdir -p /usr/share/nginx/releases/20171220120000'),
      'should call a `mkdir release` remote command'
    );

    t.true(
      remoteCopy.calledWithExactly('dist/', '/usr/share/nginx/releases/20171220120000'),
      'should call a `remoteCopy dist -> release` command'
    );

    t.true(
      local.calledWithExactly('git rev-parse @'),
      'should call a `git rev` local command'
    );

    t.true(
      remote.calledWithExactly('echo "9d63d4" > /usr/share/nginx/releases/20171220120000/REVISION'),
      'should call a `revision` remote command with local commit hash'
    );

    t.true(
      remote.calledWithExactly('ln -nfs /usr/share/nginx/releases/20171220120000 /usr/share/nginx/current'),
      'should call a `symlink` remote command from releases to current'
    );

    t.true(
      remote.calledWithExactly('ls -d1 /usr/share/nginx/releases/* | sort -n | head -n -5 | xargs rm -rf'),
      'should call a `keep last n` remote command in releases directory'
    );

    t.true(log.calledWithExactly('Release 20171220120000 deployed'), 'should log message');

    t.end();
  });
});

test.cb('deploy - success with defaults + `from` with trailing slash', t => {
  const {shipit, remoteCopy} = t.context;

  initTaskWith(shipit, {from: 'dist/', deployTo: '/usr/share/nginx/'}, deploy);

  shipit.start('deploy', err => {
    if (err) {
      return t.end(err);
    }

    t.true(
      remoteCopy.calledWithExactly('dist/', '/usr/share/nginx/releases/20171220120000'),
      'should call a `remoteCopy dist -> release` command'
    );

    t.end();
  });
});

test.cb('deploy - fail', t => {
  const {shipit} = t.context;

  initTaskWith(shipit, CONFIG_KO, deploy);

  shipit.start('deploy', err => {
    t.truthy(err, 'should throw error');
    t.end();
  });
});
