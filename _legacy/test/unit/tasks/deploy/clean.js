/*globals describe, it, beforeEach, afterEach*/

const sinon = require('sinon');
require('sinon-as-promised');
const expect       = require('chai').use(require('sinon-chai')).expect;
const Shipit       = require('shipit-cli');
const cleanFactory = require('../../../../tasks/deploy/clean');

describe('deploy:clean task', () => {
  let shipit;

  beforeEach(() => {
    shipit = new Shipit({
      environment: 'test',
      log: sinon.stub()
    });
    cleanFactory(shipit);

    // Shipit config.
    shipit.initConfig({
      test: {
        keepReleases: 5
      }
    });

    shipit.releasesPath = '/remote/deploy/releases';

    sinon.stub(shipit, 'remote').resolves();
  });

  afterEach(() => {
    shipit.remote.restore();
  });

  it('should remove old releases', done => {
    shipit.start('deploy:clean', err => {
      if (err) {
        return done(err);
      }

      expect(shipit.remote)
        .to.be.calledWith(`(ls -rd /remote/deploy/releases/*|head -n 5;ls -d ${shipit.releasesPath}/*)|sort|uniq -u|xargs rm -rf`);
      done();
    });
  });
});
