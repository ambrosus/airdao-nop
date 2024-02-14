/*
Copyright: Ambrosus Inc.
Email: tech@ambrosus.io

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

import path from "path";


export const TEMPLATE_DIRECTORY = path.resolve(process.env.TEMPLATE_DIRECTORY || './setup_templates/');
export const OUTPUT_DIRECTORY = path.resolve(process.env.OUTPUT_DIRECTORY || './output');

export const STATE_PATH = path.resolve(process.env.STORE_PATH || 'state.json');


export const PASSWORD_PATH = path.join(OUTPUT_DIRECTORY, 'password.pwds');
export const KEY_PATH = path.join(OUTPUT_DIRECTORY, 'keyfile');
export const CHAIN_DESCRIPTION_PATH = path.join(OUTPUT_DIRECTORY, 'chain.json');

export const DOCKER_COMPOSE_PATH = path.join(OUTPUT_DIRECTORY, 'docker-compose.yml');
export const PARITY_CONFIG_PATH = path.join(OUTPUT_DIRECTORY, 'parity_config.toml');

export const dockerFileTemplatePath = (networkName: string) => path.join(TEMPLATE_DIRECTORY, 'apollo', networkName, 'docker-compose.yml');
export const parityConfigTemplatePath = (networkName: string) => path.join(TEMPLATE_DIRECTORY, 'apollo', networkName, 'parity_config.toml');


export const EXPLORER_URLS = {
  main: 'https://airdao.io/explorer/',
  dev: 'https://devnet.airdao.io/explorer/',
  test: 'https://testnet.airdao.io/explorer/'
};
