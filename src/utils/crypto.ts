/*
Copyright: Ambrosus Inc.
Email: tech@ambrosus.io

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

import { ethers } from "ethers";


export function generatePrivateKey() {
  return ethers.Wallet.createRandom().privateKey;
}

export function addressForPrivateKey(privateKey: string) {
  return new ethers.Wallet(privateKey).address;
}

export async function getEncryptedWallet(privateKey: string, password: string) {
  const wallet = new ethers.Wallet(privateKey);
  return wallet.encrypt(password);
}

export function getRandomPassword() {
  return ethers.utils.hexlify(ethers.utils.randomBytes(32));
}

