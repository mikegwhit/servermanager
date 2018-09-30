/**
 * @fileoverview Runs the container.  If other instances of the image are benig
 * run, these containers are first shut down and removed.
 */
const Docker = require(__dirname + '/../index.js');
Docker.container.removeAll();