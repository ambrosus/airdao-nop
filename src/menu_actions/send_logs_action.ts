import * as fs from "fs";
import { execSync } from "child_process";
import inquirer from "inquirer";
import Crypto from "../utils/crypto";

function getPrivateKey() {
  const filePath = "./state.json";
  try {
    const fileContents = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(fileContents);
    const privateKey = data.privateKey || "";

    return privateKey;
  } catch (error) {
    console.error("Error reading or parsing private key:", error);
    return "";
  }
}

function getAddress(privateKey: string): string {
  return Crypto.addressForPrivateKey(privateKey);
}

function getNetworkName(): string {
  const filePath = "./state.json";
  const key = "network.name";
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return (data[key] || "").toLowerCase();
  } catch (error) {
    return "";
  }
}

function getCurrentTimestamp(): number {
  return Date.now();
}

function writeDebugInfo(
  address: string,
  network: string,
  timestamp: number
): void {
  const debugInfo = `
    Address: ${address}
    Network: ${network}
    Timestamp: ${timestamp}
  `;
  fs.writeFileSync("debug.txt", debugInfo);
}

async function promptUserToSendDebugFiles(): Promise<boolean> {
  console.log("The information being sent is the following:");
  console.log("* Current working directory");
  console.log("* Output of /etc/os-release");
  console.log("* Output of /proc/meminfo");
  console.log("* Directory contents of airdao-nop");
  console.log("* Directory contents of airdao-nop/output");
  console.log("* Disk block information");
  console.log("* Disk inodes information");
  console.log("* Process tree");
  console.log("* Memory usage");

  const answers = await inquirer.prompt([
    {
      type: "confirm",
      name: "proceed",
      message: "Proceed y/n?",
    },
  ]);

  if (answers.proceed) {
    const answer = answers.proceed.toLowerCase();
    if (answer === "y" || answer === "yes") {
      return true;
    }
  }
  return false;
}

function appendSystemInfoToDebugFile(): void {
  execSync("set -o xtrace");

  {
    fs.appendFileSync(
      "debug.txt",
      `
      ${process.cwd()}
    `
    );
    fs.appendFileSync(
      "debug.txt",
      `
      ${fs.readFileSync("/etc/os-release", "utf8")}
    `
    );
    fs.appendFileSync(
      "debug.txt",
      `
      ${fs.readFileSync("/proc/meminfo", "utf8")}
    `
    );
    fs.appendFileSync(
      "debug.txt",
      `
      ${fs.readdirSync("./", { withFileTypes: true })}
    `
    );
    fs.appendFileSync(
      "debug.txt",
      `
      ${fs.readdirSync("./output", { withFileTypes: true })}
    `
    );
    fs.appendFileSync(
      "debug.txt",
      `
      ${execSync("df -h")}
    `
    );
    fs.appendFileSync(
      "debug.txt",
      `
      ${execSync("df -i")}
    `
    );
    fs.appendFileSync(
      "debug.txt",
      `
      ${execSync("ps axjf")}
    `
    );
    fs.appendFileSync(
      "debug.txt",
      `
      ${execSync("free -m")}
    `
    );
    fs.appendFileSync(
      "debug.txt",
      `
      ${fs.readFileSync("/proc/meminfo", "utf8")}
    `
    );
  }

  try {
    process.chdir("airdao-nop/output");

    fs.appendFileSync("../../debug.txt", "compose.logs\n");
    fs.appendFileSync(
      "../../debug.txt",
      execSync("docker-compose logs --tail=500")
    );

    process.chdir("../..");
  } catch (error) {
    console.error("Error while changing directory:", error.message);
  }

  execSync("set +o xtrace");
}

function uploadDebugFiles(address: string, timestamp: number): void {
  const logURL = "https://transfer.ambrosus.io";
  const debugUrl = execSync(
    `curl -s --upload-file ./debug.txt ${logURL}/${address}-${timestamp}-debug.txt`,
    { encoding: "utf8" }
  );

  execSync(
    `curl -X POST --data-urlencode "payload={"attachments": [{"title":"${address}-${timestamp}","text":"${debugUrl}"},]}" https://node-check.ambrosus.io/`
  );
}

async function sendLogsAction(): Promise<boolean> {
  try {
    const privateKey = getPrivateKey();
    const address = getAddress(privateKey);
    const network = getNetworkName();
    const timestamp = getCurrentTimestamp();

    writeDebugInfo(address, network, timestamp);

    const shouldSendDebugFiles = await promptUserToSendDebugFiles();

    if (shouldSendDebugFiles) {
      appendSystemInfoToDebugFile();
      uploadDebugFiles(address, timestamp);
    }
  } catch (e) {
    console.error("An error occurred:", e);
    return true;
  }
}

export default sendLogsAction;
