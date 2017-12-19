/*globals describe, it, before, beforeEach, afterEach*/
/*eslint-env node*/

import test from 'ava';
import sinon from 'sinon';
import Shipit from 'shipit-cli';
import rewire from 'rewire';

const fetch = rewire('../../../../tasks/deploy/fetch');

test.beforeEach('mocking', t => {
  t.context.mkdirpMock = sinon.spy();

  const shipit = new Shipit({
    environment: 'test',
    log: sinon.stub()
  });

  shipit.stage = 'test';

  fetch(shipit);
  t.context.revert = fetch.__set__('mkdirp', t.context.mkdirpMock);

  // Shipit config
  shipit.initConfig({
    test: {
      workspace: '/tmp/workspace',
      repositoryUrl: 'git://website.com/user/repo'
    }
  });

  sinon.stub(shipit, 'local').resolves({
    stdout: 'ok'
  });

  t.context.shipit = shipit;
});

test.afterEach('reset mocks', t => {
  t.context.revert();
  t.context.mkdirpMock.reset();
  t.context.shipit.local.restore();
});

test.cb('deploy:fetch', t => {
  const {shipit, mkdirpMock} = t.context;

  console.log(shipit.start);

  shipit.start('deploy:fetch', err => {
    console.log('HERE');

    if (err) {
      return t.end(err);
    }

    t.true(mkdirpMock.calledWith('/tmp/workspace'));
    // t.true(shipit.local.calledWith('git init', {cwd: '/tmp/workspace'}));
    // t.true(shipit.local.calledWith('git remote', {cwd: '/tmp/workspace'}));
    // t.true(shipit.local.calledWith(
    //   'git remote add shipit git://website.com/user/repo', {
    //     cwd: '/tmp/workspace'
    //   }
    // ));
    // t.true(shipit.local.calledWith('git fetch shipit --prune && git fetch shipit --prune "refs/tags/*:refs/tags/*"', {
    //   cwd: '/tmp/workspace'
    // }));
    // t.true(shipit.local.calledWith('git checkout master', {cwd: '/tmp/workspace'}));
    // t.true(shipit.local.calledWith('git branch --list master', {cwd: '/tmp/workspace'}));

    t.end();
  });
});

// const rewire = require('rewire');
// const sinon  = require('sinon');
// require('sinon-as-promised');
// const expect       = require('chai').use(require('sinon-chai')).expect;
// const Shipit       = require('shipit-cli');
// const fetchFactory = rewire('../../../../tasks/deploy/fetch');
// // const mkdirpMock   = require('../../../mocks/mkdirp');
// const rimrafMock   = require('../../../mocks/rimraf');

// describe('deploy:fetch task', () => {
//   let shipit;
//   let revert;
//   let mkdirpMock;

//   before(() => {
//     mkdirpMock = sinon.spy();
//     revert = fetchFactory.__set__('mkdirp', mkdirpMock);
//   });

//   beforeEach(() => {
//     shipit = new Shipit({
//       environment: 'test',
//       log: sinon.stub()
//     });
//     shipit.stage = 'test';
//     fetchFactory(shipit);

//     // fetchFactory.__set__('mkdirp', mkdirpMock);

//     // Shipit config
//     shipit.initConfig({
//       test: {
//         workspace: '/tmp/workspace',
//         repositoryUrl: 'git://website.com/user/repo'
//       }
//     });

//     sinon.stub(shipit, 'local').resolves({
//       stdout: 'ok'
//     });
//   });

//   afterEach(() => {
//     // mkdirpMock.reset();
//     shipit.local.restore();
//   });

//   after(() => {
//     mkdirpMock.reset();
//     revert();
//   });

//   it('should create workspace, create repo, checkout and call sync', done => {
//     shipit.start('deploy:fetch', err => {
//       if (err) {
//         return done(err);
//       }

//       expect(mkdirpMock).to.be.calledWith('/tmp/workspace');
//       expect(shipit.local).to.be.calledWith('git init', {cwd: '/tmp/workspace'});
//       expect(shipit.local).to.be.calledWith('git remote', {cwd: '/tmp/workspace'});
//       expect(shipit.local).to.be.calledWith(
//         'git remote add shipit git://website.com/user/repo', {
//           cwd: '/tmp/workspace'
//         }
//       );
//       expect(shipit.local).to.be.calledWith('git fetch shipit --prune && git fetch shipit --prune "refs/tags/*:refs/tags/*"', {
//         cwd: '/tmp/workspace'
//       });
//       expect(shipit.local).to.be.calledWith('git checkout master', {cwd: '/tmp/workspace'});
//       expect(shipit.local).to.be.calledWith('git branch --list master', {cwd: '/tmp/workspace'});

//       done();
//     });
//   });

//   it('should create workspace, create repo, checkout shallow and call sync', done => {
//     shipit.config.shallowClone = true;

//     shipit.start('deploy:fetch', err => {
//       if (err) {
//         return done(err);
//       }

//       expect(rimrafMock).to.be.calledWith('/tmp/workspace');
//       expect(mkdirpMock).to.be.calledWith('/tmp/workspace');
//       expect(shipit.local).to.be.calledWith('git init', {
//         cwd: '/tmp/workspace'
//       });
//       expect(shipit.local).to.be.calledWith('git remote', {
//         cwd: '/tmp/workspace'
//       });
//       expect(shipit.local).to.be.calledWith(
//         'git remote add shipit git://website.com/user/repo', {
//           cwd: '/tmp/workspace'
//         }
//       );
//       expect(shipit.local).to.be.calledWith('git fetch shipit --prune --depth=1 && git fetch shipit --prune "refs/tags/*:refs/tags/*"', {
//         cwd: '/tmp/workspace'
//       });
//       expect(shipit.local).to.be.calledWith('git checkout master', {
//         cwd: '/tmp/workspace'
//       });
//       expect(shipit.local).to.be.calledWith('git branch --list master', {
//         cwd: '/tmp/workspace'
//       });
//       done();
//     });
//   });

//   it('should create workspace, create repo, checkout and call sync, update submodules', done => {
//     shipit.config.updateSubmodules = true;

//     shipit.start('deploy:fetch', err => {
//       if (err) {
//         return done(err);
//       }

//       expect(mkdirpMock).to.be.calledWith('/tmp/workspace');
//       expect(shipit.local).to.be.calledWith('git init', {
//         cwd: '/tmp/workspace'
//       });
//       expect(shipit.local).to.be.calledWith('git remote', {
//         cwd: '/tmp/workspace'
//       });
//       expect(shipit.local).to.be.calledWith(
//         'git remote add shipit git://website.com/user/repo', {
//           cwd: '/tmp/workspace'
//         }
//       );
//       expect(shipit.local).to.be.calledWith('git fetch shipit --prune && git fetch shipit --prune "refs/tags/*:refs/tags/*"', {
//         cwd: '/tmp/workspace'
//       });
//       expect(shipit.local).to.be.calledWith('git checkout master', {
//         cwd: '/tmp/workspace'
//       });
//       expect(shipit.local).to.be.calledWith('git branch --list master', {
//         cwd: '/tmp/workspace'
//       });
//       expect(shipit.local).to.be.calledWith('git submodule update --init --recursive', {
//         cwd: '/tmp/workspace'
//       });
//       done();
//     });
//   });

//   it('should create workspace, create repo, set repo config, checkout and call sync', done => {
//     shipit.config.gitConfig = {
//       foo: 'bar',
//       baz: 'quux',
//     };

//     shipit.start('deploy:fetch', err => {
//       if (err) {
//         return done(err);
//       }

//       expect(mkdirpMock).to.be.calledWith('/tmp/workspace');
//       expect(shipit.local).to.be.calledWith('git init', {
//         cwd: '/tmp/workspace'
//       });
//       expect(shipit.local).to.be.calledWith('git config foo "bar"', {
//         cwd: '/tmp/workspace'
//       });
//       expect(shipit.local).to.be.calledWith('git config baz "quux"', {
//         cwd: '/tmp/workspace'
//       });
//       expect(shipit.local).to.be.calledWith('git remote', {
//         cwd: '/tmp/workspace'
//       });
//       expect(shipit.local).to.be.calledWith(
//         'git remote add shipit git://website.com/user/repo', {
//           cwd: '/tmp/workspace'
//         }
//       );
//       expect(shipit.local).to.be.calledWith('git fetch shipit --prune && git fetch shipit --prune "refs/tags/*:refs/tags/*"', {
//         cwd: '/tmp/workspace'
//       });
//       expect(shipit.local).to.be.calledWith('git checkout master', {
//         cwd: '/tmp/workspace'
//       });
//       expect(shipit.local).to.be.calledWith('git branch --list master', {
//         cwd: '/tmp/workspace'
//       });
//       done();
//     });
//   });
// });
