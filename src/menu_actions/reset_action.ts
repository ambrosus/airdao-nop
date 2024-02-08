/*
Copyright: Ambrosus Inc.
Email: tech@ambrosus.io

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

import { dockerDown } from '../utils/exec';
import { STATE_PATH } from '../../config/config';
import { start } from '../start';
import { promises as fs } from 'fs';
import path from 'path';
import Dialog from '../dialogs/dialog_model';

async function resetAction() {
  const newFileName = `state.json.backup.${getDate()}`;

  const answer = await Dialog.askYesOrNo(`Are you sure you want to reset your setup?
  Your node will shut down, and file with your current settings will be backed up. 
    (${STATE_PATH} -> ${newFileName}.
  You can restore your settings by renaming the file back to state.json.
  After that, you can setup the node again.   Continue? 
  `);

  if (!answer)
    return;

  await dockerDown()
  await renameStateFile(newFileName);
  await start();
}

async function renameStateFile(newFileName: string) {
  const directory = path.dirname(STATE_PATH);
  const newFilePath = path.join(directory, newFileName);
  await fs.rename(STATE_PATH, newFilePath);
}


function getDate() {
  return new Date().toISOString().split('T')[0]
}

export default resetAction;
