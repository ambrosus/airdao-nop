/*
Copyright: Ambrosus Inc.
Email: tech@ambrosus.io

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

import {execCmd} from '../utils/exec';
import {OUTPUT_DIRECTORY} from '../../config/config';
import {start} from '../start';

async function resetupAction() {
  try {
    console.log('Resetup: starting...');
    await execCmd('docker-compose down', {cwd: OUTPUT_DIRECTORY});
    await execCmd(`mv state.json ${Date.now().toString()}-state.json`);

    await start();
  } catch (err) {
    console.error('An error occurred:', err);
    return true;
  }
}

export default resetupAction;
