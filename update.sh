#!/usr/bin/env bash
set -e
cd "$( dirname "$(readlink -f "${BASH_SOURCE[0]}")" )"
if [[ -d /etc/cron.daily ]]; then
  rm -f /etc/cron.daily/airdao-nop
  ln -fs $PWD/update.sh /etc/cron.daily/airdao-nop
fi

# Check if IPv6 is available before attempting to disable it
if grep -q "net.ipv6" /proc/sys/net/ 2>/dev/null; then
  cat > /etc/sysctl.d/10-airdao.conf <<-END
net.ipv6.conf.all.disable_ipv6=1
END
  sysctl -p /etc/sysctl.d/10-airdao.conf || true
else
  echo "IPv6 not available or already disabled, continuing..."
fi

git checkout yarn.lock
git checkout run-update.sh
git pull origin master
chmod +x run-update.sh
source run-update.sh
