const utils   = require('shipit-utils');
const init    = require('./init');
const fetch   = require('./fetch');
const update  = require('./update');
const publish = require('./publish');
const clean   = require('./clean');
const finish  = require('./finish');

/**
 * Deploy task.
 * - deploy:fetch
 * - deploy:update
 * - deploy:publish
 * - deploy:clean
 * - deploy:finish
 */
module.exports = function (shipit) {
  init(shipit);
  fetch(shipit);
  update(shipit);
  publish(shipit);
  clean(shipit);
  finish(shipit);

  utils.registerTask(shipit, 'deploy', [
    'deploy:init',
    'deploy:fetch',
    'deploy:update',
    'deploy:publish',
    'deploy:clean',
    'deploy:finish'
  ]);
};
