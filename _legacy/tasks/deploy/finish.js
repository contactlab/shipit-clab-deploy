const utils = require('shipit-utils');
const init  = require('../../lib/init');

/**
 * Update task.
 * - Emit an event "deployed".
 */
module.exports = function (shipit) {
  utils.registerTask(shipit, 'deploy:finish', task);

  function task() {
    const shipit = init(utils.getShipit(shipit));
    shipit.emit('deployed');
  }
};
