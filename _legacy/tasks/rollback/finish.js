const Promise = require('bluebird');
const utils   = require('shipit-utils');
const init    = require('../../lib/init');

/**
 * Update task.
 * - Emit an event "rollbacked".
 */
module.exports = function(_shipit) {
  utils.registerTask(_shipit, 'rollback:finish', () => {
    const shipit = init(utils.getShipit(_shipit));

    function deleteRelease() {
      if (!shipit.config.deleteOnRollback) {
        return Promise.resolve([]);
      }

      if (!shipit.prevReleaseDirname || !shipit.prevReleasePath) {
        return Promise.reject(new Error('Can\'t find release to delete'));
      }

      const command = `rm -rf ${shipit.prevReleasePath}`;

      return shipit.remote(command);
    }

    return deleteRelease()
            .then(() => shipit.emit('rollbacked'));
  });
};
