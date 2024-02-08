/*
Copyright: Ambrosus Inc.
Email: tech@ambrosus.io

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import {
  Contracts,
  Methods,
  ContractNames
} from '@airdao/airdao-node-contracts';
import Dialog from '../dialogs/dialog_model';
import { ethers } from 'ethers';
import { Network } from '../interfaces/network';
import { addressForPrivateKey } from "../utils/crypto";

export default async function checkStatusInServerNodes(
  privateKey: string,
  network: Network,
  explorerUrl: string
) {
  const currentTimeInSeconds = Date.now() / 1000;
  const provider = new ethers.providers.JsonRpcProvider(network.rpc);

  const signer = new ethers.VoidSigner(ethers.constants.AddressZero, provider);
  const { chainId } = await provider.getNetwork();

  const address = addressForPrivateKey(privateKey);

  const contracts = new Contracts(signer, chainId);

  let apolloInfo;
  try {
    apolloInfo = await Methods.getApolloInfo(contracts, address);
  } catch (e) {
    Dialog.genericErrorDialog("can't fetch info about your node");
    return;
  }

  if (!apolloInfo) {
    Dialog.notRegisteredDialog(explorerUrl);
    return;
  }

  if (apolloInfo.isOnboarded) {
    Dialog.alreadyOnboardedDialog(explorerUrl, address);
    return;
  }

  const contract = contracts.getContractByName(ContractNames.ServerNodesManager);
  const onboardingDelay = (await contract.onboardingDelay()).toNumber();
  const stakeTimestamp = apolloInfo.apollo.timestampStake.toNumber()

  const timeToWait = stakeTimestamp + onboardingDelay - currentTimeInSeconds;

  Dialog.waitOnboardingDialog(timeToWait);

}

