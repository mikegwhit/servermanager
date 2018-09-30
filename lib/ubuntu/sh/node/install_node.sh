#!/usr/bin/env bash
echo -e "$saasworks Installing Node 🌌"
wget https://nodejs.org/dist/v8.11.1/node-v8.11.1-linux-x64.tar.xz
tar -xf /home/user/node-v8.11.1-linux-x64.tar.xz
chmod 755 ./node-v8.11.1-linux-x64.tar.xz
mkdir /opt/node
mv ./node-v8.11.1-linux-x64 /opt/node