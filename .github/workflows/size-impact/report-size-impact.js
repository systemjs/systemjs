import { reportSizeImpactIntoGithubPullRequest } from "@jsenv/github-pull-request-filesize-impact";

reportSizeImpactIntoGithubPullRequest({
  logLevel: "debug",
  projectDirectoryUrl: new URL("../../../", import.meta.url),
  baseSnapshotFileRelativeUrl: process.argv[2],
  headSnapshotFileRelativeUrl: process.argv[3],
  generatedByLink: false,
});
