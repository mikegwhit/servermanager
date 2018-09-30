require(__dirname + '/../../index.js');
(() => {
const GCR = require(__dirname + '/../../googlecontainerregistry.class.js');
const gcr = new GCR();
gcr.ship();
})();