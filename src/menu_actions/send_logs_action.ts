/*
Copyright: Ambrosus Inc.
Email: tech@ambrosus.io

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import { readState } from '../utils/state';
import { dockerGetLogs, execCmdSafe } from '../utils/exec';
import axios from 'axios';
import Dialog from '../dialogs/dialog_model';
import { addressForPrivateKey } from "../utils/crypto";
import { OUTPUT_DIRECTORY } from "../../config/config";
import { ExecOptions } from "child_process";
import { getGitCommits } from "../utils/git";

const DISCORD_WEBHOOK_URL = 'https://qsymqgy36zfeiifil647clfy7a0lcrfe.lambda-url.eu-central-1.on.aws/';


async function sendLogsAction(): Promise<boolean> {
  const shouldSendDebugFiles = await promptUserToSendDebugFiles();
  if (!shouldSendDebugFiles)
    return;

  const info = await collectDebugInfo();

  const title = `${info.address}-${info.timestamp}`;
  const data = `
    Address: ${info.address}
    Network: ${info.network.name}
    Timestamp: ${info.timestamp}
    
    Network details: ${JSON.stringify(info.network, null, 2)}
    Working directory: ${info.cwd}
    OS Release: ${info.osRelease}
    Memory Info: ${info.memoryInfo}
    Directory Contents: ${info.directoryContents}
    Output Directory Contents: ${info.outputDirectoryContents}
    Disk Block Info: ${info.diskBlockInfo}
    Disk Inodes Info: ${info.diskInodesInfo}
    Process Tree: ${info.processTree}
    Memory Usage: ${info.memoryUsage}
    Docker logs: ${info.composeLogs}
    Local Git Head: ${info.localHead}
    Remote Git Head: ${info.remoteHead}
  `;

  await uploadDebugInfo(title, data);
  console.log(`Debug info successfully sent to AirDao support team! ID: ${title}`);
}


async function collectDebugInfo() {
  const { network, privateKey } = await readState();
  const address = addressForPrivateKey(privateKey);
  const timestamp = Math.floor(Date.now() / 1000);

  const cwd = process.cwd();
  const osRelease = await cmd('cat /etc/os-release');
  const memoryInfo = await cmd('cat /proc/meminfo');
  const directoryContents = await cmd('ls -la');
  const outputDirectoryContents = await cmd('ls -la', {cwd: OUTPUT_DIRECTORY});
  const diskBlockInfo = await cmd('df -h');
  const diskInodesInfo = await cmd('df -i');
  const processTree = await cmd('ps axjf');
  const memoryUsage = await cmd('free -m');
  const composeLogs = await dockerGetLogsSafe();
  const {localHead, remoteHead} = await getGitCommits();

  return {
    address, network, timestamp, cwd, osRelease, memoryInfo, directoryContents, outputDirectoryContents,
    diskBlockInfo, diskInodesInfo, processTree, memoryUsage, composeLogs, localHead, remoteHead
  };

}

async function uploadDebugInfo(title: string, data: string): Promise<void> {
  const response = await axios.post(DISCORD_WEBHOOK_URL, {
    message: `Logs ${title}`,
    fileName: `${title}.txt`,
    fileContent: data
  });
  if (response.status !== 200)
    throw new Error(`Failed to send debug info: ${response.data}`);
}


async function dockerGetLogsSafe() {
  try {
    return (await dockerGetLogs()).stdout;
  } catch (error) {
    return `Error while changing directory or fetching compose logs: ${error.message}`;
  }
}



async function promptUserToSendDebugFiles(): Promise<boolean> {
  console.log(
    `The information being sent is the following:
    * Current working directory
    * OS Release
    * Memory Info
    * Directory Contents
    * Output Directory Contents
    * Disk Block Info
    * Disk Inodes Info
    * Process Tree
    * Memory Usage`
  );

  return await Dialog.askYesOrNo('Do you want to proceed?', true);
}

async function cmd(cmd: string, options?: ExecOptions) {
  const {stdout, stderr} = await execCmdSafe(cmd, options);
  let result = stdout;
  if (stderr)
    result += `\t[err: ${stderr}]`;
  return result;
}

export default sendLogsAction;
