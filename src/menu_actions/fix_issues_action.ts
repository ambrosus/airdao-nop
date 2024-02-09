/*
Copyright: Ambrosus Inc.
Email: tech@ambrosus.io

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import Dialog from '../dialogs/dialog_model';
import { readState } from '../utils/state';
import { dockerDown, dockerUp, execCmd } from '../utils/exec';
import { ethers } from 'ethers';
import * as fs from 'fs/promises';
import { OUTPUT_DIRECTORY } from '../../config/config';
import path from 'path';
import { getGitCommits } from "../utils/git";


const RPC_LOCAL = 'http://127.0.0.1:8545';

async function check() {
  const state = await readState();

  console.log('Checking...');

  const providerLocal = new ethers.providers.JsonRpcProvider(RPC_LOCAL);
  const providerRemote = new ethers.providers.JsonRpcProvider(state.network.rpc);

  await checkSyncing(providerLocal);
  await checkFork(providerLocal, providerRemote);
  await checkGitVersion();

  console.log('All Checks: passed');

}


async function checkSyncing(provider: ethers.providers.JsonRpcProvider) {
  const syncing = await provider.send('eth_syncing', []);

  if (syncing)
    console.log('Syncing... please wait');
  else
    console.log('Sync: OK');
}

async function checkGitVersion() {
  const {localHead, remoteHead} = await getGitCommits();
  if (localHead === remoteHead) {
    console.log('Git version: OK');
    return;
  }

  console.log('Git version: old version detected!');
  console.log('Local:', localHead, 'Remote:', remoteHead);
  const shouldFix = await Dialog.askYesOrNo('Do you want to fix this issue? (y/n):');
  if (shouldFix)
    await fixVersionIssue()
}

async function checkFork(providerLocal: ethers.providers.JsonRpcProvider, providerRemote: ethers.providers.JsonRpcProvider) {
  const { number: blockNumber, hash: blockHashLocal } = await providerLocal.getBlock('latest');
  const { hash: blockHashRemote } = await providerRemote.getBlock(blockNumber);

  if (blockHashRemote === blockHashLocal) {
    console.log('Fork: OK');
    return;
  }

  console.log('Fork: Parity has forked...');

  const shouldFix = await Dialog.askYesOrNo('Do you want to fix this issue? (y/n):');
  if (shouldFix)
    await fixForkIssue();

}

async function fixVersionIssue() {
  console.log('The NOP will be updated now and node will be restarted...\nYou can run NOP again after the update is complete.');
  await execCmd('./update.sh', { cwd: '../../' });
  process.exit(0);
}


async function fixForkIssue() {
  console.log('Fixing fork...');
  await dockerDown();

  console.log('Removing chains...');
  await fs.rm(path.join(OUTPUT_DIRECTORY, 'chains'), { recursive: true });

  console.log('Downloading backup...');
  await execCmd('curl -s https://backup.ambrosus.io/blockchain.tgz | tar zxpf -', { cwd: OUTPUT_DIRECTORY });

  await dockerUp();
  console.log('Fork fixed');
}




export default check;
