require(__dirname + '/../../index.js');
(() => {
/**
 * @fileoverview Sets up the drive mounts for Windows.
 */
const Docker = require(__dirname + '/../../serv/docker.js');
Docker.machine.windowsSetupMount();
})();