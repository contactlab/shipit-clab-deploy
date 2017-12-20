module.exports = shipit => {
  shipit.task('rollback', [], () =>
    shipit.log('ROLLBACK')
  );
};
