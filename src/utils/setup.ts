/*
Copyright: Ambrosus Inc.
Email: tech@ambrosus.io

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

import State from '../interfaces/state';
import {OUTPUT_DIRECTORY} from '../../config/config';
import {ensureDirectoryExists} from './file';
import {
  createDockerComposeFile,
  createParityConfigFile,
  fetchChainJson,
  getExtraData,
  readTemplates
} from './templates';
import Crypto from './crypto';

export default async function configureSetup(state: State) {
  await ensureDirectoryExists(OUTPUT_DIRECTORY);

  const address = Crypto.addressForPrivateKey(state.privateKey);
  const networkName = await fetchChainJson(state.network.chainspec);

  const {dockerTemplate, parityTemplate} = await readTemplates(networkName);

  const extraData = await getExtraData(dockerTemplate);
  await createParityConfigFile(parityTemplate, address, state.ip, extraData);
  await createDockerComposeFile(
    dockerTemplate,
    address,
    networkName,
    state.network.domain
  );
}
