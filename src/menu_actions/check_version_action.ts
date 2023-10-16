/*
Copyright: Ambrosus Inc.
Email: tech@ambrosus.io

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import axios from 'axios';
import fs from 'fs/promises';
import inquirer from 'inquirer';
import {execCmd} from '../utils/exec';
import {readState} from '../utils/state';

const STATE_FILE_PATH = './state.json';

const RPC_LOCAL = 'http://127.0.0.1:8545';

async function getVar(filePath, key) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data)[key]?.toLowerCase() || null;
  } catch (error) {
    console.error('Error reading the file:', error);
    return null;
  }
}

async function getAnswerToFixIssue(answerText) {
  const {answer} = await inquirer.prompt([
    {
      type: 'input',
      name: 'answer',
      message: answerText
    }
  ]);
  return answer.toLowerCase() === 'y';
}

async function fixIssues(type) {
  switch (type) {
    case 'fork':
      await fixForkIssue();
      break;
    case 'topology':
      await fixTopologyIssue();
      break;
  }
}

async function fixForkIssue() {
  console.log('Fixing fork...');
  await execCmds([
    'cd ./output || return',
    'docker stop parity',
    'rm -rf chains',
    'curl -s https://backup.ambrosus.io/blockchain.tgz | tar zxpf -',
    'docker start parity'
  ]);
  console.log('Fork fixed');
}

async function fixTopologyIssue() {
  console.log('Topology: destroyed');
  const answer = await getAnswerToFixIssue('Do you want to fix this issue? (y/n):');
  if (answer) {
    await execCmds([
      'set -o xtrace',
      'docker stop atlas_server atlas_worker mongod',
      'docker start mongod atlas_worker atlas_server',
      'set +o xtrace'
    ]);
  }
}

async function execCmds(cmds) {
  for (const cmd of cmds) {
    await execCmd(cmd);
  }
}

async function checkURL(url) {
  try {
    const nodeInfoResponse = await axios.get(`${url}/nodeinfo`);
    const {reason, version} = nodeInfoResponse.data;

    if (reason === 'Topology was destroyed') {
      await fixIssues('topology');
    } else {
      console.log('Topology: OK');
    }

    if (!version || version === 'null') {
      console.log('URL: nodeinfo check failed');
      return;
    }
    console.log('URL: OK');
  } catch (error) {
    console.error('Error:', error);
  }
}

async function checkVersionAction() {
  try {
    const state = await readState();
    const environment = state.network.name;
    const rpcSuffix = {dev: '-dev', test: '-test'}[environment] || '';
    const rpcRemote = `https://network.ambrosus${rpcSuffix}.io`;

    console.log('Checking...');

    const syncing = await rpcCall(RPC_LOCAL, 'eth_syncing');
    if (syncing) {
      console.log('Syncing... please wait');
      return true;
    }
    console.log('Sync: OK');

    const blockNumber = await rpcCall(RPC_LOCAL, 'eth_blockNumber');
    const blockHashLocal = await rpcCall(RPC_LOCAL, 'eth_getBlockByNumber', [
      blockNumber,
      false
    ]);
    const blockHashRemote = await rpcCall(rpcRemote, 'eth_getBlockByNumber', [
      blockNumber,
      false
    ]);

    if (blockHashRemote !== blockHashLocal) {
      console.log('Fork: Parity has forked...');
      const shouldFix = await getAnswerToFixIssue(
        'Do you want to fix this issue? (y/n):'
      );
      if (shouldFix) {
        await fixIssues('fork');
      }
    } else {
      console.log('Fork: OK');
    }

    const url = await getVar(STATE_FILE_PATH, 'url');
    if (url) {
      await checkURL(url);
    }

    console.log('All Checks: passed');
    return false;
  } catch (err) {
    console.error('An error occurred:', err);
  }
}

async function rpcCall(endpoint, method, params = []) {
  try {
    const response = await axios.post(endpoint, {
      jsonrpc: '2.0',
      method,
      params,
      id: 1
    });
    return response.data.result;
  } catch (error) {
    console.error(`Error during RPC ${method} call:`, error);
    process.exit(1);
  }
}

export default checkVersionAction;
