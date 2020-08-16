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
    browser: {
      "./dist/*": true,
      "./dist/*.map": false,
      "./dist/system-node.cjs": false,
    },
    node: {
      "./dist/system-node.cjs": true,
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
