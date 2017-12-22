const path                                           = require('path');
const {mkdir, gitRev, revision, symlink, keepLastOf} = require('../lib/commands');
const {merge, getReleasesPath, getCurrentPath}       = require('../lib/config');

/**
 * Converts `number` into `string` adn adds a leading 0 if `n` is lesser than 9.
 * @param {number} n - The number
 * @returns {string}
 */
const zeroPad = n =>
  n > 9 ? String(n) : `0${n}`;

/**
 * Returns an hash from date as `YYYYMMDDHHMMSS`.
 * @param {Date} d - Date object
 * @returns {string}
 */
const dateHash = d =>
  [d.getUTCFullYear(), (d.getUTCMonth() + 1), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()]
    .map(zeroPad)
    .join('');

/**
 * Add trailing `c` character to `s` if `s` doesn't already end with `c`.
 * @param {string} c - Trailing char
 * @param {string} s - The string
 * @returns {string}
 */
const trailing = (c, s) =>
  s.lastIndexOf(c) === s.length - 1 ? s : `${s}${c}`;

module.exports = shipit => {
  shipit.task('deploy', () => {
    const config = merge(shipit.config);

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
     * Makes a REVISION file in remote `dest` path.
     * @param {string} dest - Remote destination path
     * @returns {Promise}
     */
    const makeRevision = dest =>
      shipit.local(gitRev(config.branch))
        .then(response =>
          shipit.remote(revision(dest, response.stdout.trim()))
        );

    const into     = dateHash(new Date());
    const source   = trailing('/', config.from);
    const releases = getReleasesPath(config);
    const current  = getCurrentPath(config);
    const dest     = path.join(releases, into);

    return start(`Deploy to ${dest}`)
            .then(() => shipit.remote(mkdir(dest)))
            .then(() => shipit.remoteCopy(source, dest))
            .then(() => makeRevision(dest))
            .then(() => shipit.remote(symlink(dest, current)))
            .then(() => shipit.remote(keepLastOf(config.keepReleases, releases)))
            .then(() => shipit.log(`Release ${into} deployed`));
  });
};
