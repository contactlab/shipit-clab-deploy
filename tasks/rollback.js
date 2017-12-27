const path                                     = require('path');
const {takeLatest, countDirs, rm, symlink}     = require('../lib/commands');
const {merge, getReleasesPath, getCurrentPath} = require('../lib/config');

module.exports = shipit => {
  shipit.task('rollback', () => {
    const config   = merge(shipit.config);
    const releases = getReleasesPath(config);
    const current  = getCurrentPath(config);

    /**
     * Logs message and returns a resolved Promise.
     * @param {string} msg - Message to be logged
     * @returns {Promise}
     */
    const start = msg => {
      shipit.log(msg);

      return Promise.resolve(true);
    };

    /**
     * Calls a remote `takeLatest` command on `releases` path
     * and calls `cb` for each `response` from every server.
     * @param {string} releases - Releases path
     * @param {Function} cb - Callback function (responsObject, index)
     * @returns {Promise}
     */
    const takeLatestAndThen = (releases, cb) =>
      shipit.remote(takeLatest(releases))
        .then(responses =>
          Promise.all(responses.map((x, i) => cb(x.stdout.trim(), i)))
        );

    /**
     * Removes the latest `release` if releases number is greater than 2.
     * @throws {Error}
     * @param {string} releases - Releases path
     * @returns {Promise}
     */
    const removeLatest = releases =>
      takeLatestAndThen(releases, (p, i) =>
        shipit.remote(countDirs(path.resolve(p, '..')))
          .then(responses => {
            if (parseInt(responses[i].stdout.trim(), 10) < 2) {
              throw new Error('Can\'t rollback if there is only 1 release');
            }

            return shipit.remote(rm(p));
          }));

    /**
     * Updates `current` symlinking to latest release in `releases` dir.
     * @param {string} releases - Releases path
     * @param {string} current - Current path
     * @returns {Promise}
     */
    const updateCurrent = (releases, current) =>
      takeLatestAndThen(releases, p =>
        shipit.remote(symlink(p, current))
      );

    /**
     * Logs final message
     * @param {string} releases - Releases path
     * @returns {Promise}
     */
    const logFinalMsg = releases =>
      takeLatestAndThen(releases, p =>
        shipit.log(`Rollbacked to release ${path.basename(p)}`)
      );

    return start('Rollbacking to previous release')
            .then(() => removeLatest(releases))
            .then(() => updateCurrent(releases, current))
            .then(() => logFinalMsg(releases));
  });
};
