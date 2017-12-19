const utils = require('shipit-utils');
const chalk = require('chalk');
const path  = require('path2/posix');

/**
 * Publish task.
 * - Update symbolic link.
 */
module.exports = function (_shipit) {
  utils.registerTask(_shipit, 'deploy:publish', task);

  function task() {
    const shipit = utils.getShipit(_shipit);

    return updateSymbolicLink()
            .then(() => shipit.emit('published'));

    /**
     * Update symbolic link.
     */
    function updateSymbolicLink() {
      shipit.log('Publishing release "%s"', shipit.releasePath);

      const relativeReleasePath = path.join('releases', shipit.releaseDirname);

      return shipit.remote(
        `cd ${shipit.config.deployTo} && if [[ -d current && ! (-L current) ]]; then echo "ERR: could not make symlink"; else ln -nfs ${relativeReleasePath} current_tmp && mv -fT current_tmp current; fi`
      )
      .then(res => {
        const failedresult = (res && res.stdout) ?
          res.stdout.filter(r => r.indexOf('could not make symlink') > -1) : [];

        if (failedresult.length && failedresult.length > 0) {
          shipit.log(
            chalk.yellow(
              `Symbolic link at remote not made, as something already exists at ${path(shipit.config.deployTo, 'current')}`
            )
          );
        }

        shipit.log(chalk.green('Release published.'));
      });
    }
  }
};
