#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import * as childProcess from "child_process";

const exec = util.promisify(childProcess.exec);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

async function runUpdate() {
  try {
    await exec("yarn");
    await exec("yarn build");

    if (await util.promisify(fs.exists)("output/docker-compose.yml")) {
      await exec("yarn start update");
      await exec("docker-compose -f output/docker-compose.yml pull");
      await exec("docker-compose -f output/docker-compose.yml down");
      await exec("docker-compose -f output/docker-compose.yml up -d");
    }
  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1);
  }
}

async function updateVersionAction() {
  try {
    const scriptDirectory = path.dirname(path.resolve(__filename));

    if (fs.existsSync("/etc/cron.daily")) {
      const cronDailyPath = "/etc/cron.daily/airdao-nop";
      if (fs.existsSync(cronDailyPath)) {
        fs.unlinkSync(cronDailyPath);
      }
      fs.symlinkSync(path.join(scriptDirectory, "update.ts"), cronDailyPath);
    }

    await writeFile(
      "/etc/sysctl.d/10-airdao.conf",
      "net.ipv6.conf.all.disable_ipv6=1\n",
      "utf-8"
    );

    await exec("sysctl -p /etc/sysctl.d/10-airdao.conf");

    await exec("git checkout yarn.lock");
    await exec("git checkout run-update.ts");
    await exec("git pull origin master");

    await runUpdate();
  } catch (e) {
    console.error("An error occurred:", e);
    return true;
  }
}

export default updateVersionAction;
