#!/usr/bin/env bash
set -e

yarn
yarn build
if [ -f output/docker-compose.yml ]; then
  yarn start update
  docker-compose -f output/docker-compose.yml pull
  docker-compose -f output/docker-compose.yml down
  docker-compose -f output/docker-compose.yml up -d
fi
