/*
Copyright: Ambrosus Inc.
Email: tech@ambrosus.io

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

import Dialog from '../dialogs/dialog_model';
import { Network } from '../interfaces/network';


type Networks = { [key: string]: Network };

const selectNetworkPhase = async (storedNetwork: Network, availableNetworks: Networks) => {
  const selectedNetwork = await selectNetwork(storedNetwork, availableNetworks);
  Dialog.networkSelectedDialog(selectedNetwork.name);
  return selectedNetwork as Network;
};


const selectNetwork = async (storedNetwork: Network, availableNetworks: Networks) => {
  if (storedNetwork)
      return availableNetworks[storedNetwork.name];
  return await askForNetwork(availableNetworks);
};


async function askForNetwork(availableNetworks: Networks) {
  const availableNetworksNames = Object.keys(availableNetworks);

  if (availableNetworksNames.length === 0)
    throw new Error('No networks are defined');

  if (availableNetworksNames.length === 1)
    return availableNetworks[availableNetworksNames[0]];

  const answers = await Dialog.askForNetworkDialog(availableNetworksNames);
  return availableNetworks[answers.network];
}

export default selectNetworkPhase;
