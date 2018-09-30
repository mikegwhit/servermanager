#!/bin/bash
set -e
source $HOME/.profile
/bin/bash -c "$HOME/.startup/run_lamp.sh"
/bin/bash -c "$HOME/.startup/run_vnc.sh"