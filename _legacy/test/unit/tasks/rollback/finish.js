/*globals describe, it, beforeEach, afterEach*/

const sinon         = require('sinon');
const expect        = require('chai').use(require('sinon-chai')).expect;
const Shipit        = require('shipit-cli');
const finishFactory = require('../../../../tasks/rollback/finish');
const path          = require('path2/posix');
const Promise       = require('bluebird');

describe('rollback:finish task', () => {
  let shipit;
  const readLinkCommand = 'if [ -h /remote/deploy/current ]; then readlink /remote/deploy/current; fi';

  beforeEach(() => {
    shipit = new Shipit({
      environment: 'test',
      log: sinon.stub()
    });

    finishFactory(shipit);

    // Shipit config
    shipit.initConfig({
      test: {
        workspace: '/tmp/workspace',
        deployTo: '/remote/deploy',
        deleteOnRollback: false
      }
    });

    shipit.releasePath = '/remote/deploy/releases/20141704123137';
    shipit.releaseDirname = '20141704123137';
    shipit.currentPath = path.join(shipit.config.deployTo, 'current');
    shipit.releasesPath = path.join(shipit.config.deployTo, 'releases');

    shipit.rollbackDirName = '20141704123137';
  });

  describe('delete rollbacked release', () => {
    beforeEach(() => {
      sinon.stub(shipit, 'remote', command => {
        if (command === readLinkCommand) {
          return Promise.resolve([
            {
              stdout: '/remote/deploy/releases/20141704123136\n'
            }
          ]);
        }

        if (command === 'ls -r1 /remote/deploy/releases') {
          return Promise.resolve([
            {
              stdout: '20141704123137\n20141704123136\n'
            }
          ]);
        }

        if (command === 'rm -rf /remote/deploy/releases/20141704123137') {
          return Promise.resolve([]);
        }
      });
      shipit.config.deleteOnRollback = true;
    });

    afterEach(() => {
      shipit.remote.restore();
    });

    it('undefined releases path', done => {
      shipit.start('rollback:finish', err => {
        expect(err.message).to.equal('Can\'t find release to delete');
        done();
      });
    });

    it('undefined previous directory name', done => {
      shipit.prevReleasePath = '/remote/deploy/releases/';
      shipit.start('rollback:finish', err => {
        expect(err.message).to.equal('Can\'t find release to delete');
        done();
      });
    });


    it('successful delete', done => {
      // set up test specific variables
      shipit.prevReleaseDirname = '20141704123137';
      shipit.prevReleasePath = '/remote/deploy/releases/20141704123137';

      const spy = sinon.spy();

      shipit.on('rollbacked', spy);
      shipit.start('rollback:finish', err => {
        if (err) {
          return done(err);
        }

        expect(shipit.prevReleaseDirname).to.equal('20141704123137');
        expect(shipit.remote).to.be.calledWith('rm -rf /remote/deploy/releases/20141704123137');

        // eslint-disable-next-line
        expect(spy).to.be.called;
        done();
      });
    });
  });


  it('should emit an event', done => {
    const spy = sinon.spy();

    shipit.on('rollbacked', spy);
    shipit.start('rollback:finish', err => {
      if (err) {
        return done(err);
      }

      // eslint-disable-next-line
      expect(spy).to.be.called;
      done();
    });
  });
});
