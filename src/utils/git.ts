import { execCmd } from "./exec";

export async function getGitCommits() {
  await execCmd('git fetch origin');
  const localHead = await execCmd('git rev-parse HEAD');
  const remoteHead = await execCmd('git rev-parse origin/master');
  return {
    localHead: localHead.stdout.trim(),
    remoteHead: remoteHead.stdout.trim()
  };
}


