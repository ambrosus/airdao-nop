/*
Copyright: Ambrosus Inc.
Email: tech@ambrosus.io

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import {readFile, writeFile} from 'fs/promises';
import path from 'path';
import {
  CHAIN_DESCRIPTION_FILE_NAME,
  DOCKER_FILE_NAME, KEY_FILE_NAME,
  OUTPUT_DIRECTORY,
  PARITY_CONFIG_FILE_NAME, PASSWORD_FILE_NAME,
  TEMPLATE_DIRECTORY
} from "../../config/config";
import jsyaml from 'js-yaml';
import {fileDownload} from './http_utils';

const APOLLO = 'apollo';

export async function getExtraData(dockerTemplate) {
  const dockerYaml = await jsyaml.load(dockerTemplate);
  const parityVersion = dockerYaml.services.parity.image.split(':');
  return `Apollo ${parityVersion[1]}`;
}

export async function createDockerComposeFile(
  dockerTemplateFile,
  address,
  networkName,
  domain
) {
  const dockerFile = dockerTemplateFile
    .replace(/<ENTER_YOUR_ADDRESS_HERE>/gi, address)
    .replace(/<ENTER_NETWORK_NAME_HERE>/gi, networkName)
    .replace(/<ENTER_DOMAIN_HERE>/gi, domain);

  await writeFile(path.join(OUTPUT_DIRECTORY, DOCKER_FILE_NAME), dockerFile);
}

export async function createParityConfigFile(
  parityTemplateFile,
  address,
  ip,
  extraData
) {
  const parityFile = parityTemplateFile
    .replace(/<TYPE_YOUR_ADDRESS_HERE>/gi, address)
    .replace(/<TYPE_YOUR_IP_HERE>/gi, ip)
    .replace(/<TYPE_EXTRA_DATA_HERE>/gi, extraData);

  await writeFile(
    path.join(OUTPUT_DIRECTORY, PARITY_CONFIG_FILE_NAME),
    parityFile
  );
}

export async function createPasswordFile(password) {
  await writeFile(path.join(OUTPUT_DIRECTORY, PASSWORD_FILE_NAME), password);
}

export async function createKeyFile(encryptedWallet) {
  const data = JSON.stringify(encryptedWallet, null, 2);
  await writeFile(path.join(OUTPUT_DIRECTORY, KEY_FILE_NAME), data);
}

export async function fetchChainJson(chainSpecUrl) {
  const chainFilePath = path.join(
    OUTPUT_DIRECTORY,
    CHAIN_DESCRIPTION_FILE_NAME
  );
  await fileDownload(chainSpecUrl, chainFilePath);

  const parsedChainJson = JSON.parse(
    await readFile(chainFilePath, {encoding: 'utf-8'})
  );
  return parsedChainJson.name;
}

export async function readTemplates(networkName) {
  const dockerTemplate = await readFile(
    path.join(TEMPLATE_DIRECTORY, APOLLO, networkName, DOCKER_FILE_NAME),
    {encoding: 'utf-8'}
  );
  const parityTemplate = await readFile(
    path.join(TEMPLATE_DIRECTORY, APOLLO, networkName, PARITY_CONFIG_FILE_NAME),
    {encoding: 'utf-8'}
  );

  return {dockerTemplate, parityTemplate};
}
