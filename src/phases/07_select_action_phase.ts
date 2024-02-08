/*
Copyright: Ambrosus Inc.
Email: tech@ambrosus.io

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import Dialog from '../dialogs/dialog_model';
import messages from '../dialogs/messages';
import {
  check,
  quitAction,
  resetAction,
  sendLogsAction,
} from '../menu_actions';

export const ACTIONS = {
  [messages.actions.reset]: resetAction,
  [messages.actions.logs]: sendLogsAction,
  [messages.actions.check]: check,
  [messages.actions.quit]: quitAction
};

export async function selectActionPhase() {
  while (true) {
    const { action: selectedAction } = await Dialog.selectActionDialog(Object.keys(ACTIONS));

    try {
      await ACTIONS[selectedAction]();
    } catch (err) {
      Dialog.genericErrorDialog(err.message);
    }
  }
}
