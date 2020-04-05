import { reportSizeImpactIntoGithubPullRequest } from "@jsenv/github-pull-request-filesize-impact";

reportSizeImpactIntoGithubPullRequest({
  projectDirectoryUrl: new URL("../../../", import.meta.url),
  baseSnapshotFileRelativeUrl: process.argv[2],
  headSnapshotFileRelativeUrl: process.argv[3],
  generatedByLink: false,
});
