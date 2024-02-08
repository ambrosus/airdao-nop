/*
Copyright: Ambrosus Inc.
Email: tech@ambrosus.io

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import inquirer from 'inquirer';
import {readState} from '../utils/state';
import { dockerGetLogs, execCmd, execCmdSafe } from '../utils/exec';
import axios from 'axios';
import Dialog from '../dialogs/dialog_model';

const TRANSFERSH_URL = 'https://transfer.ambrosus.io/';
const NODE_CHECK_URL = 'https://node-check.ambrosus.io/';


async function sendLogsAction(): Promise<boolean> {
  const shouldSendDebugFiles = await promptUserToSendDebugFiles();
  if (!shouldSendDebugFiles)
    return;

  const info = await collectDebugInfo();

  const title = `${info.address}-${info.timestamp}`;
  const data = `
    Address: ${info.address}
    Network: ${info.network}
    Timestamp: ${info.timestamp}
    
    Working directory: ${info.cwd}
    OS Release: ${info.osRelease}
    Memory Info: ${info.memoryInfo}
    Directory Contents: ${info.directoryContents}
    Output Directory Contents: ${info.outputDirectoryContents}
    Disk Block Info: ${info.diskBlockInfo}
    Disk Inodes Info: ${info.diskInodesInfo}
    Process Tree: ${info.processTree}
    Memory Usage: ${info.memoryUsage}
    compose.logs: ${info.composeLogs}
  `;

  await uploadDebugInfo(title, data);
}


async function collectDebugInfo() {
  const {address, network} = await readState();
  const timestamp = Math.floor(Date.now() / 1000);

  const cwd = process.cwd();
  const osRelease = await execCmdSafe('cat /etc/os-release');
  const memoryInfo = await execCmdSafe('cat /proc/meminfo');
  const directoryContents = await execCmdSafe('ls -la');
  const outputDirectoryContents = await execCmdSafe('ls -la airdao-nop/output');
  const diskBlockInfo = await execCmdSafe('df -h');
  const diskInodesInfo = await execCmdSafe('df -i');
  const processTree = await execCmdSafe('ps axjf');
  const memoryUsage = await execCmdSafe('free -m');
  const composeLogs = await dockerGetLogsSafe();

  return {
    address, network, timestamp, cwd, osRelease, memoryInfo, directoryContents, outputDirectoryContents,
    diskBlockInfo, diskInodesInfo, processTree, memoryUsage, composeLogs
  };

}

async function uploadDebugInfo(title: string, data: string): Promise<void> {
  const uploadedInfoUrl = await uploadToTransferSh(`${title}-debug.txt`, data);
  console.log(uploadedInfoUrl)
  await sendToSlack(title, uploadedInfoUrl);

}

async function uploadToTransferSh(title: string, data: string): Promise<string> {
  const response = await axios.put(TRANSFERSH_URL + title, data);
  if (response.status !== 200)
    throw new Error(`Failed to upload debug info: ${response.data}`);
  return response.data;
}

async function sendToSlack(title: string, text: string): Promise<void> {
  const response = await axios.post(NODE_CHECK_URL, {attachments: [{title, text}]});
  if (response.status !== 200)
    throw new Error(`Failed to send debug info: ${response.data}`);
}


async function dockerGetLogsSafe() {
  try {
    return await dockerGetLogs();
  } catch (error) {
    return `\n\nError while changing directory or fetching compose logs: ${error.message}`;
  }
}



async function promptUserToSendDebugFiles(): Promise<boolean> {
  console.log(
    `The information being sent is the following:
    \n* Current working directory
    \n* OS Release
    \n* Memory Info
    \n* Directory Contents
    \n* Output Directory Contents
    \n* Disk Block Info
    \n* Disk Inodes Info
    \n* Process Tree
    \n* Memory Usage`
  );

  return await Dialog.askYesOrNo('Do you want to proceed?');
}

export default sendLogsAction;
