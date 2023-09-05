# Using Airdao NOP

After having successfully installed Airdao Node, you have an `airdao-nop`
directory that contains all files related to the Node.  
To run configuration script you have to change the directory first:

    cd ~/airdao-nop

and then run configuration script:

    yarn start

The script checks basic node details, shows notifications if something is wrong

[//]: # (todo)
[//]: # (and offers several options:)
[//]: # (- **Change node URL** - if you hold an Atlas, you can change its URL)
[//]: # (- **Payouts** - request Atlas reward payout)
[//]: # (- **Retire** - retire Node)
[//]: # (- **Finish NOP** - exit configuration console)

Current status of the Node can be viewed at https://airdao.io/explorer/apollo

To update Airdao node software, run the script:

    cd ~/airdao-nop
    ./update.sh

## Directories and important files

- **state.json** - this file contains all your node configuration, including
  private key, _do not share this file with anyone_.
- **output** (directory) - contains files that were created during the
  installation process.
- **output/parity\_config.toml** - Parity config. NB! Please change this file
  only if you know what you're doing.
- **output/docker-compose.yml** - Docker Compose config. Each part of Airdao Node
  runs in its own docker container. This file defines what and how will be  run.
- **output/chain.json** - AMB-NET blockchain specification. NB! Please do
  not change this file.
- **output/chains** (directory) - Blockchain data.
- **output/data** (directory) - Mongo DB data.

## Diagnostics

We provided a script to diagnose common problems. Run it and follow its
instructions.

    source <(curl -s https://nop.ambrosus.io/check.sh)

In order to see diagnostics results and try to solve problems by oneself, one
can see logs
  

### Logs

    cd ~/airdao-nop/output
    docker-compose logs --tail 25

This command shows logs of all components. You can specify number of log
messages to output in **--tail** argument.

Let's talk about Parity logs.

    parity     | 2019-09-10 12:32:05 UTC Verifier #0 INFO import  Imported #1912475 0xdaf2…be13 (1 txs, 0.02 Mgas, 2 ms, 0.67 KiB)
    parity     | 2019-09-10 12:32:10 UTC Verifier #0 INFO import  Imported #1912476 0x3871…6230 (0 txs, 0.00 Mgas, 4 ms, 0.56 KiB)

As you can see Parity imports blocks from network. If everything goes fine, you
should see new block every 5 seconds. And the latest block number in your
Parity logs should match the one in
[Airdao Explorer](https://airdao.io/explorer).
If it doesn't - your Parity is not in sync and the Node is not operating.

## Problems and their fixes

First of all **check.sh** script provides some fixes. If it doesn't help or you
want to try manual fixes, you can try the following:

### Parity not in sync

When you see in Parity logs that it stopped syncing (the same block number
repeats at least for several minutes), run the following:

    cd ~/airdao-nop/output
    docker stop parity
    rm -rf chains
    curl -s https://backup.ambrosus.io/blockchain.tgz | tar zxpf -
    docker start parity

### Useful docker-compose commands

Show container status:

    docker-compose ps

Show container logs:

    docker-compose logs parity

Watch logs:

    docker-compose logs -f

Restart all containers:

    docker-compose restart

Restart specific container:

    docker-compose restart parity

Recreate containers (safe, but do it if you're sure that you need it):

    docker-compose down
    docker-compose up -d

### Out of memory

If logs contain messages about memory issues, it means that your instance or
server don't hold enough memory. Try to increase it. We recommend at least 2GB
of memory to run an Airdao Node.

### Instance not responding

Restart your instance.

### No block reward on Apollo

Check if Parity is in sync (see above)
If it's fine, wait for reward to appear (it could take up to 24 hours).
Don't stop and try not to restart Apollo, it has to be always online.
