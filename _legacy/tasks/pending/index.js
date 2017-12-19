const utils = require('shipit-utils');
const log = require('./log');

/**
 * Pending task.
 * - pending:init
 * - pending:log
 */
module.exports = function (shipit) {
  log(shipit);

  utils.registerTask(shipit, 'pending', [
    'pending:log',
  ]);
};
