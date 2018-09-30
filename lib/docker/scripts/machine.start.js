/**
 * @fileoverview Starts the machine.  If machine DNE, then creates the machine.
 * If machine already started, does nothing.
 */
const Docker = require(__dirname + '/../index.js');
Docker.machine.start();