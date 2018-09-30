#!/usr/bin/env bash

xfce4Exists="$(which xfce4-about)"
if [ -z $xfce4Exists ]
    then
        echo -e "$saasworks Installing Xfce 👓"
        apt-get update
        apt-get install -y supervisor xfce4 xfce4-terminal
        apt-get purge -y pm-utils xscreensaver*
        apt-get clean -y
fi