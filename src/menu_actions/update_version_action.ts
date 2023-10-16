#!/usr/bin/env node
/*
Copyright: Ambrosus Inc.
Email: tech@ambrosus.io

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import {execCmd} from '../utils/exec';

const writeFileAsync = util.promisify(fs.writeFile);
const fileExistsAsync = util.promisify(fs.exists);
const CRON_DAILY_PATH = './etc/cron.daily/airdao-nop';
const SYSCTL_CONFIG_PATH = './etc/sysctl.d/10-airdao.conf';

async function updateDockerCompose() {
  if (await fileExistsAsync('./output/docker-compose.yml')) {
    await execCmd('yarn start update');
    await execCmd('docker-compose -f output/docker-compose.yml pull');
    await execCmd('docker-compose -f output/docker-compose.yml down');
    await execCmd('docker-compose -f output/docker-compose.yml up -d');
  }
}

async function setDailyCron(scriptDirectory: string) {
  if (fs.existsSync('./etc/cron.daily')) {
    if (fs.existsSync(CRON_DAILY_PATH)) {
      fs.unlinkSync(CRON_DAILY_PATH);
    }
    fs.symlinkSync(path.join(scriptDirectory, 'update.ts'), CRON_DAILY_PATH);
  }
}

async function updateVersionAction() {
  try {
    const scriptDirectory = path.dirname(path.resolve(__filename));

    await setDailyCron(scriptDirectory);

    await writeFileAsync(
      SYSCTL_CONFIG_PATH,
      'net.ipv6.conf.all.disable_ipv6=1\n',
      'utf-8'
    );

    await execCmd(`sysctl -p ${SYSCTL_CONFIG_PATH}`);
    await execCmd('git checkout yarn.lock');
    await execCmd('git checkout run-update.ts');
    await execCmd('git pull origin master');

    await updateDockerCompose();
    return false;
  } catch (err) {
    console.error('An error occurred while updating:', err);
    process.exit(1);
  }
}

export default updateVersionAction;

