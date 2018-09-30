/**
 * @fileoverview Creates the compute instance.
 */
const {compute} = require(__dirname + '/../index.js');
const ip = compute.getStaticIP();
console.log(ip);
module.exports = ip;