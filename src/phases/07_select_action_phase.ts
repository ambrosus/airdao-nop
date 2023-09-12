/*
Copyright: Ambrosus Inc.
Email: tech@ambrosus.io

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import Dialog from "../dialogs/dialog_model";
import messages from "../dialogs/messages";
import {
  checkVersionAction,
  quitAction,
  resetupAction,
  sendLogsAction,
  updateVersionAction,
} from "../menu_actions";

export const defaultActions = {
  [messages.actions.resetup]: resetupAction,
  [messages.actions.logs]: sendLogsAction,
  [messages.actions.check]: checkVersionAction,
  [messages.actions.update]: updateVersionAction,
  [messages.actions.quit]: quitAction,
};

export const selectActionPhase = async (actions = defaultActions) => {
  let shouldQuit = false;
  while (!shouldQuit) {
    const { action: selectedAction } = await Dialog.selectActionDialog(actions);
    try {
      shouldQuit = await actions[selectedAction]();
    } catch (err) {
      if (err.message.includes("Insufficient funds")) {
        Dialog.insufficientFundsDialog();
      } else {
        Dialog.genericErrorDialog(err.message);
      }
    }
  }
  return;
};
