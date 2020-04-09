import {
  generateSnapshotFile,
  none,
  gzip,
  brotli,
} from "@jsenv/github-pull-request-filesize-impact";

generateSnapshotFile({
  projectDirectoryUrl: new URL("../../../", import.meta.url),
  snapshotFileRelativeUrl: process.argv[2],
  trackingConfig: {
    core: {
      "./dist/*": true,
      "./dist/*.map": false,
    },
    extras: {
      "./dist/extras/**/*.js": true,
      "./dist/extras/**/*.map": false,
    },
  },
  transformations: { none, gzip, brotli },
});
