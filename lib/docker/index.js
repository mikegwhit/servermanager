module.exports = {
    container: new (require(__dirname + '/dockercontainer.class.js'))(),
    image: new (require(__dirname + '/dockerimage.class.js'))(),
    machine: new (require(__dirname + '/dockermachine.class.js'))()
}