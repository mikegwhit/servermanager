require(__dirname + '/../../index.js');
(() => {
/**
 * @fileoverview Builds the container.
 */
const Docker = require(__dirname + '/../../serv/docker.js');
Docker.image.build();
})();