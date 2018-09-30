const chalk = require('chalk');
const DockerMachine = new (require(__dirname + '/dockermachine.class.js'))();
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;

class DockerImage {
    constructor() {
        if (DockerImage.instance) {
            return DockerImage.instance;
        }
        DockerImage.instance = this;
        this.configs = {
            docker: JSON.parse(require('fs').readFileSync(__dirname + 
                '/configs/docker.json', 'utf8'))
        };
    }

    /**
     * Builds an image.  Ideally, if run via CLI imagePath is accepted as a 
     * CLI argument.  So is imageName for that matter.
     * 
     * This function runs as synchronous.
     * @param {String} imageName The name of the image.
     * @param {String} imagePath The location of the DockerFile.
     */
    build(imageName, imagePath) {
        if (!DockerMachine.isMachineRunning()) {
            DockerMachine.start();
        }
        if (!imageName) {
            imageName = this.configs['docker']['imageName'];
        }
        if (!imagePath) {
            imagePath = this.configs['docker']['imagePath'];
        }
        try {
            DockerMachine.getEnv();
            const output = require('child_process')
                .execSync(`docker build -t ${imageName} ${imagePath}`, {
                    cwd: process.cwd(),
                    env: process.env,
                    stdio: 'inherit'
                });
            console.log(chalk.green('Success in building Docker image.'));
        } catch(e) {
            console.error(chalk.red('Error in building Docker image.'), e);
        }
    }

    /**
     * Tags the container.  If the machine is not running, run the machine.
     */
    tag(imageName, tag) {
        if (!DockerMachine.isMachineRunning()) {
            DockerMachine.start();
        }
        try {
            DockerMachine.getEnv();
            require('child_process').execSync(`docker tag ${imageName} ${tag}`, {
                    cwd: process.cwd(),
                    env: process.env
                });
            console.log(chalk.green('Success in tagging Docker image.'));
        } catch(e) {
            console.error(chalk.red('Error in tagging Docker image.'), e);
        }
    }

    /**
     * This function should be used on the directory of the Docker image.
     * If line endings are in CRLF, then weird errors shal occur.
     */
    windowsLineEndings() {
        // find ./ -type f -exec dos2unix {} \;
    }
}

module.exports = DockerImage;