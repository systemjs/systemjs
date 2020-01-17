var numNamedAMDExecutions = 0;
define('named-amd-single-execute', ['exports'], function(exports) {
  numNamedAMDExecutions++;
  return 'The first named AMD module';
});