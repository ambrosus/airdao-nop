# The Airdao Node Onboarding Package
The Airdao Node Onboarding Package (NOP) is a command-line tool which makes it easier to setup Airdao node.


## Table of Contents
  - **[Overview](#overview)**
  - **[Installation](#installation)**
  - **[Setting up the NOP](#setting-up-the-nop)**
  - **[Troubleshooting](#troubleshooting)**
  - **[Contribution](#contribution)**
  - **[Alternative community guide](#alternative-community-guide)**

## Overview

Running an AMB-NET masternode is a three-step process:
1. Prepare a virtual machine environment
2. Run NOP to configure your Masternode
3. Run the masternode application

## Installation

There are two ways to setup your virtual machine environment to run an Airdao masternode:

1. Use a ready-made machine image build and maintained by the Airdao team
2. Install the software and dependencies yourself on a machine

The first option is simpler as it requires less technical experience. However, for obvious security reasons setting a machine from scratch is a more secure approach.

##### Creating a Droplet

Typical DigitalOcean node (2 GB / 2 CPUs, 60 GB SSD disk, 3 TB transfer) should be good.

There is detailed step by step information how to setup droplet on digitalocean https://www.digitalocean.com/docs/droplets/how-to/create/

Our brief instructions:

Create an account and log in. Press 'Droplets' and then 'Create Droplet'. 
Use the OS Ubuntu and then choose what machine preferences and which data center suits you. 
Then either create a SSH key which you will use to access the instance or if you do not choose one you will get a password to your email. 
Write a hostname that suits you and launch the instance.

Now lets setup a firewall for the instance to make sure the instance is accessible only through specific ports. 
Your instance should be launched and you should see it by pressing 'Droplets'. 
Click on the instance you launched and then press 'Networking' -> 'Manage Firewalls'.
Add rules for the following ports:
- Port range: 30303
    Protocol: **TCP**
- Port range: 30303
    Protocol: **UDP**

The source can have the default values. When you have added the ports apply them to your droplet and then create the firewall.

Every cloud should have a similar setup.

## Setting up the NOP

##### Important notice

To avoid issues with installation process, we strongly encourage you to use PC (not android or similar terminals) to install NOP.

##### Accessing the Virtual Machine
To access the instance type the following command:
###### Without SSH key
``` ssh root@<The instances IP address>```
Now enter the password that you received by Email from digital ocean.
###### With SSH key
```ssh -i <The SSH key you specified> root@<The IP address>```

Once you're logged in on your virtual machine, run the following command:
```
source <(curl -s https://raw.githubusercontent.com/ambrosus/airdao-nop/master/setup.sh)
```

> **NOTE:** You should execute this script as a root user

Choose the necessary options:
- network (main);
- input already existing private key or create a new one;

You are successfully onboarded.

## Contribution
We will accept contributions of good code that we can use from anyone.
Please see [CONTRIBUTION.md](CONTRIBUTION.md)

Before you issue pull request:
* Make sure all tests pass.
* Make sure you have test coverage for any new features.

## Troubleshooting
If you are having docker issues [DigitalOcean has a indepth guide for installing docker](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-18-04).

## Alternative community guide

There also detailed alternative intructions made by our community: https://github.com/ambrosus/community-wiki/wiki/Installation-guides
