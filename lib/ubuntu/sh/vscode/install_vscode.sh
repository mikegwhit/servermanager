#!/usr/bin/env bash
echo -e "$saasworks Installing Visual Studio Code 🔧"
curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
mv microsoft.gpg /etc/apt/trusted.gpg.d/microsoft.gpg
sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/vscode stable main" > /etc/apt/sources.list.d/vscode.list'
apt-get update
apt-get install code # Or code-insiders
apt-get update
# Make a copy of the relevant library.
mkdir ~/vscode
mkdir ~/vscode/lib
cp /usr/lib/x86_64-linux-gnu/libxcb.so.1 ~/vscode/lib
sed -i 's/BIG-REQUESTS/_IG-REQUESTS/' ~/vscode/lib/libxcb.so.1
cp /opt/servermanager/deploy/code.desktop ~/.local/share/applications/code.desktop
cp /opt/servermanager/deploy/settings.json ~/.config/Code/User/settings.json