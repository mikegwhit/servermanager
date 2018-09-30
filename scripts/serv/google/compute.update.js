require(__dirname + '/../../index.js');
(() => {
/**
 * @fileoverview Updates the compute instance with the latest Docker image.
 */
const {compute} = require(__dirname + '/../../serv/google.js');
compute.updateInstance();
})();