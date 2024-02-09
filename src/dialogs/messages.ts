/*
Copyright: Ambrosus Inc.
Email: tech@ambrosus.io

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

const messages = {
  networkQuestion: 'Which network do you want to be onboarded to?',
  noPrivateKeyQuestion: `No private key setup yet. What do you want to do?`,
  privateKeyManualInputAnswer: 'Input existing key manually',
  privateKeyAutoGenerationAnswer: 'Generate new key automatically',
  privateKeyInputInstruction: `Please provide your private key (in hex form):`,
  privateKeyInputError: (wrongValue) =>
    `${wrongValue} is not a valid private key`,
  dockerInstalledInfo: '✅ Docker is installed',
  dockerMissingInfo:
    '⛔ Docker is required, and was not found. Please verify your installation',
  privateKeyInfo: (address) =>
    `✅ Private key verified. Your address is ${address}`,
  nodeIPGuessQuestion: (ip) =>
    `Please provide the IP address, which you will be using for your node. \nIs ${ip} correct?`,
  nodeIPInputInstruction:
    'Provide the IP address, which you will be using for your node',
  nodeIPInputError: (wrongValue) => `${wrongValue} is not a valid IP address`,
  nodeIPInfo: (ip) => `Node IP defined as ${ip}`,
  networkSelected: (network) => `Network: ${network}`,
  dockerComposeCommand: 'docker-compose up -d',
  dockerSetupComplete: '🎉 Your node configuration is ready 🎉',
  dockerStarting: 'Starting docker containers... 🐳',
  dockerStarted: '🎉 Your node is launched! 🎉',
  dockerError: 'Something went wrong. Please check the logs below.',
  insufficientFunds:
    'You have insufficient funds to perform transaction 💸\n Top up with small amount and retry',
  genericError: (message) => `An error occurred: ${message}`,
  warningMessage: '⚠️ WARNING! ⚠️',
  dockerRestartRequired:
    'Changes in network have been detected. Please restart the docker containers with',
  alreadyOnboarded: (explorerUrl, nodeAddress) =>
    `Node registered and onboarded to the network🎉. You can check it here: ${explorerUrl}apollo/${nodeAddress}`,
  notOnboarded: 'Your node is not onboarded to the network',
  waitOnboarding: (days, hours, minutes) =>
    `Please wait until your node is onboarded to the network, Left: ${days}d ${hours}h ${minutes}m`,
  notRegisteredNode: (explorerUrl) =>
    `Your node is not registered in the network. Register here: ${explorerUrl}node-setup/`,
  actions: {
    reset: '🔄 Reset node settings (private key, chainid, etc)',
    logs: '📁 Send debug information to AirDao support team',
    check: '🔍 Try to find and fix issues with your node setup',
    quit: '👋 Quit NOP'
  },
  selectActionQuestion: 'You can now perform one of the following actions'
};

export default messages;
