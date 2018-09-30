require(__dirname + '/../../index.js');
(() => {
/**
 * @fileoverview Creates the compute instance.
 */
const {compute} = require(__dirname + '/../../serv/google.js');
const ip = compute.getStaticIP();
console.log(ip);
module.exports = ip;
})();