const deploy   = require('./tasks/deploy');
const rollback = require('./tasks/rollback');

module.exports = function (shipit) {
  deploy(shipit);
  rollback(shipit);
};
