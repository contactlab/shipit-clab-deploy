const path = require('path2/posix');
const _    = require('lodash');
const $s   = require('./shipit');

module.exports = function(shipit) {
  shipit.currentPath = path.join(shipit.config.deployTo, 'current');
  shipit.releasesPath = path.join(shipit.config.deployTo, 'releases');
  shipit.config.gitLogFormat = shipit.config.gitLogFormat || '%h: %s - %an';
  _.assign(shipit.constructor.prototype, $s);

  return shipit;
};
