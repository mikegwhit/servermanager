FROM ubuntu:xenial

## Connection ports for controlling the UI:
# VNC port:5901
# noVNC webport, connect via http://IP:6901/?password=vncpassword

ENV DISPLAY=:1 \
    VNC_PORT=5901 \
    NO_VNC_PORT=6901
EXPOSE $VNC_PORT $NO_VNC_PORT

ENV HOME=/home/user \
    DOCKERFILE_PREFIX=sh \
    TERM=xterm \
    STARTUPDIR=/home/user/.startup \
    INST_SCRIPTS=/home/user/.install \
    NO_VNC_HOME=/home/user/noVNC \
    DEBIAN_FRONTEND=noninteractive \
    VNC_COL_DEPTH=24 \
    VNC_RESOLUTION=1500x700 \
    VNC_PW=vncpassword \
    VNC_VIEW_ONLY=false

WORKDIR $HOME

ENV saasworks "\e[36mSaasworks\e[0m"

# Basics
ADD $DOCKERFILE_PREFIX/setup/*.sh $INST_SCRIPTS/
RUN find $INST_SCRIPTS -name '*.sh' -exec chmod a+x {} +
RUN $INST_SCRIPTS/install_tools.sh
ENV LANG='en_US.UTF-8' LANGUAGE='en_US:en' LC_ALL='en_US.UTF-8'
RUN $INST_SCRIPTS/install_nettools.sh

# Xfce
ADD $DOCKERFILE_PREFIX/xfce/install_xfce4.sh $INST_SCRIPTS/
RUN find $INST_SCRIPTS -name '*.sh' -exec chmod a+x {} +
RUN $INST_SCRIPTS/install_xfce4.sh
ADD $DOCKERFILE_PREFIX/xfce/src/ $HOME/

# VNC
ADD $DOCKERFILE_PREFIX/vnc/install_vnc.sh $INST_SCRIPTS/
ADD $DOCKERFILE_PREFIX/vnc/install_novnc.sh $INST_SCRIPTS/
RUN find $INST_SCRIPTS -name '*.sh' -exec chmod a+x {} +
RUN $INST_SCRIPTS/install_vnc.sh
RUN $INST_SCRIPTS/install_novnc.sh
ADD $DOCKERFILE_PREFIX/vnc/run_vnc.sh $STARTUPDIR/

# LAMP
ADD $DOCKERFILE_PREFIX/lamp/*.sh $INST_SCRIPTS/
RUN find $INST_SCRIPTS -name '*.sh' -exec chmod a+x {} +
RUN $INST_SCRIPTS/install_lamp.sh
ADD $DOCKERFILE_PREFIX/lamp/run_lamp.sh $STARTUPDIR/

# Install node.js
ADD $DOCKERFILE_PREFIX/node/*.sh $INST_SCRIPTS/
RUN find $INST_SCRIPTS -name '*.sh' -exec chmod a+x {} +
RUN $INST_SCRIPTS/install_node.sh

# Install the browsers, and then start them up.
ADD $DOCKERFILE_PREFIX/browser/*.sh $INST_SCRIPTS/
RUN find $INST_SCRIPTS -name '*.sh' -exec chmod a+x {} +
RUN $INST_SCRIPTS/install_firefox.sh
RUN $INST_SCRIPTS/install_chrome.sh
ADD $DOCKERFILE_PREFIX/browser/configure_chrome.sh $STARTUPDIR/

# ENV USER servermanager
ADD $DOCKERFILE_PREFIX/user/create_user.sh $INST_SCRIPTS/
ADD $DOCKERFILE_PREFIX/user/user_permissions.sh $INST_SCRIPTS/
ADD $DOCKERFILE_PREFIX/user/bash_user.sh $STARTUPDIR/
RUN find $INST_SCRIPTS -name '*.sh' -exec chmod a+x {} +
RUN find $STARTUPDIR -name '*.sh' -exec chmod a+x {} +

# Set up user bash.
ADD $DOCKERFILE_PREFIX/.profile $HOME
RUN chmod 755 $HOME/.profile
RUN $INST_SCRIPTS/create_user.sh
RUN $INST_SCRIPTS/user_permissions.sh $STARTUPDIR $HOME  
RUN /bin/bash -c "source $HOME/.profile"

# Set up final run file.
ADD $DOCKERFILE_PREFIX/run.sh $STARTUPDIR/
RUN find $STARTUPDIR -name '*.sh' -exec chmod a+x {} +

ENTRYPOINT ["/home/user/.startup/run.sh"]
EXPOSE 80 443 3306 $VNC_PORT $NO_VNC_PORT
CMD ["--wait"]
