#!/usr/bin/env bash

echo -e "$saasworks Installing vim 📃"
apt-get update 
apt-get install -y vim
echo -e "$saasworks Installing net-tools 📃"
apt-get update 
apt-get install -y net-tools
echo -e "$saasworks Installing locales 📃"
apt-get update 
apt-get install -y locales
echo -e "$saasworks Installing bzip2 📃"
apt-get update 
apt-get install -y bzip2
echo -e "$saasworks Installing python-numpy 📃"
apt-get update 
apt-get install -y python-numpy
echo -e "$saasworks Installing xz-utils 📃"
apt-get install xz-utils
apt-get update
echo -e "$saasworks Installing xterm 📃"
apt-get install -y xterm
apt-get update
echo -e "$saasworks Installing tar 📃"
apt-get install -y tar
apt-get update
echo -e "$saasworks Installing git-core 📃"
apt-get install -y git-core
apt-get update
echo -e "$saasworks Installing git 📃"
apt-get install -y git
apt-get update

apt-get clean -y

echo -e "$saasworks Generating locale 🔤"
locale-gen en_US.UTF-8