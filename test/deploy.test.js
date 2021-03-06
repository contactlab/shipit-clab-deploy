import test from 'ava';
import Shipit from 'shipit-cli';
import sinon from 'sinon';
import deploy from '../tasks/deploy';
import {CONFIG_OK, CONFIG_KO, initTaskWith} from './_helpers';

let oriToISOString;

const handleCommitHash = command =>
  command.indexOf('git rev-parse') === 0 ?
    Promise.resolve({stdout: '9d63d4\n'}) :
    Promise.resolve();

test.before('stubbing Date toISOString method', () => {
  oriToISOString = Date.prototype.toISOString;

  Date.prototype.toISOString = function() {
    return '2017-12-20T12:00:00.000Z';
  }
});

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
  t.context.copyToRemote = sinon.stub(shipit, 'copyToRemote').resolves();
});

test.afterEach(t => {
  t.context.local.restore();
  t.context.remote.restore();
  t.context.copyToRemote.restore();
});

test.after.always('restore Date toISOString method', () => {
  Date.prototype.toISOString = oriToISOString;
});

test.cb('deploy - success', t => {
  const {log, shipit, local, remote, copyToRemote} = t.context;

  initTaskWith(shipit, CONFIG_OK, deploy);

  shipit.start('deploy', err => {
    if (err) {
      return t.end(err);
    }

    t.true(log.calledWithExactly('Deploy to /var/www/html/releases/20171220120000'), 'should log message');

    t.true(
      local.calledWithExactly('git rev-parse @'),
      'should call a `git rev` local command'
    );

    t.true(
      local.calledWithExactly('echo "9d63d4" > ./dist/REVISION'),
      'should call a `revision` remote command with local commit hash'
    );

    t.true(
      remote.calledWithExactly('mkdir -p /var/www/html/releases/20171220120000'),
      'should call a `mkdir release` remote command'
    );

    t.true(
      copyToRemote.calledWithExactly('./dist/', '/var/www/html/releases/20171220120000'),
      'should call a `copyToRemote dist -> release` command'
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
  const {log, shipit, local, remote, copyToRemote} = t.context;

  initTaskWith(shipit, {deployTo: '/usr/share/nginx/'}, deploy);

  shipit.start('deploy', err => {
    if (err) {
      return t.end(err);
    }

    t.true(log.calledWithExactly('Deploy to /usr/share/nginx/releases/20171220120000'), 'should log message');

    t.true(
      local.calledWithExactly('git rev-parse @'),
      'should call a `git rev` local command'
    );

    t.true(
      local.calledWithExactly('echo "9d63d4" > dist/REVISION'),
      'should call a `revision` remote command with local commit hash'
    );

    t.true(
      remote.calledWithExactly('mkdir -p /usr/share/nginx/releases/20171220120000'),
      'should call a `mkdir release` remote command'
    );

    t.true(
      copyToRemote.calledWithExactly('dist/', '/usr/share/nginx/releases/20171220120000'),
      'should call a `copyToRemote dist -> release` command'
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
  const {shipit, copyToRemote} = t.context;

  initTaskWith(shipit, {from: 'dist/', deployTo: '/usr/share/nginx/'}, deploy);

  shipit.start('deploy', err => {
    if (err) {
      return t.end(err);
    }

    t.true(
      copyToRemote.calledWithExactly('dist/', '/usr/share/nginx/releases/20171220120000'),
      'should call a `copyToRemote dist -> release` command'
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
