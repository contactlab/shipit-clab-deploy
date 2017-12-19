/*globals describe, it, beforeEach, afterEach*/

const sinon       = require('sinon');
const expect      = require('chai').use(require('sinon-chai')).expect;
const Shipit      = require('shipit-cli');
const initFactory = require('../../../../tasks/rollback/init');
const Promise     = require('bluebird');

describe('rollback:init task', () => {
  let shipit;
  const readLinkCommand = 'if [ -h /remote/deploy/current ]; then readlink /remote/deploy/current; fi';

  beforeEach(() => {
    shipit = new Shipit({
      environment: 'test',
      log: sinon.stub()
    });

    initFactory(shipit);

    // Shipit config
    shipit.initConfig({
      test: {
        workspace: '/tmp/workspace',
        deployTo: '/remote/deploy'
      }
    });
  });

  describe('#getCurrentReleaseDirName', () => {
    describe('unsync server', () => {
      beforeEach(() => {
        sinon.stub(shipit, 'remote', command => {
          if (command === readLinkCommand) {
            return Promise.resolve([
              {
                stdout: '/remote/deploy/releases/20141704123138'
              },
              {
                stdout: '/remote/deploy/releases/20141704123137'
              }
            ]);
          }
        });
      });

      afterEach(() => {
        shipit.remote.restore();
      });

      it('should return an error', done => {
        shipit.start('rollback:init', err => {
          expect(err.message).to.equal('Remote servers are not synced.');
          done();
        });
      });
    });

    describe('bad release dirname', () => {
      beforeEach(() => {
        sinon.stub(shipit, 'remote', command => {
          if (command === readLinkCommand) {
            return Promise.resolve([]);
          }
        });
      });

      afterEach(() => {
        shipit.remote.restore();
      });

      it('should return an error', done => {
        shipit.start('rollback:init', err => {
          expect(err.message).to.equal('Cannot find current release dirname.');
          done();
        });
      });
    });
  });

  describe('#getReleases', () => {
    describe('unsync server', () => {
      beforeEach(() => {
        sinon.stub(shipit, 'remote', command => {
          if (command === readLinkCommand) {
            return Promise.resolve([
              {
                stdout: '/remote/deploy/releases/20141704123137'
              }
            ]);
          }

          if (command === 'ls -r1 /remote/deploy/releases') {
            return Promise.resolve([
              {
                stdout: '20141704123137\n20141704123134\n'
              },
              {
                stdout: '20141704123137\n20141704123133\n'
              }
            ]);
          }
        });
      });

      afterEach(() => {
        shipit.remote.restore();
      });

      it('should return an error', done => {
        shipit.start('rollback:init', err => {
          expect(err.message).to.equal('Remote servers are not synced.');
          done();
        });
      });
    });

    describe('bad releases', () => {
      beforeEach(() => {
        sinon.stub(shipit, 'remote', command => {
          if (command === readLinkCommand) {
            return Promise.resolve([
              {
                stdout: '/remote/deploy/releases/20141704123137'
              }
            ]);
          }

          if (command === 'ls -r1 /remote/deploy/releases') {
            return Promise.resolve([]);
          }
        });
      });

      afterEach(() => {
        shipit.remote.restore();
      });

      it('should return an error', done => {
        shipit.start('rollback:init', err => {
          expect(err.message).to.equal('Cannot read releases.');
          done();
        });
      });
    });
  });

  describe('release not exists', () => {
    beforeEach(() => {
      sinon.stub(shipit, 'remote', command => {
        if (command === readLinkCommand) {
          return Promise.resolve([
            {
              stdout: '/remote/deploy/releases/20141704123137'
            }
          ]);
        }

        if (command === 'ls -r1 /remote/deploy/releases') {
          return Promise.resolve([
            {
              stdout: '20141704123137'
            }
          ]);
        }
      });
    });

    afterEach(() => {
      shipit.remote.restore();
    });

    it('should return an error', done => {
      shipit.start('rollback:init', err => {
        expect(err.message).to.equal('Cannot rollback, release not found.');
        done();
      });
    });
  });

  describe('all good', () => {
    beforeEach(() => {
      sinon.stub(shipit, 'remote', command => {
        if (command === readLinkCommand) {
          return Promise.resolve([
            {
              stdout: '/remote/deploy/releases/20141704123137\n'
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
      });
    });

    afterEach(() => {
      shipit.remote.restore();
    });

    it('define path', done => {
      shipit.start('rollback:init', err => {
        if (err) {
          return done(err);
        }

        expect(shipit.currentPath).to.equal('/remote/deploy/current');
        expect(shipit.releasesPath).to.equal('/remote/deploy/releases');
        expect(shipit.remote).to.be.calledWith(readLinkCommand);
        expect(shipit.remote).to.be.calledWith('ls -r1 /remote/deploy/releases');
        expect(shipit.releaseDirname).to.equal('20141704123136');
        expect(shipit.releasePath).to.equal('/remote/deploy/releases/20141704123136');
        done();
      });
    });
  });
});
