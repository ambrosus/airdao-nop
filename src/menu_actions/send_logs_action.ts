/*
Copyright: Ambrosus Inc.
Email: tech@ambrosus.io

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import * as fs from 'fs';
import inquirer from 'inquirer';
import {promises as fsPromises} from 'fs';
import {readState} from '../utils/state';
import {execCmd} from '../utils/exec';
import axios from 'axios';
import path from 'path';

const LOG_URL = 'https://transfer.ambrosus.io';
const NODE_CHECK_URL = 'https://node-check.ambrosus.io/';



async function sendLogsAction(): Promise<boolean> {
  try {
    const {address, network} = await readState();
    const timestamp = Math.floor(Date.now() / 1000);

    let debugInfo = `
    Address: ${address}
    Network: ${network}
    Timestamp: ${timestamp}
  `;
    fs.writeFileSync('./debug.txt', debugInfo, 'utf8');

    const shouldSendDebugFiles = await promptUserToSendDebugFiles();

    if (!shouldSendDebugFiles) {
      return false;
    }

    debugInfo += await moreDebugInfo();
    fs.writeFileSync('./debug.txt', debugInfo, 'utf8');

    await uploadDebugFiles(address, timestamp);
    return false;
  } catch (err) {
    console.error('An error occurred:', err);
    process.exit(1);
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

  const {proceed} = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: 'Proceed y/n?'
    }
  ]);

  return proceed;
}

async function moreDebugInfo(): Promise<string> {
  const cwd = process.cwd();
  const osRelease = await execCmdSafe('cat /etc/os-release');
  const memoryInfo = await execCmdSafe('cat /proc/meminfo');
  const directoryContents = await execCmdSafe('ls -la');
  const outputDirectoryContents = await execCmdSafe('ls -la airdao-nop/output');
  const diskBlockInfo = await execCmdSafe('df -h');
  const diskInodesInfo = await execCmdSafe('df -i');
  const processTree = await execCmdSafe('ps axjf');
  const memoryUsage = await execCmdSafe('free -m');
  const composeLogs = await getDockerLogs();

  return `
    Working directory: ${cwd}
    OS Release: ${osRelease}
    Memory Info: ${memoryInfo}
    Directory Contents: ${directoryContents}
    Output Directory Contents: ${outputDirectoryContents}
    Disk Block Info: ${diskBlockInfo}
    Disk Inodes Info: ${diskInodesInfo}
    Process Tree: ${processTree}
    Memory Usage: ${memoryUsage}
    compose.logs: ${composeLogs}
  `;
}

async function uploadDebugFiles(
  address: string,
  timestamp: number
): Promise<void> {
  const filePath = path.join(__dirname, '../../../debug.txt');
  const fileBuffer = await fsPromises.readFile(filePath);

  const uploadUrl = `${LOG_URL}/${address}-${timestamp}-debug.txt`;
  const response = await axios.put(uploadUrl, fileBuffer, {
    headers: {
      'Content-Type': 'text/plain'
    }
  });

  const debugUrl = response.data;

  const payload = {
    attachments: [
      {
        title: `${address}-${timestamp}`,
        text: debugUrl
      }
    ]
  };

  await axios.post(NODE_CHECK_URL, payload);
}

async function getDockerLogs() {
  try {
    process.chdir('airdao-nop/output');
    return await execCmdSafe('docker-compose logs --tail=500');
  } catch (error) {
    return `\n\nError while changing directory or fetching compose logs: ${error.message}`;
  }
}


async function execCmdSafe(cmd) {
  try {
    return await execCmd(cmd);
  } catch (error) {
    return `\n\nError while executing ${cmd}: ${error.message}`;
  }
}

export default sendLogsAction;
