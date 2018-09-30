require(__dirname + '/../../index.js');
(() => {
/**
 * @fileoverview Runs the container.  If other instances of the image are benig
 * run, these containers are first shut down and removed.
 */
const Docker = require(__dirname + '/../../serv/docker.js');
Docker.container.removeAll();
})();