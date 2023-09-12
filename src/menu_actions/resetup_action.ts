import util from "util";
import childProcess from "child_process";

const exec = util.promisify(childProcess.exec);

async function resetupAction() {
  try {
    console.log("Resetup: starting...");
    await exec("cd airdao-nop");
    await exec("docker-compose down");
    await exec(`mv state.json ${Date.now().toString()}-state.json`);

    await exec("yarn build && yarn start");
  } catch (e) {
    console.error("An error occurred:", e);
    return true;
  }
}

export default resetupAction;
