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

function getCurrentTimestamp(): number {
  return Date.now();
}

function writeDebugInfo(
  address: string,
  network: string,
  timestamp: number
): void {
  const debugInfo = `
    Address: ${address}
    Network: ${network}
    Timestamp: ${timestamp}
  `;
  fs.writeFileSync('debug.txt', debugInfo);
}

async function promptUserToSendDebugFiles(): Promise<boolean> {
  const messages = [
    'The information being sent is the following:',
    '* Current working directory',
    '* OS Release',
    '* Memory Info',
    '* Directory Contents',
    '* Output Directory Contents',
    '* Disk Block Info',
    '* Disk Inodes Info',
    '* Process Tree',
    '* Memory Usage'
  ];

  console.log(messages.join('\n'));

  const {proceed} = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: 'Proceed y/n?'
    }
  ]);

  return proceed;
}

async function appendSystemInfoToDebugFile(): Promise<string> {
  const commands = [
    {label: 'Working Directory', cmd: process.cwd},
    {
      label: 'OS Release',
      cmd: () => fs.readFileSync('/etc/os-release', 'utf8')
    },
    {
      label: 'Memory Info',
      cmd: () => fs.readFileSync('/proc/meminfo', 'utf8')
    },
    {
      label: 'Directory Contents',
      cmd: () => fs.readdirSync('./', {withFileTypes: true}).toString()
    },
    {
      label: 'Output Directory Contents',
      cmd: () => fs.readdirSync('/output', {withFileTypes: true}).toString()
    },
    {label: 'Disk Block Info', cmd: 'df -h'},
    {label: 'Disk Inodes Info', cmd: 'df -i'},
    {label: 'Process Tree', cmd: 'ps axjf'},
    {label: 'Memory Usage', cmd: 'free -m'}
  ];

  let result = '';
  for (const command of commands) {
    try {
      const output =
        typeof command.cmd === 'function'
          ? command.cmd()
          : await execCmd(command.cmd);
      result += `\n\n${command.label}:\n${output}`;
    } catch (err) {
      result += `\n\nError getting ${command.label}: ${err.message}`;
    }
  }

  try {
    process.chdir('airdao-nop/output');
    result += '\n\ncompose.logs:\n';
    result += await execCmd('docker-compose logs --tail=500');
    process.chdir('../..');
  } catch (error) {
    result += `\n\nError while changing directory or fetching compose logs: ${error.message}`;
  }

  return result;
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

async function sendLogsAction(): Promise<boolean> {
  try {
    const {address, network} = await readState();
    const timestamp = getCurrentTimestamp();

    writeDebugInfo(address, network.name, timestamp);

    const shouldSendDebugFiles = await promptUserToSendDebugFiles();

    if (shouldSendDebugFiles) {
      await appendSystemInfoToDebugFile();
      await uploadDebugFiles(address, timestamp);
    }

    return false;
  } catch (err) {
    console.error('An error occurred:', err);
    process.exit(1);
  }
}

export default sendLogsAction;
