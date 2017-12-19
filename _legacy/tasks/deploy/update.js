const utils   = require('shipit-utils');
const path    = require('path2/posix');
const moment  = require('moment');
const chalk   = require('chalk');
const _       = require('lodash');
const util    = require('util');
const Promise = require('bluebird');
const $s      = require('../../lib/shipit');

/**
 * Update task.
 * - Set previous release.
 * - Set previous revision.
 * - Create and define release path.
 * - Copy previous release (for faster rsync)
 * - Set current revision and write REVISION file.
 * - Remote copy project.
 */
module.exports = function(_shipit) {
  utils.registerTask(_shipit, 'deploy:update', task);

  function task() {
    const shipit = utils.getShipit(_shipit);

    _.assign(shipit.constructor.prototype, $s);

    return setPreviousRelease()
      .then(setPreviousRevision)
      .then(createReleasePath)
      .then(copyPreviousRelease)
      .then(remoteCopy)
      .then(setCurrentRevision)
      .then(() => shipit.emit('updated'));

    /**
     * Copy previous release to release dir.
     */
    function copyPreviousRelease() {
      const copyParameter = shipit.config.copy || '-a';

      if (!shipit.previousRelease || shipit.config.copy === false) {
        return Promise.resolve();
      }

      shipit.log('Copy previous release to "%s"', shipit.releasePath);
      return shipit.remote(
        util.format(
          'cp %s %s/. %s',
          copyParameter,
          path.join(shipit.releasesPath, shipit.previousRelease),
          shipit.releasePath
        )
      );
    }

    /**
     * Create and define release path.
     */
    function createReleasePath() {
      shipit.releaseDirname = moment.utc().format('YYYYMMDDHHmmss');
      shipit.releasePath = path.join(shipit.releasesPath, shipit.releaseDirname);

      shipit.log('Create release path "%s"', shipit.releasePath);

      return shipit.remote(`mkdir -p ${shipit.releasePath}`)
              .then(() => shipit.log(chalk.green('Release path created.')));
    }

    /**
     * Remote copy project.
     */
    function remoteCopy() {
      const options = _.get(shipit.config, 'deploy.remoteCopy') || {rsync: '--del'};
      const rsyncFrom = shipit.config.rsyncFrom || shipit.config.workspace;
      const uploadDirPath = path.resolve(rsyncFrom, shipit.config.dirToCopy || '');

      shipit.log('Copy project to remote servers.');

      return shipit.remoteCopy(`${uploadDirPath}/`, shipit.releasePath, options)
              .then(() => shipit.log(chalk.green('Finished copy.')));
    }

    /**
     * Set shipit.previousRevision from remote REVISION file.
     */
    function setPreviousRevision() {
      shipit.previousRevision = null;

      if (!shipit.previousRelease) {
        return Promise.resolve();
      }

      return shipit.getRevision(shipit.previousRelease)
        .then(revision => {
          if (revision) {
            shipit.log(chalk.green('Previous revision found.'));
            shipit.previousRevision = revision;
          }
        });
    }

    /**
     * Set shipit.previousRelease.
     */
    function setPreviousRelease() {
      shipit.previousRelease = null;

      return shipit.getCurrentReleaseDirname()
        .then(currentReleasseDirname => {
          if (currentReleasseDirname) {
            shipit.log(chalk.green('Previous release found.'));
            shipit.previousRelease = currentReleasseDirname;
          }
        });
    }

    /**
     * Set shipit.currentRevision and write it to REVISION file.
     */
    function setCurrentRevision() {
      shipit.log('Setting current revision and creating revision file.');

      return shipit.local(`git rev-parse ${shipit.config.branch}`, {cwd: shipit.config.workspace})
              .then(response => {
                shipit.currentRevision = response.stdout.trim();
                return shipit.remote(`echo "${shipit.currentRevision}" > ${path.join(shipit.releasePath, 'REVISION')}`);
              })
              .then(() => shipit.log(chalk.green('Revision file created.')));
    }
  }
};
