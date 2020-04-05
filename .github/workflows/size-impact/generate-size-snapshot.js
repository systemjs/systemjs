import { generateSnapshotFile } from "@jsenv/github-pull-request-filesize-impact";

generateSnapshotFile({
  projectDirectoryUrl: new URL("../../../", import.meta.url),
  snapshotFileRelativeUrl: process.argv[2],
  directorySizeTrackingConfig: {
    dist: {
      "**/*": true,
      "**/*.map": false,
    },
  },
});
