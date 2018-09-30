require(__dirname + '/../../index.js');
(() => {
/**
 * @fileoverview Creates the compute instance.
 */
const {compute} = require(__dirname + '/../../serv/google.js');
compute.deleteInstance();
compute.deleteFirewallRules();
compute.deleteStaticIP();
})();