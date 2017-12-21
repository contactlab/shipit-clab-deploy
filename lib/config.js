const path = require('path');
const Joi  = require('joi');

const SCHEMA = Joi.object().keys({
  from        : Joi.string().required(),
  deployTo    : Joi.string().required(),
  releasesDir : Joi.string().required(),
  currentDir  : Joi.string().required(),
  keepReleases: Joi.number().min(2).required()
});

const DEFAULTS = {
  from        : path.join('.', 'dist'),
  releasesDir : 'releases',
  currentDir  : 'current',
  keepReleases: 10
};

const merge = config =>
  Object.assign({}, DEFAULTS, config);

const safeFn = (config, fn) => {
  if (!isValid(config)) {
    throw new Error('Configuration is not valid');
  }

  return fn(config);
};

const isValid = config =>
  Joi.validate(config, SCHEMA, {presence: 'required'}).error === null;

const getReleasesPath = config =>
  safeFn(merge(config), ({deployTo, releasesDir}) =>
    path.join(deployTo, releasesDir)
  );

const getCurrentPath = config =>
  safeFn(merge(config), ({deployTo, currentDir}) =>
    path.join(deployTo, currentDir)
  );

module.exports = {
  isValid,
  getReleasesPath,
  getCurrentPath
};
