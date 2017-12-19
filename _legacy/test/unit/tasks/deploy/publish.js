/*globals describe, it, beforeEach, afterEach*/

const sinon = require('sinon');
require('sinon-as-promised');
const expect         = require('chai').use(require('sinon-chai')).expect;
const Shipit         = require('shipit-cli');
const publishFactory = require('../../../../tasks/deploy/publish');
const path           = require('path2/posix');

describe('deploy:publish task', () => {
  let shipit;

  beforeEach(() => {
    shipit = new Shipit({
      environment: 'test',
      log: sinon.stub()
    });

    publishFactory(shipit);

    // Shipit config
    shipit.initConfig({
      test: {
        deployTo: '/remote/deploy'
      }
    });

    shipit.releasePath = '/remote/deploy/releases/20141704123138';
    shipit.releaseDirname = '20141704123138';
    shipit.currentPath = path.join(shipit.config.deployTo, 'current');
    shipit.releasesPath = path.join(shipit.config.deployTo, 'releases');

    sinon.stub(shipit, 'remote').resolves();
  });

  afterEach(() => {
    shipit.remote.restore();
  });

  it('should update the symbolic link', done => {
    shipit.start('deploy:publish', err => {
      if (err) {
        return done(err);
      }

      expect(shipit.currentPath).to.equal('/remote/deploy/current');
      expect(shipit.remote).to.be.calledWith('cd /remote/deploy && if [[ -d current && ! (-L current) ]]; then echo "ERR: could not make symlink"; else ln -nfs releases/20141704123138 current_tmp && mv -fT current_tmp current; fi');
      done();
    });
  });
});
