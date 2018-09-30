require(__dirname + '/../../index.js');
(() => {
const Google = require(__dirname + '/../../google.class.js');
const google = new Google();
google.setup();
})();