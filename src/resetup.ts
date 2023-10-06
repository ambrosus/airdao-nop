/*
Copyright: Ambrosus Inc.
Email: tech@ambrosus.io

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

import {ensureDirectoryExists} from './utils/file';
import {OUTPUT_DIRECTORY} from '../config/config';
import {deleteDockerAndParityFiles, stopDocker} from './utils/exec';
import configureSetup from './utils/setup';
import runDockerPhase from './phases/05_run_docker';
import {readState} from './utils/state';
const resetup = async () => {
  const state = await readState();
  await ensureDirectoryExists(OUTPUT_DIRECTORY);
  await stopDocker();
  await deleteDockerAndParityFiles();

  await configureSetup(state);

  await runDockerPhase();
};

resetup().catch((err) => {
  console.error(err);
  process.exit(1);
});
