/*
Copyright: Ambrosus Inc.
Email: tech@ambrosus.io

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

import jsyaml from 'js-yaml';
import { readFile, writeFile } from 'fs/promises';
import { fileDownload } from './utils/http_utils';
import {
  CHAIN_DESCRIPTION_PATH,
  DOCKER_COMPOSE_PATH,
  dockerFileTemplatePath,
  KEY_PATH,
  OUTPUT_DIRECTORY,
  PARITY_CONFIG_PATH,
  parityConfigTemplatePath,
  PASSWORD_PATH
} from '../config/config';
import State from './interfaces/state';
import { ensureDirectoryExists } from './utils/file';
import { addressForPrivateKey, getEncryptedWallet, getRandomPassword } from "./utils/crypto";


export default async function setupNodeConfigFiles(state: State) {
  await ensureDirectoryExists(OUTPUT_DIRECTORY);

  const address = addressForPrivateKey(state.privateKey);
  const networkName = await fetchChainJson(state.network.chainspec);

  const {dockerTemplate, parityTemplate} = await readTemplates(networkName);

  const extraData = await getExtraData(dockerTemplate);
  await createParityConfigFile(parityTemplate, address, state.ip, extraData);
  await createDockerComposeFile(dockerTemplate, address, networkName, state.network.domain);

  const password = getRandomPassword();
  await writeFile(PASSWORD_PATH, password);

  const encryptedWallet = await getEncryptedWallet(state.privateKey, password);
  await writeFile(KEY_PATH, encryptedWallet);
}


async function getExtraData(docketTemplate: string) {
  const dockerYaml = await jsyaml.load(docketTemplate) as any;
  const parityVersion = dockerYaml.services.parity.image.split(':');
  return `Apollo ${parityVersion[1]}`;
}

async function createDockerComposeFile(dockerTemplateFile: string, address: string, networkName: string, domain: string) {
  const dockerFile = dockerTemplateFile
    .replace(/<ENTER_YOUR_ADDRESS_HERE>/gi, address)
    .replace(/<ENTER_NETWORK_NAME_HERE>/gi, networkName)
    .replace(/<ENTER_DOMAIN_HERE>/gi, domain);

  await writeFile(DOCKER_COMPOSE_PATH, dockerFile);
}

async function createParityConfigFile(parityTemplateFile: string, address: string, ip: string, extraData: string) {
  const parityFile = parityTemplateFile
    .replace(/<TYPE_YOUR_ADDRESS_HERE>/gi, address)
    .replace(/<TYPE_YOUR_IP_HERE>/gi, ip)
    .replace(/<TYPE_EXTRA_DATA_HERE>/gi, extraData);

  await writeFile(PARITY_CONFIG_PATH, parityFile);
}


async function fetchChainJson(chainspecUrl: string) {
  await fileDownload(chainspecUrl, CHAIN_DESCRIPTION_PATH);

  const parsedChainJson = JSON.parse(await readFile(CHAIN_DESCRIPTION_PATH, {encoding: 'utf-8'}));
  return parsedChainJson.name;
}

async function readTemplates(networkName: string) {
  const dockerTemplate = await readFile(dockerFileTemplatePath(networkName), {encoding: 'utf-8'});
  const parityTemplate = await readFile(parityConfigTemplatePath(networkName), {encoding: 'utf-8'});

  return {dockerTemplate, parityTemplate};
}
