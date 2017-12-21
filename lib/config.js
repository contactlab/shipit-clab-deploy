const path = require('path');
const Joi  = require('joi');

const SCHEMA = Joi.object().keys({
  from        : Joi.string().required(),
  deployTo    : Joi.string().required(),
  releasesDir : Joi.string().required(),
  currentDir  : Joi.string().required(),
  keepReleases: Joi.number().min(2).required()
});

const VALIDATION_OPTS = {
  presence: 'required',
  allowUnknown: true
};

const DEFAULTS = {
  from        : path.join('.', 'dist'),
  releasesDir : 'releases',
  currentDir  : 'current',
  keepReleases: 10
};

const merge = config =>
  Object.assign({}, DEFAULTS, config);

const safeFn = (config, fn) => {
  const err = Joi.validate(config, SCHEMA, VALIDATION_OPTS).error;

  if (err !== null) {
    throw new Error(err);
  }

  return fn(config);
};

const getReleasesPath = config =>
  safeFn(merge(config), ({deployTo, releasesDir}) =>
    path.join(deployTo, releasesDir)
  );

const getCurrentPath = config =>
  safeFn(merge(config), ({deployTo, currentDir}) =>
    path.join(deployTo, currentDir)
  );

module.exports = {
  getReleasesPath,
  getCurrentPath
};
