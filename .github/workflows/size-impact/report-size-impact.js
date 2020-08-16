import {
  reportFileSizeImpact,
  readGithubWorkflowEnv,
  none,
  gzip,
  brotli,
} from "@jsenv/file-size-impact";

reportFileSizeImpact({
  ...readGithubWorkflowEnv(),

  trackingConfig: {
    systemjs: {
      "./dist/*": true,
      "./dist/*.map": false,
    },
    extras: {
      "./dist/extras/**/*.js": true,
      "./dist/extras/**/*.map": false,
    },
  },
  transformations: { none, gzip, brotli },
  commentSections: {
    overallSizeImpact: false,
    detailedSizeImpact: true,
    cacheImpact: false,
  },
});
