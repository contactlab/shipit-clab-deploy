/*globals describe, it, beforeEach, afterEach*/

const sinon = require('sinon');
require('sinon-as-promised');
const expect         = require('chai').use(require('sinon-chai')).expect;
const Shipit         = require('shipit-cli');
const pendingFactory = require('../../../../tasks/pending/log');

describe('pending:log task', () => {
  let shipit;

  beforeEach(() => {
    shipit = new Shipit({
      environment: 'test',
      log: sinon.stub()
    });

    pendingFactory(shipit);

    // Shipit config
    shipit.initConfig({
      test: {
        deployTo: '/remote/deploy'
      }
    });

    shipit.releasePath = '/remote/deploy/releases/20141704123138';
    shipit.releaseDirname = '20141704123138';

    sinon.stub(shipit, 'remote').resolves();
  });

  afterEach(() => {
    shipit.remote.restore();
  });

  describe('#getPendingCommits', () => {
    describe('no current release', () => {
      it('should return null', done => {
        shipit.start('pending:log', err => {
          if (err) {
            return done(err);
          }

          shipit.getPendingCommits()
            .then(commitStr => {
              expect(commitStr).to.equal(null);
              done();
            });
        });
      });
    });
  });
});
