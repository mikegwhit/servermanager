/**
 * @fileoverview Creates the compute instance.
 */
const {compute} = require(__dirname + '/../index.js');
compute.deleteInstance();
compute.deleteFirewallRules();
compute.deleteStaticIP();