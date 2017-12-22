const path = require('path');
const Joi  = require('joi');

/**
 * Shipit Clab deploy configuration object/type
 * @typedef {Object} Configuration
 * @property {string} from - Local directory to deploy on remote server
 * @property {string} deployTo - Path to the remote doc root
 * @property {string} releasesDir - Name of the `releases` directory under doc root
 * @property {string} currentDir - Name of the `current` symlinked directory under doc root
 * @property {number} keepReleases - Number of releases versions to keep after deploy
 */

const SCHEMA = Joi.object().keys({
  from        : Joi.string().required(),
  deployTo    : Joi.string().required(),
  releasesDir : Joi.string().required(),
  currentDir  : Joi.string().required(),
  keepReleases: Joi.number().min(2).required()
});

const VALIDATION_OPTS = {
  presence    : 'required',
  allowUnknown: true
};

const DEFAULTS = {
  from        : path.join('.', 'dist'),
  releasesDir : 'releases',
  currentDir  : 'current',
  keepReleases: 10
};

/**
 * Validates `config` and if ok runs `fn` with `config`, otherwise throws error.
 * @throws {Error}
 * @param {Configuration} config - Shipit configuration object
 * @param {Function} fn - Function to execute
 * @returns {*}
 */
const safeFn = (config, fn) => {
  const err = Joi.validate(config, SCHEMA, VALIDATION_OPTS).error;

  if (err !== null) {
    throw new Error(err);
  }

  return fn(config);
};

/**
 * Merge provided `config` object with `DEFAULTS`.
 * @param {Configuration} config - Shipit configuration object
 * @returns {Configuration}
 */
const merge = config =>
  Object.assign({}, DEFAULTS, config);

/**
 * Gets the full `releaseDir` path from `config`.
 * @throws {Error}
 * @param {Configuration} config - Shipit configuration object
 * @returns {string}
 */
const getReleasesPath = config =>
  safeFn(config, ({deployTo, releasesDir}) =>
    path.join(deployTo, releasesDir)
  );

/**
 * Gets the full `currentDir` path from `config`.
 * @throws {Error}
 * @param {Object} config - Shipit configuration object
 * @returns {string}
 */
const getCurrentPath = config =>
  safeFn(config, ({deployTo, currentDir}) =>
    path.join(deployTo, currentDir)
  );

module.exports = {
  merge,
  getReleasesPath,
  getCurrentPath
};
