const utils = require('shipit-utils');
const chalk = require('chalk');
const init  = require('../../lib/init');

/**
 * Log task.
 */
module.exports = function(_shipit) {
  utils.registerTask(_shipit, 'pending:log', task);

  function task() {
    const shipit = init(utils.getShipit(_shipit));

    return shipit.getPendingCommits()
      .then(commits => {
        let msg = chalk.green('\nNo pending commits.');

        if (commits) {
          msg = chalk.yellow(chalk.underline('\nPending commits:\n') + commits);
        }

        shipit.log(msg);
      });
  }
};
