const utils = require('shipit-utils');

/**
 * Clean task.
 * - Remove old releases.
 */
module.exports = function(_shipit) {
  utils.registerTask(_shipit, 'deploy:clean', task);

  function task() {
    const shipit = utils.getShipit(_shipit);

    return cleanOldReleases()
      .then(() => shipit.emit('cleaned'));

    /**
     * Remove old releases.
     */

    function cleanOldReleases() {
      shipit.log('Keeping "%d" last releases, cleaning others', shipit.config.keepReleases);

      const command = `(ls -rd ${shipit.releasesPath}/*|head -n ${shipit.config.keepReleases};ls -d ${shipit.releasesPath}/*)|sort|uniq -u|xargs rm -rf`;

      return shipit.remote(command);
    }
  }
};
