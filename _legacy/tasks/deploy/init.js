const utils = require('shipit-utils');
const init  = require('../../lib/init');

/**
 * Init task.
 * - Emit deploy event.
 */
module.exports = function (shipit) {
  utils.registerTask(shipit, 'deploy:init', task);

  function task() {
    const shipit = init(utils.getShipit(shipit));
    shipit.emit('deploy');
  }
};
