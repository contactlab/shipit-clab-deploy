const Joi  = require('joi');

const SCHEMA = Joi.object().keys({
  deployTo   : Joi.string().required(),
  releasesDir: Joi.string().required()
});

const isValid = config =>
  Joi.validate(config, SCHEMA, {presence: 'required'}).error === null;

module.exports = {
  isValid
};
