/*
Copyright: Ambrosus Inc.
Email: tech@ambrosus.io

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

import {execCmd} from '../utils/exec';
import {OUTPUT_DIRECTORY} from '../../config/config';
import {start} from '../start';
import {promises as fs} from 'fs';
import path from 'path';

async function renameFile() {
  const oldFilePath = path.join(__dirname, '../../../state.json');
  const newFileName = `${Date.now()}-state.json`;
  const newFilePath = path.join(__dirname, `../../../${newFileName}`);

  await fs.rename(oldFilePath, newFilePath);
}

async function resetupAction() {
  try {
    console.log('Resetup: starting...');
    await execCmd('docker-compose down', {cwd: OUTPUT_DIRECTORY});

    await renameFile();

    await start();
    return false;
  } catch (err) {
    console.error('An error occurred:', err);
    process.exit(1);
  }
}

export default resetupAction;
