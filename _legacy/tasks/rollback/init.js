const utils = require('shipit-utils');
const path  = require('path2/posix');
const init  = require('../../lib/init');

/**
 * Update task.
 * - Create and define release path.
 * - Remote copy project.
 */
module.exports = function(_shipit) {
  utils.registerTask(_shipit, 'rollback:init', task);

  function task() {
    const shipit = init(utils.getShipit(_shipit));

    return defineReleasePath()
      .then(() => shipit.emit('rollback'));

    /**
     * Define release path to rollback.
     */
    function defineReleasePath() {
      shipit.log('Get current release dirname.');

      return shipit.getCurrentReleaseDirname()
              .then(currentRelease => {
                if (!currentRelease) {
                  throw new Error('Cannot find current release dirname.');
                }

                shipit.log('Current release dirname : %s.', currentRelease);

                shipit.log('Getting dist releases.');

                return shipit.getReleases()
                        .then(releases => {
                          if (!releases) {
                            throw new Error('Cannot read releases.');
                          }

                          shipit.log('Dist releases : %j.', releases);

                          const currentReleaseIndex = releases.indexOf(currentRelease);
                          const rollbackReleaseIndex = currentReleaseIndex + 1;

                          shipit.releaseDirname = releases[rollbackReleaseIndex];

                          // Save the previous release in case we need to delete it later
                          shipit.prevReleaseDirname = releases[currentReleaseIndex];
                          shipit.prevReleasePath = path.join(shipit.releasesPath, shipit.prevReleaseDirname);

                          shipit.log('Will rollback to %s.', shipit.releaseDirname);

                          if (!shipit.releaseDirname) {
                            throw new Error('Cannot rollback, release not found.');
                          }

                          shipit.releasePath = path.join(shipit.releasesPath, shipit.releaseDirname);
                        });
              });
    }
  }
};
