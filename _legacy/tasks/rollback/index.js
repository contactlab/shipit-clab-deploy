const utils  = require('shipit-utils');
const init   = require('./init');
const fetch  = require('../deploy/fetch');
const clean  = require('../deploy/clean');
const finish = require('./finish');

/**
 * Rollback task.
 * - rollback:init
 * - deploy:publish
 * - deploy:clean
 */
module.exports = function (shipit) {
  init(shipit);
  fetch(shipit);
  clean(shipit);
  finish(shipit);

  utils.registerTask(shipit, 'rollback', [
    'rollback:init',
    'deploy:publish',
    'deploy:clean',
    'rollback:finish'
  ]);
};
