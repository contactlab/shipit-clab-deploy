const path   = require('path2/posix');
const _      = require('lodash');
const util   = require('util');
const Shipit = module.exports;

/**
 * Compute the current release dir name.
 *
 * @param {object} result
 * @returns {string}
 */
const computeReleases = result => {
  if (!result.stdout) {
    return null;
  }

  // Trim last breakline.
  const dirs = result.stdout.replace(/\n$/, '');

  // Convert releases to an array.
  return dirs.split('\n');
};

/**
 * Test if all values are equal.
 *
 * @param {*[]} values
 * @returns {boolean}
 */
const equalValues = values => values.every(value => _.isEqual(value, values[0]));

/**
 * Compute the current release dir name.
 *
 * @param {object} result
 * @returns {string}
 */
const computeReleaseDirname = result => {
  if (!result.stdout) {
    return null;
  }

  // Trim last breakline.
  const target = result.stdout.replace(/\n$/, '');

  return target.split(path.sep).pop();
};

/**
 * Return the current release dirname.
 */
Shipit.getCurrentReleaseDirname = function() {
  const shipit = this;

  return shipit
    .remote(util.format('if [ -h %s ]; then readlink %s; fi', shipit.currentPath, shipit.currentPath))
    .then(results => {
      const res = results || [];
      const releaseDirnames = res.map(computeReleaseDirname);

      if (!equalValues(releaseDirnames)) {
        throw new Error('Remote servers are not synced.');
      }

      if (!releaseDirnames[0]) {
        shipit.log('No current release found.');
        return null;
      }

      return releaseDirnames[0];
    });
};

/**
 * Return all remote releases (newest first)
 */
Shipit.getReleases = function() {
  const shipit = this;

  return shipit
    .remote(`ls -r1 ${shipit.releasesPath}`)
    .then(results => {
      const releases = results.map(computeReleases);

      if (!equalValues(releases)) {
        throw new Error('Remote servers are not synced.');
      }

      return releases[0];
    });
};

/**
 * Return SHA from remote REVISION file.
 *
 * @param {string} releaseDir Directory name of the relesase dir (YYYYMMDDHHmmss).
 */
Shipit.getRevision = function(releaseDir) {
  const shipit = this;
  const file = path.join(shipit.releasesPath, releaseDir, 'REVISION');

  return shipit
    .remote(`if [ -f ${file} ]; then cat ${file} 2>/dev/null; fi;`)
    .then(response => response[0].stdout.trim());
};

const pendingCommitsFromDeployed = shipit => deployed => {
  if (!deployed) {
    return null;
  }

  // Get local remotes.
  return shipit
          .local('git remote', {cwd: shipit.config.workspace})
          .then(res => {
            const remotes = res && res.stdout ? res.stdout.split(/\s/) : [];

            if (remotes.length < 1) {
              return null;
            }

            // Compare against currently undeployed revision
            const compareRevision = `${remotes[0]}/${shipit.config.branch}`;

            // Print diff
            return shipit.local(
              `git log --pretty=format:"${shipit.config.gitLogFormat}" ${deployed}..${compareRevision}`,
              {cwd: shipit.config.workspace}
            )
            .then(response => response.stdout.trim() || null);
          });
};

Shipit.getPendingCommits = function() {
  const shipit = this;

  return shipit
    .getCurrentReleaseDirname()
    .then(currentReleaseDirname => {
      if (!currentReleaseDirname) {
        return null;
      }

      return shipit
        .getRevision(currentReleaseDirname)
        .then(pendingCommitsFromDeployed(shipit));
    });
};
