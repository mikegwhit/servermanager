require(__dirname + '/../../index.js');
(() => {
/**
 * @fileoverview Stops the running machine.
 */
const Docker = require(__dirname + '/../../serv/docker.js');
Docker.machine.stop();
})();