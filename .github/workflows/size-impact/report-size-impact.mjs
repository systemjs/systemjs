import {
  reportFileSizeImpact,
  readGithubWorkflowEnv,
  raw,
  gzip,
  brotli,
} from "@jsenv/file-size-impact";

reportFileSizeImpact({
  ...readGithubWorkflowEnv(),

  trackingConfig: {
    browser: {
      "./dist/*.js": false,
      "./dist/*.min.js": true,
      "./dist/system-node.cjs": false,
    },
    node: {
      "./dist/system-node.cjs": true,
      "./dist/system-node.mjs": true,
    },
    extras: {
      "./dist/extras/**/*.js": false,
      "./dist/extras/**/*.min.js": true,
    },
  },
  transformations: { raw, gzip, brotli },
});
