/*
Copyright: Ambrosus Inc.
Email: tech@ambrosus.io

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

import Dialog from './dialogs/dialog_model';
import networks from '../config/networks.json';
import checkDockerAvailablePhase from './phases/01_check_docker_available_phase';
import selectNetworkPhase from './phases/02_select_network_phase';
import getPrivateKeyPhase from './phases/03_get_private_key_phase';
import getNodeIPPhase from './phases/04_get_node_ip_phase';
import {readState, writeState} from './utils/state';
import setupNodeConfigFiles from './setup';
import runDockerPhase from './phases/05_run_docker';
import checkStatusInServerNodes from './phases/06_check_status_in_server_nodes';
import {selectActionPhase} from './phases/07_select_action_phase';
import { EXPLORER_URLS } from "../config/config";



export const start = async () => {
  Dialog.logoDialog();

  if (!(await checkDockerAvailablePhase()))
    return;

  const state = await readState();

  state.network = await selectNetworkPhase(state.network, networks);
  state.privateKey = await getPrivateKeyPhase(state.privateKey);
  state.ip = await getNodeIPPhase(state.ip);
  state.explorerUrl = EXPLORER_URLS[state.network.name] || EXPLORER_URLS.main;

  await writeState(state);

  await setupNodeConfigFiles(state);
  Dialog.setupCompleteDialog();

  await runDockerPhase();

  await checkStatusInServerNodes(state.privateKey, state.network, state.explorerUrl);

  await selectActionPhase();
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
