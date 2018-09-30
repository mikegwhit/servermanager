module.exports = {
    cli: new (require(__dirname + '/google.class.js'))(),
    compute: new (require(__dirname + '/googlecompute.class.js'))(),
    containerRegistry: new (require(__dirname + '/googlecontainerregistry.class.js'))(),
    iam: new (require(__dirname + '/googleiam.class.js'))()
};