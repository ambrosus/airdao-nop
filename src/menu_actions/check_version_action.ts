import axios from "axios";
import fs from "fs/promises";
import inquirer from "inquirer";
import { execSync } from "child_process";

async function getVar(filePath, key) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    const jsonData = JSON.parse(data);
    const value = jsonData[key];
    return value ? value.toLowerCase() : null;
  } catch (error) {
    return null;
  }
}

async function rpc_syncing(endpoint) {
  try {
    const response = await axios.post(endpoint, {
      jsonrpc: "2.0",
      method: "eth_syncing",
      params: [],
      id: 1,
    });
    return response.data.result === true;
  } catch (error) {
    return false;
  }
}

async function rpc_blockNumber(endpoint) {
  try {
    const response = await axios.post(endpoint, {
      jsonrpc: "2.0",
      method: "eth_blockNumber",
      params: [],
      id: 1,
    });
    return response.data.result;
  } catch (error) {
    return null;
  }
}

async function rpc_getBlockByNumber(endpoint, blockNumber) {
  try {
    const response = await axios.post(endpoint, {
      jsonrpc: "2.0",
      method: "eth_getBlockByNumber",
      params: [blockNumber, false],
      id: 1,
    });
    return response.data.result?.hash || null;
  } catch (error) {
    return null;
  }
}

async function getAnswerToFixIssue(answerText) {
  const { answer } = await inquirer.prompt([
    {
      type: "input",
      name: "answer",
      message: answerText,
    },
  ]);
  return answer.toLowerCase() === "y";
}

async function fixForkIssue() {
  console.log("Fork: fixing ...");
  execSync("cd ./output || return");
  execSync("docker stop parity");
  execSync("rm -rf chains");
  execSync("curl -s https://backup.ambrosus.io/blockchain.tgz | tar zxpf -");
  execSync("docker start parity");
  console.log("Fork: fixed");
}

async function fixTopologyIssue() {
  console.log("Topology: destroyed");
  const answer = await getAnswerToFixIssue(
    "Do you want to fix this issue? (y/n):"
  );
  if (answer) {
    execSync("set -o xtrace");

    execSync("docker stop atlas_server");
    execSync("docker stop atlas_worker");
    execSync("docker stop mongod");

    execSync("docker start mongod");
    execSync("docker start atlas_worker");
    execSync("docker start atlas_server");
    execSync("set +o xtrace");
  }
}

async function checkURL(urlS) {
  try {
    const { execSync } = require("child_process");
    const getUrlJSPath = "ambrosus-nop/dist/src/getUrl.js";
    const urlC = execSync(`node ${getUrlJSPath}`, { encoding: "utf8" }).trim();

    if (urlS !== urlC) {
      console.log("URL[C]: URLs in state.json and contract mismatch");
      return;
    }

    const nodeInfoResponse = await axios.get(`${urlS}/nodeinfo`);
    const reason = nodeInfoResponse.data.reason;

    if (reason === "Topology was destroyed") {
      await fixTopologyIssue();
    } else {
      console.log("Topology: OK");
    }

    const version = nodeInfoResponse.data.version;

    if (!version || version === "null") {
      console.log("URL: nodeinfo check failed");
      return;
    } else {
      console.log("URL: OK");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function syncCheckAndFix(rpcLocal) {
  const syncing = await rpc_syncing(rpcLocal);

  if (syncing) {
    console.log("Sync: syncing ... please wait");
    return;
  } else {
    console.log("Sync: OK");
  }

  const blockNumber = await rpc_blockNumber(rpcLocal);

  const blockHashLocal = await rpc_getBlockByNumber(rpcLocal, blockNumber);

  return { blockNumber, blockHashLocal };
}

async function checkVersionAction() {
  try {
    const stateFilePath = "./state.json";
    const environment = await getVar(stateFilePath, "network.name");

    let rpcSuffix = "";
    switch (environment) {
      case "dev":
        rpcSuffix = "-dev";
        break;
      case "test":
        rpcSuffix = "-test";
        break;
      default:
        rpcSuffix = "";
    }

    const rpcRemote = `https://network.ambrosus${rpcSuffix}.io`;
    const rpcLocal = "http://127.0.0.1:8545";

    console.log("Checking ...");

    const { blockNumber, blockHashLocal } = await syncCheckAndFix(rpcLocal);

    const blockHashRemote = await rpc_getBlockByNumber(rpcRemote, blockNumber);

    if (!blockHashLocal) {
      console.log("rpcCall[L]: error");
      return;
    }

    if (!blockHashRemote) {
      console.log("rpcCall[R]: error, parity is not accessible");
      return;
    }

    if (blockHashRemote !== blockHashLocal) {
      console.log("Fork: parity forked ...");
      const shouldFix = await getAnswerToFixIssue(
        "Do you want to fix this issue? (y/n):"
      );
      if (shouldFix) {
        await fixForkIssue();
      }
    } else {
      console.log("Fork: OK");
    }

    const urlS = await getVar(stateFilePath, "url");

    if (!urlS) {
      console.log("URL[S]: state.json info not found");
      return;
    }

    await checkURL(urlS);

    console.log("All Checks: passed");
  } catch (e) {
    console.error("An error occurred:", e);
    return true;
  }
}

export default checkVersionAction;
