#!/bin/bash

# Change /etc/needrestart/needrestart.conf to skip confirmations for restarting required services
sed -i 's/^#\$nrconf{restart} = '\''i'\'';/$nrconf{restart} = '\''a'\'';/' /etc/needrestart/needrestart.conf

#Intall node.js
apt-get update -y
apt-get install -y ca-certificates curl gnupg
mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
echo \
  "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
apt-get update -y
apt-get install -y nodejs

# Install required packages
if [[ "$ubuntu_version" == "20.04" || "$ubuntu_version" < "20.04" ]]; then
    apt-get install -y python-dev
else
    apt-get install -y python-dev-is-python3
fi

apt-get install -y \
    build-essential \
    npm \
    git \
    apt-transport-https \
    software-properties-common \
    jq

# Install Docker and Docker Compose
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y \
    docker-ce \
    docker-ce-cli \
    containerd.io

curl -L https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-"$(uname -s)"-"$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install yarn globally
npm install -g yarn

git clone https://github.com/ascendia-network/airdao-nop.git
cd airdao-nop || return

./update.sh

yarn install
yarn build
yarn start
