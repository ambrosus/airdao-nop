/*
Copyright: Ambrosus Inc.
Email: tech@ambrosus.io

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import inquirer from 'inquirer';
import {readState} from '../utils/state';
import {execCmd} from '../utils/exec';
import {ethers} from 'ethers';


const RPC_LOCAL = 'http://127.0.0.1:8545';

async function check() {
  try {
    const state = await readState();
    const environment = state.network.name;

    const rpcSuffix = {dev: '-dev', test: '-test'}[environment] || '';
    const rpcRemote = `https://network.ambrosus${rpcSuffix}.io`;

    console.log('Checking...');

    const providerLocal = new ethers.providers.JsonRpcProvider(RPC_LOCAL);
    const providerRemote = new ethers.providers.JsonRpcProvider(rpcRemote);

    await checkSyncing(providerLocal);
    await checkFork(providerLocal, providerRemote);
    // todo old git version check

    console.log('All Checks: passed');
    return false;
  } catch (err) {
    console.error('An error occurred:', err);
  }
}


async function checkSyncing(provider: ethers.providers.JsonRpcProvider) {
  const syncing = await provider.send('eth_syncing', []);
  if (syncing) {
    console.log('Syncing... please wait');
    return true;
  }
  console.log('Sync: OK');
}


async function checkFork(providerLocal: ethers.providers.JsonRpcProvider, providerRemote: ethers.providers.JsonRpcProvider) {

  const {number: blockNumber, hash: blockHashLocal} = await providerLocal.getBlock('latest');
  const {hash: blockHashRemote} = await providerRemote.getBlock(blockNumber)

  if (blockHashRemote !== blockHashLocal) {
    console.log('Fork: Parity has forked...');
    const shouldFix = await getAnswerToFixIssue('Do you want to fix this issue? (y/n):');
    if (shouldFix) {
      await fixForkIssue();
    }
  } else {
    console.log('Fork: OK');
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


async function execCmds(cmds) {
  for (const cmd of cmds) {
    await execCmd(cmd);
  }
}

export default check;
