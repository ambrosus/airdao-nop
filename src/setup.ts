/*
Copyright: Ambrosus Inc.
Email: tech@ambrosus.io

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

import configureSetup from './utils/setup';
import State from './interfaces/state';
import Crypto from './utils/crypto';

import {createKeyFile, createPasswordFile} from './utils/templates';

export default async function setup(state: State) {
  await configureSetup(state);

  const password = Crypto.getRandomPassword();
  await createPasswordFile(password);

  const encryptedWallet = Crypto.getEncryptedWallet(state.privateKey, password);
  await createKeyFile(encryptedWallet);
}
