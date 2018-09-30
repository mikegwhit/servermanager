/**
 * @fileoverview Stops the running machine.
 */
const Docker = require(__dirname + '/../index.js');
Docker.machine.stop();